/**
 * Central site configuration. Edit here to rebrand or add sections —
 * the header, footer and home page all read from this file.
 */

export const site = {
  name: "AXIOM",
  nameSuffix: "/CUBE",
  build: "v0.9 · BUILD 0921",
  tagline: "Built to be extended",
} as const;

export type NavItem = {
  to: "/" | "/solver" | "/algorithms" | "/timer";
  label: string;
};

export const navItems: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/solver", label: "Solver" },
  { to: "/algorithms", label: "Algorithms" },
  { to: "/timer", label: "Timer" },
];
