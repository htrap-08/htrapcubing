import { SolverHelp } from "@/components/learning-content";
import { solverMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo-navigation";
import { PageWatermark } from "@/components/page-watermark";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { readSolverSession, writeSolverSession } from "@/lib/solver-session";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TwistyCube } from "@/components/twisty-cube";
import { ScanColourSolver } from "@/components/scan-colour-solver";
import { Square1Solver } from "@/components/square1-solver";
const LazySideColourSolver = lazy(() =>
  import("@/components/side-colour-solver").then((module) => ({
    default: module.SideColourSolver,
  })),
);
function SideColourSolver(props: {
  puzzle: "pyraminx" | "megaminx" | "skewb";
  onSolved: (solution: string) => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const fallback = (
    <div className="flex h-[340px] items-center justify-center" role="status">
      Loading colour editor…
    </div>
  );
  return ready ? (
    <Suspense fallback={fallback}>
      <LazySideColourSolver {...props} />
    </Suspense>
  ) : (
    fallback
  );
}
import { ColourSolver } from "@/components/colour-solver";

import { puzzleById, puzzles, type PuzzleId } from "@/lib/puzzles";
import { cn } from "@/lib/utils";

function SolutionPlayer({ solution, puzzle }: { solution: string; puzzle: PuzzleId }) {
  const [setup, setSetup] = useState<string | null>(solution ? null : "");
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!solution) {
      setSetup("");
      return;
    }
    import("cubing/alg")
      .then(({ Alg }) => {
        if (!cancelled) setSetup(new Alg(solution).invert().toString());
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [solution]);
  return setup === null ? (
    <div className="flex h-[400px] items-center justify-center" role="status">
      {error
        ? "Animation could not load. Refresh to retry; the moves above are still available."
        : "Loading solution animation…"}
    </div>
  ) : (
    <TwistyCube puzzle={puzzle} setup={setup} alg={solution} playback />
  );
}

type SolverSearch = { puzzle: PuzzleId };

export const Route = createFileRoute("/scrambledeggs/solver")({
  validateSearch: (search: Record<string, unknown>): SolverSearch => {
    const id = String(search["puzzle"] ?? "3x3") as PuzzleId;
    return { puzzle: puzzles.some((p) => p.id === id) ? id : "3x3" };
  },
  head: ({ match }) => solverMeta(match.search.puzzle),
  component: SolverPage,
});

function SolverPage() {
  const { puzzle: puzzleId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const puzzle = puzzleById(puzzleId);
  const [engineReady, setEngineReady] = useState(false);
  useEffect(() => {
    if (!puzzle.n || puzzle.n < 4) return;
    const controller = new AbortController();
    fetch("/api/nxn/health", { signal: controller.signal })
      .then(async (response) => {
        const health = await response.json();
        if (!controller.signal.aborted) setEngineReady(response.ok && health.ready === true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setEngineReady(false);
      });
    return () => controller.abort();
  }, [puzzleId, puzzle.n]);
  const [mode, setMode] = useState<"colours" | "scan">("colours");
  const [custom, setCustom] = useState<string | null>(null);
  const [graphInput, setGraphInput] = useState("");
  useEffect(() => {
    if (puzzleId !== "3x3") return;
    const saved = readSolverSession();
    setGraphInput(saved.input ?? "");
    if (saved.mode) setMode(saved.mode);
    if (saved.solution) setCustom(saved.solution);
  }, [puzzleId]);
  const onInputChange = useCallback((input: string) => setGraphInput(input), []);
  const onSolved = useCallback(
    (solution: string, input?: string) => {
      setCustom(solution);
      if (puzzleId === "3x3") {
        const value = input ?? readSolverSession().input ?? "";
        setGraphInput(value);
        writeSolverSession({ solution, input: value });
      }
    },
    [puzzleId],
  );
  const selectPuzzle = (id: PuzzleId) => {
    navigate({ search: { puzzle: id }, resetScroll: false });
    setCustom(null);
    setMode("colours");
  };
  const cubeButtons = puzzles.filter((p) => p.kind === "nxn");
  const otherButtons = puzzles.filter((p) => p.kind !== "nxn");
  return (
    <div className="solver-page min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <section className="themed-section relative overflow-hidden border-b border-line">
        <PageWatermark title="SOLVER" />
        <div className="solver-container relative mx-auto px-5 pb-4 pt-6 sm:px-8">
          <Breadcrumbs />
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {puzzle.short} cube solver
          </h1>
          <p className="mt-4 max-w-[52ch] text-[15px] text-muted">
            Enter your puzzle’s colors or scan it to get its solution.
          </p>
          <div className="solver-layout mt-10 grid items-start gap-5">
            <aside className="rounded-xl border border-line bg-panel p-4 solver-puzzles">
              <p className="font-mono text-[20px] uppercase tracking-[0.075em] text-muted">Cubes</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5 font-mono text-[12px]">
                {cubeButtons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPuzzle(p.id)}
                    className={cn(
                      "rounded-md border py-1.5 transition",
                      p.id === puzzle.id
                        ? "border-primary bg-primary font-medium text-primary-foreground"
                        : "border-line bg-panel-2 hover:bg-panel",
                    )}
                  >
                    {p.short}
                  </button>
                ))}
              </div>

              <p className="mt-4 font-mono text-[20px] uppercase tracking-[0.075em] text-muted">
                Other puzzles
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
                {otherButtons.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPuzzle(p.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 transition",
                      p.id === puzzle.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-line bg-panel-2 hover:bg-panel",
                    )}
                  >
                    {p.short}
                  </button>
                ))}
              </div>
              {puzzleId === "3x3" && graphInput.length === 54 && (
                <Link
                  to="/scrambledeggs/cool-stuff"
                  search={{ source: "solver" }}
                  className="cool-animation-link mt-5 flex min-h-11 items-center justify-center rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Cool animation
                </Link>
              )}
            </aside>
            <div className="rounded-xl border border-line bg-panel p-5 solver-panel">
              <div className="solver-panel-heading flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-[40px] font-bold">{puzzle.short}</h2>
                {puzzle.kind === "nxn" && (
                  <div className="flex rounded-md border border-line bg-panel-2 p-0.5 font-mono text-base">
                    {(["colours", "scan"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMode(m);
                          setCustom(null);
                        }}
                        className={cn(
                          "rounded px-2 py-4",
                          mode === m ? "bg-display text-background" : "text-muted",
                        )}
                      >
                        {m === "scan" ? "Scan my colors" : "Enter my colours"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {puzzle.n && puzzle.n >= 4 && !engineReady && (
                <div className="solver-service-notice" role="status">
                  <strong>Automatic big-cube solving is currently unavailable.</strong>
                  <p>
                    You can use the colour editor and scanner, but they cannot return a solution
                    until the separate service is online.{" "}
                    <Link to="/scrambledeggs/algorithms" search={{ puzzle: puzzle.id }}>
                      Learn the {puzzle.short} reduction method instead →
                    </Link>
                  </p>
                </div>
              )}
              {puzzle.kind === "square1" ? (
                <Square1Solver key={puzzle.id} />
              ) : custom !== null ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-primary">Your solution</p>
                  <p className="mt-2 max-h-48 overflow-y-auto break-words font-mono text-sm">
                    {custom || "Already solved"}
                  </p>
                  <SolutionPlayer
                    key={`${puzzle.id}:${custom}`}
                    puzzle={puzzle.id}
                    solution={custom}
                  />
                  <button
                    type="button"
                    onClick={() => setCustom(null)}
                    className="mt-3 rounded border border-line px-3 py-2 text-sm"
                  >
                    Enter another puzzle
                  </button>
                </div>
              ) : puzzle.kind === "nxn" ? (
                mode === "scan" ? (
                  <ScanColourSolver
                    key={puzzle.id}
                    n={puzzle.n!}
                    onSolved={onSolved}
                    onInputChange={onInputChange}
                  />
                ) : (
                  <ColourSolver
                    key={puzzle.id}
                    n={puzzle.n!}
                    onSolved={onSolved}
                    onInputChange={onInputChange}
                  />
                )
              ) : (
                <SideColourSolver key={puzzle.id} puzzle={puzzle.kind} onSolved={onSolved} />
              )}
            </div>
          </div>
        </div>
      </section>
      <SolverHelp puzzle={puzzleId} />
      <SiteFooter compact />
    </div>
  );
}
