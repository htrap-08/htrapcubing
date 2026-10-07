/** Square-1 rings use twelve 30-degree slots; corners occupy two slots. */
export type Square1State = { top: number[]; bottom: number[]; flipped: boolean };
export type Square1Move = { top: number; bottom: number } | { slice: true };
export const solvedSquare1 = (): Square1State => ({
  top: [0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7],
  bottom: [8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15],
  flipped: false,
});
const rotate = (ring: number[], amount: number) =>
  ring.map((_, i) => ring[(((i - amount) % 12) + 12) % 12]!);
export const canSliceSquare1 = (s: Square1State) =>
  [s.top, s.bottom].every((r) => r[11] !== r[0] && r[5] !== r[6]);
export function applySquare1Move(state: Square1State, move: Square1Move): Square1State {
  if ("slice" in move) {
    if (!canSliceSquare1(state))
      throw new Error(
        "Slice blocked by a corner. Align both layers before / (never force the puzzle).",
      );
    return {
      top: [...state.top.slice(0, 6), ...state.bottom.slice(0, 6)],
      bottom: [...state.top.slice(6), ...state.bottom.slice(6)],
      flipped: !state.flipped,
    };
  }
  return { ...state, top: rotate(state.top, move.top), bottom: rotate(state.bottom, move.bottom) };
}
export function parseSquare1(text: string): Square1Move[] {
  const source = text.trim();
  if (source.length > 4000) throw new Error("Please use a sequence shorter than 4000 characters.");
  const moves: Square1Move[] = [];
  const token = /\s*(?:\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)|(\/))/y;
  let i = 0;
  while (i < source.length) {
    token.lastIndex = i;
    const m = token.exec(source);
    if (!m) throw new Error(`Invalid notation near “${source.slice(i, i + 15)}”. Use (a,b) and /.`);
    if (m[3]) moves.push({ slice: true });
    else {
      const top = Number(m[1]),
        bottom = Number(m[2]);
      if (Math.abs(top) > 6 || Math.abs(bottom) > 6)
        throw new Error("Layer turns must be between -6 and 6 (units of 30°).");
      moves.push({ top, bottom });
    }
    i = token.lastIndex;
  }
  return moves;
}
export const formatSquare1 = (moves: Square1Move[]) =>
  moves.map((m) => ("slice" in m ? "/" : `(${m.top},${m.bottom})`)).join(" ");
export function square1StateAfter(text: string, initial = solvedSquare1()) {
  return parseSquare1(text).reduce(applySquare1Move, initial);
}
export function solveSquare1Scramble(text: string) {
  const moves = parseSquare1(text);
  const state = moves.reduce(applySquare1Move, solvedSquare1());
  const inverse = [...moves]
    .reverse()
    .map((m) => ("slice" in m ? m : { top: -m.top, bottom: -m.bottom }));
  const solved = inverse.reduce(applySquare1Move, state);
  if (JSON.stringify(solved) !== JSON.stringify(solvedSquare1()))
    throw new Error("Solution verification failed.");
  return formatSquare1(inverse);
}
/** Legal random-move practice scramble; does not claim WCA random-state distribution. */
export function square1Scramble(length = 15): string {
  let state = solvedSquare1();
  const moves: Square1Move[] = [];
  for (let i = 0; i < length; i++) {
    const candidates: Square1Move[] = [];
    for (let top = -5; top <= 6; top++)
      for (let bottom = -5; bottom <= 6; bottom++) {
        if ((top || bottom) && canSliceSquare1(applySquare1Move(state, { top, bottom })))
          candidates.push({ top, bottom });
      }
    const move = candidates[Math.floor(Math.random() * candidates.length)]!;
    state = applySquare1Move(state, move);
    moves.push(move);
    state = applySquare1Move(state, { slice: true });
    moves.push({ slice: true });
  }
  return formatSquare1(moves);
}

export const square1PieceNames = [
  "White–orange–green corner",
  "White–green edge",
  "White–green–red corner",
  "White–red edge",
  "White–red–blue corner",
  "White–blue edge",
  "White–blue–orange corner",
  "White–orange edge",
  "Yellow–orange edge",
  "Yellow–orange–green corner",
  "Yellow–green edge",
  "Yellow–green–red corner",
  "Yellow–red edge",
  "Yellow–red–blue corner",
  "Yellow–blue edge",
  "Yellow–blue–orange corner",
];
export const square1PieceWidth = (id: number) => ((id < 8 ? id % 2 === 0 : id % 2 === 1) ? 2 : 1);
export function square1StateFromPieces(
  top: number[],
  bottom: number[],
  flipped: boolean,
): Square1State {
  if (
    top.length + bottom.length !== 16 ||
    new Set([...top, ...bottom]).size !== 16 ||
    [...top, ...bottom].some((n) => !Number.isInteger(n) || n < 0 || n > 15)
  )
    throw new Error("Use each of the 16 pieces exactly once.");
  const expand = (ring: number[]) =>
    ring.flatMap((id) => Array(square1PieceWidth(id)).fill(id) as number[]);
  const state = { top: expand(top), bottom: expand(bottom), flipped };
  validateSquare1State(state);
  return state;
}
export function validateSquare1State(state: Square1State) {
  const all = [...state.top, ...state.bottom];
  if (state.top.length !== 12 || state.bottom.length !== 12 || typeof state.flipped !== "boolean")
    throw new Error("Each layer must total twelve 30° slots. A corner uses two; an edge uses one.");
  if (all.some((id) => !Number.isInteger(id) || id < 0 || id > 15))
    throw new Error("Invalid piece.");
  for (let id = 0; id < 16; id++) {
    if (all.filter((n) => n === id).length !== square1PieceWidth(id))
      throw new Error("Use every piece exactly once, keeping corners intact.");
    if (
      square1PieceWidth(id) === 2 &&
      ![state.top, state.bottom].some((r) => r.some((n, i) => n === id && r[(i + 1) % 12] === id))
    )
      throw new Error("A corner cannot be split.");
  }
}
const pieceWedges = [
  [0, 1],
  [2],
  [3, 4],
  [5],
  [6, 7],
  [8],
  [9, 10],
  [11],
  [12],
  [13, 14],
  [15],
  [16, 17],
  [18],
  [19, 20],
  [21],
  [22, 23],
];
export function square1PatternData(state: Square1State) {
  validateSquare1State(state);
  const pieces = [state.top, state.bottom].flatMap((r) =>
    r.map((id, i) => pieceWedges[id]![r[(i + 11) % 12] === id ? 1 : 0]!),
  );
  return {
    WEDGES: { pieces, orientation: Array(24).fill(0) },
    EQUATOR: { pieces: [0, 1], orientation: [0, state.flipped ? 3 : 0] },
  };
}
