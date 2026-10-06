export type RGB = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };
export type CubeColour = "white" | "yellow" | "red" | "orange" | "blue" | "green";
export const CUBE_PALETTE: Readonly<Record<CubeColour, Readonly<RGB>>>;
export function rgbToLab(rgb: RGB): Lab;
export function ciede2000(first: Lab, second: Lab): number;
export function classifyCubeColours(pixels: readonly RGB[], expectedCount?: number): CubeColour[];
