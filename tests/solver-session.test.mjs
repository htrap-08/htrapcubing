import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const data = (s) => "data:text/javascript," + encodeURIComponent(s);
const compile = (f) =>
  ts.transpileModule(fs.readFileSync(new URL(f, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const cubeURL = data(compile("../src/lib/cube-state.ts"));
const { solvedFacelets } = await import(cubeURL);
const session = await import(
  data(compile("../src/lib/solver-session.ts").replace('"./cube-state"', JSON.stringify(cubeURL)))
);
test("draft, notation and solution survive a handoff without being overwritten", () => {
  const oldWindow = globalThis.window,
    oldStorage = globalThis.sessionStorage;
  const store = new Map();
  globalThis.window = {};
  globalThis.sessionStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  };
  try {
    const facelets = solvedFacelets(3);
    const input = session.faceletsToGraphString(facelets);
    session.writeSolverSession({
      facelets,
      input,
      scramble: "R U",
      solution: "U' R'",
      mode: "colours",
    });
    assert.equal(input.length, 54);
    assert.deepEqual(session.readSolverSession().facelets, facelets);
    assert.equal(session.readSolverSession().scramble, "R U");
    assert.equal(session.readSolverSession().solution, "U' R'");
    session.writeSolverSession({ mode: "scan" });
    assert.equal(session.readSolverSession().input, input);
    assert.deepEqual(session.readSolverSession().facelets, facelets);
    session.writeSolverSession({ input: "", solution: "" });
    assert.equal(session.readSolverSession().input, undefined);
  } finally {
    globalThis.window = oldWindow;
    globalThis.sessionStorage = oldStorage;
  }
});
test("corrupt storage and incomplete colours are handled safely", () => {
  const oldWindow = globalThis.window,
    oldStorage = globalThis.sessionStorage;
  globalThis.window = {};
  globalThis.sessionStorage = {
    getItem: () => "{broken",
    setItem: () => {
      throw Error("disabled");
    },
  };
  try {
    assert.deepEqual(session.readSolverSession(), {});
    assert.doesNotThrow(() => session.writeSolverSession({ mode: "scan" }));
    const f = solvedFacelets(3);
    f.U[0] = "x";
    assert.equal(session.faceletsToGraphString(f), "");
  } finally {
    globalThis.window = oldWindow;
    globalThis.sessionStorage = oldStorage;
  }
});
