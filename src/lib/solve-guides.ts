/**
 * Step-by-step solve walkthroughs, one per puzzle family.
 * Each step shows a title, what to look for, and the moves to run.
 * Edit or add steps freely — the solver page renders whatever is here.
 */

import type { PuzzleId } from "./puzzles";
import type { StickerKey } from "./algorithms";

export type SolveStep = {
  title: string;
  phase: string;
  look: string;
  moves: string;
  face: StickerKey[];
};

type GuideKey =
  "2x2" | "3x3" | "big-even" | "big-odd" | "pyraminx" | "megaminx" | "skewb" | "square1";

export const guides: Record<GuideKey, SolveStep[]> = {
  square1: [
    {
      title: "Learn the notation",
      phase: "Notation",
      look: "A pair turns the top and bottom in 30° steps; a slash flips the right half. Align the seams before every slice.",
      moves: "(1,0) / (-1,0)",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Restore cube shape",
      phase: "Shape",
      look: "Bring corners together and pair narrow edges. Recover two square layers before solving colours. Shape moves depend on your current arrangement.",
      moves: "Align layers → slice → inspect shape",
      face: ["u", "x", "u", "x", "u", "x", "u", "x", "u"],
    },
    {
      title: "Separate the layers",
      phase: "Layers",
      look: "Move the top-colour pieces to the top and the opposite-colour pieces below. Keep both slice seams clear; the same algorithm will not work for every case.",
      moves: "Place corners → place edges",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Permute corners and edges",
      phase: "Permutation",
      look: "Match the side colours, solving corners then edges. The Square-1 algorithm group includes case-specific exchanges; use the linked guide for setup orientation.",
      moves: "Corners → edges → parity if needed",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
    {
      title: "Finish the middle layer",
      phase: "Middle",
      look: "If the equator is flipped after the pieces are solved, this sequence restores it. Stop if a slice is blocked.",
      moves: "/ (6,0) / (6,0) / (6,0)",
      face: ["u", "u", "u", "f", "f", "f", "d", "d", "d"],
    },
  ],
  "2x2": [
    {
      title: "Build the white face",
      phase: "Layer 1",
      look: "Find the four white corners and place them so side colours match in pairs.",
      moves: "R U R' U'",
      face: ["u", "u", "x", "u", "u", "x", "x", "x", "x"],
    },
    {
      title: "Orient the yellow face",
      phase: "OLL",
      look: "Hold white on the bottom. Count how many yellow stickers face up.",
      moves: "R U R' U R U2 R'",
      face: ["x", "x", "d", "x", "d", "d", "x", "d", "x"],
    },
    {
      title: "Permute the last layer",
      phase: "PBL",
      look: "Find the one side with two matching colours and hold it at the back.",
      moves: "R U' R F2 R' U R'",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
  ],
  "3x3": [
    {
      title: "White cross",
      phase: "Cross",
      look: "Four white edges around the white centre, side colours matching their centres.",
      moves: "F R U R' U' F'",
      face: ["x", "u", "x", "u", "u", "u", "x", "u", "x"],
    },
    {
      title: "First layer corners",
      phase: "F1L",
      look: "A white corner sitting in the top layer above its slot.",
      moves: "R U R' U'",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Second layer edges",
      phase: "F2L",
      look: "A top-layer edge with no yellow on it. Match its front colour to a centre.",
      moves: "U R U' R' U' F' U F",
      face: ["x", "f", "x", "l", "u", "r", "x", "f", "x"],
    },
    {
      title: "Yellow cross",
      phase: "OLL 1",
      look: "Dot, L shape, or line on the yellow face.",
      moves: "F R U R' U' F'",
      face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    },
    {
      title: "Orient yellow corners",
      phase: "OLL 2",
      look: "Hold an unsolved corner front-right-top and repeat until it flips.",
      moves: "R' D' R D",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
    {
      title: "Permute the last layer",
      phase: "PLL",
      look: "Find a side with three matching colours and hold it at the back.",
      moves: "R U R' U' R' F R2 U' R' U' R U R' F'",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
  ],
  "big-even": [
    {
      title: "Solve the centres",
      phase: "Reduction 1",
      look: "Build each 2×2 (or larger) centre block using wide slice turns.",
      moves: "r U r' · U r U' r'",
      face: ["x", "x", "x", "x", "u", "x", "x", "x", "x"],
    },
    {
      title: "Pair the edges",
      phase: "Reduction 2",
      look: "Bring matching edge pieces to the front-left and front-right slots.",
      moves: "d R F' U R' F d'",
      face: ["x", "f", "x", "x", "x", "x", "x", "f", "x"],
    },
    {
      title: "Solve it as a 3×3",
      phase: "3×3 stage",
      look: "Treat each paired edge as one edge and each centre block as one centre.",
      moves: "F R U R' U' F'",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Fix OLL parity",
      phase: "Parity",
      look: "One last-layer edge looks flipped — impossible on a real 3×3.",
      moves: "r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'",
      face: ["x", "d", "x", "d", "d", "d", "x", "x", "x"],
    },
    {
      title: "Fix PLL parity",
      phase: "Parity",
      look: "Two last-layer edges are swapped after OLL is complete.",
      moves: "2R2 U2 2R2 u2 2R2 2U2",
      face: ["d", "d", "d", "p", "d", "p", "d", "d", "d"],
    },
  ],
  "big-odd": [
    {
      title: "Solve the centres",
      phase: "Reduction 1",
      look: "Fixed middle centres anchor each face — build outward from them.",
      moves: "r U r' · U r U' r'",
      face: ["x", "x", "x", "x", "u", "x", "x", "x", "x"],
    },
    {
      title: "Pair the edges",
      phase: "Reduction 2",
      look: "Group each edge's wing pieces around its middle edge piece.",
      moves: "d R F' U R' F d'",
      face: ["x", "f", "x", "x", "x", "x", "x", "f", "x"],
    },
    {
      title: "Solve it as a 3×3",
      phase: "3×3 stage",
      look: "Odd cubes can't have edge parity — standard 3×3 method finishes it.",
      moves: "R U R' U R U2 R'",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Fix stray centres",
      phase: "Cleanup",
      look: "A single centre piece landed on the wrong face late in reduction.",
      moves: "r U r' U r U2 r'",
      face: ["x", "x", "x", "x", "u", "x", "x", "x", "x"],
    },
  ],
  pyraminx: [
    {
      title: "Twist the four tips",
      phase: "Tips",
      look: "Each tip only needs to match the centre directly below it.",
      moves: "u  l  r  b",
      face: ["x", "p", "x", "p", "p", "p", "x", "p", "x"],
    },
    {
      title: "Orient the centres",
      phase: "Centres",
      look: "Turn the three big layers so each centre matches the tip above it.",
      moves: "L R' L' R",
      face: ["x", "l", "x", "l", "l", "l", "x", "l", "x"],
    },
    {
      title: "Build the first face",
      phase: "Layer 1",
      look: "Place the three edges around one chosen colour.",
      moves: "R U R' U'",
      face: ["u", "u", "u", "u", "u", "u", "x", "x", "x"],
    },
    {
      title: "Cycle the last edges",
      phase: "Last layer",
      look: "Three edges remain — cycle or flip them.",
      moves: "R U R' U R U R'",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
  ],
  megaminx: [
    {
      title: "White star",
      phase: "Star",
      look: "Five edges around the white face, side colours matching their centres.",
      moves: "F R U R' U' F'",
      face: ["x", "u", "x", "u", "u", "u", "x", "u", "x"],
    },
    {
      title: "First layer corners",
      phase: "Layer 1",
      look: "Same right-hand trigger as a 3×3, repeated for five corners.",
      moves: "R U R' U'",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Work down the sides",
      phase: "Layers 2–4",
      look: "Insert edges layer by layer, exactly like a 3×3 middle layer.",
      moves: "U R U' R' U' F' U F",
      face: ["x", "f", "x", "l", "u", "r", "x", "f", "x"],
    },
    {
      title: "Grey star and last layer",
      phase: "Last layer",
      look: "Build the final cross, then orient and permute the last pieces.",
      moves: "R U R' U R U2 R'",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
  ],
  skewb: [
    {
      title: "Build one full face",
      phase: "Face",
      look: "Pick a colour and assemble its centre plus four corners intuitively.",
      moves: "R' L R L'",
      face: ["u", "u", "u", "u", "u", "u", "u", "u", "u"],
    },
    {
      title: "Orient the last corners",
      phase: "Corners",
      look: "Hold the solved face down and check the four top corners.",
      moves: "R' L R L' R' L R L'",
      face: ["x", "d", "x", "d", "d", "d", "x", "d", "x"],
    },
    {
      title: "Place the last centres",
      phase: "Centres",
      look: "Only centres remain — either a 3-cycle or a pair swap.",
      moves: "R L' R' L R L' R' L",
      face: ["d", "d", "d", "d", "d", "d", "d", "d", "d"],
    },
  ],
};

export function guideFor(id: PuzzleId): SolveStep[] {
  if (id === "2x2") return guides["2x2"];
  if (id === "3x3") return guides["3x3"];
  if (id === "pyraminx") return guides.pyraminx;
  if (id === "megaminx") return guides.megaminx;
  if (id === "skewb") return guides.skewb;
  if (id === "square1") return guides.square1;
  const n = parseInt(id, 10);
  return n % 2 === 0 ? guides["big-even"] : guides["big-odd"];
}
