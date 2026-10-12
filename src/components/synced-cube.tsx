import { lazy, Suspense, useCallback, useMemo } from "react";
import { invertAlg } from "@/lib/cube-state";
import { graphSnapshots, SOLVED_GRAPH_STATE } from "@/lib/cube-graph-model.js";
const LightCubeScene = lazy(() => import("./light-cube-scene"));
export function SyncedCube({
  solution,
  timestamp,
  onReady,
}: {
  solution: string;
  timestamp: number;
  onReady: (times: number[], duration: number) => void;
}) {
  const data = useMemo(() => {
    const moves = solution.trim().split(/\s+/).filter(Boolean),
      setup = invertAlg(solution).split(/\s+/).filter(Boolean);
    const input = graphSnapshots(SOLVED_GRAPH_STATE, setup).at(-1)!;
    const states = graphSnapshots(input, moves);
    const times: number[] = [];
    let duration = 0;
    for (const m of moves) {
      times.push(duration);
      duration += m.includes("2") ? 1500 : 1000;
    }
    return { moves, states, times, duration };
  }, [solution]);
  const ready = useCallback(() => onReady(data.times, data.duration), [data, onReady]);
  let step = 0;
  while (step + 1 < data.times.length && timestamp >= data.times[step + 1]!) step++;
  const finished = timestamp >= data.duration;
  if (finished) step = data.moves.length;
  const start = data.times[step] ?? data.duration,
    end = data.times[step + 1] ?? data.duration;
  const progress = end > start ? (timestamp - start) / (end - start) : 0;
  return (
    <div className="synced-cube">
      <Suspense fallback={<span className="text-sm text-muted">Loading cube…</span>}>
        <LightCubeScene
          state={data.states[step]!}
          move={data.moves[step]}
          progress={progress}
          finished={finished}
          onReady={ready}
        />
      </Suspense>
    </div>
  );
}
