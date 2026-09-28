import { loadPaintPuzzle, patternColours, type SidePuzzle } from "../src/lib/side-puzzle-state";
const cases: [SidePuzzle, string][] = [
  ["pyraminx", "R U L B R' U' L u l' r b"],
  ["skewb", "R U L B R' U' L B U R"],
  ["megaminx", "R U F2 L' BR U2 D FR' BL2 R U' DR DL2 B"],
];
document.querySelector<HTMLButtonElement>("#run")!.onclick = async () => {
  const results = document.querySelector("#results")!;
  results.textContent = "Running…\n";
  for (const [puzzle, scramble] of cases) {
    try {
      const data = await loadPaintPuzzle(puzzle);
      const colours = patternColours(data, data.kpuzzle.defaultPattern().applyAlg(scramble));
      const result = await new Promise<{ solution?: string; error?: string }>((resolve, reject) => {
        const job = new Worker(new URL("../src/lib/side-puzzle.worker.ts", import.meta.url), { type: "module" });
        const timeout = setTimeout(() => { job.terminate(); reject(new Error("Timed out")); }, 60000);
        job.onmessage = (event) => { clearTimeout(timeout); job.terminate(); resolve(event.data); };
        job.onerror = (event) => { clearTimeout(timeout); job.terminate(); reject(new Error(event.message)); };
        job.postMessage({ puzzle, colours });
      });
      if (result.error || !result.solution) throw new Error(result.error ?? "No solution returned");
      results.textContent += `${puzzle}: PASS — verified solution returned\n`;
    } catch (error) { results.textContent += `${puzzle}: FAIL — ${String(error)}\n`; }
  }
};
