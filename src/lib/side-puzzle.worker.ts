import { solveMegaminx, solvePyraminx, solveSkewb } from "cubing/search";
import {
  loadPaintPuzzle,
  patternFromColours,
  patternColours,
  type SidePuzzle,
} from "./side-puzzle-state";

self.onmessage = async (event: MessageEvent<{ puzzle: SidePuzzle; colours: number[] }>) => {
  try {
    const { puzzle, colours } = event.data;
    const data = await loadPaintPuzzle(puzzle);
    const pattern = patternFromColours(data, colours);
    const solved = data.stickers.map((s) => s.face);
    if (colours.every((c, i) => c === solved[i])) {
      self.postMessage({ solution: "" });
      return;
    }
    const alg = await { pyraminx: solvePyraminx, skewb: solveSkewb, megaminx: solveMegaminx }[
      puzzle
    ](pattern);
    if (!patternColours(data, pattern.applyAlg(alg)).every((c, i) => c === solved[i])) {
      throw new Error(
        "The solution did not pass verification. Check your colours and reference orientation.",
      );
    }
    self.postMessage({ solution: alg.toString() });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Unable to solve this colour pattern.",
    });
  }
};
