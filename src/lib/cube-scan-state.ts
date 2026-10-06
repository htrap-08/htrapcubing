import { FACES, type Face, type Facelets } from "./cube-state";
import type { CubeColour } from "./cube-colour-classifier.js";

export type ScannedFaces = Record<Face, CubeColour[] | null>;
export type ScanState = {
  n: number;
  faces: ScannedFaces;
  index: number;
  draft: CubeColour[] | null;
};
export type ScanAction =
  | { type: "capture"; colours: CubeColour[] }
  | { type: "correct"; index: number; colour: CubeColour }
  | { type: "confirm" }
  | { type: "select"; index: number }
  | { type: "rescan" }
  | { type: "reset" };

export function initialScanState(n = 3): ScanState {
  return {
    n,
    faces: { U: null, R: null, F: null, D: null, L: null, B: null },
    index: 0,
    draft: null,
  };
}

export function cubeScanReducer(state: ScanState, action: ScanAction): ScanState {
  const face = FACES[state.index];
  switch (action.type) {
    case "reset":
      return initialScanState(state.n);
    case "capture":
      return action.colours.length === state.n * state.n
        ? { ...state, draft: [...action.colours] }
        : state;
    case "correct":
      return state.draft && action.index >= 0 && action.index < state.n * state.n
        ? { ...state, draft: state.draft.map((c, i) => (i === action.index ? action.colour : c)) }
        : state;
    case "rescan":
      return face ? { ...state, faces: { ...state.faces, [face]: null }, draft: null } : state;
    case "select": {
      const selected = FACES[action.index];
      if (!selected) return state;
      // Previously confirmed faces can be corrected; unscanned faces stay in order.
      const firstMissing = FACES.findIndex((f) => !state.faces[f]);
      if (!state.faces[selected] && action.index !== firstMissing) return state;
      return { ...state, index: action.index, draft: state.faces[selected]?.slice() ?? null };
    }
    case "confirm": {
      if (!face || !state.draft) return state;
      const faces = { ...state.faces, [face]: [...state.draft] };
      const next = FACES.findIndex((f) => !faces[f]);
      return { n: state.n, faces, index: next === -1 ? state.index : next, draft: null };
    }
  }
}

/** Each face is row-major as seen from outside. U has B above; D has F above. */
export function scannedFacesToCubeString(faces: ScannedFaces, n = 3): string {
  const colourToFace = new Map<CubeColour, Face>();
  for (const face of FACES) {
    const cells = faces[face];
    if (!cells || cells.length !== n * n) throw new Error("Scan and confirm all six faces first.");
    colourToFace.set(n === 3 ? cells[4]! : SCAN_FACE_COLOURS[face], face);
  }
  if (colourToFace.size !== 6)
    throw new Error("The six centre colours must be different. Check or rescan the faces.");
  const all = FACES.flatMap((face) => faces[face]!);
  for (const colour of colourToFace.keys()) {
    const count = all.filter((cell) => cell === colour).length;
    if (count !== n * n)
      throw new Error(
        `${colour} appears ${count} times; it must appear exactly ${n * n} times. Check the scanned colours.`,
      );
  }
  return all.map((colour) => colourToFace.get(colour)!).join("");
}

export const SCAN_FACE_COLOURS: Record<Face, CubeColour> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue",
};
const stickerOf = {
  white: "u",
  red: "r",
  green: "l",
  yellow: "d",
  orange: "f",
  blue: "b",
} as const;

export function scannedFacesToFacelets(faces: ScannedFaces, n: number): Facelets {
  scannedFacesToCubeString(faces, n);
  if (
    n % 2 &&
    FACES.some((face) => faces[face]![Math.floor((n * n) / 2)] !== SCAN_FACE_COLOURS[face])
  ) {
    throw new Error("Check the fixed centre colours: white up, green front.");
  }
  return Object.fromEntries(
    FACES.map((face) => [face, faces[face]!.map((colour) => stickerOf[colour])]),
  ) as Facelets;
}
