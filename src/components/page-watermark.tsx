/** Decorative page title, matching the homepage's translucent CUBE lettering. */
export function PageWatermark({ title }: { title: "SOLVER" | "ALGORITHMS" | "TIMER" }) {
  return (
    <div aria-hidden="true" className={`page-watermark page-watermark-${title.toLowerCase()}`}>
      {title}
    </div>
  );
}
