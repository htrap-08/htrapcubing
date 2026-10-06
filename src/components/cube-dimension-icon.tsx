/** Three visible faces, each containing exactly n × n stickers. */
export function CubeDimensionIcon({ n }: { n: number }) {
  const faces = [
    { transform: "matrix(0.5 -0.25 0.5 0.25 2 17)", colour: "var(--sticker-u)" },
    { transform: "matrix(0.5 0.25 0 0.5 2 17)", colour: "var(--sticker-f)" },
    { transform: "matrix(0.5 -0.25 0 0.5 32 32)", colour: "var(--sticker-r)" },
  ];
  const cell = 60 / n;
  const gap = Math.min(1, cell * 0.12);
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${n} by ${n} cube`}
      className="size-14 shrink-0"
    >
      {faces.map(({ transform, colour }) => (
        <g key={transform} transform={transform}>
          <rect width="60" height="60" fill="var(--foreground)" />
          {Array.from({ length: n * n }, (_, index) => (
            <rect
              key={index}
              x={(index % n) * cell + gap / 2}
              y={Math.floor(index / n) * cell + gap / 2}
              width={cell - gap}
              height={cell - gap}
              fill={colour}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
