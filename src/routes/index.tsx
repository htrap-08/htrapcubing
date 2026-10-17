import { useEffect } from "react";
import { PortfolioContact } from "@/components/portfolio-contact";
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
  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation?.type !== "reload") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="portfolio-page">
      <main className="portfolio-main">
        <section className="portfolio-intro">
          <PortfolioNameIntro />
        </section>
        <PortfolioProjectShowcase />
        <PortfolioContact />
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
