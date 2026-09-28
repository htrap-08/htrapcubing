import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const url = (text) => `data:text/javascript,${encodeURIComponent(text)}`;
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const stateUrl = url(compile("../../src/lib/cube-state.ts"));
const { solvedFacelets, blankFacelets } = await import(stateUrl);
const { solveLargeCube } = await import(
  url(
    compile("../../src/lib/large-cube-solver.ts").replace(
      '"./cube-state"',
      JSON.stringify(stateUrl),
    ),
  )
);

test("all sizes detect solved and blank facelets without a network request", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Unexpected network request");
  };
  try {
    for (let n = 4; n <= 10; n++) {
      assert.deepEqual(await solveLargeCube(n, solvedFacelets(n), new AbortController().signal), {
        ok: true,
        solution: "",
      });
      assert.match(
        (await solveLargeCube(n, blankFacelets(n), new AbortController().signal)).error,
        /blank/,
      );
    }
  } finally {
    globalThis.fetch = original;
  }
});

test("serializes physical colours in URFDLB order and returns service solution", async () => {
  const state = solvedFacelets(4);
  [state.U[0], state.R[0]] = [state.R[0], state.U[0]];
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (path, options) => {
    calls.push([path, options]);
    return Response.json(
      path.endsWith("/solve")
        ? { id: "job1", status: "solving" }
        : { status: "complete", solution: "R U R'" },
    );
  };
  try {
    assert.equal((await solveLargeCube(4, state, new AbortController().signal)).solution, "R U R'");
    const submitted = JSON.parse(calls[0][1].body);
    assert.equal(submitted.n, 4);
    assert.equal(
      submitted.state,
      "R" +
        "U".repeat(15) +
        "U" +
        "R".repeat(15) +
        "F".repeat(16) +
        "D".repeat(16) +
        "L".repeat(16) +
        "B".repeat(16),
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("cancellation during submission stops the server job", async () => {
  const state = solvedFacelets(4);
  [state.U[0], state.R[0]] = [state.R[0], state.U[0]];
  const controller = new AbortController();
  const original = globalThis.fetch;
  let stopped = false;
  globalThis.fetch = async (path, options) => {
    if (options.method === "DELETE") {
      stopped = true;
      return Response.json({ status: "cancelled" });
    }
    controller.abort();
    return Response.json({ id: "cancel-me" });
  };
  try {
    await assert.rejects(solveLargeCube(4, state, controller.signal));
    assert.equal(stopped, true);
  } finally {
    globalThis.fetch = original;
  }
});
