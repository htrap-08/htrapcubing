import { Sticker } from "@/components/sticker";
import type { StickerKey } from "@/lib/algorithms";
import { faceNames, type FaceKey } from "@/lib/puzzles";

export type NetState = Record<FaceKey, StickerKey[]>;

const faceDefault: Record<FaceKey, StickerKey> = {
  U: "u",
  D: "d",
  F: "f",
  B: "b",
  L: "l",
  R: "r",
};

export const solvedNet = (n: number): NetState => ({
  U: Array<StickerKey>(n * n).fill(faceDefault.U),
  D: Array<StickerKey>(n * n).fill(faceDefault.D),
  F: Array<StickerKey>(n * n).fill(faceDefault.F),
  B: Array<StickerKey>(n * n).fill(faceDefault.B),
  L: Array<StickerKey>(n * n).fill(faceDefault.L),
  R: Array<StickerKey>(n * n).fill(faceDefault.R),
});

function Face({
  face,
  cells,
  n,
  cell,
  onPaint,
}: {
  face: FaceKey;
  cells: StickerKey[];
  n: number;
  cell: number;
  onPaint?: ((face: FaceKey, index: number) => void) | undefined;
}) {
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {cells.map((value, i) => (
        <Sticker
          key={i}
          value={value}
          title={`${faceNames[face]} ${i + 1}`}
          style={{ width: cell, height: cell }}
          onClick={onPaint ? () => onPaint(face, i) : undefined}
        />
      ))}
    </div>
  );
}

/** Unfolded cube net: U on top, L F R B in a row, D beneath. */
export function CubeNet({
  n,
  state,
  onPaint,
}: {
  n: number;
  state: NetState;
  onPaint?: ((face: FaceKey, index: number) => void) | undefined;
}) {
  const cell = Math.max(9, Math.round(132 / n));
  const spacer = cell * n + 2 * (n - 1);

  return (
    <div className="flex flex-col items-center gap-2 overflow-x-auto">
      <div className="flex gap-2">
        <div style={{ width: spacer }} />
        <Face face="U" cells={state.U} n={n} cell={cell} onPaint={onPaint} />
      </div>
      <div className="flex gap-2">
        <Face face="L" cells={state.L} n={n} cell={cell} onPaint={onPaint} />
        <Face face="F" cells={state.F} n={n} cell={cell} onPaint={onPaint} />
        <Face face="R" cells={state.R} n={n} cell={cell} onPaint={onPaint} />
        <Face face="B" cells={state.B} n={n} cell={cell} onPaint={onPaint} />
      </div>
      <div className="flex gap-2">
        <div style={{ width: spacer }} />
        <Face face="D" cells={state.D} n={n} cell={cell} onPaint={onPaint} />
      </div>
    </div>
  );
}
