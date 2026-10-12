import { readSolverSession, writeSolverSession, faceletsToGraphString } from "@/lib/solver-session";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Sticker } from "@/components/sticker";
import type { StickerKey } from "@/lib/algorithms";
import {
  blankFacelets,
  solveFacelets,
  solvedFacelets,
  loadSolver,
  type Face,
  type Facelets,
} from "@/lib/cube-state";
import { solveLargeCube } from "@/lib/large-cube-solver";
import { cn } from "@/lib/utils";

const PaintCube3D = lazy(() =>
  import("@/components/paint-cube-3d").then((m) => ({ default: m.PaintCube3D })),
);

const brushes: { key: StickerKey; label: string }[] = [
  { key: "u", label: "White" },
  { key: "d", label: "Yellow" },
  { key: "f", label: "Orange" },
  { key: "r", label: "Red" },
  { key: "l", label: "Green" },
  { key: "b", label: "Blue" },
];

/** Paint your real cube's colours onto a 3D cube, then solve it automatically. */
export function ColourSolver({
  n,
  onSolved,
  onInputChange,
}: {
  n: number;
  onSolved: (solution: string, input?: string) => void;
  onInputChange?: (input: string) => void;
}) {
  const [state, setState] = useState<Facelets>(() => blankFacelets(n));
  const [scramble, setScramble] = useState("");
  const [brush, setBrush] = useState<StickerKey>("u");
  const [mounted, setMounted] = useState(false);
  const request = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (n === 3) {
      const saved = readSolverSession();
      if (saved.facelets) setState(saved.facelets);
      if (saved.scramble) setScramble(saved.scramble);
    }
    setMounted(true);
    return () => request.current?.abort();
  }, [n]);

  useEffect(() => {
    if (!mounted || n !== 3) return;
    const input = faceletsToGraphString(state);
    const saved = readSolverSession();
    writeSolverSession({
      facelets: state,
      scramble,
      mode: "colours",
      input,
      solution: saved.input === input ? (saved.solution ?? "") : "",
    });
    onInputChange?.(input);
  }, [mounted, n, state, scramble, onInputChange]);

  const paint = (face: Face, i: number) => {
    // Odd cubes have fixed centre stickers.
    if (busy || (n % 2 === 1 && i === Math.floor((n * n) / 2))) return;
    setError(null);
    setScramble("");
    setState((prev) => {
      const cells = [...prev[face]];
      cells[i] = brush;
      return { ...prev, [face]: cells };
    });
  };

  const applyScramble = async () => {
    if (
      !scramble.trim() ||
      scramble.length > 400 ||
      !/^([URFDLB](2|'|2')?\s*)+$/.test(scramble.trim())
    ) {
      setError("Use face turns such as R U R' U' or F2, with at most 400 characters.");
      return;
    }
    try {
      const { default: exported } = await import("@/vendor/cubejs/index.js");
      const Cube = exported as { new (): { move(alg: string): { asString(): string } } };
      const str = new Cube().move(scramble.trim()).asString();
      const colour = { U: "u", R: "r", F: "l", D: "d", L: "f", B: "b" } as const;
      setState(
        Object.fromEntries(
          ["U", "R", "F", "D", "L", "B"].map((face, i) => [
            face,
            [...str.slice(i * 9, i * 9 + 9)].map((c) => colour[c as keyof typeof colour]),
          ]),
        ) as Facelets,
      );
      setError(null);
    } catch {
      setError("That scramble could not be applied. Check the move notation.");
    }
  };

  const solve = async () => {
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    try {
      const res =
        n <= 3
          ? await solveFacelets(n as 2 | 3, state)
          : await solveLargeCube(n, state, controller.signal);
      if (controller.signal.aborted) return;
      if (!res.ok) setError(res.error);
      else if (!res.solution) setError("That cube is already solved!");
      else onSolved(res.solution, n === 3 ? faceletsToGraphString(state) : undefined);
    } catch {
      if (!controller.signal.aborted)
        setError("Something went wrong while solving — please try again.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  };

  return (
    <div className="colour-solver mt-3 flex flex-1 flex-col">
      {n === 3 && (
        <details className="mb-3 rounded-md border border-line bg-panel-2 p-3">
          <summary className="min-h-11 cursor-pointer content-center text-sm">
            Enter scramble moves
          </summary>
          <form
            className="mt-2 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void applyScramble();
            }}
          >
            <input
              aria-label="Scramble moves"
              value={scramble}
              onChange={(e) => setScramble(e.target.value)}
              placeholder="R U R' U' F2"
              maxLength={400}
              disabled={busy}
              className="min-h-11 min-w-0 flex-1 rounded border border-line bg-background px-3 text-base"
            />
            <button
              disabled={busy}
              type="submit"
              className="min-h-11 rounded border border-primary px-4 text-sm text-primary"
            >
              Apply scramble
            </button>
          </form>
        </details>
      )}
      {mounted ? (
        <Suspense fallback={<Loading />}>
          <PaintCube3D n={n} state={state} onPaint={paint} />
        </Suspense>
      ) : (
        <Loading />
      )}
      <p className="solver-paint-hint mt-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Pick a colour · paint the cube
      </p>

      <p className="sr-only">
        Hold white on top and green at the front. Enter each face as viewed from outside.
      </p>
      <fieldset
        disabled={busy}
        className="solver-palette mt-4 flex flex-wrap justify-center gap-1.5"
      >
        {brushes.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => setBrush(b.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition",
              brush === b.key
                ? "border-primary bg-background"
                : "border-line bg-panel-2 hover:bg-background",
            )}
          >
            <Sticker value={b.key} className="size-3.5" />
            {b.label}{" "}
            {n >= 4
              ? `${
                  Object.values(state)
                    .flat()
                    .filter((c) => c === b.key).length
                }/${n * n}`
              : ""}
          </button>
        ))}
      </fieldset>

      <fieldset disabled={busy} className="solver-actions mt-4 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            setScramble("");
            setState(blankFacelets(n));
            setError(null);
          }}
          className="rounded-md border border-line bg-panel-2 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition hover:bg-background"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={busy}
          onMouseEnter={() => {
            if (n <= 3) void loadSolver();
          }}
          onClick={solve}
          className="rounded-md bg-primary py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Solving…" : "Solve it"}
        </button>
        <button
          type="button"
          onClick={() => {
            setScramble("");
            setState(solvedFacelets(n));
            setError(null);
          }}
          className="rounded-md border border-line bg-panel-2 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition hover:bg-background"
        >
          Fill solved
        </button>
      </fieldset>
      {busy ? (
        <div className="sr-only" role="status">
          <p>
            {n <= 3
              ? "Working out the moves — the first solve takes a few seconds."
              : "Solving centres, pairing edges, and checking the solution. Larger cubes can take several minutes."}
          </p>
          {n >= 4 ? (
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => request.current?.abort()}
            >
              Cancel solve
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-primary/40 bg-background p-2.5 text-[12px] text-primary"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-[340px] items-center justify-center font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
      Loading 3D cube…
    </div>
  );
}
