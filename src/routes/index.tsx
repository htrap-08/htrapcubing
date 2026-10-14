import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Parth — Portfolio" },
      {
        name: "description",
        content:
          "Parth’s portfolio and projects. Explore scrambled eggs, an interactive cubing toolkit.",
      },
      { property: "og:title", content: "Parth — Portfolio" },
      { property: "og:description", content: "Projects and experiments by Parth." },
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
          <h1>Hi, I’m Parth.</h1>
          <p className="portfolio-intro-copy">Projects and experiments.</p>
        </section>
        <section aria-labelledby="portfolio-projects" className="portfolio-projects">
          <h2 id="portfolio-projects">Projects</h2>
          <article className="portfolio-project">
            <div className="portfolio-project-icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <rect
                  x="5"
                  y="5"
                  width="54"
                  height="54"
                  rx="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                {[0, 1, 2].flatMap((r) =>
                  [0, 1, 2].map((c) => (
                    <rect
                      key={`${r}-${c}`}
                      x={10 + c * 15}
                      y={10 + r * 15}
                      width="13"
                      height="13"
                      rx="2"
                      fill={(r + c) % 2 === 0 ? "#e85522" : "currentColor"}
                      opacity={(r + c) % 2 === 0 ? 1 : 0.16}
                    />
                  )),
                )}
              </svg>
            </div>
            <div className="portfolio-project-content">
              <p className="portfolio-eyebrow">Cubing toolkit</p>
              <h3>scrambled eggs</h3>
              <p>
                Puzzle solvers, camera colour scanning, visual move tutorials, a timer and
                interactive cube experiments.
              </p>
              <Link to="/scrambledeggs" className="portfolio-project-button">
                Open scrambled eggs <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        </section>
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
