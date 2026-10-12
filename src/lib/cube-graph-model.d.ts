export const GRAPH_FACES: string[];
export const SOLVED_GRAPH_STATE: string;
export const GRAPH_POINTS: { x: number; y: number; face: string; index: number }[];
export const GRAPH_EDGES: { from: number; to: number }[];
export function graphCurve(from: number, to: number): { x: number; y: number };
export function graphMovePermutation(move: string): number[];
export function applyGraphMove(state: string, move: string): string;
export function graphSnapshots(start: string, moves: string[]): string[];
export const GRAPH_RINGS: {
  axis: number;
  slice: number;
  cx: number;
  cy: number;
  r: number;
  vertices: number[];
}[];
export const GRAPH_SLOTS: { p: number[]; n: number[] }[];
export const GRAPH_COLOURS: Record<string, string>;
export function easedTurnProgress(progress: number, half?: boolean): number;
export function graphPositionDuringMove(
  source: number,
  move: string | undefined,
  progress: number,
): { x: number; y: number };
