import { PageWatermark } from "@/components/page-watermark";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AlgorithmMoveDemo } from "@/components/algorithm-move-demo";
import { FaceDiagram } from "@/components/sticker";
import { algorithms, type Track } from "@/lib/algorithms";
import { puzzles, type PuzzleId } from "@/lib/puzzles";
import { tutorialFor, algorithmBelongsTo } from "@/lib/algorithm-tutorials";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/algorithms")({
  validateSearch: (search: Record<string, unknown>): { puzzle?: PuzzleId } =>
    puzzles.some((p) => p.id === search["puzzle"]) ? { puzzle: search["puzzle"] as PuzzleId } : {},
  head: () => ({
    meta: [
      { title: "Algorithms — scrambled eggs" },
      {
        name: "description",
        content:
          "Learn cube notation with interactive 3D moves, then explore puzzle-specific tutorials and algorithms.",
      },
    ],
  }),
  component: AlgorithmsPage,
});
const basicMoves = [
  {
    face: "U",
    name: "Up",
    description: "Turn the top layer. Look down at the top face to judge clockwise.",
  },
  {
    face: "R",
    name: "Right",
    description: "Turn the right layer. Judge clockwise while looking directly at the right face.",
  },
  {
    face: "F",
    name: "Front",
    description: "Turn the face pointing toward you. Keep your front fixed during the sequence.",
  },
  {
    face: "D",
    name: "Down",
    description:
      "Turn the bottom layer. Judge clockwise from underneath, looking at the bottom face.",
  },
  {
    face: "L",
    name: "Left",
    description: "Turn the left layer. Judge clockwise while looking directly at the left face.",
  },
  {
    face: "B",
    name: "Back",
    description: "Turn the rear layer. Judge clockwise from behind, looking directly at that face.",
  },
];
function MoveCard({ face, name, description }: (typeof basicMoves)[number]) {
  const [suffix, setSuffix] = useState("");
  return (
    <article className="tutorial-card">
      <h3 className="text-xl font-bold">
        {face} · {name}
      </h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`${name} turn variants`}>
        {[
          ["", "Clockwise"],
          ["'", "Inverse"],
          ["2", "Half turn"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={suffix === value}
            className={cn("tutorial-button", suffix === value && "bg-display text-background")}
            onClick={() => setSuffix(value!)}
          >
            {face}
            {value} · {label}
          </button>
        ))}
      </div>
      <AlgorithmMoveDemo alg={face + suffix} face={face} />
    </article>
  );
}
function AlgorithmsPage() {
  const { puzzle } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [track, setTrack] = useState<Track>("beginner");
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    setTrack("beginner");
    setGroup("");
    setQuery("");
    setPreview(null);
  }, [puzzle]);
  const selected = puzzles.find((p) => p.id === puzzle);
  const tutorial = puzzle ? tutorialFor(puzzle) : null;
  const pool = puzzle ? algorithms.filter((a) => algorithmBelongsTo(a, puzzle)) : [];
  const trackPool = pool.filter((a) => a.track === track);
  const groups = [...new Set(trackPool.map((a) => a.group))];
  const visible = trackPool.filter(
    (a) =>
      (!group || a.group === group) &&
      `${a.name} ${a.moves} ${a.group}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="algorithms-page min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <section className="themed-section border-b border-line">
        <PageWatermark title="ALGORITHMS" />
        <div className="algorithms-container mx-auto max-w-[1440px] px-5 py-10 sm:px-8">
          <h1 className="algorithms-title mb-6 font-display font-bold">algorithms</h1>
          <div className="tutorial-layout">
            <aside className="tutorial-sidebar">
              <label className="block lg:hidden text-sm font-bold">
                Choose a puzzle
                <select
                  className="mt-2 min-h-11 w-full rounded-lg border border-line bg-panel px-3 text-base"
                  value={puzzle ?? ""}
                  onChange={(e) =>
                    void navigate({
                      search: e.target.value ? { puzzle: e.target.value as PuzzleId } : {},
                      resetScroll: false,
                    })
                  }
                >
                  <option value="">Start here · Basic moves</option>
                  {puzzles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.short}
                    </option>
                  ))}
                </select>
              </label>
              <nav aria-label="Puzzle tutorials" className="hidden lg:block">
                <Link
                  to="/algorithms"
                  search={{}}
                  resetScroll={false}
                  className={cn("tutorial-sidebar-link", !puzzle && "selected")}
                  aria-current={!puzzle ? "page" : undefined}
                >
                  Start here · Basic moves
                </Link>
                <p className="mt-5 mb-2 text-xs uppercase tracking-widest text-muted">Cubes</p>
                {puzzles
                  .filter((p) => p.kind === "nxn")
                  .map((p) => (
                    <Link
                      key={p.id}
                      to="/algorithms"
                      search={{ puzzle: p.id }}
                      resetScroll={false}
                      className={cn("tutorial-sidebar-link", puzzle === p.id && "selected")}
                      aria-current={puzzle === p.id ? "page" : undefined}
                    >
                      {p.short}
                    </Link>
                  ))}
                <p className="mt-5 mb-2 text-xs uppercase tracking-widest text-muted">
                  Other puzzles
                </p>
                {puzzles
                  .filter((p) => p.kind !== "nxn")
                  .map((p) => (
                    <Link
                      key={p.id}
                      to="/algorithms"
                      search={{ puzzle: p.id }}
                      resetScroll={false}
                      className={cn("tutorial-sidebar-link", puzzle === p.id && "selected")}
                      aria-current={puzzle === p.id ? "page" : undefined}
                    >
                      {p.short}
                    </Link>
                  ))}
              </nav>
            </aside>
            <main className="min-w-0" id="tutorial-content">
              {!puzzle ? (
                <>
                  <p className="text-xs uppercase tracking-widest text-primary">Start here</p>
                  <h2 className="mt-2 text-3xl font-bold">Learn the six basic turns</h2>
                  <p className="mt-3 max-w-3xl text-muted">
                    A letter means a 90° clockwise turn when looking directly at that face. An
                    apostrophe (′) means counterclockwise; 2 means 180°. Choose a variant and press
                    Play. Drag a model to inspect it.
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    Hold white above and green toward you to start. U/R/F/D/L/B describe positions,
                    not permanent colours. Turning a face is different from rotating the whole cube.
                  </p>
                  <a
                    className="mt-3 inline-block text-sm text-primary underline"
                    href="https://www.worldcubeassociation.org/regulations/#12a"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WCA move notation reference
                  </a>
                  <div className="mt-6 grid gap-5 xl:grid-cols-2">
                    {basicMoves.map((m) => (
                      <MoveCard key={m.face} {...m} />
                    ))}
                  </div>
                  <div className="tutorial-card mt-6">
                    <h3 className="text-xl font-bold">Read a sequence</h3>
                    <p className="mt-2 text-muted">
                      R U R′ U′ means right clockwise, top clockwise, right inverse, then top
                      inverse. Read left to right. Keep your grip and finish every move before
                      starting the next.
                    </p>
                    <Link
                      to="/algorithms"
                      search={{ puzzle: "3x3" }}
                      className="tutorial-button mt-4 inline-flex bg-primary text-primary-foreground"
                    >
                      Open the 3×3 learning path →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    {selected?.short} learning path
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">Learn the {selected?.short}</h2>
                  <p className="mt-3 text-muted">{tutorial?.intro}</p>
                  <div className="tutorial-card mt-5">
                    <h3 className="text-lg font-bold">Notation & grip</h3>
                    <p className="mt-2 text-sm text-muted">{tutorial?.notation}</p>
                    <a
                      href={tutorial?.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm text-primary underline"
                    >
                      {tutorial?.sourceLabel} ↗
                    </a>
                  </div>
                  <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                    {tutorial?.lessons.map((lesson, i) => (
                      <li className="tutorial-card" key={lesson.title}>
                        <span className="text-xs font-mono text-primary">STEP {i + 1}</span>
                        <h3 className="mt-2 text-xl font-bold">{lesson.title}</h3>
                        <p className="mt-2 text-sm">{lesson.goal}</p>
                        <p className="mt-3 text-sm text-muted">
                          <strong>Check before continuing:</strong> {lesson.check}
                        </p>
                      </li>
                    ))}
                  </ol>
                  {Number(puzzle.split("x")[0]) >= 4 && (
                    <div className="tutorial-card mt-5">
                      <h3 className="font-bold">After reduction</h3>
                      <p className="mt-2 text-sm text-muted">
                        Use the 3×3 algorithms only after centres and edge groups are complete. A
                        4×4 parity sequence is not automatically suitable for wider cubes; follow
                        the size-specific setup in your guide.
                      </p>
                      <Link
                        to="/algorithms"
                        search={{ puzzle: "3x3" }}
                        className="tutorial-button mt-3 inline-flex"
                      >
                        3×3 algorithm library →
                      </Link>
                    </div>
                  )}
                  <h2 className="mt-8 text-2xl font-bold">{selected?.short} algorithm library</h2>
                  <p className="mt-2 text-sm text-muted">
                    Match the case and starting orientation first. Previews demonstrate the moves
                    from a solved puzzle, not the starting case or a complete solve.
                  </p>
                  {pool.length > 0 ? (
                    <>
                      <div className="my-4 flex flex-wrap gap-2">
                        {(["beginner", "advanced"] as Track[])
                          .filter((t) => pool.some((a) => a.track === t))
                          .map((t) => (
                            <button
                              key={t}
                              aria-pressed={track === t}
                              className={cn(
                                "tutorial-button",
                                track === t && "bg-display text-background",
                              )}
                              onClick={() => {
                                setTrack(t);
                                setGroup("");
                                setPreview(null);
                              }}
                            >
                              {t}
                            </button>
                          ))}
                      </div>
                      <div className="mb-5 grid gap-3 sm:grid-cols-2">
                        <label className="text-sm">
                          Search
                          <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Moves, name or stage"
                            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-panel px-3 text-base"
                          />
                        </label>
                        <label className="text-sm">
                          Stage
                          <select
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-panel px-3 text-base"
                          >
                            <option value="">All stages</option>
                            {groups.map((g) => (
                              <option key={g}>{g}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {visible.map((a) => (
                          <article className="tutorial-card" key={a.id}>
                            <p className="text-xs uppercase tracking-wider text-muted">{a.group}</p>
                            <h3 className="mt-2 text-xl font-bold">
                              {puzzle === "2x2" ? a.name.replace(/OLL \d+ — /, "") : a.name}
                            </h3>
                            <p className="my-3 break-words font-mono text-base">{a.moves}</p>
                            {puzzle === "3x3" && <FaceDiagram face={a.face} />}
                            <p className="mt-3 text-sm text-muted">
                              {puzzle === "2x2"
                                ? "Match the corner pattern and grip in the linked 2×2 guide. Keep the solved layer below."
                                : a.description}
                            </p>
                            <a
                              href={a.source ?? tutorial?.source}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-block text-sm text-primary underline"
                            >
                              Setup and tutorial reference ↗
                            </a>
                            <button
                              className="tutorial-button mt-3 block"
                              aria-expanded={preview === a.id}
                              onClick={() => setPreview(preview === a.id ? null : a.id)}
                            >
                              {preview === a.id ? "Hide" : "Show"} 3D moves
                            </button>
                            {preview === a.id && (
                              <AlgorithmMoveDemo puzzle={puzzle} alg={a.moves} />
                            )}
                          </article>
                        ))}
                      </div>
                      {!visible.length && (
                        <p className="mt-4 text-muted">
                          No algorithms match these filters. Try another track or clear the search.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="tutorial-card mt-4">
                      <p className="text-sm text-muted">
                        This learning path uses case-dependent setups and slice choices. Use the
                        linked tutorial for the exact cases; the 3×3 library covers the outer-turn
                        stage after reduction.
                      </p>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
      <SiteFooter compact />
    </div>
  );
}
