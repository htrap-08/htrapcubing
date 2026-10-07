import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { puzzles } from "cubing/puzzles";
import { Alg } from "cubing/alg";
import { randomScrambleForEvent } from "cubing/scramble";
const source = await readFile(new URL("../src/lib/square1.ts", import.meta.url), "utf8");
const url =
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText,
  ).toString("base64");
const { solvedSquare1, parseSquare1, square1StateAfter, solveSquare1Scramble, square1Scramble } =
  await import(url);
test("rejects malformed notation and slices through a corner", () => {
  for (const text of ["R U", "(7,0)", "(1,)", "(1,0)garbage"])
    assert.throws(() => parseSquare1(text));
  assert.throws(() => square1StateAfter("(2,0) /"), /blocked/);
  assert.deepEqual(square1StateAfter("(1,0) / / (-1,0)"), solvedSquare1());
});
test("random practice scrambles are legal and reverse to solved in independent cubing model", async () => {
  const k = await puzzles.square1.kpuzzle();
  for (let i = 0; i < 40; i++) {
    const scramble = square1Scramble();
    const solution = solveSquare1Scramble(scramble);
    assert.deepEqual(square1StateAfter(solution, square1StateAfter(scramble)), solvedSquare1());
    assert(
      k.defaultPattern().applyAlg(scramble).applyAlg(solution).isIdentical(k.defaultPattern()),
    );
    assert.equal(new Alg(scramble).experimentalNumUnits(), 30);
  }
});
test("official random-state sq1 scramble is accepted and replay solves it", async () => {
  const k = await puzzles.square1.kpuzzle();
  for (let i = 0; i < 5; i++) {
    const scramble = (await randomScrambleForEvent("sq1")).toString();
    const solution = solveSquare1Scramble(scramble);
    assert(k.defaultPattern().applyAlg(scramble).applyAlg(solution).isIdentical(k.defaultPattern()));
  }
});

test("Square-1 library sequences have legal slices and inverse playback", async () => {
  const source = await readFile(new URL("../src/lib/algorithms.ts", import.meta.url), "utf8");
  const url =
    "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
    ).toString("base64");
  const { algorithms } = await import(url);
  for (const a of algorithms.filter((a) => a.puzzle === "Square-1")) {
    assert.doesNotThrow(() => square1StateAfter(a.moves), a.id);
    const solution = solveSquare1Scramble(a.moves);
    assert.deepEqual(square1StateAfter(solution, square1StateAfter(a.moves)), solvedSquare1());
  }
});
