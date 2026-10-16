import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

const features = [
  {
    label: "01 / SOLVE",
    title: "Every scramble has a solution.",
    copy: "Paint your puzzle or scan its colours. Find the solution and follow every turn.",
    to: "/scrambledeggs/solver",
    action: "Explore the solver",
    kind: "cube",
  },
  {
    label: "02 / IMPROVE",
    title: "One more solve.",
    copy: "Fresh scrambles, a focused timer and your session history. Make the next solve your best.",
    to: "/scrambledeggs/timer",
    action: "Try the timer",
    kind: "timer",
  },
  {
    label: "03 / EXPERIMENT",
    title: "A different way to see a cube.",
    copy: "Follow the connections between stickers as a cube solves itself. A little maths, in motion.",
    to: "/scrambledeggs/cool-stuff",
    action: "Explore cool stuff",
    kind: "graph",
  },
] as const;

/** Scroll only updates compositor transforms; no animation library or media downloads. */
export function PortfolioProjectShowcase() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const distance = bounds.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, distance)));
      element.querySelectorAll<HTMLElement>(".linear-project-card").forEach((card, index) => {
        const step = Math.max(0, Math.min(1, progress * 2.5 - (index - 1)));
        card.style.setProperty("--card-entry", String(index === 0 ? 1 : step));
        // Keep covered cards out of the keyboard sequence while retaining the final CTA.
        card.inert = !media.matches && index !== Math.min(2, Math.floor(progress * 2.5 + 0.05));
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <section ref={section} className="linear-projects" aria-labelledby="portfolio-projects">
      <div className="linear-project-stage">
        <div className="linear-project-heading">
          <div>
            <p className="portfolio-eyebrow">Selected project / 01</p>
            <h2 id="portfolio-projects">
              scrambled eggs<span>.</span>
            </h2>
          </div>
          <Link to="/scrambledeggs" className="linear-project-open">
            Open project <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="linear-project-deck">
          {features.map((feature, index) => (
            <article
              key={feature.kind}
              className={`linear-project-card linear-card-${feature.kind}`}
              style={{ zIndex: index + 1 }}
            >
              <div className="linear-card-art" aria-hidden="true">
                <span className="linear-art-brand">scrambled eggs</span>
                {feature.kind === "cube" && (
                  <div className="linear-cube-grid">
                    {Array.from({ length: 9 }, (_, i) => (
                      <span key={i} />
                    ))}
                  </div>
                )}
                {feature.kind === "timer" && (
                  <div className="linear-timer-art">
                    <span>YOUR NEXT PERSONAL BEST</span>
                    <strong>12.84</strong>
                    <div>
                      <i /> ready when you are
                    </div>
                  </div>
                )}
                {feature.kind === "graph" && (
                  <svg className="linear-graph-art" viewBox="0 0 320 260">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <g key={i} transform={`rotate(${i * 60} 160 130)`}>
                        <ellipse cx="160" cy="130" rx="103" ry="52" />
                        <circle cx="263" cy="130" r="5" />
                      </g>
                    ))}
                    <circle cx="160" cy="130" r="8" />
                  </svg>
                )}
                <span className="linear-art-caption">
                  {feature.kind === "cube"
                    ? "FROM SCRAMBLE TO SOLVED"
                    : feature.kind === "timer"
                      ? "FOCUS. TURN. REPEAT."
                      : "EVERY STICKER IS CONNECTED"}
                </span>
              </div>
              <div className="linear-card-copy">
                <p className="portfolio-eyebrow">{feature.label}</p>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
                <Link to={feature.to} className="linear-feature-link">
                  {feature.action} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="linear-scroll-hint">
          Scroll to explore <span aria-hidden="true">↓</span>
        </p>
      </div>
    </section>
  );
}
