export function solveFaceletInput(facelets: Record<string, string[]>): {
  moves: string;
  stages: { name: string; moves: string }[];
};
