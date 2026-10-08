import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TwistyCube } from "@/components/twisty-cube";
import { ScanColourSolver } from "@/components/scan-colour-solver";
import { Square1Solver } from "@/components/square1-solver";
import { SideColourSolver } from "@/components/side-colour-solver";
import { ColourSolver } from "@/components/colour-solver";
import { Alg } from "cubing/alg";
import { puzzleById, puzzles, type PuzzleId } from "@/lib/puzzles";
import { cn } from "@/lib/utils";

type SolverSearch = { puzzle: PuzzleId };

export const Route = createFileRoute("/solver")({
  validateSearch: (search: Record<string, unknown>): SolverSearch => {
    const id = String(search["puzzle"] ?? "3x3") as PuzzleId;
    return { puzzle: puzzles.some((p) => p.id === id) ? id : "3x3" };
  },
  head: () => ({
    meta: [
      { title: "Solver — scrambled eggs" },
      {
        name: "description",
        content:
          "Enter or scan your puzzle colours and follow an animated solution for 2×2 through 10×10, Pyraminx, Megaminx, Skewb and Square-1.",
      },
      { property: "og:title", content: "Solver — scrambled eggs" },
      {
        property: "og:description",
        content: "Pick a puzzle, enter its colours, and follow the solution moves.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolverPage,
});

function SolverPage() {
  const { puzzle: puzzleId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const puzzle = puzzleById(puzzleId);
  const [mode, setMode] = useState<"colours" | "scan">("colours");
  const [custom, setCustom] = useState<string | null>(null);
  const onSolved = useCallback((solution: string) => setCustom(solution), []);
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
      <section className="relative overflow-hidden border-b border-line">
        <div className="solver-background pointer-events-none absolute inset-0 opacity-40" />
        <div className="solver-container relative mx-auto px-5 pb-4 pt-6 sm:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Solve it, one move at a time
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
              {puzzle.kind === "square1" ? (
                <Square1Solver key={puzzle.id} />
              ) : custom !== null ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-primary">Your solution</p>
                  <p className="mt-2 max-h-48 overflow-y-auto break-words font-mono text-sm">
                    {custom || "Already solved"}
                  </p>
                  <TwistyCube
                    key={puzzle.id}
                    puzzle={puzzle.id}
                    setup={custom ? new Alg(custom).invert().toString() : ""}
                    alg={custom}
                    playback
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
                  <ScanColourSolver key={puzzle.id} n={puzzle.n!} onSolved={onSolved} />
                ) : (
                  <ColourSolver key={puzzle.id} n={puzzle.n!} onSolved={onSolved} />
                )
              ) : (
                <SideColourSolver key={puzzle.id} puzzle={puzzle.kind} onSolved={onSolved} />
              )}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter compact />
    </div>
  );
}
