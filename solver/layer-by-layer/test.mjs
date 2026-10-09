import { kpuzzle, solvePattern, isColourSolved } from "./solver.mjs";
import fs from "node:fs";
const count = Number(process.argv[2] ?? 100);
let seed = 101048;
const random = (n) => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed % n;
};
const faces = ["R", "L", "U", "D", "F", "B", "2R", "2L", "2U", "2D", "2F", "2B"];
const suffix = ["", "'", "2"];
const failures = [],
  records = [];
const start = Date.now();
for (let i = 0; i < count; i++) {
  const scramble = Array.from(
    { length: 40 },
    () => faces[random(faces.length)] + suffix[random(3)],
  ).join(" ");
  try {
    const before = kpuzzle.defaultPattern().applyAlg(scramble);
    const time = Date.now();
    const r = solvePattern(before);
    if (!isColourSolved(before.applyAlg(r.moves))) throw Error("Replay not solved");
    records.push({
      index: i,
      moves: r.moves.split(/\s+/).filter(Boolean).length,
      ms: Date.now() - time,
    });
  } catch (e) {
    failures.push({ index: i, scramble, error: e.message });
  }
}
const report = {
  count,
  passed: records.length,
  failed: failures.length,
  elapsedMs: Date.now() - start,
  maxMoves: Math.max(...records.map((r) => r.moves)),
  meanMoves: records.reduce((a, r) => a + r.moves, 0) / records.length,
  failures,
};
fs.writeFileSync(new URL("./test-results.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
