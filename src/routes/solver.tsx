import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CubeNet, solvedNet, type NetState } from "@/components/cube-net";
import { TwistyCube, twistyPuzzleConfig } from "@/components/twisty-cube";
import { SideColourSolver } from "@/components/side-colour-solver";
import { Alg } from "cubing/alg";
import { ColourSolver } from "@/components/colour-solver";
import { FaceDiagram, Sticker } from "@/components/sticker";
import type { StickerKey } from "@/lib/algorithms";
import {
  faceNames,
  generateScramble,
  puzzleById,
  puzzles,
  type FaceKey,
  type PuzzleId,
} from "@/lib/puzzles";
import { guideFor } from "@/lib/solve-guides";
import { cn } from "@/lib/utils";

type SolverSearch = { puzzle: PuzzleId };

export const Route = createFileRoute("/solver")({
  validateSearch: (search: Record<string, unknown>): SolverSearch => {
    const id = String(search["puzzle"] ?? "3x3") as PuzzleId;
    return { puzzle: puzzles.some((p) => p.id === id) ? id : "3x3" };
  },
  head: () => ({
    meta: [
      { title: "Solver — AXIOM/CUBE" },
      {
        name: "description",
        content:
          "Step-by-step solve walkthroughs for 2×2 through 10×10 cubes plus Pyraminx, Megaminx and Skewb, with a paintable cube net and fresh scrambles.",
      },
      { property: "og:title", content: "Solver — AXIOM/CUBE" },
      {
        property: "og:description",
        content:
          "Pick a puzzle, paint in your cube, and follow a phase-by-phase walkthrough to the solved state.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolverPage,
});

const palette: { key: StickerKey; face: FaceKey }[] = [
  { key: "u", face: "U" },
  { key: "r", face: "R" },
  { key: "f", face: "F" },
  { key: "d", face: "D" },
  { key: "l", face: "L" },
  { key: "b", face: "B" },
];

function SolverPage() {
  const { puzzle: puzzleId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const puzzle = puzzleById(puzzleId ?? "3x3");
  const n = puzzle.n ?? 3;

  const [scramble, setScramble] = useState("…");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setScramble(generateScramble(puzzle)), []);
  const [net, setNet] = useState<NetState>(() => solvedNet(n));
  const [brush, setBrush] = useState<StickerKey>("u");
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"practice" | "colours">("practice");
  const [custom, setCustom] = useState<string | null>(null);
  const canPaint = true;

  const steps = useMemo(() => guideFor(puzzle.id), [puzzle.id]);
  const current = steps[Math.min(step, steps.length - 1)];

  const selectPuzzle = (id: PuzzleId) => {
    const next = puzzleById(id);
    navigate({ search: { puzzle: id }, resetScroll: false });
    setScramble(generateScramble(next));
    setNet(solvedNet(next.n ?? 3));
    setStep(0);
    setCustom(null);
    setMode("practice");
  };

  const paint = (face: FaceKey, index: number) =>
    setNet((prev) => {
      const cells = [...prev[face]];
      cells[index] = brush;
      return { ...prev, [face]: cells };
    });

  const cubeButtons = puzzles.filter((p) => p.kind === "nxn");
  const otherButtons = puzzles.filter((p) => p.kind !== "nxn");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 select-none font-display text-[22vw] font-bold leading-none text-display-soft">
          SOLVER
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 pb-14 pt-14 sm:px-8">
          <div className="rise max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              (a) Solver
            </p>
            <h1 className="mt-3 text-balance font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Solve it, one turn at a time
            </h1>
            <p className="mt-4 max-w-[52ch] text-pretty text-[15px] text-muted">{puzzle.blurb}</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            {/* Controls */}
            <div className="rise lg:col-span-3">
              <div className="rounded-xl border border-line bg-panel p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  Puzzle
                </p>
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

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
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

                <div className="mt-5 rounded-lg border border-line bg-background p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                    Your scramble
                  </p>
                  <p className="mt-2 whitespace-pre-line font-mono text-[13px] leading-relaxed">
                    {scramble}
                  </p>
                  <button
                    onClick={() => setScramble(generateScramble(puzzle))}
                    className="mt-3 w-full rounded-md border border-line bg-panel-2 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition hover:bg-panel"
                  >
                    New scramble
                  </button>
                </div>
              </div>
            </div>

            {/* Net */}
            <div className="rise lg:col-span-5" style={{ animationDelay: "120ms" }}>
              <div className="flex h-full flex-col rounded-xl border border-line bg-panel p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  {puzzle.short}
                  </p>
                  {canPaint ? (
                    <div className="flex rounded-md border border-line bg-panel-2 p-0.5 font-mono text-[10px] uppercase tracking-[0.08em]">
                      {(["practice", "colours"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMode(m)}
                          className={cn(
                            "rounded px-2 py-1 transition",
                            mode === m
                              ? "bg-display text-background"
                              : "text-muted hover:text-foreground",
                          )}
                        >
                          {m === "practice" ? "Practice" : "Enter my colours"}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {canPaint && mode === "colours" ? (
                  puzzle.kind !== "nxn" ? (
                    <SideColourSolver
                      key={puzzle.id}
                      puzzle={puzzle.kind}
                      onSolved={(solution) => {
                        setCustom(solution);
                        setMode("practice");
                      }}
                    />
                  ) : (
                    <ColourSolver
                      key={puzzle.id}
                      n={n}
                      onSolved={(solution) => {
                        setCustom(solution);
                        setMode("practice");
                      }}
                    />
                  )
                ) : twistyPuzzleConfig[puzzle.id] ? (
                  <div className="mt-3 flex flex-1 flex-col">
                    {custom ? (
                      <div className="mb-3 rounded-lg border border-primary/40 bg-background p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                          Your solution · {custom.split(" ").length} moves
                        </p>
                        <p className="mt-1.5 max-h-48 overflow-y-auto break-words font-mono text-[13px] leading-relaxed">
                          {custom}
                        </p>
                        <p className="mt-1.5 text-[12px] text-muted">
                          Hold your puzzle with the same colours facing you and follow the moves
                          above.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCustom(null)}
                          className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted hover:text-foreground"
                        >
                          Back to walkthrough
                        </button>
                      </div>
                    ) : null}
                    <TwistyCube
                      key={puzzle.id}
                      puzzle={puzzle.id}
                      setup={custom ? new Alg(custom).invert().toString() : ""}
                      alg={custom ?? ""}
                    />
                    <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                      Click a face or use the buttons to turn · drag to rotate
                    </p>
                  </div>
                ) : puzzle.kind === "nxn" ? (
                  <>
                    <p className="mt-3 text-[12px] text-muted">
                      3D model isn't available for {puzzle.short} yet — paint the net instead.
                    </p>
                    <div className="mt-5 flex-1 place-items-center">
                      <CubeNet n={n} state={net} onPaint={paint} />
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                        Brush
                      </span>
                      {palette.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => setBrush(p.key)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] transition",
                            brush === p.key
                              ? "border-primary bg-panel-2"
                              : "border-line hover:bg-panel-2",
                          )}
                        >
                          <Sticker value={p.key} className="size-3" />
                          {faceNames[p.face]}
                        </button>
                      ))}
                      <button
                        onClick={() => setNet(solvedNet(n))}
                        className="ml-auto rounded-md border border-line bg-panel-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition hover:bg-panel"
                      >
                        Reset net
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-4 text-center">
                    <FaceDiagram
                      face={["x", "f", "x", "l", "d", "r", "x", "b", "x"]}
                      size="size-8"
                    />
                    <p className="max-w-[34ch] text-pretty text-[13px] text-muted">
                      {puzzle.label} isn't a square net — follow the walkthrough on the right and
                      work directly on the puzzle in your hands.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="rise lg:col-span-4" style={{ animationDelay: "180ms" }}>
              <div className="rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                    Walkthrough
                  </p>
                  <span className="font-mono text-[11px] text-primary">
                    step {Math.min(step + 1, steps.length)} / {steps.length}
                  </span>
                </div>

                {current ? (
                  <div className="mt-4 rounded-lg border border-line bg-background p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                      {current.phase}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold tracking-tight">
                      {current.title}
                    </h2>
                    <div className="mt-3 flex items-start gap-4">
                      <FaceDiagram face={current.face} />
                      <p className="font-mono text-[14px] font-medium leading-relaxed">
                        {current.moves}
                      </p>
                    </div>
                    <p className="mt-3 text-pretty text-[13px] text-muted">{current.look}</p>
                  </div>
                ) : null}

                <ol className="mt-4 divide-y divide-line font-mono text-[12px]">
                  {steps.map((s, i) => (
                    <li key={s.title}>
                      <button
                        onClick={() => setStep(i)}
                        className={cn(
                          "flex w-full items-center gap-3 py-2 text-left transition",
                          i === step ? "text-foreground" : "text-muted hover:text-foreground",
                        )}
                      >
                        <span className="w-5 text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="truncate">{s.title}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-[0.1em]">
                          {s.phase}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="rounded-md border border-line bg-panel-2 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition hover:bg-background"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                    className="rounded-md bg-display py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-background transition hover:brightness-125"
                  >
                    Next step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
