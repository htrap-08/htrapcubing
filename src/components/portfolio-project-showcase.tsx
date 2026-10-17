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

/** Reveal cards once as they enter the normal document viewport. */
export function PortfolioProjectShowcase() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const cards = element.querySelectorAll<HTMLElement>(".linear-project-card");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    cards.forEach((card) => {
      card.dataset["reveal"] = "true";
      observer.observe(card);
    });
    return () => {
      observer.disconnect();
      cards.forEach((card) => delete card.dataset["reveal"]);
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
          {features.map((feature) => (
            <article
              key={feature.kind}
              className={`linear-project-card linear-card-${feature.kind}`}
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
      </div>
    </section>
  );
}
