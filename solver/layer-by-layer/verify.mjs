import { kpuzzle, isColourSolved } from "./solver.mjs";
import { faceletsFromPattern, patternFromFacelets, solveFaceletInput } from "./facelets.mjs";
import fs from "node:fs";
const total = Number(process.argv[2] ?? 100);
let seed = 10101048;
const rnd = (n) => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  seed >>>= 0;
  return seed % n;
};
const faces = ["R", "L", "U", "D", "F", "B", "2R", "2L", "2U", "2D", "2F", "2B"];
const ends = ["", "'", "2"];
const failures = [],
  replays = [];
let max = 0,
  sum = 0;
const begin = Date.now();
for (let i = 0; i < total; i++) {
  const scramble = Array.from(
    { length: [0, 1, 2, 5, 20, 40, 80][i % 7] },
    () => faces[rnd(12)] + ends[rnd(3)],
  ).join(" ");
  try {
    const input = kpuzzle.defaultPattern().applyAlg(scramble);
    const colours = faceletsFromPattern(input);
    const parsed = patternFromFacelets(colours);
    if (!input.isIdentical(parsed)) throw Error("Facelet roundtrip");
    const result = solveFaceletInput(colours);
    if (!isColourSolved(input.applyAlg(result.moves))) throw Error("Final replay");
    const n = result.moves.split(/\s+/).filter(Boolean).length;
    sum += n;
    max = Math.max(max, n);
    if (i < 1000) replays.push({ scramble, solution: result.moves, stages: result.stages });
  } catch (e) {
    failures.push({ scramble, error: e.message });
  }
}
const solved = faceletsFromPattern(kpuzzle.defaultPattern());
const invalid = [];
const blank = structuredClone(solved);
blank.U[0] = "X";
invalid.push(blank);
const count = structuredClone(solved);
count.U[0] = "D";
invalid.push(count);
// Twist one U/R/F corner without changing colour counts.
const twisted = structuredClone(solved);
[twisted.U[15], twisted.R[0], twisted.F[3]] = [twisted.R[0], twisted.F[3], twisted.U[15]];
invalid.push(twisted);
const flipped = structuredClone(solved);
[flipped.U[14], flipped.F[2]] = [flipped.F[2], flipped.U[14]];
invalid.push(flipped);
const mirrored = structuredClone(solved);
[mirrored.U[15], mirrored.R[0]] = [mirrored.R[0], mirrored.U[15]];
invalid.push(mirrored);
let rejected = 0;
for (const state of invalid) {
  try {
    patternFromFacelets(state);
  } catch {
    rejected++;
  }
}
if (rejected !== invalid.length) failures.push({ error: "Invalid input accepted" });
const report = {
  total,
  passed: total - failures.filter((f) => f.scramble).length,
  failures,
  invalidRejected: rejected,
  maxMoves: max,
  meanMoves: sum / total,
  elapsedMs: Date.now() - begin,
  scope:
    "Full mixed-length legal scrambles (0, 1, 2, 5, 20, 40, 80 moves); facelet decode; white-first stages; full replay; protected pieces checked at every macro. Synthetic input, not physical camera verification.",
};
fs.writeFileSync(new URL("./verification.json", import.meta.url), JSON.stringify(report, null, 2));
fs.writeFileSync(new URL("./geometric-replays.json", import.meta.url), JSON.stringify(replays));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
