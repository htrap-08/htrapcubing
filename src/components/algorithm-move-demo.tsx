import { useEffect, useRef, useState } from "react";
import type { TwistyPlayer } from "cubing/twisty";
import type { PuzzleId } from "@/lib/puzzles";
import { twistyPuzzleConfig } from "@/components/twisty-cube";

export function AlgorithmMoveDemo({
  puzzle = "3x3",
  alg,
  face,
  caseDemo = false,
}: {
  puzzle?: PuzzleId;
  alg: string;
  face?: string;
  caseDemo?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<TwistyPlayer | null>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setReady(false);
    setError(false);
    import("cubing/twisty")
      .then(({ TwistyPlayer }) => {
        if (cancelled || !host.current) return;
        const p = new TwistyPlayer({
          ...twistyPuzzleConfig[puzzle],
          background: "none",
          controlPanel: "none",
          hintFacelets: "none",
          viewerLink: "none",
          tempoScale: 0.7,
          cameraLatitude: face === "D" ? -35 : 35,
          cameraLongitude: face === "B" ? 210 : face === "L" ? -30 : 30,
        });
        p.style.width = "100%";
        p.style.height = "230px";
        player.current = p;
        host.current.replaceChildren(p);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      player.current?.pause();
      player.current?.remove();
      player.current = null;
    };
  }, [visible, puzzle, face]);
  useEffect(() => {
    if (!ready || !player.current) return;
    let cancelled = false;
    const p = player.current;
    p.pause();
    const moves = alg.replace(/[·\n]/g, " ");
    import("cubing/alg")
      .then(({ Alg }) => {
        if (cancelled) return;
        p.experimentalSetupAlg = caseDemo ? new Alg(moves).invert() : "";
        p.alg = moves;
        p.jumpToStart();
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [alg, ready, caseDemo]);
  return (
    <div>
      <div
        ref={host}
        className="algorithm-demo-model"
        aria-label={`3D ${puzzle} movement demonstration: ${alg}`}
      >
        <p className="text-sm text-muted">
          {error ? "The 3D model could not load. Refresh to retry." : "Loading 3D model…"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={!ready}
          className="tutorial-button bg-primary text-primary-foreground"
          onClick={() => {
            player.current?.jumpToStart();
            player.current?.play();
          }}
        >
          Play {alg}
        </button>
        <button
          disabled={!ready}
          className="tutorial-button"
          onClick={() => player.current?.pause()}
        >
          Pause
        </button>
        <button
          disabled={!ready}
          className="tutorial-button"
          onClick={() => {
            player.current?.pause();
            player.current?.jumpToStart();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
