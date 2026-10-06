/** A flat face containing exactly n × n stickers. */
export function CubeDimensionIcon({ n }: { n: number }) {
  const original = ["u", "f", "u", "f", "d", "f", "u", "f", "u"];
  const cell = 60 / n;
  const gap = 60 / (4 * n - 1);
  return (
    <svg
      viewBox="0 0 60 60"
      role="img"
      aria-label={`${n} by ${n} cube grid`}
      className="size-11 shrink-0"
    >
      {Array.from({ length: n * n }, (_, index) => (
        <rect
          key={index}
          x={(index % n) * cell + gap / 2}
          y={Math.floor(index / n) * cell + gap / 2}
          width={cell - gap}
          height={cell - gap}
          rx={Math.min(1.5, cell * 0.1)}
          fill={`var(--sticker-${original[Math.min(2, Math.floor((Math.floor(index / n) * 3) / n)) * 3 + Math.min(2, Math.floor(((index % n) * 3) / n))]})`}
          stroke="var(--foreground)"
          strokeOpacity="0.15"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}
