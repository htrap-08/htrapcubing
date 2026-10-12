import CubeExport from "@/vendor/cubejs/index.js";
import { graphSnapshots, SOLVED_GRAPH_STATE } from "./cube-graph-model.js";
type CubeInstance = {
  cp: number[];
  co: number[];
  ep: number[];
  eo: number[];
  asString(): string;
  move(s: string): CubeInstance;
  solve(): string;
  isSolved(): boolean;
};
const Cube = CubeExport as {
  new (): CubeInstance;
  fromString(s: string): CubeInstance;
  initSolver(): void;
};
const parity = (p: number[]) =>
  p.reduce((v, a, i) => v + p.slice(i + 1).filter((b) => b < a).length, 0) % 2;
let ready = false;
self.onmessage = (
  event: MessageEvent<{ input?: string; scramble?: string; solution?: string }>,
) => {
  try {
    let cube: CubeInstance;
    if (event.data.input) {
      const s = event.data.input;
      if (
        !/^[URFDLB]{54}$/.test(s) ||
        "URFDLB"
          .split("")
          .some((f, i) => s[i * 9 + 4] !== f || [...s].filter((c) => c === f).length !== 9)
      )
        throw Error("Check the colours: each face colour must occur nine times.");
      cube = Cube.fromString(s);
      if (
        cube.asString() !== s ||
        new Set(cube.cp).size !== 8 ||
        new Set(cube.ep).size !== 12 ||
        cube.co.reduce((a, b) => a + b, 0) % 3 ||
        cube.eo.reduce((a, b) => a + b, 0) % 2 ||
        parity(cube.cp) !== parity(cube.ep)
      )
        throw Error("That colour pattern is not a legal cube. Return to Solver to correct it.");
    } else {
      if (!event.data.scramble || !/^([URFDLB](2|'|2')?\s*)+$/.test(event.data.scramble))
        throw Error("Invalid scramble");
      cube = new Cube().move(event.data.scramble);
    }
    const input = cube.asString();
    let solution = event.data.solution;
    if (!solution || !Cube.fromString(input).move(solution).isSolved()) {
      if (!ready) {
        Cube.initSolver();
        ready = true;
      }
      solution = cube.isSolved() ? "" : cube.solve();
    }
    const moves = solution.trim().split(/\s+/).filter(Boolean);
    const states = graphSnapshots(input, moves);
    if (states.at(-1) !== SOLVED_GRAPH_STATE) throw Error("The solution could not be verified.");
    self.postMessage({ ok: true, input, solution, moves, states });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : "Could not prepare the animation.",
    });
  }
};
