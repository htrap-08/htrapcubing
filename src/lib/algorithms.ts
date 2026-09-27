/**
 * Algorithm library data.
 *
 * `face` is a 9-cell top-view diagram read left-to-right, top-to-bottom.
 * Cell keys map to sticker tokens in styles.css:
 *   u/d/f/b/l/r = face colours, x = unsolved/grey, p = highlight (violet)
 * Add entries here and they render automatically on /algorithms.
 */

export type StickerKey = "u" | "d" | "f" | "b" | "l" | "r" | "x" | "p";

export type Track = "beginner" | "advanced";

export type Algorithm = {
  id: string;
  track: Track;
  group: string;
  name: string;
  moves: string;
  face: StickerKey[];
  description: string;
  puzzle?: string;
};

export const groupsByTrack: Record<Track, string[]> = {
  beginner: [
    "White cross",
    "First layer",
    "Second layer",
    "Top cross",
    "Last layer",
    "Other puzzles",
  ],
  advanced: ["CFOP · F2L", "CFOP · OLL", "CFOP · PLL", "Commutators", "Big cube parity"],
};

const g = (k: StickerKey, n: number): StickerKey[] => Array.from({ length: n }, () => k);

export const algorithms: Algorithm[] = [
  // ---------- BEGINNER ----------
  {
    id: "b-cross-flip",
    track: "beginner",
    group: "White cross",
    name: "Flip a cross edge",
    moves: "F R U R' U' F'",
    face: ["x", "u", "x", "u", "u", "u", "x", "u", "x"],
    description: "The edge is in the right slot but showing the wrong colour. This flips it in place.",
  },
  {
    id: "b-cross-insert",
    track: "beginner",
    group: "White cross",
    name: "Drop an edge in",
    moves: "F2",
    face: ["x", "x", "x", "x", "u", "x", "x", "u", "x"],
    description: "Line the edge above its matching centre, then turn that face twice to drop it home.",
  },
  {
    id: "b-corner-right",
    track: "beginner",
    group: "First layer",
    name: "Right-hand corner insert",
    moves: "R U R' U'",
    face: ["f", "f", "l", "f", "f", "f", "u", "f", "f"],
    description: "Repeat until the white corner drops into its slot. Never more than six repeats.",
  },
  {
    id: "b-corner-left",
    track: "beginner",
    group: "First layer",
    name: "Left-hand corner insert",
    moves: "L' U' L U",
    face: ["l", "f", "f", "f", "f", "f", "f", "f", "u"],
    description: "Mirror of the right-hand insert, for a corner sitting on the left front slot.",
  },
  {
    id: "b-edge-right",
    track: "beginner",
    group: "Second layer",
    name: "Middle edge — to the right",
    moves: "U R U' R' U' F' U F",
    face: ["x", "f", "x", "l", "d", "r", "x", "f", "x"],
    description: "Edge is on the top layer with no yellow on it and needs to slot right.",
  },
  {
    id: "b-edge-left",
    track: "beginner",
    group: "Second layer",
    name: "Middle edge — to the left",
    moves: "U' L' U L U F U' F'",
    face: ["x", "f", "x", "r", "d", "l", "x", "f", "x"],
    description: "The mirror sequence, sending the edge into the left middle slot.",
  },
  {
    id: "b-top-cross",
    track: "beginner",
    group: "Top cross",
    name: "Dot / L / line to cross",
    moves: "F R U R' U' F'",
    face: ["x", "d", "x", "d", "d", "x", "x", "x", "x"],
    description: "Run it once from a dot, again from an L, once more from a line. Cross done.",
  },
  {
    id: "b-cross-perm",
    track: "beginner",
    group: "Top cross",
    name: "Swap two cross edges",
    moves: "R U R' U R U2 R' U",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    description: "Puts the yellow cross edges over their matching side colours.",
  },
  {
    id: "b-corner-perm",
    track: "beginner",
    group: "Last layer",
    name: "Position the last corners",
    moves: "U R U' L' U R' U' L",
    face: ["p", "d", "x", "d", "d", "d", "x", "d", "p"],
    description: "Cycles three top corners into their correct spots, colours ignored for now.",
  },
  {
    id: "b-corner-orient",
    track: "beginner",
    group: "Last layer",
    name: "Twist the last corners",
    moves: "R' D' R D",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    description: "Repeat in pairs on one corner at a time, keeping the top face pointing at you.",
  },
  {
    id: "b-pyraminx",
    track: "beginner",
    group: "Other puzzles",
    name: "Pyraminx last layer",
    moves: "R U R' U R U R'",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    puzzle: "Pyraminx",
    description: "Solve the tips, build the centres, then cycle the last three edges with this.",
  },
  {
    id: "b-skewb",
    track: "beginner",
    group: "Other puzzles",
    name: "Skewb Sarah's beginner",
    moves: "R' L R L'",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    puzzle: "Skewb",
    description: "Build one face intuitively, then use this to cycle the remaining corners.",
  },
  {
    id: "b-megaminx",
    track: "beginner",
    group: "Other puzzles",
    name: "Megaminx last layer edges",
    moves: "R U R' U R U2 R'",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    puzzle: "Megaminx",
    description: "Megaminx is 3×3 logic on twelve faces — the same Sune finishes the last layer.",
  },

  // ---------- ADVANCED ----------
  {
    id: "a-f2l-basic",
    track: "advanced",
    group: "CFOP · F2L",
    name: "F2L — pair in the slot",
    moves: "U R U' R'",
    face: ["x", "f", "x", "f", "f", "f", "x", "f", "x"],
    description: "The base case: corner and edge already paired above their slot.",
  },
  {
    id: "a-f2l-split",
    track: "advanced",
    group: "CFOP · F2L",
    name: "F2L — split pair",
    moves: "R U' R' U y' R' U R",
    face: ["x", "f", "x", "l", "f", "r", "x", "f", "x"],
    description: "Corner and edge separated on the top layer; join them, then insert in one flow.",
  },
  {
    id: "a-f2l-trapped",
    track: "advanced",
    group: "CFOP · F2L",
    name: "F2L — corner trapped",
    moves: "R U' R' U2 R U' R'",
    face: ["x", "f", "x", "f", "p", "f", "x", "f", "x"],
    description: "Eject a wrongly-oriented corner, reset it on top, and re-insert cleanly.",
  },
  {
    id: "a-oll-sune",
    track: "advanced",
    group: "CFOP · OLL",
    name: "OLL 27 — Sune",
    moves: "R U R' U R U2 R'",
    face: ["x", "x", "d", "d", "d", "d", "x", "d", "x"],
    description: "One corner oriented, the classic three-corner twist.",
  },
  {
    id: "a-oll-antisune",
    track: "advanced",
    group: "CFOP · OLL",
    name: "OLL 26 — Anti-Sune",
    moves: "R U2 R' U' R U' R'",
    face: ["d", "x", "x", "d", "d", "d", "x", "d", "x"],
    description: "Sune's mirror. Learn both and a third of OLL cases disappear.",
  },
  {
    id: "a-oll-h",
    track: "advanced",
    group: "CFOP · OLL",
    name: "OLL 21 — H / double Sune",
    moves: "R U2 R' U' R U R' U' R U' R'",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    description: "All four corners flipped outward, cross already solved.",
  },
  {
    id: "a-oll-t",
    track: "advanced",
    group: "CFOP · OLL",
    name: "OLL 33 — T shape",
    moves: "R U R' U' R' F R F'",
    face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    description: "Short, fast, and one of the first full-OLL cases worth learning.",
  },
  {
    id: "a-pll-t",
    track: "advanced",
    group: "CFOP · PLL",
    name: "T perm",
    moves: "R U R' U' R' F R2 U' R' U' R U R' F'",
    face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    description: "Swaps two adjacent corners and two edges. The workhorse PLL.",
  },
  {
    id: "a-pll-y",
    track: "advanced",
    group: "CFOP · PLL",
    name: "Y perm",
    moves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    face: ["p", "d", "d", "d", "d", "d", "d", "d", "p"],
    description: "Diagonal corner swap plus an edge swap — the case nothing else covers.",
  },
  {
    id: "a-pll-ua",
    track: "advanced",
    group: "CFOP · PLL",
    name: "Ua perm",
    moves: "R U' R U R U R U' R' U' R2",
    face: ["d", "p", "d", "d", "d", "d", "d", "d", "d"],
    description: "Three-edge cycle, counter-clockwise. Pairs with Ub for all edge-only cases.",
  },
  {
    id: "a-pll-jb",
    track: "advanced",
    group: "CFOP · PLL",
    name: "Jb perm",
    moves: "R U R' F' R U R' U' R' F R2 U' R' U'",
    face: ["d", "d", "p", "d", "d", "d", "d", "d", "d"],
    description: "Adjacent corner and edge swap on the right side — very finger-trick friendly.",
  },
  {
    id: "a-comm-3cycle",
    track: "advanced",
    group: "Commutators",
    name: "Corner 3-cycle [R, U]",
    moves: "R U R' · U · R U' R' · U'",
    face: ["p", "x", "p", "x", "d", "x", "p", "x", "x"],
    description: "The A B A' B' skeleton: insert, interchange, undo, undo. Cycles three corners, touches nothing else.",
  },
  {
    id: "a-comm-edge",
    track: "advanced",
    group: "Commutators",
    name: "Edge 3-cycle [M', U2]",
    moves: "M' U2 M U2",
    face: ["x", "p", "x", "p", "d", "p", "x", "x", "x"],
    description: "Slice-based commutator for blindsolving and clean last-layer edge work.",
  },
  {
    id: "a-comm-setup",
    track: "advanced",
    group: "Commutators",
    name: "Setup move conjugate",
    moves: "S · [A, B] · S'",
    face: ["x", "x", "p", "x", "d", "x", "p", "x", "p"],
    description: "Wrap any commutator in a setup move to reach pieces the pure form can't touch.",
  },
  {
    id: "a-parity-oll",
    track: "advanced",
    group: "Big cube parity",
    name: "4×4 OLL parity",
    moves: "r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'",
    face: ["x", "d", "x", "d", "d", "d", "x", "x", "x"],
    puzzle: "4×4 · 6×6 · 8×8 · 10×10",
    description: "A single flipped edge after reduction — only possible on even-order cubes.",
  },
  {
    id: "a-parity-pll",
    track: "advanced",
    group: "Big cube parity",
    name: "4×4 PLL parity",
    moves: "2R2 U2 2R2 u2 2R2 2U2",
    face: ["d", "d", "d", "p", "d", "p", "d", "d", "d"],
    puzzle: "4×4 · 6×6 · 8×8 · 10×10",
    description: "Two last-layer edges swapped. Run it, then finish with a normal PLL.",
  },
  {
    id: "a-parity-center",
    track: "advanced",
    group: "Big cube parity",
    name: "Big cube centre commutator",
    moves: "r U r' U r U2 r'",
    face: g("x", 4).concat(["d"], g("x", 4)) as StickerKey[],
    puzzle: "5×5 and larger",
    description: "Fixes a stray centre piece late in reduction without breaking solved faces.",
  },
];

export const algorithmsFor = (track: Track, group?: string) =>
  algorithms.filter((a) => a.track === track && (!group || a.group === group));
