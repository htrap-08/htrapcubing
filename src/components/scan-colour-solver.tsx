import { useEffect, useMemo, useReducer, useState } from "react";
import { CubeCamera } from "./cube-camera";
import {
  CUBE_PALETTE,
  classifyCubeColours,
  type CubeColour,
} from "@/lib/cube-colour-classifier.js";
import { FACES, solveCubeString, solveFacelets, type Face } from "@/lib/cube-state";
import {
  cubeScanReducer,
  initialScanState,
  scannedFacesToCubeString,
  scannedFacesToFacelets,
} from "@/lib/cube-scan-state";
import { solveLargeCube } from "@/lib/large-cube-solver";
import { cn } from "@/lib/utils";

const guide: Record<Face, { name: string; centre: CubeColour; above: CubeColour }> = {
  U: { name: "Up", centre: "white", above: "blue" },
  R: { name: "Right", centre: "red", above: "white" },
  F: { name: "Front", centre: "green", above: "white" },
  D: { name: "Down", centre: "yellow", above: "green" },
  L: { name: "Left", centre: "orange", above: "white" },
  B: { name: "Back", centre: "blue", above: "white" },
};
const colours = Object.keys(CUBE_PALETTE) as CubeColour[];

export function ScanColourSolver({
  n = 3,
  onSolved,
}: {
  n?: number;
  onSolved: (solution: string) => void;
}) {
  const [state, dispatch] = useReducer(cubeScanReducer, n, initialScanState);
  const [result, setResult] = useState<{ busy: boolean; message: string; error: boolean }>({
    busy: false,
    message: "",
    error: false,
  });
  const face = FACES[state.index]!;
  const current = guide[face];
  const count = FACES.filter((f) => state.faces[f]).length;
  const complete = count === 6 && !state.draft;
  const formatted = useMemo(() => {
    if (!complete) return { value: "", error: "" };
    try {
      return { value: scannedFacesToCubeString(state.faces, n), error: "" };
    } catch (error) {
      return {
        value: "",
        error: error instanceof Error ? error.message : "Check the scanned faces.",
      };
    }
  }, [complete, state.faces, n]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    if (!formatted.value) {
      setResult({ busy: false, message: "", error: false });
      return;
    }
    setResult({
      busy: true,
      message: "All six faces captured. Finding your solution…",
      error: false,
    });
    async function solve() {
      if (n === 3) return solveCubeString(formatted.value);
      const facelets = scannedFacesToFacelets(state.faces, n);
      return n === 2 ? solveFacelets(2, facelets) : solveLargeCube(n, facelets, controller.signal);
    }
    void solve()
      .then((answer) => {
        if (cancelled) return;
        if (!answer.ok) setResult({ busy: false, message: answer.error, error: true });
        else if (!answer.solution)
          setResult({ busy: false, message: "Your cube is already solved!", error: false });
        else {
          setResult({ busy: false, message: "Solution found.", error: false });
          onSolved(answer.solution);
        }
      })
      .catch(() => {
        if (!cancelled)
          setResult({
            busy: false,
            message: "The solver could not finish. Review a face and confirm it to try again.",
            error: true,
          });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [formatted, onSolved, n, state.faces]);

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-muted">
        Scan a {n}×{n} in U → R → F → D → L → B order. Rotate the whole cube between scans without
        turning its layers.
      </p>
      <div className="flex flex-wrap gap-2" aria-label="Scanned faces">
        {FACES.map((f, index) => (
          <button
            type="button"
            key={f}
            disabled={
              result.busy ||
              (!state.faces[f] && index !== FACES.findIndex((item) => !state.faces[item]))
            }
            onClick={() => dispatch({ type: "select", index })}
            aria-label={`${f} face${state.faces[f] ? ", scanned; review" : ", not scanned"}`}
            aria-current={!complete && index === state.index ? "step" : undefined}
            className={cn(
              "rounded-md border px-3 py-2 text-sm disabled:opacity-50",
              !complete && index === state.index
                ? "border-primary bg-display text-background"
                : "border-line bg-panel-2",
            )}
          >
            {f}
            {state.faces[f] ? " ✓" : ""}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted" role="status">
        {count}/6 faces confirmed · {count * n * n}/{6 * n * n} colours
      </p>
      {!complete && (
        <>
          <h3 className="font-display text-lg font-bold">
            Scan {face} — {current.name}
          </h3>
          <p className="text-sm">
            Point the{" "}
            <strong>
              {current.centre}{" "}
              {n % 2 ? "centre face" : "side in the standard white-up, green-front orientation"}
            </strong>{" "}
            at the camera, with the <strong>{current.above} side along the top edge</strong> of the
            preview. Fill the guide with this face.
          </p>
          {!state.draft ? (
            <CubeCamera
              n={n}
              onScan={(rgb) =>
                dispatch({ type: "capture", colours: classifyCubeColours(rgb, n * n) })
              }
            />
          ) : (
            <>
              <p className="text-sm text-muted">
                Review the detected colours. Use each dropdown to correct a sticker before
                confirming.
              </p>
              <div
                className="mx-auto grid w-full gap-1"
                style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
                aria-label={`${face} scanned colour review`}
              >
                {state.draft.map((colour, index) => {
                  const rgb = CUBE_PALETTE[colour];
                  return (
                    <label
                      key={index}
                      className="min-w-0 overflow-hidden rounded-md border border-line"
                    >
                      <span
                        className="block aspect-square"
                        style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
                      />
                      <span className="sr-only">
                        {face} row {Math.floor(index / n) + 1} column {(index % n) + 1}
                      </span>
                      <select
                        value={colour}
                        onChange={(e) =>
                          dispatch({ type: "correct", index, colour: e.target.value as CubeColour })
                        }
                        className="w-full bg-background p-0.5 text-[10px] text-foreground"
                      >
                        {colours.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
              {n % 2 === 1 && state.draft[Math.floor((n * n) / 2)] !== current.centre && (
                <p role="alert" className="text-sm text-primary">
                  Expected the {current.centre} centre for {face}. Check the face or correct its
                  centre colour.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "rescan" })}
                  className="rounded-md border border-line px-4 py-2 text-sm"
                >
                  Rescan face
                </button>
                <button
                  type="button"
                  disabled={n % 2 === 1 && state.draft[Math.floor((n * n) / 2)] !== current.centre}
                  onClick={() => dispatch({ type: "confirm" })}
                  className="rounded-md bg-display px-4 py-2 text-sm text-background disabled:opacity-50"
                >
                  {count === 5 && !state.faces[face] ? "Confirm and solve" : `Confirm ${face}`}
                </button>
              </div>
            </>
          )}
        </>
      )}
      {formatted.error && (
        <p role="alert" className="text-sm text-primary">
          {formatted.error}
        </p>
      )}
      {result.message && (
        <p role={result.error ? "alert" : "status"} className="text-sm">
          {result.message}
        </p>
      )}
      {complete && !result.busy && (
        <p className="text-sm text-muted">
          Select a face above to correct colours or rescan. For the solution, return to white on top
          and green facing you.
        </p>
      )}
      <button
        type="button"
        disabled={result.busy}
        onClick={() => dispatch({ type: "reset" })}
        className="text-sm text-muted underline disabled:opacity-50"
      >
        Start scans over
      </button>
    </div>
  );
}
