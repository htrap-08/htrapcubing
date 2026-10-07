import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Square1Icon } from "@/components/square1-icon";
import { FaceDiagram } from "@/components/sticker";
import { algorithms, groupsByTrack, type Track } from "@/lib/algorithms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/algorithms")({
  head: () => ({
    meta: [
      { title: "Algorithms — AXIOM/CUBE" },
      {
        name: "description",
        content:
          "A visual algorithm library in two tracks: a plain-language beginner method, and advanced CFOP F2L, OLL, PLL, commutators and big cube parity.",
      },
      { property: "og:title", content: "Algorithms — AXIOM/CUBE" },
      {
        property: "og:description",
        content:
          "Beginner method and advanced CFOP, commutators and parity algorithms, each with a visual face diagram.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlgorithmsPage,
});

function AlgorithmsPage() {
  const [track, setTrack] = useState<Track>("beginner");
  const [group, setGroup] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const groups = groupsByTrack[track];
  const visible = algorithms.filter((a) => {
    if (a.track !== track) return false;
    if (group && a.group !== group) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.moves.toLowerCase().includes(q) ||
      a.group.toLowerCase().includes(q)
    );
  });

  const switchTrack = (t: Track) => {
    setTrack(t);
    setGroup(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="self-start lg:sticky lg:top-20">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                (b) Algorithms
              </p>
              <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight">
                Every turn, on record.
              </h1>

              <div className="mt-6 inline-flex rounded-lg border border-line bg-panel p-1 font-mono text-[11px] uppercase tracking-[0.08em]">
                {(["beginner", "advanced"] as Track[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTrack(t)}
                    className={cn(
                      "rounded-md px-3 py-1.5 transition",
                      track === t
                        ? "bg-display text-background"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search moves or names"
                className="mt-4 w-full rounded-md border border-line bg-panel px-3 py-2 font-mono text-[12px] outline-none placeholder:text-muted focus:border-primary"
              />

              <div className="mt-5 space-y-1 font-mono text-[11px]">
                <button
                  onClick={() => setGroup(null)}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left transition",
                    group === null
                      ? "bg-panel-2 text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  All ({algorithms.filter((a) => a.track === track).length})
                </button>
                {groups.map((gr) => (
                  <button
                    key={gr}
                    onClick={() => setGroup(gr)}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left transition",
                      group === gr
                        ? "bg-panel-2 text-foreground"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {gr}
                  </button>
                ))}
              </div>
            </aside>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((a, i) => (
                <article
                  key={a.id}
                  className="rise rounded-xl border border-line bg-panel p-4"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                    {a.group}
                    {a.puzzle ? ` · ${a.puzzle}` : ""}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight">{a.name}</h2>
                  <div className="mt-3 flex items-center gap-4">
                    {a.puzzle === "Square-1" ? <Square1Icon /> : <FaceDiagram face={a.face} />}
                    <p className="font-mono text-[13px] font-medium leading-relaxed">{a.moves}</p>
                  </div>
                  <p className="mt-3 text-pretty text-[12px] text-muted">{a.description}</p>
                  {a.source ? (
                    <a
                      href={a.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-primary underline"
                    >
                      Notation and setup reference
                    </a>
                  ) : null}
                </article>
              ))}

              {visible.length === 0 ? (
                <p className="font-mono text-[12px] text-muted">Nothing matches that search yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
