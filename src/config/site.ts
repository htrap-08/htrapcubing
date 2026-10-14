/**
 * Central site configuration. Edit here to rebrand or add sections —
 * the header, footer and home page all read from this file.
 */

export const site = {
  name: "scrambled eggs",
  nameSuffix: "",
  build: "v0.9 · BUILD 0921",
  tagline: "Built to be extended",
} as const;

export type NavItem = {
  to:
    | "/scrambledeggs"
    | "/scrambledeggs/solver"
    | "/scrambledeggs/algorithms"
    | "/scrambledeggs/timer"
    | "/scrambledeggs/cool-stuff";
  label: string;
};

export const navItems: NavItem[] = [
  { to: "/scrambledeggs", label: "Home" },
  { to: "/scrambledeggs/solver", label: "Solver" },
  { to: "/scrambledeggs/algorithms", label: "Algorithms" },
  { to: "/scrambledeggs/timer", label: "Timer" },
  { to: "/scrambledeggs/cool-stuff", label: "Cool stuff" },
];
