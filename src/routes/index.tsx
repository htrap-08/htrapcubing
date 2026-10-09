import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Square1Icon } from "@/components/square1-icon";
import { FaceDiagram } from "@/components/sticker";
import { puzzles } from "@/lib/puzzles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "scrambled eggs" },
      {
        name: "description",
        content:
          "Step-by-step solve guides for 2×2 to 10×10, Pyraminx, Megaminx and Skewb, a visual beginner and CFOP algorithm library, plus scrambles and a speedsolving timer.",
      },
      {
        property: "og:title",
        content: "scrambled eggs",
      },
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
    tag: "Solver",
    title: "We solve it for you",
    body: "Pick any cube from 2×2 to 10×10, plus a lot more. Paint it yourself or scan the cube using your camera. Follow the solution",
  },
  {
    to: "/algorithms" as const,
    tag: "Algorithms",
    title: "We solve it for you",
    body: "Two tracks: a beginner method with basic algorithms, and an advanced shelf covering F2L, OLL, PLL, commutators and big-cube parity.",
  },
  {
    to: "/timer" as const,
    tag: "Timer",
    title: "Time your progress",
    body: "Official-style scrambles for every puzzle, a hold-to-start timer, and a session log.",
  },
];

const homepagePuzzles = [
  ["2×2 The Eggbite", "Easiest"],
  ["3×3 The Classic Scramble", "The original"],
  ["4×4 The Skillet", "Entry to the big cubes"],
  ["5×5 The Casserole", "Odd big cube"],
  ["6×6 The Omelette", "Wide-layer reduction"],
  ["7×7 The Frittata", "Need to be patient"],
  ["8×8 The Quiche", "Kinda easy"],
  ["9×9 The Full English", "Centers anchor to fixed middles."],
  ["10×10 The All-You-Can Eat", "Big One"],
  ["Pyraminx The Toast Triangle", "Tetrahedron typa"],
  ["Megaminx The Fruit Salad", "Dodecahedron typa"],
  ["Skewb The French Toast", "Corner-turning cube"],
  ["Square-1 The Layer Cake", "Shapeshifter"],
];

function Home() {
  return (
    <div className="homepage bg-background text-foreground">
      <SiteHeader compact />
      <main>
        <section className="home-hero">
          <img className="home-gradient" src="/images/home-gradient.svg" alt="" />
          <div className="home-watermark" aria-hidden="true">
            CUBE
          </div>
          <div className="home-container home-hero-content">
            <h1>not just a cube solver</h1>
            <p className="home-intro">
              Various puzzles, a visual algorithm library from layer-by-layer to advanced
              algorithms, a timer and many more
            </p>
            <div className="home-features">
              {sections.map((section) => (
                <Link key={section.to} to={section.to} className="home-feature">
                  <p className="home-feature-tag">{section.tag}</p>
                  <h2>{section.title}</h2>
                  <p className="home-feature-body">{section.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="home-puzzles">
          <div className="home-container home-puzzle-grid">
            <h2>Thirteen Puzzles</h2>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 10, 9].map((index) => {
              const puzzle = puzzles[index];
              if (!puzzle) return null;
              return (
                <Link
                  key={puzzle.id}
                  to="/solver"
                  search={{ puzzle: puzzle.id }}
                  className="home-puzzle-card"
                >
                  {puzzle.kind === "square1" ? (
                    <Square1Icon />
                  ) : puzzle.kind === "nxn" && puzzle.n ? (
                    <img
                      src={`/images/home-cube-${puzzle.n}.svg`}
                      alt={`${puzzle.n} by ${puzzle.n} cube grid`}
                      className="home-cube-icon"
                    />
                  ) : (
                    <FaceDiagram
                      face={["u", "f", "u", "f", "d", "f", "u", "f", "u"]}
                      size="size-3"
                    />
                  )}
                  <div className="min-w-0">
                    <h3>{homepagePuzzles[index]?.[0] ?? puzzle.label}</h3>
                    <p>{homepagePuzzles[index]?.[1] ?? puzzle.blurb}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter compact />
    </div>
  );
}
