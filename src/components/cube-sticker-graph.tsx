import {
  GRAPH_POINTS,
  GRAPH_RINGS,
  GRAPH_COLOURS,
  graphPositionDuringMove,
} from "@/lib/cube-graph-model.js";
export function CubeStickerGraph({
  state,
  move,
  progress,
}: {
  state: string;
  move: string | undefined;
  progress: number;
}) {
  const active = move ? ["U", "R", "F", "D", "L", "B"].indexOf(move[0]!) : -1;
  const axes = [1, 0, 2, 1, 0, 2],
    sides = [1, 1, 1, -1, -1, -1];
  return (
    <svg
      viewBox="55 30 430 430"
      className="sticker-graph"
      role="img"
      aria-label="54 sticker vertices on nine circular slice loops, moving in sync with the cube"
    >
      <title>scrambled eggs sticker atlas: 54 vertices, 108 edges, nine slice loops</title>
      <g transform="rotate(30 270 260)">
        {GRAPH_RINGS.map((r) => (
          <circle
            key={`${r.axis}-${r.slice}`}
            cx={r.cx}
            cy={r.cy}
            r={r.r}
            fill="none"
            className={
              active >= 0 && r.axis === axes[active] && r.slice === sides[active]
                ? "graph-ring active"
                : "graph-ring"
            }
          />
        ))}
        {GRAPH_POINTS.map((p, i) => {
          const at = graphPositionDuringMove(i, move, progress);
          return (
            <rect
              key={i}
              x={at.x - 7.5}
              y={at.y - 7.5}
              width={15}
              height={15}
              rx={4}
              fill={GRAPH_COLOURS[state[i]!]}
              stroke="#352a24"
              strokeWidth={1.8}
            >
              <title>{`${p.face} sticker ${p.index + 1}`}</title>
            </rect>
          );
        })}
      </g>
    </svg>
  );
}
