import test from "node:test";
import assert from "node:assert/strict";
import { kpuzzle, isColourSolved } from "./solver.mjs";
import { faceletsFromPattern, patternFromFacelets, solveFaceletInput } from "./facelets.mjs";
test("solved input produces no moves", () =>
  assert.equal(solveFaceletInput(faceletsFromPattern(kpuzzle.defaultPattern())).moves, ""));
test("mixed inner turns, rotations and parity cases solve from sticker input", () => {
  for (const scramble of [
    "2R",
    "R U F 2L B2 2U' D",
    "x y R U' 2F L2 2D",
    "2L' U2 2L' U2 2L' 2R U2 2L' U2 2L U2 2R' U2 2L2",
  ]) {
    const p = kpuzzle.defaultPattern().applyAlg(scramble);
    const f = faceletsFromPattern(p);
    assert.ok(patternFromFacelets(f).isIdentical(p));
    const r = solveFaceletInput(f);
    assert.ok(isColourSolved(p.applyAlg(r.moves)));
    assert.equal(r.stages.length, 10);
  }
});
test("single wing flip and corner twist are rejected", () => {
  const f = faceletsFromPattern(kpuzzle.defaultPattern());
  const flipped = structuredClone(f);
  [flipped.U[14], flipped.F[2]] = [flipped.F[2], flipped.U[14]];
  assert.throws(() => patternFromFacelets(flipped));
  const twisted = structuredClone(f);
  [twisted.U[15], twisted.R[0], twisted.F[3]] = [twisted.R[0], twisted.F[3], twisted.U[15]];
  assert.throws(() => patternFromFacelets(twisted));
});
