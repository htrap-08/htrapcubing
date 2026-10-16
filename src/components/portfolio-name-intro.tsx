import { useState } from "react";
import type { CSSProperties } from "react";

/** Responsive squeeze-and-release lettering; the name remains real, accessible text. */
export function PortfolioNameIntro() {
  const [replay, setReplay] = useState(0);
  return (
    <div className="portfolio-name-intro">
      <h1 className="portfolio-squeeze" aria-label="PARTH GUPTA">
        <span key={replay} className="portfolio-squeeze-letters" aria-hidden="true">
          {[..."PARTHGUPTA"].map((letter, index) => (
            <span
              key={index}
              className={`portfolio-squeeze-letter${index === 5 ? " surname-start" : ""}`}
              style={
                {
                  "--squeeze-first": index < 3 ? 2.5 : 0.12,
                  "--squeeze-settle": index % 2 ? 1.16 : 0.84,
                  "--squeeze-rebound": index % 2 ? 0.96 : 1.04,
                  "--squeeze-middle": index >= 3 && index < 7 ? 2.1 : 0.12,
                  "--squeeze-last": index >= 7 ? 2.5 : 0.12,
                } as CSSProperties
              }
            >
              <svg viewBox="0 0 100 120" preserveAspectRatio="none" focusable="false">
                <text
                  x="50"
                  y="101"
                  textAnchor="middle"
                  textLength="94"
                  lengthAdjust="spacingAndGlyphs"
                >
                  {letter}
                </text>
              </svg>
            </span>
          ))}
        </span>
      </h1>
      <button
        className="portfolio-replay"
        type="button"
        onClick={() => setReplay((value) => value + 1)}
        aria-label="Replay name animation"
      >
        Replay intro <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}
