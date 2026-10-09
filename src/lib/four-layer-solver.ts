import type { Facelets, SolveResult } from "./cube-state";
const colours: Record<string, string> = { u: "U", r: "R", l: "F", d: "D", f: "L", b: "B" };
/** Runs the verified layer solver off the main thread, without server tables. */
export function solveFourLayers(state: Facelets, signal: AbortSignal): Promise<SolveResult> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./four-layer.worker.ts", import.meta.url), {
      type: "module",
    });
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      worker.terminate();
    };
    const abort = () => {
      cleanup();
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve({ ok: false, error: "The 4×4 solver timed out. Check the colours and try again." });
    }, 30000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = (event: MessageEvent<SolveResult>) => {
      cleanup();
      resolve(event.data);
    };
    worker.onerror = () => {
      cleanup();
      resolve({ ok: false, error: "The 4×4 solver could not load. Please refresh and try again." });
    };
    worker.postMessage(
      Object.fromEntries(
        Object.entries(state).map(([face, cells]) => [face, cells.map((c) => colours[c] ?? "X")]),
      ),
    );
  });
}
