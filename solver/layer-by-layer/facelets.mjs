import { KPattern } from "cubing/kpuzzle";
import { kpuzzle, coordinates, solvePattern, isColourSolved } from "./solver.mjs";
const faces = {
  U: { n: [0, 1, 0], r: [1, 0, 0], d: [0, 0, 1] },
  D: { n: [0, -1, 0], r: [1, 0, 0], d: [0, 0, -1] },
  F: { n: [0, 0, 1], r: [1, 0, 0], d: [0, -1, 0] },
  B: { n: [0, 0, -1], r: [-1, 0, 0], d: [0, -1, 0] },
  R: { n: [1, 0, 0], r: [0, 0, -1], d: [0, -1, 0] },
  L: { n: [-1, 0, 0], r: [0, 0, 1], d: [0, -1, 0] },
};
const faceOf = (n) => Object.keys(faces).find((f) => faces[f].n.every((v, i) => v === n[i]));
const rotation = (v, axis, q) => {
  v = v.slice();
  for (let t = 0; t < ((q % 4) + 4) % 4; t++) {
    const a = (axis + 1) % 3,
      b = (axis + 2) % 3;
    [v[a], v[b]] = [-v[b], v[a]];
  }
  return v;
};
const signature = (stickers) =>
  stickers
    .map((s) => faceOf(s.normal) + "=" + s.colour)
    .sort()
    .join("|");
const entries = {},
  decode = {};
const primitive = Object.keys(faces)
  .flatMap((f) => [f, "2" + f])
  .map((m) => {
    const f = m.at(-1),
      axis = faces[f].n.findIndex((v) => v),
      side = faces[f].n[axis],
      t = kpuzzle.algToTransformation(m);
    return { axis, side, layer: m.startsWith("2") ? 1 : 3, q: -side, t };
  });
for (const orbit of kpuzzle.definition.orbits) {
  const o = orbit.orbitName;
  entries[o] = new Map();
  decode[o] = new Map();
  for (let origin = 0; origin < orbit.numPieces; origin++) {
    const position = coordinates[o][origin];
    const stickers = position.flatMap((v, axis) =>
      Math.abs(v) === 3
        ? [
            {
              normal: [0, 0, 0].map((_, i) => (i === axis ? Math.sign(v) : 0)),
              colour: faceOf([0, 0, 0].map((_, i) => (i === axis ? Math.sign(v) : 0))),
            },
          ]
        : [],
    );
    const queue = [{ target: origin, orientation: 0, stickers }],
      seen = new Set([origin + ",0"]);
    for (let head = 0; head < queue.length; head++) {
      const s = queue[head],
        key = [origin, s.target, s.orientation].join(",");
      entries[o].set(key, s.stickers);
      const decKey = s.target + ":" + signature(s.stickers);
      const piece =
        o === "CENTERS" ? kpuzzle.defaultPattern().patternData.CENTERS.pieces[origin] : origin;
      const existing = decode[o].get(decKey);
      if (existing && existing.piece !== piece) throw Error("Ambiguous sticker decoding " + o);
      decode[o].set(decKey, { piece, orientation: s.orientation });
      for (const m of primitive) {
        const p = coordinates[o][s.target];
        const selected = p[m.axis] === m.side * m.layer;
        const data = m.t.transformationData[o],
          target = data.permutation.indexOf(s.target),
          orientation = (s.orientation + data.orientationDelta[target]) % orbit.numOrientations;
        const k = target + "," + orientation;
        if (seen.has(k)) continue;
        const stickers = selected
          ? s.stickers.map((st) => ({ ...st, normal: rotation(st.normal, m.axis, m.q) }))
          : s.stickers;
        seen.add(k);
        queue.push({ target, orientation, stickers });
      }
    }
  }
}
const positionKey = (p) => p.join(",");
const stickerSlots = new Map();
for (const [f, frame] of Object.entries(faces))
  for (let i = 0; i < 16; i++) {
    const row = Math.floor(i / 4),
      col = i % 4;
    const p = frame.n.map(
      (v, j) => 3 * v + (-3 + 2 * col) * frame.r[j] + (-3 + 2 * row) * frame.d[j],
    );
    const key = positionKey(p);
    if (!stickerSlots.has(key)) stickerSlots.set(key, []);
    stickerSlots.get(key).push({ face: f, index: i, normal: frame.n });
  }
export function faceletsFromPattern(pattern) {
  const out = Object.fromEntries(Object.keys(faces).map((f) => [f, Array(16)]));
  for (const o of ["CENTERS", "EDGES", "CORNERS"])
    for (let target = 0; target < coordinates[o].length; target++) {
      const data = pattern.patternData[o],
        origin = data.pieces[target],
        orientation = data.orientation[target];
      const stickers = entries[o].get([origin, target, orientation].join(","));
      if (!stickers) throw Error("Impossible cubie orientation");
      for (const slot of stickerSlots.get(positionKey(coordinates[o][target]))) {
        out[slot.face][slot.index] = stickers.find((s) =>
          s.normal.every((v, i) => v === slot.normal[i]),
        ).colour;
      }
    }
  return out;
}
export function patternFromFacelets(facelets) {
  const colours = Object.keys(faces);
  for (const f of colours)
    if (
      !Array.isArray(facelets[f]) ||
      facelets[f].length !== 16 ||
      facelets[f].some((c) => !colours.includes(c))
    )
      throw Error("Colour every sticker on the 4×4.");
  for (const c of colours)
    if (colours.flatMap((f) => facelets[f]).filter((v) => v === c).length !== 16)
      throw Error("Each colour must appear exactly 16 times.");
  const data = {};
  for (const o of ["CENTERS", "EDGES", "CORNERS"]) {
    data[o] = { pieces: [], orientation: [] };
    for (let target = 0; target < coordinates[o].length; target++) {
      const stickers = stickerSlots
        .get(positionKey(coordinates[o][target]))
        .map((s) => ({ normal: s.normal, colour: facelets[s.face][s.index] }));
      const found = decode[o].get(target + ":" + signature(stickers));
      if (!found) throw Error("Invalid or mirrored " + o.toLowerCase() + " piece.");
      data[o].pieces.push(found.piece);
      data[o].orientation.push(found.orientation);
    }
    if (o !== "CENTERS" && new Set(data[o].pieces).size !== coordinates[o].length)
      throw Error("Duplicate or missing " + o.toLowerCase() + " pieces.");
  }
  if (data.CORNERS.orientation.reduce((a, b) => a + b, 0) % 3)
    throw Error("A corner is twisted: this state cannot be solved with legal turns.");
  return new KPattern(kpuzzle, data);
}
export function solveFaceletInput(facelets) {
  const original = patternFromFacelets(facelets);
  if (isColourSolved(original)) return { moves: "", stages: [] };
  // White-first frame: rotate U to D, and relabel the reference colour scheme.
  const rotated = faceletsFromPattern(original.applyAlg("x2"));
  const relabel = { U: "D", D: "U", F: "B", B: "F", R: "R", L: "L" };
  const rebased = Object.fromEntries(
    Object.entries(rotated).map(([f, cells]) => [f, cells.map((c) => relabel[c])]),
  );
  const result = solvePattern(patternFromFacelets(rebased));
  const moves = "x2 " + result.moves + " x2";
  if (!isColourSolved(original.applyAlg(moves))) throw Error("Original colour input replay failed");
  const stages = result.stages.map((s) => ({ ...s }));
  stages[0].moves = "x2 " + stages[0].moves;
  stages.at(-1).moves += " x2";
  return { moves, stages };
}
