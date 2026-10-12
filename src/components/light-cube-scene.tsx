import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import * as THREE from "three";
import { GRAPH_SLOTS, GRAPH_COLOURS, easedTurnProgress } from "@/lib/cube-graph-model.js";
const positions = [-1, 0, 1].flatMap((x) =>
  [-1, 0, 1].flatMap((y) => [-1, 0, 1].flatMap((z) => (x || y || z ? [[x, y, z]] : []))),
);
const frame: Record<string, [number, number]> = {
  U: [1, 1],
  R: [0, 1],
  F: [2, 1],
  D: [1, -1],
  L: [0, -1],
  B: [2, -1],
};
export default function LightCubeScene({
  state,
  move,
  progress,
  finished,
  onReady,
}: {
  state: string;
  move: string | undefined;
  progress: number;
  finished: boolean;
  onReady: () => void;
}) {
  const stickers = useMemo(
    () =>
      GRAPH_SLOTS.map((s) => ({
        position: s.p.map((v, i) => v + s.n[i]! * 0.485) as [number, number, number],
        quaternion: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(...(s.n as [number, number, number])),
        ),
      })),
    [],
  );
  const [axis, side] = move ? frame[move[0]!]! : [0, 0];
  const amount = move?.includes("2") ? 2 : move?.endsWith("'") ? -1 : 1;
  const angle = ((-side * amount * Math.PI) / 2) * easedTurnProgress(progress, move?.includes("2"));
  const rotation: [number, number, number] = [0, 0, 0];
  rotation[axis] = angle;
  const selected = (p: number[]) => Boolean(move) && p[axis] === side;
  const layer = (turning: boolean) => (
    <group rotation={turning ? rotation : [0, 0, 0]}>
      {positions
        .filter((p) => selected(p) === turning)
        .map((p) => (
          <mesh key={p.join(",")} position={p as [number, number, number]}>
            <boxGeometry args={[0.965, 0.965, 0.965]} />
            <meshBasicMaterial color="#f9f8f4" />
            <Edges color="#9b9d96" threshold={15} />
          </mesh>
        ))}
      {stickers.map((s, i) =>
        selected(GRAPH_SLOTS[i]!.p) === turning ? (
          <mesh key={i} position={s.position} quaternion={s.quaternion}>
            <planeGeometry args={[0.85, 0.85]} />
            <meshBasicMaterial color={GRAPH_COLOURS[state[i]!]!} toneMapped={false} />
          </mesh>
        ) : null,
      )}
    </group>
  );
  return (
    <Canvas
      camera={{ position: [6, 4.6, 7], fov: 34 }}
      dpr={[1, 1.5]}
      frameloop={finished ? "always" : "demand"}
      onCreated={onReady}
    >
      {layer(false)}
      {layer(true)}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={finished}
        autoRotateSpeed={1.2}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
