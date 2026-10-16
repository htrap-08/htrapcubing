import { PortfolioProjectShowcase } from "@/components/portfolio-project-showcase";
import { PortfolioNameIntro } from "@/components/portfolio-name-intro";
import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parth Gupta — Portfolio" },
      {
        name: "description",
        content:
          "Parth Gupta’s portfolio and projects. Explore scrambled eggs, an interactive cubing toolkit.",
      },
      { property: "og:title", content: "Parth Gupta — Portfolio" },
      { property: "og:description", content: "Projects and experiments by Parth Gupta." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Portfolio,
});
function Portfolio() {
  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <Link to="/" className="portfolio-name">
          Parth<span aria-hidden="true">.</span>
        </Link>
        <a href="mailto:parthg08@gmail.com" className="portfolio-contact">
          Get in touch ↗
        </a>
      </header>
      <main className="portfolio-main">
        <section className="portfolio-intro">
          <p className="portfolio-eyebrow">htrap.in / portfolio</p>
          <PortfolioNameIntro />
          <p className="portfolio-intro-copy">Projects and experiments.</p>
        </section>
        <PortfolioProjectShowcase />
      </main>
      <footer className="portfolio-footer">
        <span>Parth · htrap.in</span>
        <a href="mailto:parthg08@gmail.com">parthg08@gmail.com</a>
        <nav aria-label="Site information">
          <Link to="/privacy">Privacy</Link>
          <Link to="/legal">Licences</Link>
        </nav>
      </footer>
    </div>
  );
}
