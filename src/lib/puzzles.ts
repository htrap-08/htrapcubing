/**
 * Puzzle registry + scramble generators.
 * Add a puzzle here and it appears in the solver, the timer and the
 * algorithm filters automatically.
 */

export type FaceKey = "U" | "D" | "F" | "B" | "L" | "R";

export type PuzzleId =
  | "2x2"
  | "3x3"
  | "4x4"
  | "5x5"
  | "6x6"
  | "7x7"
  | "8x8"
  | "9x9"
  | "10x10"
  | "pyraminx"
  | "megaminx"
  | "skewb";

export type PuzzleKind = "nxn" | "pyraminx" | "megaminx" | "skewb";

export type Puzzle = {
  id: PuzzleId;
  label: string;
  short: string;
  kind: PuzzleKind;
  /** Cube order for nxn puzzles */
  n?: number;
  /** How many random moves a scramble uses */
  scrambleLength: number;
  blurb: string;
};

export const puzzles: Puzzle[] = [
  { id: "2x2", label: "2×2 Pocket Cube", short: "2×2", kind: "nxn", n: 2, scrambleLength: 11, blurb: "Corners only — the fastest way to learn layer thinking." },
  { id: "3x3", label: "3×3 Rubik's Cube", short: "3×3", kind: "nxn", n: 3, scrambleLength: 20, blurb: "The original. Beginner layer-by-layer, then CFOP." },
  { id: "4x4", label: "4×4 Revenge", short: "4×4", kind: "nxn", n: 4, scrambleLength: 44, blurb: "Centers, edge pairing, then 3×3 with parity fixes." },
  { id: "5x5", label: "5×5 Professor", short: "5×5", kind: "nxn", n: 5, scrambleLength: 60, blurb: "Odd big cube — fixed centers, no OLL parity." },
  { id: "6x6", label: "6×6 Cube", short: "6×6", kind: "nxn", n: 6, scrambleLength: 80, blurb: "Wide-layer reduction with inner-slice parity." },
  { id: "7x7", label: "7×7 Cube", short: "7×7", kind: "nxn", n: 7, scrambleLength: 100, blurb: "Reduction at scale — patience beats speed." },
  { id: "8x8", label: "8×8 Cube", short: "8×8", kind: "nxn", n: 8, scrambleLength: 120, blurb: "Even cube, two inner slice groups per face." },
  { id: "9x9", label: "9×9 Cube", short: "9×9", kind: "nxn", n: 9, scrambleLength: 140, blurb: "Odd cube — centers anchor to fixed middles." },
  { id: "10x10", label: "10×10 Cube", short: "10×10", kind: "nxn", n: 10, scrambleLength: 160, blurb: "The big one. Same reduction, more of everything." },
  { id: "pyraminx", label: "Pyraminx", short: "Pyraminx", kind: "pyraminx", scrambleLength: 11, blurb: "Tetrahedron: tips, centres, then the last layer." },
  { id: "megaminx", label: "Megaminx", short: "Megaminx", kind: "megaminx", scrambleLength: 70, blurb: "Dodecahedron: twelve faces, 3×3 logic throughout." },
  { id: "skewb", label: "Skewb", short: "Skewb", kind: "skewb", scrambleLength: 11, blurb: "Corner-turning cube solved in two intuitive stages." },
];

export const puzzleById = (id: PuzzleId): Puzzle =>
  puzzles.find((p) => p.id === id) ?? (puzzles[1] as Puzzle);

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

const SUFFIX = ["", "'", "2"] as const;

/** Wide-turn notation for NxN cubes, e.g. 3Rw' */
function nxnScramble(n: number, length: number): string {
  const faces: FaceKey[] = ["U", "D", "L", "R", "F", "B"];
  const opposite: Record<FaceKey, FaceKey> = { U: "D", D: "U", L: "R", R: "L", F: "B", B: "F" };
  const maxDepth = Math.max(1, Math.floor(n / 2));
  const moves: string[] = [];
  let last: FaceKey | null = null;
  let beforeLast: FaceKey | null = null;

  while (moves.length < length) {
    const face = pick(faces);
    if (face === last) continue;
    if (last && face === opposite[last] && face === beforeLast) continue;
    const depth = n <= 3 ? 1 : 1 + Math.floor(Math.random() * maxDepth);
    const token =
      depth === 1 ? face : depth === 2 ? `${face}w` : `${depth}${face}w`;
    moves.push(`${token}${pick(SUFFIX)}`);
    beforeLast = last;
    last = face;
  }
  return moves.join(" ");
}

function pyraminxScramble(length: number): string {
  const faces = ["U", "L", "R", "B"];
  const tips = ["u", "l", "r", "b"];
  const moves: string[] = [];
  let last = "";
  while (moves.length < length) {
    const f = pick(faces);
    if (f === last) continue;
    moves.push(`${f}${Math.random() < 0.5 ? "" : "'"}`);
    last = f;
  }
  for (const t of tips) {
    if (Math.random() < 0.6) moves.push(`${t}${Math.random() < 0.5 ? "" : "'"}`);
  }
  return moves.join(" ");
}

function skewbScramble(length: number): string {
  const faces = ["U", "L", "R", "B"];
  const moves: string[] = [];
  let last = "";
  while (moves.length < length) {
    const f = pick(faces);
    if (f === last) continue;
    moves.push(`${f}${Math.random() < 0.5 ? "" : "'"}`);
    last = f;
  }
  return moves.join(" ");
}

/** WCA-style Megaminx scramble: 7 lines of R/D pairs closed by a U turn. */
function megaminxScramble(): string {
  const lines: string[] = [];
  for (let line = 0; line < 7; line++) {
    const parts: string[] = [];
    for (let i = 0; i < 5; i++) {
      parts.push(`R${Math.random() < 0.5 ? "++" : "--"}`);
      parts.push(`D${Math.random() < 0.5 ? "++" : "--"}`);
    }
    parts.push(Math.random() < 0.5 ? "U" : "U'");
    lines.push(parts.join(" "));
  }
  return lines.join("\n");
}

export function generateScramble(puzzle: Puzzle): string {
  switch (puzzle.kind) {
    case "nxn":
      return nxnScramble(puzzle.n ?? 3, puzzle.scrambleLength);
    case "pyraminx":
      return pyraminxScramble(puzzle.scrambleLength);
    case "skewb":
      return skewbScramble(puzzle.scrambleLength);
    case "megaminx":
      return megaminxScramble();
  }
}

/** Faces in net layout order used by the solver's colour-input net. */
export const faceOrder: FaceKey[] = ["U", "L", "F", "R", "B", "D"];

export const faceNames: Record<FaceKey, string> = {
  U: "Up",
  D: "Down",
  F: "Front",
  B: "Back",
  L: "Left",
  R: "Right",
};

export const faceColorClass: Record<FaceKey, string> = {
  U: "bg-sticker-u",
  D: "bg-sticker-d",
  F: "bg-sticker-f",
  B: "bg-sticker-b",
  L: "bg-sticker-l",
  R: "bg-sticker-r",
};
