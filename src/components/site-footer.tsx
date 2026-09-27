import { Link } from "@tanstack/react-router";
import { navItems, site } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:gap-6 sm:px-8">
        <span className="font-display text-sm font-bold tracking-tight">
          {site.name}
          <span className="text-muted">{site.nameSuffix}</span>
        </span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          {navItems
            .filter((i) => i.to !== "/")
            .map((item) => (
              <Link key={item.to} to={item.to} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          <span className="cursor-default text-muted/60">Custom tools · coming</span>
        </nav>
        <p className="font-mono text-[10px] tracking-[0.1em] text-muted sm:ml-auto">
          {site.tagline} · © 2026 {site.name}
        </p>
      </div>
    </footer>
  );
}
