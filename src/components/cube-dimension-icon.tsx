/** A flat face containing exactly n × n stickers. */
export function CubeDimensionIcon({ n }: { n: number }) {
  const cell = 60 / n;
  const gap = Math.min(2, cell * 0.16);
  return (
    <svg
      viewBox="0 0 60 60"
      role="img"
      aria-label={`${n} by ${n} cube grid`}
      className="size-14 shrink-0"
    >
      {Array.from({ length: n * n }, (_, index) => (
        <rect
          key={index}
          x={(index % n) * cell + gap / 2}
          y={Math.floor(index / n) * cell + gap / 2}
          width={cell - gap}
          height={cell - gap}
          rx={Math.min(1.5, cell * 0.1)}
          fill="var(--sticker-f)"
          stroke="var(--foreground)"
          strokeOpacity="0.15"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
