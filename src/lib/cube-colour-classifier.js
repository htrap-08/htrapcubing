/** Approximate sRGB references; sticker shades and lighting vary between cubes. */
export const CUBE_PALETTE = Object.freeze({
  white: Object.freeze({ r: 255, g: 255, b: 255 }),
  yellow: Object.freeze({ r: 255, g: 255, b: 0 }),
  red: Object.freeze({ r: 255, g: 0, b: 0 }),
  orange: Object.freeze({ r: 255, g: 128, b: 0 }),
  blue: Object.freeze({ r: 0, g: 0, b: 255 }),
  green: Object.freeze({ r: 0, g: 180, b: 0 }),
});

/** Convert 0–255 sRGB to CIELAB using the D65 reference white. */
export function rgbToLab({ r, g, b }) {
  const linear = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const R = linear(r),
    G = linear(g),
    B = linear(b);
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const f = (value) =>
    value > (6 / 29) ** 3 ? Math.cbrt(value) : value / (3 * (6 / 29) ** 2) + 4 / 29;
  const fx = f(x),
    fy = f(y),
    fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIEDE2000 with standard parametric factors kL = kC = kH = 1.
 * Formula and reference tests: https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/
 */
export function ciede2000(lab1, lab2) {
  const rad = Math.PI / 180;
  const sin = (degrees) => Math.sin(degrees * rad);
  const cos = (degrees) => Math.cos(degrees * rad);
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;
  const meanC = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(meanC ** 7 / (meanC ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1,
    ap2 = (1 + G) * a2;
  const C1 = Math.hypot(ap1, b1),
    C2 = Math.hypot(ap2, b2);
  const hue = (a, b) => (a === 0 && b === 0 ? 0 : (Math.atan2(b, a) / rad + 360) % 360);
  const h1 = hue(ap1, b1),
    h2 = hue(ap2, b2);
  const dL = L2 - L1;
  const dC = C2 - C1;
  let dh = h2 - h1;
  if (C1 * C2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1 * C2) * sin(dh / 2);
  const meanL = (L1 + L2) / 2;
  const meanCp = (C1 + C2) / 2;
  let meanH;
  if (C1 * C2 === 0) meanH = h1 + h2;
  else if (Math.abs(h1 - h2) <= 180) meanH = (h1 + h2) / 2;
  else meanH = (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2;
  const T =
    1 -
    0.17 * cos(meanH - 30) +
    0.24 * cos(2 * meanH) +
    0.32 * cos(3 * meanH + 6) -
    0.2 * cos(4 * meanH - 63);
  const SL = 1 + (0.015 * (meanL - 50) ** 2) / Math.sqrt(20 + (meanL - 50) ** 2);
  const SC = 1 + 0.045 * meanCp;
  const SH = 1 + 0.015 * meanCp * T;
  const theta = 30 * Math.exp(-(((meanH - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(meanCp ** 7 / (meanCp ** 7 + 25 ** 7));
  const RT = -RC * sin(2 * theta);
  const l = dL / SL,
    c = dC / SC,
    h = dH / SH;
  return Math.sqrt(Math.max(0, l * l + c * c + h * h + RT * c * h));
}

const paletteLab = Object.entries(CUBE_PALETTE).map(([name, rgb]) => ({
  name,
  lab: rgbToLab(rgb),
}));

/**
 * @param {Array<{r: number, g: number, b: number}>} pixels Nine sRGB samples (0–255).
 * @returns {string[]} Nine colour names in the same order as the input.
 */
export function classifyCubeColours(pixels, expectedCount = 9) {
  if (!Array.isArray(pixels) || pixels.length !== expectedCount) {
    throw new TypeError(`Expected an array of exactly ${expectedCount} RGB objects.`);
  }
  return Array.from(pixels, (pixel, index) => {
    if (
      !pixel ||
      ![pixel.r, pixel.g, pixel.b].every(
        (value) => Number.isFinite(value) && value >= 0 && value <= 255,
      )
    ) {
      throw new TypeError(
        `Invalid RGB sample at index ${index}: channels must be numbers from 0 to 255.`,
      );
    }
    const lab = rgbToLab(pixel);
    let closest = paletteLab[0].name;
    let bestDistance = Infinity;
    for (const reference of paletteLab) {
      const distance = ciede2000(lab, reference.lab);
      if (distance < bestDistance) {
        closest = reference.name;
        bestDistance = distance;
      }
    }
    return closest;
  });
}
