import type { CSSProperties } from "react";

/** Animate strips of a fixed Pricedown wordmark; keep the name accessible. */
export function PortfolioNameIntro() {
  return (
    <div className="portfolio-name-intro">
      <h1 className="portfolio-squeeze" aria-label="PARTH GUPTA">
        <span className="portfolio-squeeze-letters" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              key={index}
              className="portfolio-squeeze-letter"
              style={
                {
                  "--squeeze-start": index === 9 ? 1 : 0.08,
                  "--squeeze-delay": `${(9 - index) * 110}ms`,
                  "--wordmark-position": `${(index / 9) * 100}%`,
                } as CSSProperties
              }
            >
              <span className="portfolio-name-artwork" />
            </span>
          ))}
        </span>
      </h1>
    </div>
  );
}
