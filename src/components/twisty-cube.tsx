import { useEffect, useRef, useState } from "react";
import type { TwistyPlayerConfig } from "cubing/twisty";
import type { PuzzleId } from "@/lib/puzzles";

/** Player configurations for built-in puzzles and larger procedural cubes. */
export const twistyPuzzleConfig: Record<
  PuzzleId,
  Pick<TwistyPlayerConfig, "puzzle" | "experimentalPuzzleDescription">
> = {
  "2x2": { puzzle: "2x2x2" },
  "3x3": { puzzle: "3x3x3" },
  "4x4": { puzzle: "4x4x4" },
  "5x5": { puzzle: "5x5x5" },
  "6x6": { puzzle: "6x6x6" },
  "7x7": { puzzle: "7x7x7" },
  // These sizes use cubing.js geometry descriptions instead of built-in IDs.
  "8x8": { experimentalPuzzleDescription: "c f 0.75 f 0.5 f 0.25 f 0" },
  "9x9": {
    experimentalPuzzleDescription:
      "c f 0.777777777777778 f 0.555555555555556 f 0.333333333333333 f 0.111111111111111",
  },
  "10x10": { experimentalPuzzleDescription: "c f 0.8 f 0.6 f 0.4 f 0.2 f 0" },
  pyraminx: { puzzle: "pyraminx" },
  megaminx: { puzzle: "megaminx" },
  skewb: { puzzle: "skewb" },
};

const clean = (alg: string) => alg.replace(/[·\n]/g, " ").replace(/\s+/g, " ").trim();

/** Interactive 3D puzzle (cubing.js Twisty Player). Browser-only: loaded after mount. */
export function TwistyCube({
  puzzle,
  setup,
  alg,
}: {
  puzzle: PuzzleId;
  setup: string;
  alg: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLElement & Record<string, unknown>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    import("cubing/twisty").then(({ TwistyPlayer }) => {
      if (cancelled || !host.current) return;
      const p = new TwistyPlayer({
        ...twistyPuzzleConfig[puzzle],
        // Custom geometry defaults to a face-on view; match the other cubes.
        ...(twistyPuzzleConfig[puzzle].experimentalPuzzleDescription
          ? { cameraLatitude: 35, cameraLongitude: 30, cameraDistance: 6.25 }
          : {}),
        background: "none",
        controlPanel: "none",
        hintFacelets: "none",
      });
      (p as unknown as Record<string, unknown>)["experimentalMovePressInput"] = "basic";
      p.style.width = "100%";
      p.style.height = "340px";
      host.current.replaceChildren(p);
      player.current = p as unknown as HTMLElement & Record<string, unknown>;
      setReady(true);
    });
    return () => {
      cancelled = true;
      player.current?.remove();
      player.current = null;
    };
  }, [puzzle]);

  useEffect(() => {
    const p = player.current;
    if (!ready || !p) return;
    try {
      p["experimentalSetupAlg"] = setup === "…" ? "" : clean(setup);
      p["alg"] = clean(alg);
    } catch {
      p["alg"] = "";
    }
  }, [ready, puzzle, setup, alg]);

  const addMove = (m: string) => {
    const p = player.current as unknown as { experimentalAddMove?: (m: string) => void } | null;
    try {
      p?.experimentalAddMove?.(m);
    } catch {
      /* ignore moves the puzzle doesn't support */
    }
  };

  const reset = () => {
    const p = player.current;
    if (p) p["alg"] = "";
  };

  const bases = movesFor(puzzle);

  return (
    <div className="flex w-full flex-col">
      <div ref={host} className="flex min-h-[340px] w-full items-center justify-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Loading 3D model…
        </span>
      </div>
      {ready ? (
        <div className="mt-3 flex flex-col gap-1.5">
          {[bases, bases.map(inverse)].map((row, r) => (
            <div key={r} className="flex flex-wrap justify-center gap-1.5">
              {row.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => addMove(m)}
                  className="min-w-10 rounded-md border border-line bg-panel-2 px-2 py-1.5 font-mono text-[12px] transition hover:border-primary hover:bg-background"
                >
                  {m}
                </button>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={reset}
            className="mx-auto mt-1 rounded-md border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition hover:text-foreground"
          >
            Clear my moves
          </button>
        </div>
      ) : null}
    </div>
  );
}

function movesFor(puzzle: PuzzleId): string[] {
  if (puzzle === "pyraminx" || puzzle === "skewb") return ["U", "L", "R", "B"];
  if (puzzle === "megaminx") return ["R++", "D++", "U", "F", "L", "R"];
  return ["U", "D", "L", "R", "F", "B"];
}

function inverse(m: string): string {
  if (m.endsWith("++")) return m.replace("++", "--");
  return `${m}'`;
}
