import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/seo-navigation";
import { seoMeta } from "@/lib/seo";
export const Route = createFileRoute("/scrambledeggs/about")({
  head: () =>
    seoMeta(
      "About scrambled eggs — A Project by Parth Gupta",
      "Meet the creator of scrambled eggs and learn how its cube solvers, tutorial references, camera scanner and timer work, including current limitations.",
    ),
  component: About,
});
function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <main className="legal-copy">
        <Breadcrumbs />
        <h1>About scrambled eggs</h1>
        <p>
          scrambled eggs is a puzzle-tools project by <a href="/">Parth Gupta</a>. It brings
          together physical-puzzle colour entry, camera scanning, 3D move demonstrations, a practice
          timer and experiments with cube sticker permutations.
        </p>
        <h2>How the tools are checked</h2>
        <p>
          The repository includes automated checks for cube colour classification, scan state,
          solver-session persistence, graph moves, puzzle-specific algorithms and Square-1 solving.
          These checks cover specific examples and regressions; they do not prove every possible
          physical puzzle state is solvable or every scan is accurate. Review detected colours and
          never force a blocked turn.
        </p>
        <h2>Learning material and sources</h2>
        <p>
          Tutorial pages separate puzzle-specific preparation from the shared 3×3 finishing method.
          Algorithm references identify external guides for the starting case and grip. The 3D
          examples illustrate move sequences; a constructed example is not a substitute for
          recognising a case on your cube.
        </p>
        <p>
          The learning content was updated on <time dateTime="2026-10-19">19 October 2026</time>.
          Source links and software attribution are available on the{" "}
          <Link to="/legal">licences page</Link>. No competition credentials or independent
          certification are claimed.
        </p>
        <h2>Current solver availability</h2>
        <p>
          Small-cube and side-puzzle engines run in your browser. Automatic solving for 4×4–10×10
          requires a separately hosted engine and is currently unavailable; the colour editors,
          tutorials and timer remain available. A service-status message appears before the big-cube
          editor.
        </p>
        <h2>Contact and feedback</h2>
        <p>
          Report reproducible, non-sensitive bugs in the{" "}
          <a href="https://github.com/htrap-08/htrapcubing/issues" target="_blank" rel="noreferrer">
            public issue tracker
          </a>
          . Include the puzzle, browser and steps, but do not post private camera images or
          credentials. For private enquiries, email{" "}
          <a href="mailto:parthg08@gmail.com">parthg08@gmail.com</a>.
        </p>
        <p>
          <Link to="/scrambledeggs/solver" search={{ puzzle: "3x3" }}>
            Open the 3×3 solver
          </Link>{" "}
          · <Link to="/scrambledeggs/algorithms">Learn cube notation</Link> ·{" "}
          <Link to="/privacy">Privacy notice</Link>
        </p>
      </main>
      <SiteFooter compact />
    </div>
  );
}
