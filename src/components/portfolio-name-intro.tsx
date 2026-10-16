import type { CSSProperties } from "react";

/** One right-to-left squeeze reveal; the name remains real, accessible text. */
export function PortfolioNameIntro() {
  return (
    <div className="portfolio-name-intro">
      <h1 className="portfolio-squeeze" aria-label="PARTH GUPTA">
        <span className="portfolio-squeeze-letters" aria-hidden="true">
          {[..."PARTHGUPTA"].map((letter, index) => (
            <span
              key={index}
              className={`portfolio-squeeze-letter${index === 5 ? " surname-start" : ""}`}
              style={
                {
                  "--squeeze-start": index === 9 ? 1 : 0.08,
                  "--squeeze-delay": `${(9 - index) * 110}ms`,
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
    </div>
  );
}
