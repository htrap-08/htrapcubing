/** Sticker-position graph: 54 fixed vertices, with legal turns permuting coloured tokens. */
export const GRAPH_FACES = ["U", "R", "F", "D", "L", "B"];
export const SOLVED_GRAPH_STATE = GRAPH_FACES.map((f) => f.repeat(9)).join("");
const frames = {
  U: [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ],
  R: [
    [1, 0, 0],
    [0, 0, -1],
    [0, -1, 0],
  ],
  F: [
    [0, 0, 1],
    [1, 0, 0],
    [0, -1, 0],
  ],
  D: [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, -1],
  ],
  L: [
    [-1, 0, 0],
    [0, 0, 1],
    [0, -1, 0],
  ],
  B: [
    [0, 0, -1],
    [-1, 0, 0],
    [0, -1, 0],
  ],
};
const slots = GRAPH_FACES.flatMap((f) =>
  Array.from({ length: 9 }, (_, i) => {
    const [n, r, d] = frames[f];
    return { p: n.map((v, j) => v + ((i % 3) - 1) * r[j] + (Math.floor(i / 3) - 1) * d[j]), n };
  }),
);
const key = (p, n) => p.join(",") + "/" + n.join(",");
const lookup = new Map(slots.map((s, i) => [key(s.p, s.n), i]));
const rotation = (v, axis, q) => {
  v = [...v];
  for (let i = 0; i < ((q % 4) + 4) % 4; i++) {
    const a = (axis + 1) % 3,
      b = (axis + 2) % 3;
    [v[a], v[b]] = [-v[b], v[a]];
  }
  return v;
};
export function graphMovePermutation(move) {
  if (!/^[URFDLB](2|'|2')?$/.test(move)) throw Error("Unsupported graph move");
  const n = frames[move[0]][0],
    axis = n.findIndex((v) => v),
    side = n[axis];
  const amount = move.includes("2") ? 2 : move.endsWith("'") ? -1 : 1;
  const perm = Array.from({ length: 54 }, (_, i) => i);
  slots.forEach((s, i) => {
    if (s.p[axis] === side) {
      const destination = lookup.get(
        key(rotation(s.p, axis, -side * amount), rotation(s.n, axis, -side * amount)),
      );
      perm[destination] = i;
    }
  });
  return perm;
}
export function applyGraphMove(state, move) {
  if (!/^[URFDLB]{54}$/.test(state)) throw Error("Invalid graph state");
  return graphMovePermutation(move)
    .map((i) => state[i])
    .join("");
}
export function graphSnapshots(start, moves) {
  const states = [start];
  for (const m of moves) states.push(applyGraphMove(states.at(-1), m));
  return states;
}
// Independent circle-intersection embedding of the nine slice loops.
const scale = 240,
  offset = { x: 270, y: 260 };
const circleCentres = [
  [Math.sqrt(3) * 0.16, 0.16],
  [0, -0.32],
  [-Math.sqrt(3) * 0.16, 0.16],
];
const radius = (axis, slice) => 0.52 + (axis === 2 ? -1 : 1) * slice * 0.05;
function intersections(a, ra, b, rb) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    distance = Math.hypot(dx, dy);
  const along = (ra * ra - rb * rb + distance * distance) / (2 * distance),
    height = Math.sqrt(ra * ra - along * along);
  const x = a[0] + (along * dx) / distance,
    y = a[1] + (along * dy) / distance;
  return [
    { x: x - (height * dy) / distance, y: y + (height * dx) / distance },
    { x: x + (height * dy) / distance, y: y - (height * dx) / distance },
  ];
}
export const GRAPH_POINTS = slots.map((slot, i) => {
  const normal = slot.n.findIndex((v) => v),
    axes = [0, 1, 2].filter((a) => a !== normal);
  const points = intersections(
    circleCentres[axes[0]],
    radius(axes[0], slot.p[axes[0]]),
    circleCentres[axes[1]],
    radius(axes[1], slot.p[axes[1]]),
  );
  points.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  const outer = normal === 2 ? slot.n[normal] < 0 : slot.n[normal] > 0;
  const point = points[outer ? 1 : 0];
  return {
    x: offset.x + point.x * scale,
    y: offset.y + point.y * scale,
    face: GRAPH_FACES[Math.floor(i / 9)],
    index: i % 9,
  };
});
export const GRAPH_RINGS = [0, 1, 2].flatMap((axis) =>
  [-1, 0, 1].map((slice) => {
    const [x, y] = circleCentres[axis],
      cx = offset.x + x * scale,
      cy = offset.y + y * scale;
    const vertices = slots
      .flatMap((s, i) => (s.n[axis] === 0 && s.p[axis] === slice ? [i] : []))
      .sort(
        (a, b) =>
          Math.atan2(GRAPH_POINTS[a].y - cy, GRAPH_POINTS[a].x - cx) -
          Math.atan2(GRAPH_POINTS[b].y - cy, GRAPH_POINTS[b].x - cx),
      );
    return { axis, slice, cx, cy, r: radius(axis, slice) * scale, vertices };
  }),
);
export const GRAPH_EDGES = GRAPH_RINGS.flatMap((r) =>
  r.vertices.map((from, i) => ({ from, to: r.vertices[(i + 1) % 12] })),
);
export const GRAPH_SLOTS = slots;
export const GRAPH_COLOURS = {
  U: "#faf9f4",
  R: "#d74b35",
  F: "#2c654d",
  D: "#f7bd4a",
  L: "#e68639",
  B: "#21477d",
};
export function graphCurve(from, to) {
  const a = GRAPH_POINTS[Math.min(from, to)],
    b = GRAPH_POINTS[Math.max(from, to)];
  return { x: (a.x + b.x) / 2 - (b.y - a.y) * 0.2, y: (a.y + b.y) / 2 + (b.x - a.x) * 0.2 };
}
export function easedTurnProgress(progress, half = false) {
  const f = Math.max(0, Math.min(1, progress));
  if (!half) return (1 - Math.cos(Math.PI * f)) / 2;
  const phase = f < 0.5 ? 0 : 1,
    t = (1 - Math.cos(Math.PI * (phase ? 2 * f - 1 : 2 * f))) / 2;
  return (phase + t) / 2;
}
export function graphPositionDuringMove(source, move, progress) {
  const start = GRAPH_POINTS[source];
  if (!move) return start;
  const half = move.includes("2"),
    fraction = Math.max(0, Math.min(1, progress)),
    phase = half && fraction >= 0.5 ? 1 : 0;
  const quarter = move[0] + (move.endsWith("'") ? "'" : "");
  const p = graphMovePermutation(quarter),
    forward = [];
  p.forEach((s, d) => (forward[s] = d));
  const from = phase ? forward[source] : source,
    to = forward[from],
    a = GRAPH_POINTS[from],
    b = GRAPH_POINTS[to];
  if (from === to) return a;
  const t =
    (1 - Math.cos(Math.PI * (half ? (phase ? 2 * fraction - 1 : 2 * fraction) : fraction))) / 2;
  const normal = frames[move[0]][0],
    axis = normal.findIndex((v) => v),
    slice = normal[axis];
  if (slots[from].n[axis] === 0) {
    const ring = GRAPH_RINGS.find((r) => r.axis === axis && r.slice === slice),
      i = ring.vertices.indexOf(from),
      j = ring.vertices.indexOf(to),
      shift = (j - i + 12) % 12;
    const direction = shift === 3 ? 1 : -1;
    let angle = Math.atan2(a.y - ring.cy, a.x - ring.cx),
      end = Math.atan2(b.y - ring.cy, b.x - ring.cx);
    if (direction > 0) while (end <= angle) end += Math.PI * 2;
    else while (end >= angle) end -= Math.PI * 2;
    angle += (end - angle) * t;
    return { x: ring.cx + ring.r * Math.cos(angle), y: ring.cy + ring.r * Math.sin(angle) };
  }
  const centre = GRAPH_POINTS[Math.floor(from / 9) * 9 + 4];
  const r0 = Math.hypot(a.x - centre.x, a.y - centre.y),
    r1 = Math.hypot(b.x - centre.x, b.y - centre.y);
  const angle = Math.atan2(a.y - centre.y, a.x - centre.x),
    end = Math.atan2(b.y - centre.y, b.x - centre.x);
  const delta = ((end - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
    r = r0 + (r1 - r0) * t;
  return {
    x: centre.x + r * Math.cos(angle + delta * t),
    y: centre.y + r * Math.sin(angle + delta * t),
  };
}
