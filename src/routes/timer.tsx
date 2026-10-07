import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { generateScramble, puzzleById, puzzles, type PuzzleId, type Puzzle } from "@/lib/puzzles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Timer — AXIOM/CUBE" },
      {
        name: "description",
        content:
          "Competition-style scrambles and a hold-to-start speedcubing timer with a saved session log, best time, Ao5 and Ao12.",
      },
      { property: "og:title", content: "Timer — AXIOM/CUBE" },
      {
        property: "og:description",
        content:
          "Generate a scramble, hold space, solve, and log every time with best, Ao5 and Ao12 statistics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimerPage,
});

type Solve = { id: number; ms: number; puzzle: PuzzleId; dnf: boolean; scramble: string };

const STORAGE_KEY = "axiom-cube-session-v1";

const fmt = (ms: number) => {
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return m > 0 ? `${m}:${s.toFixed(2).padStart(5, "0")}` : s.toFixed(2);
};

const average = (list: Solve[], count: number) => {
  const recent = list.slice(0, count);
  if (recent.length < count) return null;
  if (recent.filter((s) => s.dnf).length > 1) return null;
  const times = recent.map((s) => (s.dnf ? Infinity : s.ms)).sort((a, b) => a - b);
  const middle = times.slice(1, times.length - 1);
  if (middle.some((t) => !isFinite(t))) return null;
  return middle.reduce((a, b) => a + b, 0) / middle.length;
};

function TimerPage() {
  const [puzzleId, setPuzzleId] = useState<PuzzleId>("3x3");
  const puzzle = puzzleById(puzzleId);
  const [scramble, setScramble] = useState("…");
  const [scrambleLoading, setScrambleLoading] = useState(false);
  const [scrambleError, setScrambleError] = useState("");
  const scrambleRequest = useRef(0);
  const refreshScramble = useCallback(async (next: Puzzle) => {
    const request = ++scrambleRequest.current;
    setScrambleLoading(true);
    setScrambleError("");
    setScramble("…");
    try {
      const text =
        next.kind === "square1"
          ? (await (await import("cubing/scramble")).randomScrambleForEvent("sq1")).toString()
          : generateScramble(next);
      if (request === scrambleRequest.current) setScramble(text);
    } catch {
      if (request === scrambleRequest.current)
        setScrambleError("Couldn't generate a scramble. Try again.");
    } finally {
      if (request === scrambleRequest.current) setScrambleLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshScramble(puzzleById("3x3"));
    return () => {
      // This is a request counter, not a DOM ref. Invalidate pending results on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++scrambleRequest.current;
    };
  }, [refreshScramble]);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [armed, setArmed] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  // restore session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSolves(JSON.parse(raw) as Solve[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solves.slice(0, 200)));
    } catch {
      /* storage full or unavailable */
    }
  }, [solves]);

  const tick = useCallback(() => {
    setElapsed(performance.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (scrambleLoading || scrambleError || scramble === "…") return;
    startRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, scrambleLoading, scrambleError, scramble]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    const ms = performance.now() - startRef.current;
    setElapsed(ms);
    setSolves((prev) => [{ id: Date.now(), ms, puzzle: puzzleId, dnf: false, scramble }, ...prev]);
    void refreshScramble(puzzle);
  }, [puzzle, puzzleId, scramble, refreshScramble]);

  // space bar control
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      e.preventDefault();
      if (running) {
        stop();
      } else {
        setArmed(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (!running && armed) {
        setArmed(false);
        setElapsed(0);
        start();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [armed, running, start, stop]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const sessionSolves = solves.filter((s) => s.puzzle === puzzleId);
  const valid = sessionSolves.filter((s) => !s.dnf);
  const best = valid.length ? Math.min(...valid.map((s) => s.ms)) : null;
  const ao5 = average(sessionSolves, 5);
  const ao12 = average(sessionSolves, 12);

  const toggleDnf = (id: number) =>
    setSolves((prev) => prev.map((s) => (s.id === id ? { ...s, dnf: !s.dnf } : s)));
  const remove = (id: number) => setSolves((prev) => prev.filter((s) => s.id !== id));

  const changePuzzle = (id: PuzzleId) => {
    setPuzzleId(id);
    void refreshScramble(puzzleById(id));
    setElapsed(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="bg-display text-background">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                (c) Timer · session
              </p>

              <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
                {puzzles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => changePuzzle(p.id)}
                    disabled={running}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 transition",
                      p.id === puzzleId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-background/15 text-background/60 hover:text-background",
                    )}
                  >
                    {p.short}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-background/10 bg-background/[0.03] p-8 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
                  {puzzle.kind === "square1" ? "Random-state scramble" : "Scramble"} ·{" "}
                  {puzzle.short}
                </p>
                <p className="mt-3 whitespace-pre-line text-balance font-mono text-xl font-medium tracking-tight sm:text-2xl">
                  {scrambleLoading ? "Generating scramble…" : scramble}
                </p>
                {scrambleError && (
                  <p role="alert" className="mt-2 text-sm text-primary">
                    {scrambleError}
                  </p>
                )}
                {puzzle.kind === "square1" && (
                  <p className="mt-3 text-xs text-background/60">
                    (a,b): top/bottom turns in 30° steps. /: 180° slice. Align seams before slicing.
                  </p>
                )}

                <div className="mt-8">
                  <p
                    className={cn(
                      "settle font-mono text-[76px] font-bold leading-none tracking-tighter tabular-nums sm:text-[124px]",
                      armed && "text-primary",
                    )}
                  >
                    {fmt(elapsed)}
                  </p>
                </div>

                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.15em] text-background/40">
                  {running
                    ? "Solving · press space to stop"
                    : armed
                      ? "Release space to start"
                      : "Hold space to start · press space to stop"}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => void refreshScramble(puzzle)}
                    disabled={running || scrambleLoading}
                    className="rounded-lg bg-primary px-8 py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-primary-foreground transition hover:brightness-95"
                  >
                    New scramble
                  </button>
                  <button
                    onClick={() => (running ? stop() : (setElapsed(0), start()))}
                    disabled={!running && (scrambleLoading || Boolean(scrambleError))}
                    className="rounded-lg border border-background/20 px-8 py-3 font-mono text-[12px] uppercase tracking-[0.12em] transition hover:bg-background/10"
                  >
                    {running ? "Stop" : "Start"}
                  </button>
                </div>
              </div>
            </div>

            <aside>
              <div className="flex items-end justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
                  Recent solves
                </p>
                <span className="font-mono text-[11px] text-primary">
                  {ao5 ? `ao5 ${fmt(ao5)}` : `${sessionSolves.length} solves`}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-background/10 font-mono text-[13px]">
                {sessionSolves.slice(0, 12).map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <span className="w-8 text-[10px] text-background/40">
                      #{sessionSolves.length - i}
                    </span>
                    <span
                      className={cn("tabular-nums", s.dnf && "text-background/40 line-through")}
                    >
                      {fmt(s.ms)}
                    </span>
                    {best !== null && !s.dnf && s.ms === best ? (
                      <span className="text-[10px] uppercase tracking-[0.1em] text-primary">
                        Best
                      </span>
                    ) : null}
                    <span className="ml-auto flex gap-2 text-[10px] uppercase tracking-[0.1em] text-background/40">
                      <button onClick={() => toggleDnf(s.id)} className="hover:text-background">
                        DNF
                      </button>
                      <button onClick={() => remove(s.id)} className="hover:text-background">
                        Del
                      </button>
                    </span>
                  </li>
                ))}
                {sessionSolves.length === 0 ? (
                  <li className="py-3 text-[12px] text-background/40">
                    No solves for {puzzle.short} yet.
                  </li>
                ) : null}
              </ul>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Best", value: best !== null ? fmt(best) : "—" },
                  { label: "Ao5", value: ao5 ? fmt(ao5) : "—" },
                  { label: "Ao12", value: ao12 ? fmt(ao12) : "—" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-background/10 bg-background/[0.03] p-3"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-background/40">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>

              {sessionSolves.length > 0 ? (
                <button
                  onClick={() => setSolves((prev) => prev.filter((s) => s.puzzle !== puzzleId))}
                  className="mt-4 w-full rounded-lg border border-background/15 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-background/60 transition hover:text-background"
                >
                  Clear {puzzle.short} session
                </button>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
