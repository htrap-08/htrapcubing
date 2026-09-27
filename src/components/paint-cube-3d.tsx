import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { StickerKey } from "@/lib/algorithms";
import { FACES, type Face, type Facelets } from "@/lib/cube-state";

type V = [number, number, number];
/** Outward normal, and "right"/"down" directions as seen looking at each face. */
const frame: Record<Face, { n: V; r: V; d: V }> = {
  U: { n: [0, 1, 0], r: [1, 0, 0], d: [0, 0, 1] },
  D: { n: [0, -1, 0], r: [1, 0, 0], d: [0, 0, -1] },
  F: { n: [0, 0, 1], r: [1, 0, 0], d: [0, -1, 0] },
  B: { n: [0, 0, -1], r: [-1, 0, 0], d: [0, -1, 0] },
  R: { n: [1, 0, 0], r: [0, 0, -1], d: [0, -1, 0] },
  L: { n: [-1, 0, 0], r: [0, 0, 1], d: [0, -1, 0] },
};

const KEYS: StickerKey[] = ["u", "d", "f", "b", "l", "r", "x", "p"];

/** Resolve the theme's sticker colours (oklch) into sRGB for the 3D renderer. */
function useStickerColors() {
  const [colors, setColors] = useState<Record<string, string>>({});
  useEffect(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    const style = getComputedStyle(document.documentElement);
    const out: Record<string, string> = {};
    for (const k of KEYS) {
      const raw = style.getPropertyValue(`--sticker-${k}`).trim();
      if (!ctx || !raw) continue;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = raw;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      out[k] = `rgb(${r},${g},${b})`;
    }
    out["x"] = "#6b665e";
    setColors(out);
  }, []);
  return colors;
}

function Stickers({
  n,
  state,
  colors,
  onPaint,
}: {
  n: number;
  state: Facelets;
  colors: Record<string, string>;
  onPaint: (face: Face, index: number) => void;
}) {
  const items = useMemo(() => {
    const list: { face: Face; i: number; pos: V; quat: THREE.Quaternion }[] = [];
    const half = n / 2;
    for (const face of FACES) {
      const { n: nv, r, d } = frame[face];
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(...nv),
      );
      for (let i = 0; i < n * n; i++) {
        const row = Math.floor(i / n), col = i % n;
        const a = col - (n - 1) / 2, b = row - (n - 1) / 2;
        list.push({
          face,
          i,
          quat,
          pos: [0, 1, 2].map((k) => nv[k]! * (half + 0.005) + r[k]! * a + d[k]! * b) as V,
        });
      }
    }
    return list;
  }, [n]);

  return (
    <>
      {items.map(({ face, i, pos, quat }) => (
        <mesh
          key={`${face}${i}`}
          position={pos}
          quaternion={quat}
          onClick={(e) => {
            e.stopPropagation();
            onPaint(face, i);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <planeGeometry args={[0.86, 0.86]} />
          <meshStandardMaterial color={colors[state[face][i]!] ?? "#888"} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

/** A 3D cube whose stickers you click to colour. */
export function PaintCube3D({
  n,
  state,
  onPaint,
}: {
  n: number;
  state: Facelets;
  onPaint: (face: Face, index: number) => void;
}) {
  const colors = useStickerColors();
  const dist = n * 2.4;
  return (
    <div className="h-[340px] w-full touch-none">
      <Canvas camera={{ position: [dist * 0.7, dist * 0.6, dist * 0.8], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} />
        <directionalLight position={[-6, -4, -5]} intensity={0.6} />
        <RoundedBox args={[n, n, n]} radius={0.12} smoothness={3}>
          <meshStandardMaterial color="#1c1a17" roughness={0.6} />
        </RoundedBox>
        <Stickers n={n} state={state} colors={colors} onPaint={onPaint} />
        <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
