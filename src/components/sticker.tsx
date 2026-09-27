import type { CSSProperties } from "react";
import type { StickerKey } from "@/lib/algorithms";
import { cn } from "@/lib/utils";

const stickerClass: Record<StickerKey, string> = {
  u: "bg-sticker-u",
  d: "bg-sticker-d",
  f: "bg-sticker-f",
  b: "bg-sticker-b",
  l: "bg-sticker-l",
  r: "bg-sticker-r",
  x: "bg-sticker-x",
  p: "bg-sticker-p",
};

export function Sticker({
  value,
  className,
  onClick,
  title,
  style,
}: {
  value: StickerKey;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
  title?: string | undefined;
  style?: CSSProperties | undefined;
}) {
  const base = cn(
    "rounded-[3px] outline-1 -outline-offset-1 outline-foreground/10",
    stickerClass[value],
    className,
  );

  if (!onClick) return <span className={base} title={title} style={style} />;

  return (
    <button
      type="button"
      title={title}
      style={style}
      onClick={onClick}
      className={cn(base, "transition-transform duration-150 ease-cube hover:scale-110")}
    />
  );
}

/** 3×3 top-view diagram used by algorithm cards and solve steps. */
export function FaceDiagram({ face, size = "size-4" }: { face: StickerKey[]; size?: string }) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-1">
      {face.map((cell, i) => (
        <Sticker key={i} value={cell} className={size} />
      ))}
    </div>
  );
}
