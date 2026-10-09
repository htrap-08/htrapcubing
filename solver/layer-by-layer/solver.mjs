import { puzzles } from "cubing/puzzles";
import { Alg } from "cubing/alg";
import geometry from "./geometry.json" with { type: "json" };
export const kpuzzle = await puzzles["4x4x4"].kpuzzle();
const solved = kpuzzle.defaultPattern();
const tokens = geometry.moves.map((m) => (m === m.toLowerCase() ? "2" + m.toUpperCase() : m));
const primitives = tokens
  .flatMap((m) => [m, m + "'", m + "2"])
  .map((m) => ({ moves: m, t: kpuzzle.algToTransformation(m) }));
export const coordinates = {};
for (const orbit of kpuzzle.definition.orbits) {
  coordinates[orbit.orbitName] = [];
  for (let i = 0; i < orbit.numPieces; i++) {
    const sig = tokens.map(
      (m) =>
        kpuzzle.algToTransformation(m).transformationData[orbit.orbitName].permutation[i] !== i,
    );
    const matches = geometry.positions.filter(
      (p) => p.orbit === orbit.orbitName && JSON.stringify(p.signature) === JSON.stringify(sig),
    );
    if (matches.length !== 1) throw Error("Ambiguous geometry mapping");
    coordinates[orbit.orbitName][i] = matches[0].position;
  }
}
const bases = {
  CENTERS: "2L F 2R' F' 2L' F 2R F'",
  EDGES: "R U R' U' 2R U R U' R' 2R'",
  CORNERS: "R' U R' D2 R U' R' D2 R2",
};
const setups = {};
function inverse(s) {
  return new Alg(s).invert().toString();
}
for (const [orbit, base] of Object.entries(bases)) {
  const perm = kpuzzle.algToTransformation(base).transformationData[orbit].permutation;
  const a = perm.findIndex((p, i) => p !== i);
  const initial = [a, perm[a], perm[perm[a]]];
  const map = new Map([[initial.join(","), ""]]);
  const queue = [initial];
  const moves =
    orbit === "CORNERS" ? primitives.filter((p) => !p.moves.startsWith("2")) : primitives;
  for (let head = 0; head < queue.length; head++) {
    const tuple = queue[head],
      path = map.get(tuple.join(","));
    for (const move of moves) {
      const p = move.t.transformationData[orbit].permutation;
      const forward = [];
      p.forEach((v, i) => (forward[v] = i));
      const next = tuple.map((i) => forward[i]),
        key = next.join(",");
      if (!map.has(key)) {
        map.set(key, (path + " " + move.moves).trim());
        queue.push(next);
      }
    }
  }
  setups[orbit] = map;
}
const cache = new Map();
function cycle(orbit, a, b, c) {
  const key = [orbit, a, b, c].join(",");
  if (cache.has(key)) return cache.get(key);
  const setup = setups[orbit].get([a, b, c].join(","));
  if (setup === undefined) throw Error("Unsupported cycle");
  const moves = [inverse(setup), bases[orbit], setup].filter(Boolean).join(" "),
    t = kpuzzle.algToTransformation(moves);
  if (t.transformationData[orbit].permutation[a] !== b) throw Error("Wrong cycle direction");
  const result = { moves, t };
  cache.set(key, result);
  return result;
}
const twistBase = "R' D' R D R' D' R D U D' R' D R D' R' D R U'";
const twist = kpuzzle.algToTransformation(twistBase);
const twistIds = twist.transformationData.CORNERS.orientationDelta.flatMap((v, i) =>
  v ? [i] : [],
);
const twistSetups = new Map([[twistIds.join(","), ""]]);
const twistQueue = [twistIds];
for (let head = 0; head < twistQueue.length; head++)
  for (const move of primitives.filter((p) => !p.moves.startsWith("2"))) {
    const f = [];
    move.t.transformationData.CORNERS.permutation.forEach((v, i) => (f[v] = i));
    const next = twistQueue[head].map((i) => f[i]),
      key = next.join(",");
    if (!twistSetups.has(key)) {
      twistSetups.set(key, (twistSetups.get(twistQueue[head].join(",")) + " " + move.moves).trim());
      twistQueue.push(next);
    }
  }
function twistPair(a, b, amount) {
  const setup = twistSetups.get([a, b].join(","));
  const seq = [inverse(setup), twistBase, setup].filter(Boolean).join(" ");
  let t = kpuzzle.algToTransformation(seq);
  let moves = seq;
  if (t.transformationData.CORNERS.orientationDelta[a] !== amount) {
    moves = inverse(seq);
    t = t.invert();
  }
  return { moves, t };
}
export function isColourSolved(pattern) {
  return (
    ["EDGES", "CORNERS"].every(
      (o) =>
        pattern.patternData[o].pieces.every((p, i) => p === i) &&
        pattern.patternData[o].orientation.every((v) => v === 0),
    ) &&
    pattern.patternData.CENTERS.pieces.every((p, i) => p === solved.patternData.CENTERS.pieces[i])
  );
}
const indices = (orbit, predicate) =>
  coordinates[orbit].flatMap((p, i) => (predicate(p) ? [i] : []));
export function solvePattern(input) {
  let state = input;
  const stages = [],
    allMoves = [];
  const protectedSlots = { CENTERS: new Set(), EDGES: new Set(), CORNERS: new Set() };
  const correct = (o, i, s = state) =>
    s.patternData[o].pieces[i] === solved.patternData[o].pieces[i] &&
    (o === "CENTERS" || s.patternData[o].orientation[i] === 0);
  function apply(a) {
    const next = state.applyTransformation(a.t);
    for (const [o, ids] of Object.entries(protectedSlots))
      for (const i of ids)
        if (!correct(o, i, next)) throw Error("Protected piece disturbed: " + o + i);
    state = next;
    allMoves.push(a.moves);
  }
  function centers(targets) {
    let count = 0;
    while (targets.some((i) => !correct("CENTERS", i))) {
      if (++count > 100) throw Error("Centre stage stalled");
      let chosen;
      const p = state.patternData.CENTERS.pieces;
      const before = targets.filter((i) => correct("CENTERS", i)).length;
      outer: for (const i of targets.filter((i) => !correct("CENTERS", i)))
        for (let j = 0; j < 24; j++)
          if (j !== i && p[j] === solved.patternData.CENTERS.pieces[i])
            for (let k = 0; k < 24; k++)
              if (k !== i && k !== j) {
                const after = p.slice();
                after[i] = p[j];
                after[j] = p[k];
                after[k] = p[i];
                if (
                  [...protectedSlots.CENTERS].some(
                    (v) => after[v] !== solved.patternData.CENTERS.pieces[v],
                  )
                )
                  continue;
                if (
                  targets.filter((v) => after[v] === solved.patternData.CENTERS.pieces[v]).length >
                  before
                ) {
                  chosen = cycle("CENTERS", i, j, k);
                  break outer;
                }
              }
      if (!chosen) throw Error("No progressive centre cycle");
      apply(chosen);
    }
    targets.forEach((i) => protectedSlots.CENTERS.add(i));
  }
  function pieces(orbit, targets) {
    for (const i of targets) {
      if (state.patternData[orbit].pieces[i] !== i) {
        const j = state.patternData[orbit].pieces.indexOf(i);
        const k = coordinates[orbit].findIndex(
          (_, k) => k !== i && k !== j && !protectedSlots[orbit].has(k) && !targets.includes(k),
        );
        if (k < 0) throw Error("Need parity or buffer");
        apply(cycle(orbit, i, j, k));
      }
      if (orbit === "CORNERS" && state.patternData.CORNERS.orientation[i]) {
        const b = coordinates.CORNERS.findIndex(
          (_, k) => k !== i && !protectedSlots.CORNERS.has(k) && !targets.includes(k),
        );
        if (b < 0) throw Error("Missing corner twist buffer");
        apply(twistPair(i, b, (3 - state.patternData.CORNERS.orientation[i]) % 3));
      }
      if (!correct(orbit, i)) throw Error("Piece orientation mismatch " + orbit + i);
      protectedSlots[orbit].add(i);
    }
  }
  function stage(name, fn) {
    const begin = allMoves.length;
    fn();
    stages.push({ name, moves: allMoves.slice(begin).join(" ") });
  }
  stage("White centre", () => centers(indices("CENTERS", (p) => p[1] === -3)));
  stage("White cross", () =>
    pieces(
      "EDGES",
      indices("EDGES", (p) => p[1] === -3),
    ),
  );
  stage("First-layer corners", () =>
    pieces(
      "CORNERS",
      indices("CORNERS", (p) => p[1] === -3),
    ),
  );
  stage("Second-layer centres", () => centers(indices("CENTERS", (p) => p[1] === -1)));
  stage("Second-layer wings", () =>
    pieces(
      "EDGES",
      indices("EDGES", (p) => p[1] === -1),
    ),
  );
  stage("Third-layer centres", () => centers(indices("CENTERS", (p) => p[1] === 1)));
  stage("Third-layer wings", () =>
    pieces(
      "EDGES",
      indices("EDGES", (p) => p[1] === 1),
    ),
  );
  // Top centres are automatically colour solved once all other centres are correct.
  stage("Top centres", () => centers(indices("CENTERS", (p) => p[1] === 3)));
  stage("Top corners", () => {
    const top = indices("CORNERS", (p) => p[1] === 3);
    const cp = state.patternData.CORNERS.pieces;
    const odd = cp.reduce((n, p, i) => n + cp.slice(i + 1).filter((v) => v < p).length, 0) % 2;
    if (odd) apply({ moves: "U", t: kpuzzle.algToTransformation("U") });
    const permLocked = new Set();
    for (let z = 0; z < top.length - 2; z++) {
      const i = top[z];
      if (state.patternData.CORNERS.pieces[i] !== i) {
        const j = state.patternData.CORNERS.pieces.indexOf(i);
        const k = top.find((k) => k !== i && k !== j && !permLocked.has(k));
        apply(cycle("CORNERS", i, j, k));
      }
      permLocked.add(i); // Delay twist locking until permutation is complete.
    }
    if (top.some((i) => state.patternData.CORNERS.pieces[i] !== i))
      throw Error("Corner permutation failed");
    const buffer = top.at(-1);
    for (const i of top.slice(0, -1))
      if (state.patternData.CORNERS.orientation[i])
        apply(twistPair(i, buffer, (3 - state.patternData.CORNERS.orientation[i]) % 3));
    if (top.some((i) => !correct("CORNERS", i))) throw Error("Corner twist failed");
    top.forEach((i) => protectedSlots.CORNERS.add(i));
  });
  stage("Top wings with commutators and parity", () => {
    const top = indices("EDGES", (p) => p[1] === 3);
    let cp = state.patternData.EDGES.pieces;
    const odd = cp.reduce((n, p, i) => n + cp.slice(i + 1).filter((v) => v < p).length, 0) % 2;
    if (odd) {
      const moves = "2L' U2 2L' U2 2L' 2R U2 2L' U2 2L U2 2R' U2 2L2";
      apply({ moves, t: kpuzzle.algToTransformation(moves) });
    }
    for (let z = 0; z < top.length - 2; z++) {
      const i = top[z];
      if (state.patternData.EDGES.pieces[i] !== i) {
        const j = state.patternData.EDGES.pieces.indexOf(i);
        const k = top.find((k) => k !== i && k !== j && !protectedSlots.EDGES.has(k));
        apply(cycle("EDGES", i, j, k));
      }
      protectedSlots.EDGES.add(i);
    }
  });
  if (!isColourSolved(state)) throw Error("Final verification failed");
  const moves = allMoves.join(" ");
  if (!isColourSolved(input.applyAlg(moves))) throw Error("Replay failed");
  return { moves, stages, pattern: state };
}
