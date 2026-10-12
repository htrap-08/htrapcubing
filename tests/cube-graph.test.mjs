import test from "node:test";
import assert from "node:assert/strict";
import Cube from "../src/vendor/cubejs/index.js";
import {
  GRAPH_POINTS,
  GRAPH_EDGES,
  SOLVED_GRAPH_STATE,
  graphMovePermutation,
  applyGraphMove,
  graphSnapshots,
  graphCurve,
} from "../src/lib/cube-graph-model.js";
test("graph has 54 unique sticker slots and reversible edge curves", () => {
  assert.equal(GRAPH_POINTS.length, 54);
  assert.equal(new Set(GRAPH_POINTS.map((p) => p.x + "," + p.y)).size, 54);
  for (const e of GRAPH_EDGES) assert.deepEqual(graphCurve(e.from, e.to), graphCurve(e.to, e.from));
});
test("all face turns match the independent cubejs state", () => {
  let seed = 481012;
  const rnd = (n) => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) % n;
  };
  const moves = "URFDLB".split("").flatMap((f) => [f, f + "'", f + "2"]);
  for (let trial = 0; trial < 100; trial++) {
    let state = SOLVED_GRAPH_STATE;
    const cube = new Cube();
    for (let j = 0; j < 30; j++) {
      const m = moves[rnd(18)];
      state = applyGraphMove(state, m);
      cube.move(m);
      assert.equal(state, cube.asString());
    }
  }
  for (const move of moves) {
    const p = graphMovePermutation(move);
    assert.equal(new Set(p).size, 54);
    let s = SOLVED_GRAPH_STATE;
    for (let i = 0; i < 4; i++) s = applyGraphMove(s, move);
    assert.equal(s, SOLVED_GRAPH_STATE);
  }
});
test("solution graph reaches solved for real random cube inputs", () => {
  Cube.initSolver();
  for (const scramble of [
    "R U R' U' F2",
    "F R2 D B' L U2",
    "R2 U2 F2 D2 L2 B2",
    "U R F D L B U' R' F' D' L' B'",
  ]) {
    const cube = new Cube().move(scramble);
    const start = cube.asString();
    const solution = cube.solve();
    const states = graphSnapshots(start, solution.split(/\s+/).filter(Boolean));
    assert.equal(states.at(-1), SOLVED_GRAPH_STATE);
  }
});
test("nine circular loops form the 108-edge 4-regular sticker graph", async () => {
  const { GRAPH_RINGS, graphPositionDuringMove } = await import("../src/lib/cube-graph-model.js");
  assert.equal(GRAPH_RINGS.length, 9);
  assert.equal(GRAPH_EDGES.length, 108);
  const edges = new Set(GRAPH_EDGES.map((e) => [e.from, e.to].sort((a, b) => a - b).join("-")));
  assert.equal(edges.size, 108);
  const degrees = Array(54).fill(0);
  for (const e of GRAPH_EDGES) {
    degrees[e.from]++;
    degrees[e.to]++;
  }
  assert.ok(degrees.every((d) => d === 4));
  const membership = Array(54).fill(0);
  for (const ring of GRAPH_RINGS) {
    assert.equal(ring.vertices.length, 12);
    for (const i of ring.vertices) {
      membership[i]++;
      assert.ok(
        Math.abs(Math.hypot(GRAPH_POINTS[i].x - ring.cx, GRAPH_POINTS[i].y - ring.cy) - ring.r) <
          1e-7,
      );
    }
  }
  assert.ok(membership.every((c) => c === 2));
  for (const move of ["U", "R", "F", "D", "L", "B", "R'", "F2"]) {
    const p = graphMovePermutation(move),
      d = [];
    p.forEach((s, i) => (d[s] = i));
    for (let i = 0; i < 54; i++) {
      const start = graphPositionDuringMove(i, move, 0),
        end = graphPositionDuringMove(i, move, 1);
      assert.ok(Math.hypot(start.x - GRAPH_POINTS[i].x, start.y - GRAPH_POINTS[i].y) < 1e-6);
      assert.ok(Math.hypot(end.x - GRAPH_POINTS[d[i]].x, end.y - GRAPH_POINTS[d[i]].y) < 1e-6);
    }
  }
});
