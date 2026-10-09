import { FACES, type Facelets, type SolveResult } from "./cube-state";

const colourToFace: Record<string, string> = {
  u: "U",
  r: "R",
  l: "F",
  d: "D",
  f: "L",
  b: "B",
};

type Job = { id?: string; status?: string; solution?: string; error?: string };

async function readResponse(response: Response): Promise<Job> {
  const body = (await response.json().catch(() => ({}))) as Job;
  if (!response.ok)
    throw new Error(body.error ?? "The larger-cube solver is unavailable. Please try again later.");
  return body;
}

/** Solves entered facelets, never a scramble history. Polling keeps long solves off the UI thread. */
export async function solveLargeCube(
  n: number,
  state: Facelets,
  signal: AbortSignal,
): Promise<SolveResult> {
  if (!Number.isInteger(n) || n < 4 || n > 10)
    return { ok: false, error: "Choose a cube from 4×4 to 10×10." };
  const cells = FACES.flatMap((face) => state[face]);
  if (FACES.some((face) => state[face].length !== n * n) || cells.some((c) => !colourToFace[c])) {
    return { ok: false, error: "Some stickers are still blank — colour every sticker first." };
  }
  for (const colour of Object.keys(colourToFace)) {
    if (cells.filter((c) => c === colour).length !== n * n) {
      return {
        ok: false,
        error: `Each colour must appear exactly ${n * n} times. Check the colour counts below.`,
      };
    }
  }
  const facelets = cells.map((c) => colourToFace[c]).join("");
  if (n % 2 && FACES.some((face, i) => facelets[i * n * n + Math.floor((n * n) / 2)] !== face)) {
    return {
      ok: false,
      error: "Keep the fixed centres in their original colours: white up, green front.",
    };
  }
  if (FACES.every((face, i) => facelets.slice(i * n * n, (i + 1) * n * n) === face.repeat(n * n))) {
    return { ok: true, solution: "" };
  }

  if (n === 4) {
    const { solveFourLayers } = await import("./four-layer-solver");
    return solveFourLayers(state, signal);
  }

  let id: string | undefined;
  const cancelJob = () => {
    if (id)
      void fetch(`/api/nxn/jobs/${id}`, { method: "DELETE", keepalive: true }).catch(() => {});
  };
  signal.addEventListener("abort", cancelJob, { once: true });
  try {
    // Read the job ID even if cancelled during submission, so it can be stopped server-side.
    const started = await readResponse(
      await fetch("/api/nxn/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n, state: facelets }),
      }),
    );
    id = started.id;
    if (!id) throw new Error("The solver could not start. Please try again.");
    if (signal.aborted) {
      cancelJob();
      signal.throwIfAborted();
    }
    const deadline = Date.now() + 11 * 60 * 1000;
    while (Date.now() < deadline) {
      signal.throwIfAborted();
      const job = await readResponse(await fetch(`/api/nxn/jobs/${id}`, { signal }));
      if (job.status === "complete" && typeof job.solution === "string")
        return { ok: true, solution: job.solution };
      if (job.status === "error" || job.status === "cancelled")
        return { ok: false, error: job.error ?? "Solve cancelled." };
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer);
          reject(signal.reason);
        };
        const timer = setTimeout(() => {
          signal.removeEventListener("abort", abort);
          resolve();
        }, 1000);
        signal.addEventListener("abort", abort, { once: true });
      });
    }
    cancelJob();
    return { ok: false, error: "The solver took too long. Please try again." };
  } catch (error) {
    cancelJob();
    if (signal.aborted) throw error;
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "The solver is unavailable. Please try again.",
    };
  } finally {
    signal.removeEventListener("abort", cancelJob);
  }
}
