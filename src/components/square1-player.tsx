import { createElement, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ExtrudeGeometry, Shape } from "three";
import { applySquare1Move, parseSquare1, solvedSquare1, type Square1State } from "@/lib/square1";

const colours = ["#fafafa", "#f1cb1c", "#df5729", "#27a865", "#d72e36", "#2878d0"];
function geometry(id: number) {
  const corner = id < 8 ? id % 2 === 0 : id % 2 === 1;
  const half = ((corner ? 30 : 15) * Math.PI) / 180;
  const shape = new Shape();
  shape.moveTo(0, 0);
  for (const a of [-half, 0, half]) {
    const radius = corner ? (a === 0 ? Math.SQRT2 : 1 / Math.cos(Math.PI / 12)) : 1 / Math.cos(a);
    shape.lineTo(radius * Math.cos(a), radius * Math.sin(a));
  }
  shape.closePath();
  const g = new ExtrudeGeometry(shape, { depth: 0.62, bevelEnabled: false });
  // Colour outer walls by their solved world face, including two-colour corners.
  const initialAngle =
    ((id < 8 ? 45 + Math.floor(id / 2) * 90 - (id % 2 ? -45 : 0) : (id - 8) * 45) * Math.PI) / 180;
  const normal = g.getAttribute("normal");
  g.clearGroups();
  for (let i = 0; i < normal.count; i += 3) {
    let material = normal.getZ(i) > 0 ? 0 : 6;
    if (Math.abs(normal.getZ(i)) < 0.5) {
      const x = normal.getX(i),
        y = normal.getY(i);
      material =
        x < 0.6
          ? 5
          : 1 + (((Math.round((initialAngle - Math.atan2(y, x)) / (Math.PI / 2)) % 4) + 4) % 4);
    }
    g.addGroup(i, 3, material);
  }
  return g;
}
function Pieces({ state }: { state: Square1State }) {
  const geometries = useMemo(() => Array.from({ length: 16 }, (_, id) => geometry(id)), []);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  const pieces = [state.top, state.bottom].flatMap((ring, layer) =>
    ring.flatMap((id, i) => {
      if (ring[(i + 11) % 12] === id) return [];
      const width = ring[(i + 1) % 12] === id ? 2 : 1;
      const angle = (((layer === 0 ? 15 : -15) + (i + width / 2) * 30) * Math.PI) / 180;
      return [{ id, layer, angle }];
    }),
  );
  // Create Three.js intrinsics directly: the dev inspector's DOM attributes
  // cannot be applied to Three objects.
  return createElement(
    "group",
    null,
    ...pieces.map(({ id, layer, angle }) =>
      createElement(
        "group",
        {
          key: id,
          position: [0, layer === 0 ? 0.28 : -0.94, 0],
          rotation: [0, -angle, 0],
        },
        createElement(
          "mesh",
          { geometry: geometries[id]!, rotation: [-Math.PI / 2, 0, 0], scale: [0.985, 0.985, 1] },
          createElement("meshStandardMaterial", {
            attach: "material-0",
            color: layer === 0 ? colours[id < 8 ? 0 : 1]! : "#221f19",
            roughness: 0.65,
          }),
          createElement("meshStandardMaterial", {
            attach: "material-6",
            color: layer === 1 ? colours[id < 8 ? 0 : 1]! : "#221f19",
            roughness: 0.65,
          }),
          ...["#df5729", "#27a865", "#d72e36", "#2878d0", "#221f19"].map((colour, index) =>
            createElement("meshStandardMaterial", {
              key: index,
              attach: `material-${index + 1}`,
              color: colour,
              roughness: 0.65,
            }),
          ),
        ),
      ),
    ),
    createElement(
      "mesh",
      { position: [-0.5, 0, 0] },
      createElement("boxGeometry", { args: [0.98, 0.42, 1.98] }),
      ...["#df5729", "#d72e36", "#221f19", "#221f19", "#27a865", "#2878d0"].map((colour, i) =>
        createElement("meshStandardMaterial", { key: i, attach: `material-${i}`, color: colour }),
      ),
    ),
    createElement(
      "mesh",
      { position: [0.5, 0, 0], rotation: [state.flipped ? Math.PI : 0, 0, 0] },
      createElement("boxGeometry", { args: [0.98, 0.42, 1.98] }),
      ...["#df5729", "#d72e36", "#221f19", "#221f19", "#27a865", "#2878d0"].map((colour, i) =>
        createElement("meshStandardMaterial", { key: i, attach: `material-${i}`, color: colour }),
      ),
    ),
  );
}
export function Square1Player({
  setup = "",
  alg = "",
  playback = false,
}: {
  setup?: string;
  alg?: string;
  playback?: boolean;
}) {
  const [history, setHistory] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const moves = useMemo(() => parseSquare1(alg), [alg]);
  useEffect(() => {
    setHistory("");
    setIndex(0);
    setPlaying(false);
    setError("");
  }, [setup, alg]);
  const state = useMemo(() => {
    const start = parseSquare1(setup).reduce(applySquare1Move, solvedSquare1());
    return (playback ? moves.slice(0, index) : parseSquare1(history)).reduce(
      applySquare1Move,
      start,
    );
  }, [setup, playback, moves, index, history]);
  useEffect(() => {
    if (!playing) return;
    if (index >= moves.length) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setIndex((i) => i + 1), 650);
    return () => window.clearTimeout(id);
  }, [playing, index, moves.length]);
  const add = (move: string) => {
    try {
      parseSquare1(move).reduce(applySquare1Move, state);
      setHistory((h) => `${h} ${move}`);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Move blocked.");
    }
  };
  return (
    <div className="mt-3">
      <div className="h-[340px] w-full" aria-label="Interactive 3D Square-1 model">
        <Canvas camera={{ position: [4, 3, 4], fov: 40 }}>
          {createElement("ambientLight", { intensity: 1.5 })}
          {createElement("directionalLight", { position: [3, 5, 4], intensity: 2 })}
          <Pieces state={state} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} />
        </Canvas>
      </div>
      <div className="square1-playbar mt-3 flex flex-wrap items-center justify-center gap-2">
        {playback ? (
          <>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setIndex(0);
              }}
            >
              Restart
            </button>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => Math.max(0, i - 1));
              }}
            >
              Back
            </button>
            <button type="button" onClick={() => setPlaying((p) => !p)} disabled={!moves.length}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              disabled={index === moves.length}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => Math.min(moves.length, i + 1));
              }}
            >
              Next
            </button>
            <span className="text-xs text-muted">
              {index} / {moves.length}
            </span>
          </>
        ) : (
          <>
            {["(1,0)", "(-1,0)", "(0,1)", "(0,-1)", "(3,0)", "(0,3)", "/"].map((m) => (
              <button
                type="button"
                key={m}
                className="rounded border border-line px-2 py-1 font-mono text-xs"
                onClick={() => add(m)}
              >
                {m}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setHistory("");
                setError("");
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
