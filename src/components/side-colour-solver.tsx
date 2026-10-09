import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  blankPaint,
  loadPaintPuzzle,
  patternFromColours,
  type PaintPuzzle,
  type SidePuzzle,
} from "@/lib/side-puzzle-state";
import { cn } from "@/lib/utils";
const PaintPuzzle3D = lazy(() =>
  import("./paint-puzzle-3d").then((m) => ({ default: m.PaintPuzzle3D })),
);

export function SideColourSolver({
  puzzle,
  onSolved,
}: {
  puzzle: SidePuzzle;
  onSolved: (solution: string) => void;
}) {
  const [data, setData] = useState<PaintPuzzle | null>(null);
  const [colours, setColours] = useState<number[]>([]);
  const [brush, setBrush] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    let cancelled = false;
    void loadPaintPuzzle(puzzle)
      .then((model) => {
        if (cancelled) return;
        setData(model);
        setColours(blankPaint(model));
      })
      .catch(() => {
        if (!cancelled) setError("The model could not load. Refresh the page to try again.");
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, [puzzle]);

  const solve = () => {
    if (!data || busy) return;
    setError(null);
    try {
      patternFromColours(data, colours);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check your colours.");
      return;
    }
    if (colours.every((colour, i) => colour === data.stickers[i]!.face)) {
      setError("That puzzle is already solved!");
      return;
    }
    setBusy(true);
    try {
      const job = new Worker(new URL("../lib/side-puzzle.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.current = job;
      job.onmessage = (event: MessageEvent<{ solution?: string; error?: string }>) => {
        stop();
        setBusy(false);
        if (event.data.error)
          setError(
            "This pattern could not be solved. Check the stickers and reference orientation. " +
              event.data.error,
          );
        else if (event.data.solution) onSolved(event.data.solution);
        else setError("That puzzle is already solved!");
      };
      job.onerror = () => {
        stop();
        setBusy(false);
        setError("The solver could not start. Refresh the page and try again.");
      };
      timer.current = setTimeout(() => {
        stop();
        setBusy(false);
        setError("This solve took too long. Check the colours and try again.");
      }, 120000);
      job.postMessage({ puzzle, colours });
    } catch {
      stop();
      setBusy(false);
      setError("The solver could not start. Please try again.");
    }
  };
  if (!data)
    return (
      <p
        className="flex h-[340px] items-center justify-center text-center text-sm text-muted"
        role="status"
      >
        {error ?? "Loading colour editor…"}
      </p>
    );

  return (
    <div className="mt-3 flex flex-col gap-3">
      <Suspense
        fallback={<div className="h-[340px] text-center text-muted">Loading 3D model…</div>}
      >
        <PaintPuzzle3D
          data={data}
          colours={colours}
          onPaint={(i) => {
            if (busy || (puzzle === "megaminx" && data.stickers[i]!.orbit === "CENTERS")) return;
            setError(null);
            setColours((previous) => previous.map((c, index) => (index === i ? brush : c)));
          }}
        />
      </Suspense>
      <p className="text-center text-xs text-muted">
        Pick a colour and click stickers. Drag to see every face; scroll to zoom.{" "}
        {puzzle === "megaminx" ? "Centres stay fixed." : "Match the solved reference orientation."}
      </p>
      <fieldset disabled={busy} className="flex flex-wrap justify-center gap-2">
        {data.colours.map((colour, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={brush === i}
            onClick={() => setBrush(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] disabled:opacity-50",
              brush === i ? "border-primary bg-background" : "border-line bg-panel-2",
            )}
          >
            <span
              className="size-3.5 rounded-sm border border-black/20"
              style={{ backgroundColor: colour.colour }}
            />
            {colour.name} {colours.filter((c) => c === i).length}/{colour.count}
          </button>
        ))}
      </fieldset>
      <fieldset disabled={busy} className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className="rounded-md border border-line py-2 text-xs"
          onClick={() => {
            setColours(blankPaint(data));
            setError(null);
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded-md border border-line py-2 text-xs"
          onClick={() => {
            setColours(data.stickers.map((s) => s.face));
            setError(null);
          }}
        >
          Fill solved
        </button>
        <button
          type="button"
          className="rounded-md bg-primary py-2 text-xs text-primary-foreground"
          onClick={solve}
        >
          {busy ? "Solving…" : "Solve it"}
        </button>
      </fieldset>
      {busy ? (
        <div role="status" className="text-center text-xs text-muted">
          Finding and checking your solution…{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              stop();
              setBusy(false);
            }}
          >
            Cancel solve
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-md border border-primary/40 p-2.5 text-xs text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
