import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { solvePyraminx, solveSkewb, solveMegaminx } from "cubing/search";
import { Alg } from "cubing/alg";
let source = ts.transpileModule(
  readFileSync(new URL("../src/lib/side-puzzle-state.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
).outputText;
for (const name of ["cubing/kpuzzle", "cubing/puzzles"])
  source = source.replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
const { loadPaintPuzzle, blankPaint, patternColours, patternFromColours } = await import(
  `data:text/javascript,${encodeURIComponent(source)}`
);
const cases = [
  ["pyraminx", "R U L B R' U' L u l' r b", solvePyraminx, 36],
  ["skewb", "R U L B R' U' L B U R", solveSkewb, 30],
  ["megaminx", "R U F2 L' BR U2 D FR' BL2 R U' DR DL2 B", solveMegaminx, 132],
];
for (const [id, scramble, solve, count] of cases) {
  test(
    `${id}: painted scramble converts to pieces and produces a verified solution`,
    { timeout: 120000 },
    async () => {
      const data = await loadPaintPuzzle(id);
      assert.equal(data.stickers.length, count);
      assert.throws(() => patternFromColours(data, blankPaint(data)), /Colour every/);
      const original = data.kpuzzle.defaultPattern().applyAlg(scramble);
      const colours = patternColours(data, original);
      const entered = patternFromColours(data, colours);
      assert.deepEqual(patternColours(data, entered), colours);
      const solution = await solve(entered);
      assert.deepEqual(
        patternColours(data, entered.applyAlg(solution)),
        data.stickers.map((s) => s.face),
      );
      // The displayed setup must reproduce the entered stickers, including order-five turns.
      assert.deepEqual(
        patternColours(
          data,
          data.kpuzzle.defaultPattern().applyAlg(new Alg(solution.toString()).invert()),
        ),
        colours,
      );
      console.log(`${id}: verified ${solution.toString()}`);
    },
  );
}
test("rejects incorrect colour counts and duplicate pieces", async () => {
  const data = await loadPaintPuzzle("pyraminx");
  const colours = data.stickers.map((s) => s.face);
  colours[0] = (colours[0] + 1) % 4;
  assert.throws(() => patternFromColours(data, colours), /must appear/);
  const bad = data.stickers.map((s) => s.face);
  const a = data.stickers.findIndex((s) => s.orbit === "EDGES");
  const b = data.stickers.findIndex((s) => s.orbit === "CORNERS" && s.face !== bad[a]);
  [bad[a], bad[b]] = [bad[b], bad[a]];
  assert.throws(() => patternFromColours(data, bad), /piece/);
});
