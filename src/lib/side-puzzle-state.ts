import { KPattern, type KPuzzle } from "cubing/kpuzzle";
import { puzzles } from "cubing/puzzles";

export type SidePuzzle = "pyraminx" | "skewb" | "megaminx";
export type PaintSticker = {
  coords: number[];
  orbit: string;
  ord: number;
  ori: number;
  face: number;
};
export type PaintPuzzle = {
  id: SidePuzzle;
  kpuzzle: KPuzzle;
  stickers: PaintSticker[];
  colours: { colour: string; name: string; count: number }[];
  home: Record<string, number[][]>;
};
const names: Record<string, string> = {
  "#44ee00": "Green",
  "#f4f400": "Yellow",
  "#ff0000": "Red",
  "#2266ff": "Blue",
  "#ff8000": "Orange",
  "#ffffff": "White",
  "#008800": "Dark green",
  "#8800dd": "Purple",
  "#0000ff": "Dark blue",
  "#e8d0a0": "Cream",
  "#3399ff": "Light blue",
  "#99ff00": "Lime",
  "#ff66cc": "Pink",
  "#888888": "Grey",
};

export async function loadPaintPuzzle(id: SidePuzzle): Promise<PaintPuzzle> {
  const loader = puzzles[id]!;
  const [kpuzzle, geometry] = await Promise.all([loader.kpuzzle(), loader.pg!()]);
  const all = geometry.get3d().stickers;
  const stickers = all
    .filter((s) => !s.isDup)
    .map(({ coords, orbit, ord, ori, face }) => ({ coords, orbit, ord, ori, face }));
  const home: Record<string, number[][]> = {};
  for (const orbit of kpuzzle.definition.orbits) {
    home[orbit.orbitName] = Array.from({ length: orbit.numPieces }, () =>
      Array<number>(orbit.numOrientations).fill(-1),
    );
  }
  for (const s of all) home[s.orbit]![s.ord]![s.ori] = s.face;
  const colours = Array.from(new Set(stickers.map((s) => s.face)))
    .sort((a, b) => a - b)
    .map((face) => {
      const colour = all.find((s) => s.face === face)!.color;
      return {
        colour,
        name: names[colour] ?? `Colour ${face + 1}`,
        count: stickers.filter((s) => s.face === face).length,
      };
    });
  return { id, kpuzzle, stickers, colours, home };
}

export function blankPaint(data: PaintPuzzle): number[] {
  return data.stickers.map((s) => (data.id === "megaminx" && s.orbit === "CENTERS" ? s.face : -1));
}

export function patternColours(data: PaintPuzzle, pattern: KPattern): number[] {
  return data.stickers.map((s) => {
    const orbit = pattern.patternData[s.orbit]!;
    const home = data.home[s.orbit]![orbit.pieces[s.ord]!]!;
    return home[(s.ori - orbit.orientation[s.ord]! + home.length) % home.length]!;
  });
}

/** Match coloured stickers to each physical piece and its cyclic orientation. */
export function patternFromColours(data: PaintPuzzle, colours: number[]): KPattern {
  if (
    colours.length !== data.stickers.length ||
    colours.some((c) => !Number.isInteger(c) || c < 0 || c >= data.colours.length)
  ) {
    throw new Error("Colour every sticker before solving.");
  }
  for (let face = 0; face < data.colours.length; face++) {
    if (colours.filter((c) => c === face).length !== data.colours[face]!.count) {
      throw new Error(
        `${data.colours[face]!.name} must appear ${data.colours[face]!.count} times. Check the colour counts.`,
      );
    }
  }
  // Some default orbits share identity arrays; clone each orbit independently.
  const patternData = Object.fromEntries(
    Object.entries(data.kpuzzle.defaultPattern().patternData).map(([name, orbit]) => [
      name,
      {
        ...orbit,
        pieces: [...orbit.pieces],
        orientation: [...orbit.orientation],
      },
    ]),
  );
  for (const definition of data.kpuzzle.definition.orbits) {
    const { orbitName, numPieces, numOrientations } = definition;
    const used = new Set<number>();
    for (let slot = 0; slot < numPieces; slot++) {
      const indices = data.stickers
        .map((s, i) => ({ ...s, i }))
        .filter((s) => s.orbit === orbitName && s.ord === slot);
      let matched = false;
      for (let piece = 0; piece < numPieces && !matched; piece++) {
        if (used.has(piece)) continue;
        for (let orientation = 0; orientation < numOrientations; orientation++) {
          if (
            indices.every(
              (s) =>
                colours[s.i] ===
                data.home[orbitName]![piece]![
                  (s.ori - orientation + numOrientations) % numOrientations
                ],
            )
          ) {
            patternData[orbitName]!.pieces[slot] = piece;
            patternData[orbitName]!.orientation[slot] = orientation;
            used.add(piece);
            matched = true;
            break;
          }
        }
      }
      if (!matched)
        throw new Error(
          "These colours form a missing, duplicated, or mirrored piece. Check the stickers and the reference orientation.",
        );
    }
  }
  if (
    data.id === "megaminx" &&
    patternData["CENTERS"]!.pieces.some((piece, slot) => piece !== slot)
  ) {
    throw new Error("Keep the Megaminx centres in the reference colour order.");
  }
  return new KPattern(data.kpuzzle, patternData);
}
