import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CubeStickerGraph } from "@/components/cube-sticker-graph";
import { SyncedCube } from "@/components/synced-cube";
import { generateScramble, puzzleById } from "@/lib/puzzles";
import { readSolverSession } from "@/lib/solver-session";
type Prepared = { input: string; solution: string; moves: string[]; states: string[] };
export const Route = createFileRoute("/cool-stuff")({
  validateSearch: (search: Record<string, unknown>): { source?: "solver" } =>
    search["source"] === "solver" ? { source: "solver" } : {},
  head: () => ({
    meta: [
      { title: "Cool stuff — scrambled eggs" },
      {
        name: "description",
        content: "Watch a 3×3 cube solve beside a synchronized graph of its moving stickers.",
      },
    ],
  }),
  component: CoolStuff,
});
function CoolStuff() {
  const { source } = Route.useSearch();
  const [prepared, setPrepared] = useState<Prepared | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [playing, setPlaying] = useState(false),
    [timestamp, setTimestamp] = useState(0),
    [times, setTimes] = useState<number[]>([]),
    [duration, setDuration] = useState(0),
    [ready, setReady] = useState(false),
    [reload, setReload] = useState(0);
  const elapsed = useRef(0);
  const request = useRef<Worker | null>(null);
  useEffect(() => {
    setPrepared(null);
    setError("");
    setLoading(true);
    setPlaying(false);
    setReady(false);
    setTimestamp(0);
    elapsed.current = 0;
    const saved = source === "solver" && reload === 0 ? readSolverSession() : null;
    if (saved && !saved.input) {
      setError("No complete 3×3 is saved. Return to Solver and enter all six faces.");
      setLoading(false);
      return;
    }
    const worker = new Worker(new URL("../lib/cool-cube.worker.ts", import.meta.url), {
      type: "module",
    });
    request.current = worker;
    const timer = setTimeout(() => {
      worker.terminate();
      setLoading(false);
      setError("Preparing the animation took too long. Please try again.");
    }, 45000);
    worker.onmessage = (event: MessageEvent<Prepared & { ok: boolean; error?: string }>) => {
      clearTimeout(timer);
      setLoading(false);
      if (event.data.ok) setPrepared(event.data);
      else setError(event.data.error ?? "Could not prepare the cube.");
    };
    worker.onerror = () => {
      clearTimeout(timer);
      setLoading(false);
      setError("The animation engine could not load. Please refresh and try again.");
    };
    worker.postMessage(
      saved
        ? { input: saved.input, solution: saved.solution }
        : { scramble: generateScramble(puzzleById("3x3")) },
    );
    return () => {
      clearTimeout(timer);
      worker.terminate();
      request.current = null;
    };
  }, [source, reload]);
  const playerReady = useCallback((starts: number[], total: number) => {
    setTimes(starts);
    setDuration(total);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!playing || !ready) return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      elapsed.current = Math.min(duration, elapsed.current + (now - last));
      last = now;
      setTimestamp(elapsed.current);
      if (elapsed.current >= duration) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, ready, duration]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  const finished = ready && timestamp >= duration;
  let step = 0;
  while (step + 1 < times.length && timestamp >= times[step + 1]!) step++;
  if (finished && prepared) step = prepared.moves.length;
  const start = times[step] ?? duration,
    end = times[step + 1] ?? duration,
    progress = end > start ? (timestamp - start) / (end - start) : 0;
  const seek = (value: number) => {
    setPlaying(false);
    elapsed.current = value;
    setTimestamp(value);
  };
  return (
    <div className="solver-page cool-stuff-page min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <section className="themed-section border-b border-line">
        <div className="solver-container mx-auto px-5 pb-10 pt-6 sm:px-8">
          <h1 className="font-display font-bold">cool stuff</h1>
          <p className="text-muted">Small experiments with a twist.</p>
          <article className="cool-experiment mt-8 rounded-xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">A cube, a graph, one solution</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Every dot is a sticker position. Each turn moves the coloured stickers around the
                  graph, in sync with the cube.
                </p>
              </div>
              <Link
                to="/solver"
                search={{ puzzle: "3x3" }}
                className="cool-back-link rounded-md border border-line px-3 py-2 text-sm"
              >
                Back to my 3×3
              </Link>
            </div>
            {source === "solver" && reload === 0 && (
              <p className="mt-3 text-sm text-primary">
                Using your saved Solver cube. Your entered colours stay saved when you go back.
              </p>
            )}
            {error ? (
              <div
                className="cool-visuals-placeholder flex items-center justify-center text-center"
                role="alert"
              >
                {error}
              </div>
            ) : prepared ? (
              <div className="cool-visuals">
                <div className="cool-visual-panel">
                  <p className="cool-panel-label">The cube</p>
                  <SyncedCube
                    solution={prepared.solution}
                    timestamp={timestamp}
                    onReady={playerReady}
                  />
                </div>
                <div className="cool-visual-panel">
                  <p className="cool-panel-label">The sticker graph</p>
                  <CubeStickerGraph
                    state={prepared.states[step] ?? prepared.input}
                    move={prepared.moves[step]}
                    progress={progress}
                  />
                </div>
              </div>
            ) : (
              <div
                className="cool-visuals-placeholder flex items-center justify-center"
                role="status"
              >
                Preparing a random scramble and verified solution…
              </div>
            )}
            <div className="cool-controls flex flex-wrap items-center gap-3">
              <button
                disabled={!prepared || !ready || loading}
                className="rounded-md bg-primary px-5 py-3 text-primary-foreground"
                onClick={() => {
                  if (finished) {
                    elapsed.current = 0;
                    setTimestamp(0);
                  }
                  setPlaying((p) => !p);
                }}
              >
                {playing ? "Pause" : finished ? "Replay" : "Play animation"}
              </button>
              <button
                disabled={!ready}
                className="rounded-md border border-line px-4 py-3"
                onClick={() => seek(0)}
              >
                Reset
              </button>
              <button
                disabled={loading}
                className="rounded-md border border-line px-4 py-3"
                onClick={() => setReload((v) => v + 1)}
              >
                New random cube
              </button>
              <span className="font-mono text-sm text-muted" role="status">
                {prepared
                  ? finished
                    ? "Solved!"
                    : `Move ${Math.min(step + 1, prepared.moves.length)} / ${prepared.moves.length}`
                  : "Getting ready"}
              </span>
            </div>
            {prepared && ready && duration > 0 && (
              <label className="mt-4 flex items-center gap-3 text-sm text-muted">
                Progress
                <input
                  aria-label="Animation progress"
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={timestamp}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="min-w-0 flex-1 accent-primary"
                />
              </label>
            )}
            <p className="mt-4 text-xs text-muted">
              This graph shows sticker permutations, like the reference animation. It is not a
              search tree of all possible cube states.
            </p>
          </article>
        </div>
      </section>
      <SiteFooter compact />
    </div>
  );
}
