import { useEffect } from "react";
import { PortfolioContact } from "@/components/portfolio-contact";
import { PortfolioProjectShowcase } from "@/components/portfolio-project-showcase";
import { PortfolioNameIntro } from "@/components/portfolio-name-intro";
import { createFileRoute } from "@tanstack/react-router";
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
          <h2 className="portfolio-projects-heading">
            <a href="#portfolio-projects">
              Projects <span aria-hidden="true">↓</span>
            </a>
          </h2>
        </section>
        <PortfolioProjectShowcase />
        <PortfolioContact />
      </main>
    </div>
  );
}
