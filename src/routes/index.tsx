import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CubeDimensionIcon } from "@/components/cube-dimension-icon";
import { FaceDiagram } from "@/components/sticker";
import { puzzles } from "@/lib/puzzles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXIOM/CUBE — Twisty puzzle solver, algorithms and timer" },
      {
        name: "description",
        content:
          "Step-by-step solve guides for 2×2 to 10×10, Pyraminx, Megaminx and Skewb, a visual beginner and CFOP algorithm library, plus scrambles and a speedsolving timer.",
      },
      { property: "og:title", content: "AXIOM/CUBE — Twisty puzzle solver, algorithms and timer" },
      {
        property: "og:description",
        content:
          "Solve guides for every cube from 2×2 to 10×10, a visual algorithm library, and a scramble timer built for speedcubers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const sections = [
  {
    to: "/solver" as const,
    tag: "(a) Solver",
    title: "Solve it, one turn at a time.",
    body: "Pick any cube from 2×2 to 10×10, plus a lot more. Paint in your scrambled cube, follow the turns.",
  },
  {
    to: "/algorithms" as const,
    tag: "(b) Algorithms",
    title: "Every turn, on record.",
    body: "Two tracks: a beginner method with basic algorithms, and an advanced shelf covering F2L, OLL, PLL, commutators and big-cube parity.",
  },
  {
    to: "/timer" as const,
    tag: "(c) Timer",
    title: "Time your progress.",
    body: "Official-style scrambles for every puzzle, a hold-to-start timer, and a session log.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 select-none font-display text-[22vw] font-bold leading-none text-display-soft">
          CUBE
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-14 sm:px-8">
          <div className="rise max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Cubing Website
            </p>
            <h1 className="mt-3 text-balance font-display text-5xl font-bold tracking-tight sm:text-6xl">
              learn it, solve it
            </h1>
            <p className="mt-4 max-w-[52ch] text-pretty text-[15px] text-muted">
              Various puzzles, a visual algorithm library from first layer to commutators, and a
              timer that keeps your session honest
            </p>
            <div className="mt-7 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
              <Link
                to="/solver"
                search={{ puzzle: "3x3" }}
                className="rounded-md bg-display px-5 py-2.5 text-background transition hover:brightness-125"
              >
                Open the solver
              </Link>
              <Link
                to="/timer"
                className="rounded-md border border-line bg-panel px-5 py-2.5 transition hover:bg-panel-2"
              >
                Start timing
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {sections.map((s, i) => (
              <Link
                key={s.to}
                to={s.to}
                className="rise rounded-xl border border-line bg-panel p-5 transition hover:border-primary/40"
                style={{ animationDelay: `${60 * (i + 1)}ms` }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                  {s.tag}
                </p>
                <h2 className="mt-2 text-balance font-display text-2xl font-bold tracking-tight">
                  {s.title}
                </h2>
                <p className="mt-3 text-pretty text-[13px] text-muted">{s.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="self-start">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Supported puzzles
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight">
                Twelve puzzles, one method of thinking.
              </h2>
              <p className="mt-4 text-[13px] text-muted">
                Every big cube reduces to a 3×3. Learn the core once and the rest is scale.
              </p>
            </aside>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {puzzles.map((p) => (
                <Link
                  key={p.id}
                  to="/solver"
                  search={{ puzzle: p.id }}
                  className="flex items-start gap-4 rounded-xl border border-line bg-panel p-4 transition hover:border-primary/40"
                >
                  {p.kind === "nxn" && p.n ? (
                    <CubeDimensionIcon n={p.n} />
                  ) : (
                    <FaceDiagram
                      face={["u", "f", "u", "f", "d", "f", "u", "f", "u"]}
                      size="size-3"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold tracking-tight">{p.label}</h3>
                    <p className="mt-1 text-pretty text-[12px] text-muted">{p.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
