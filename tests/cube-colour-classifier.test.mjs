import test from "node:test";
import assert from "node:assert/strict";
import {
  CUBE_PALETTE,
  rgbToLab,
  ciede2000,
  classifyCubeColours,
} from "../src/lib/cube-colour-classifier.js";

// Sharma, Wu & Dalal reference data: neutral colours and hue-wrap boundary cases.
// https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/dataNprograms/ciede2000testdata.txt
const reference = `
50 2.6772 -79.7751 50 0 -82.7485 2.0425
50 3.1571 -77.2803 50 0 -82.7485 2.8615
50 2.8361 -74.0200 50 0 -82.7485 3.4412
50 -1.3802 -84.2814 50 0 -82.7485 1.0000
50 0 0 50 -1 2 2.3669
50 -1 2 50 0 0 2.3669
50 2.49 -0.001 50 -2.49 0.0009 7.1792
50 2.49 -0.001 50 -2.49 0.0010 7.1792
50 2.49 -0.001 50 -2.49 0.0011 7.2195
50 2.49 -0.001 50 -2.49 0.0012 7.2195
50 -0.001 2.49 50 0.0009 -2.49 4.8045
50 -0.001 2.49 50 0.0010 -2.49 4.8045
50 -0.001 2.49 50 0.0011 -2.49 4.7461
50 2.5 0 50 0 -2.5 4.3065
50 2.5 0 73 25 -18 27.1492
2.0776 0.0795 -1.1350 0.9033 -0.0636 -0.5514 0.9082`;

test("matches published CIEDE2000 reference values in both directions", () => {
  for (const line of reference.trim().split("\n")) {
    const [L, a, b, L2, a2, b2, expected] = line.trim().split(/\s+/).map(Number);
    const first = { L, a, b },
      second = { L: L2, a: a2, b: b2 };
    assert.ok(Math.abs(ciede2000(first, second) - expected) < 0.00005, line);
    assert.ok(Math.abs(ciede2000(second, first) - expected) < 0.00005, `reverse: ${line}`);
  }
});

test("sRGB conversion yields expected D65 Lab values", () => {
  assert.deepEqual(rgbToLab({ r: 0, g: 0, b: 0 }), { L: 0, a: 0, b: 0 });
  const white = rgbToLab(CUBE_PALETTE.white);
  assert.ok(
    Math.abs(white.L - 100) < 0.001 && Math.abs(white.a) < 0.001 && Math.abs(white.b) < 0.001,
  );
  const red = rgbToLab(CUBE_PALETTE.red);
  assert.ok(
    Math.abs(red.L - 53.2408) < 0.001 &&
      Math.abs(red.a - 80.0925) < 0.001 &&
      Math.abs(red.b - 67.2032) < 0.001,
  );
});

test("classifies all six colours and nearby samples in input order without mutation", () => {
  const names = ["white", "yellow", "red", "orange", "blue", "green", "white", "red", "blue"];
  const pixels = names.map((name) => Object.freeze({ ...CUBE_PALETTE[name] }));
  Object.freeze(pixels);
  assert.deepEqual(classifyCubeColours(pixels), names);
  const nearby = pixels.map(({ r, g, b }) => ({
    r: Math.max(0, r - 8),
    g: Math.max(0, g - 8),
    b: Math.max(0, b - 8),
  }));
  assert.deepEqual(classifyCubeColours(nearby), names);
});

test("rejects wrong length, sparse arrays and invalid channels", () => {
  for (const input of [
    null,
    [],
    new Array(9),
    Array(9).fill({ r: NaN, g: 0, b: 0 }),
    Array(9).fill({ r: 256, g: 0, b: 0 }),
    Array(9).fill({ r: -1, g: 0, b: 0 }),
    Array(9).fill({ r: "255", g: 0, b: 0 }),
  ]) {
    assert.throws(() => classifyCubeColours(input), TypeError);
  }
});


test('classifies a full face for every supported cube size', () => {
  for (let n = 2; n <= 10; n++) {
    assert.deepEqual(classifyCubeColours(Array(n * n).fill(CUBE_PALETTE.green), n * n), Array(n * n).fill('green'));
  }
});
