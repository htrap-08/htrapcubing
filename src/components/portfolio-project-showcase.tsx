import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

const cards = [
  { kind: "cover", title: "scrambled eggs", to: "/scrambledeggs", label: "Open scrambled eggs" },
  {
    kind: "solver",
    title: "Every scramble has a solution.",
    copy: "Paint your puzzle or scan its colours. Follow the solution, one turn at a time.",
    to: "/scrambledeggs/solver",
    label: "Explore the solver",
  },
  {
    kind: "timer",
    title: "One more solve.",
    copy: "Fresh scrambles. A focused timer. Your next personal best.",
    to: "/scrambledeggs/timer",
    label: "Try the timer",
  },
  {
    kind: "graph",
    title: "See the connections.",
    copy: "Watch the sticker graph move with the cube. A little maths, in motion.",
    to: "/scrambledeggs/cool-stuff",
    label: "Explore cool stuff",
  },
] as const;

function CubeArtwork() {
  return (
    <div className="project-cube" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

/** Cards stay in normal page flow; their reveal follows the viewport, not a timer. */
export function PortfolioProjectShowcase() {
  const reel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = reel.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = element.querySelector<HTMLElement>(".project-reel-canvas");
    if (!canvas) return;
    const items = element.querySelectorAll<HTMLElement>(".project-reel-card");
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = canvas.getBoundingClientRect().top;
      const viewport = window.innerHeight;
      items.forEach((card) => {
        const progress = Math.max(
          0,
          Math.min(1, (viewport * 0.95 - top - card.offsetTop) / (viewport * 0.6)),
        );
        card.style.setProperty("--card-reveal", String(progress));
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section className="project-reel-section" aria-label="Scrambled eggs project showcase">
      <div ref={reel} className="project-reel">
        <div className="project-reel-canvas">
          {cards.map((card, index) => (
            <article key={card.kind} className={`project-reel-card reel-${card.kind}`}>
              <Link to={card.to} className="project-reel-card-link" aria-label={card.label}>
                {card.kind === "cover" ? (
                  <>
                    <h2 className="reel-cover-title">
                      scrambled
                      <br />
                      eggs<span>.</span>
                    </h2>
                    <CubeArtwork />
                  </>
                ) : (
                  <>
                    <span className="reel-card-brand" aria-hidden="true">
                      scrambled eggs
                    </span>
                    <div className="reel-card-art" aria-hidden="true">
                      {card.kind === "solver" && <CubeArtwork />}
                      {card.kind === "timer" && (
                        <strong className="reel-timer">
                          12.84<span>PERSONAL BEST</span>
                        </strong>
                      )}
                      {card.kind === "graph" && (
                        <svg viewBox="0 0 320 240">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <g key={i} transform={`rotate(${i * 60} 160 120)`}>
                              <ellipse cx="160" cy="120" rx="102" ry="50" />
                              <circle cx="262" cy="120" r="5" />
                            </g>
                          ))}
                          <circle cx="160" cy="120" r="7" />
                        </svg>
                      )}
                    </div>
                    <div className="reel-card-information">
                      <span className="reel-card-category">
                        0{index} / {card.kind === "graph" ? "COOL STUFF" : card.kind.toUpperCase()}
                      </span>
                      <h3>{card.title}</h3>
                      <p>{card.copy}</p>
                      <span className="reel-card-action">
                        {card.label} <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </>
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
