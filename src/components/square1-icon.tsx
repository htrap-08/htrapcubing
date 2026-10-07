/** Flat Square-1 face with its four wide corners and four narrow edges. */
export function Square1Icon() {
  return (
    <svg
      viewBox="0 0 60 60"
      role="img"
      aria-label="Square-1 segmented face"
      className="size-11 shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="56"
        height="56"
        rx="3"
        fill="var(--sticker-u)"
        stroke="var(--foreground)"
        strokeOpacity=".2"
      />
      {[15, 75, 105, 165, 195, 255, 285, 345].map((degrees) => {
        const a = (degrees * Math.PI) / 180,
          r = 28 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
        return (
          <path
            key={degrees}
            d={`M30 30L${30 + r * Math.cos(a)} ${30 + r * Math.sin(a)}`}
            stroke="var(--primary)"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}
