import { Link } from "@tanstack/react-router";
import { navItems, site } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid grid-cols-2 gap-[2px]">
            <span className="size-2.5 bg-primary" />
            <span className="size-2.5 bg-foreground/80" />
            <span className="size-2.5 bg-foreground/80" />
            <span className="size-2.5 bg-panel" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            {site.name}
            <span className="text-muted">{site.nameSuffix}</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-2.5 py-1.5 transition-colors"
              activeOptions={{ exact: item.to === "/" }}
              inactiveProps={{ className: "text-muted hover:text-foreground" }}
              activeProps={{ className: "bg-display text-background hover:text-background" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden font-mono text-[10px] tracking-[0.15em] text-muted sm:inline">
            {site.build}
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-md px-2.5 py-1.5"
            activeOptions={{ exact: item.to === "/" }}
            inactiveProps={{ className: "text-muted hover:text-foreground" }}
            activeProps={{ className: "bg-display text-background" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
