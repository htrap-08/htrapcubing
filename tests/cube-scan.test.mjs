import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const encode = (source) =>
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText,
  ).toString("base64");
const cubeSource = (
  await readFile(new URL("../src/lib/cube-state.ts", import.meta.url), "utf8")
).replace(
  "@/vendor/cubejs/index.js",
  new URL("../src/vendor/cubejs/index.js", import.meta.url).href,
);
const cubeURL = encode(cubeSource);
const { solveCubeString } = await import(cubeURL);
const scanSource = (
  await readFile(new URL("../src/lib/cube-scan-state.ts", import.meta.url), "utf8")
).replace("./cube-state", cubeURL);
const { initialScanState, cubeScanReducer, scannedFacesToCubeString, scannedFacesToFacelets } = await import(
  encode(scanSource)
);
const order = ["U", "R", "F", "D", "L", "B"];
const names = ["white", "red", "green", "yellow", "orange", "blue"];

test("six confirmed scans become a standard URFDLB string; review and reset work", () => {
  let state = initialScanState();
  assert.throws(() => scannedFacesToCubeString(state.faces));
  assert.equal(cubeScanReducer(state, { type: "select", index: 4 }), state);
  for (let i = 0; i < 6; i++) {
    assert.equal(state.index, i);
    state = cubeScanReducer(state, { type: "capture", colours: Array(9).fill(names[i]) });
    state = cubeScanReducer(state, { type: "confirm" });
  }
  assert.equal(scannedFacesToCubeString(state.faces), order.map((f) => f.repeat(9)).join(""));
  state = cubeScanReducer(state, { type: "select", index: 0 });
  state = cubeScanReducer(state, { type: "correct", index: 0, colour: "red" });
  assert.equal(state.faces.U[0], "white");
  state = cubeScanReducer(state, { type: "confirm" });
  assert.throws(() => scannedFacesToCubeString(state.faces), /exactly 9/);
  assert.deepEqual(cubeScanReducer(state, { type: "reset" }), initialScanState());
});

test("scanned scrambled facelets pass through the existing Kociemba solver and solve correctly", async () => {
  const { default: Cube } = await import("../src/vendor/cubejs/index.js");
  const cube = new Cube();
  cube.move("R U F2 L D' B R2 U'");
  const original = cube.asString();
  const faces = Object.fromEntries(
    order.map((f, i) => [
      f,
      [...original.slice(i * 9, i * 9 + 9)].map((letter) => names[order.indexOf(letter)]),
    ]),
  );
  const formatted = scannedFacesToCubeString(faces);
  assert.equal(formatted, original);
  const answer = await solveCubeString(formatted);
  assert.equal(answer.ok, true);
  cube.move(answer.solution);
  assert.equal(cube.isSolved(), true);
  assert.deepEqual(await solveCubeString(order.map((f) => f.repeat(9)).join("")), {
    ok: true,
    solution: "",
  });
  assert.equal((await solveCubeString("invalid")).ok, false);
});


test('all cube sizes capture six correctly sized faces and preserve solver colour mapping', () => {
  for (let n = 2; n <= 10; n++) {
    let state = initialScanState(n);
    for (let i = 0; i < 6; i++) {
      assert.equal(state.index, i);
      state = cubeScanReducer(state, { type: 'capture', colours: Array(n * n).fill(names[i]) });
      state = cubeScanReducer(state, { type: 'confirm' });
    }
    assert.equal(scannedFacesToCubeString(state.faces, n), order.map(f => f.repeat(n * n)).join(''));
    const facelets = scannedFacesToFacelets(state.faces, n);
    assert.equal(Object.values(facelets).flat().length, 6 * n * n);
    assert.deepEqual(facelets.F, Array(n * n).fill('l'));
    assert.deepEqual(facelets.L, Array(n * n).fill('f'));
    assert.equal(cubeScanReducer(state, { type: 'reset' }).n, n);
  }
});
