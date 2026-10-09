/**
 * Facelet colour state for 2×2 / 3×3 and the automatic solver.
 * Facelet order follows the standard URFDLB layout: each face is read row by
 * row as seen from outside, U with B at the top, D with F at the top, and the
 * four sides with U at the top.
 */
import type { StickerKey } from "@/lib/algorithms";

export const FACES = ["U", "R", "F", "D", "L", "B"] as const;
export type Face = (typeof FACES)[number];
export type Facelets = Record<Face, StickerKey[]>;

/**
 * Fixed colour scheme used by the colour-entry cube.
 * With white on top and yellow underneath, the side centres run
 * green → red → blue → orange around F → R → B → L.
 */
const defaultColor: Record<Face, StickerKey> = {
  U: "u",
  R: "r",
  F: "l",
  D: "d",
  L: "f",
  B: "b",
};
const opposite: Record<string, StickerKey> = { u: "d", d: "u", f: "b", b: "f", l: "r", r: "l" };

export const solvedFacelets = (n: number): Facelets =>
  Object.fromEntries(FACES.map((f) => [f, Array(n * n).fill(defaultColor[f])])) as Facelets;

export const blankFacelets = (n: number): Facelets =>
  Object.fromEntries(
    FACES.map((f) => {
      const cells = Array<StickerKey>(n * n).fill("x");
      if (n % 2 === 1) cells[(n * n - 1) / 2] = defaultColor[f];
      return [f, cells];
    }),
  ) as Facelets;

/** Expand a 2×2 into 3×3 facelets, picking centres so the back-down-left corner is home. */
function expand2x2(s: Facelets): Facelets {
  const d = s.D[2]!,
    l = s.L[2]!,
    b = s.B[3]!;
  const centre: Record<Face, StickerKey> = {
    D: d,
    L: l,
    B: b,
    U: opposite[d]!,
    R: opposite[l]!,
    F: opposite[b]!,
  };
  const out = {} as Facelets;
  for (const f of FACES) {
    const c = s[f];
    const x = centre[f];
    out[f] = [c[0]!, x, c[1]!, x, x, x, c[2]!, x, c[3]!];
  }
  return out;
}

export function invertAlg(alg: string): string {
  return alg
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reverse()
    .map((m) => (m.endsWith("2") ? m : m.endsWith("'") ? m.slice(0, -1) : `${m}'`))
    .join(" ");
}

type CubeInstance = {
  asString(): string;
  cp: number[];
  co: number[];
  ep: number[];
  eo: number[];
  solve(): string;
  isSolved(): boolean;
};
type CubeStatic = {
  fromString(s: string): CubeInstance;
  initSolver(): void;
};

let solverReady: Promise<CubeStatic> | null = null;

/** Loads and warms the solver (a few seconds the first time). Browser only. */
export function loadSolver(): Promise<CubeStatic> {
  solverReady ??= import("@/vendor/cubejs/index.js").then(async (mod) => {
    const Cube = ((mod as { default?: unknown }).default ?? mod) as CubeStatic;
    // Give the browser a frame to paint the "preparing" state first.
    await new Promise((r) => setTimeout(r, 50));
    Cube.initSolver();
    return Cube;
  });
  return solverReady;
}

const parity = (p: number[]) => {
  let swaps = 0;
  const seen = new Array(p.length).fill(false);
  for (let i = 0; i < p.length; i++) {
    if (seen[i]) continue;
    let j = i,
      len = 0;
    while (!seen[j]) {
      seen[j] = true;
      j = p[j]!;
      len++;
    }
    swaps += len - 1;
  }
  return swaps % 2;
};

export type SolutionStage = { name: string; moves: string };
export type SolveResult =
  { ok: true; solution: string; stages?: SolutionStage[] } | { ok: false; error: string };

export async function solveFacelets(n: 2 | 3, state: Facelets): Promise<SolveResult> {
  const all = FACES.flatMap((f) => state[f]);
  if (all.includes("x"))
    return { ok: false, error: "Some stickers are still blank — colour every sticker first." };
  for (const key of ["u", "d", "f", "b", "l", "r"] as StickerKey[]) {
    const count = all.filter((c) => c === key).length;
    if (count !== n * n)
      return {
        ok: false,
        error: `Each colour should appear exactly ${n * n} times — one colour appears ${count} times.`,
      };
  }

  const full = n === 2 ? expand2x2(state) : state;
  const letterOf = new Map<StickerKey, Face>();
  for (const f of FACES) letterOf.set(full[f][4]!, f);
  if (letterOf.size !== 6)
    return { ok: false, error: "The centre stickers must all be different colours." };
  if (n === 2 && new Set(FACES.map((f) => full[f][4])).size !== 6)
    return {
      ok: false,
      error: "That corner combination isn't possible — double-check your colours.",
    };

  const str = FACES.map((f) => full[f].map((c) => letterOf.get(c)).join("")).join("");

  return solveCubeString(str);
}

/** Solve a standard 54-facelet URFDLB string using the existing Kociemba engine. */
export async function solveCubeString(str: string): Promise<SolveResult> {
  if (
    !/^[URFDLB]{54}$/.test(str) ||
    FACES.some(
      (face, i) =>
        str[i * 9 + 4] !== face || [...str].filter((value) => value === face).length !== 9,
    )
  )
    return {
      ok: false,
      error: "Check all six faces: each colour must occur nine times with six different centres.",
    };
  const Cube = await loadSolver();
  let cube: CubeInstance;
  try {
    cube = Cube.fromString(str);
  } catch {
    return { ok: false, error: "That colour pattern isn't a real cube — check for mistakes." };
  }
  const valid =
    cube.asString() === str &&
    new Set(cube.cp).size === 8 &&
    new Set(cube.ep).size === 12 &&
    cube.co.reduce((a, b) => a + b, 0) % 3 === 0 &&
    cube.eo.reduce((a, b) => a + b, 0) % 2 === 0 &&
    parity(cube.cp) === parity(cube.ep);
  if (!valid)
    return {
      ok: false,
      error:
        "That colour pattern can't happen on a real cube — a piece may be twisted or two stickers swapped.",
    };
  if (cube.isSolved()) return { ok: true, solution: "" };
  return { ok: true, solution: cube.solve().trim() };
}
