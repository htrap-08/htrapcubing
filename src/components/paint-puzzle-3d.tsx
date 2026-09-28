import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from "three";
import type { PaintPuzzle } from "@/lib/side-puzzle-state";

function polygon(coords: number[], inset: number, lift: number) {
  const vertices = Array.from({ length: coords.length / 3 }, (_, i) =>
    coords.slice(i * 3, i * 3 + 3),
  );
  const centre = [0, 1, 2].map(
    (axis) => vertices.reduce((sum, v) => sum + v[axis]!, 0) / vertices.length,
  );
  const points = vertices.map((v) =>
    v.map((x, axis) => (centre[axis]! + (x - centre[axis]!) * inset) * lift),
  );
  const triangles: number[] = [];
  for (let i = 1; i < points.length - 1; i++)
    triangles.push(...points[0]!, ...points[i]!, ...points[i + 1]!);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(triangles, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function PaintPuzzle3D({
  data,
  colours,
  onPaint,
}: {
  data: PaintPuzzle;
  colours: number[];
  onPaint: (i: number) => void;
}) {
  const geometries = useMemo(
    () =>
      data.stickers.map((s) => ({
        base: polygon(s.coords, 1, 1),
        sticker: polygon(s.coords, 0.92, 1.002),
      })),
    [data],
  );
  useEffect(
    () => () => {
      for (const g of geometries) {
        g.base.dispose();
        g.sticker.dispose();
      }
    },
    [geometries],
  );
  return (
    <div className="h-[340px] w-full touch-none" aria-label={`Paintable ${data.id} model`}>
      <Canvas camera={{ position: [4.5, 3.5, 6], fov: 38 }} dpr={[1, 2]}>
        {geometries.map((g, i) => (
          <group key={i}>
            <mesh geometry={g.base} onClick={(e) => e.stopPropagation()}>
              <meshBasicMaterial color="#1c1a17" side={DoubleSide} />
            </mesh>
            <mesh
              geometry={g.sticker}
              onClick={(e) => {
                e.stopPropagation();
                if (e.delta < 5) onPaint(i);
              }}
            >
              <meshBasicMaterial
                color={data.colours[colours[i]!]?.colour ?? "#9a958c"}
                side={DoubleSide}
              />
            </mesh>
          </group>
        ))}
        <OrbitControls enablePan={false} minDistance={4} maxDistance={12} rotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
