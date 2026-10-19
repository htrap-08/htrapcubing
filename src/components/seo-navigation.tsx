import { useLocation } from "@tanstack/react-router";
import { breadcrumbs } from "@/lib/seo";
export function Breadcrumbs() {
  const location = useLocation();
  const items = breadcrumbs(location.pathname, location.search as Record<string, unknown>);
  if (!items.length) return null;
  return (
    <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.path}>
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <a href={item.path}>{item.name}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
