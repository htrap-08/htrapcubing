import { FACES, type Facelets } from "./cube-state";
import type { ScanState } from "./cube-scan-state";
export type SolverSession = {
  facelets?: Facelets;
  scan?: ScanState;
  mode?: "colours" | "scan";
  solution?: string;
  scramble?: string;
  input?: string;
};
const KEY = "scrambled-eggs-3x3-draft-v1";
export function readSolverSession(): SolverSession {
  if (typeof window === "undefined") return {};
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) || "{}");
    if (!data || typeof data !== "object") return {};
    const out: SolverSession = {};
    if (
      data.facelets &&
      FACES.every(
        (f) =>
          Array.isArray(data.facelets[f]) &&
          data.facelets[f].length === 9 &&
          data.facelets[f].every(
            (v: unknown) =>
              typeof v === "string" && ["u", "d", "l", "r", "f", "b", "x"].includes(v),
          ),
      )
    )
      out.facelets = data.facelets;
    if (data.mode === "scan" || data.mode === "colours") out.mode = data.mode;
    if (typeof data.scramble === "string" && data.scramble.length < 500)
      out.scramble = data.scramble;
    if (typeof data.solution === "string" && data.solution.length < 5000)
      out.solution = data.solution;
    if (typeof data.input === "string" && /^[URFDLB]{54}$/.test(data.input)) out.input = data.input;
    if (
      data.scan?.n === 3 &&
      Number.isInteger(data.scan.index) &&
      data.scan.index >= 0 &&
      data.scan.index < 6 &&
      FACES.every(
        (f) =>
          data.scan.faces?.[f] === null ||
          (Array.isArray(data.scan.faces?.[f]) &&
            data.scan.faces[f].length === 9 &&
            data.scan.faces[f].every((c: unknown) =>
              ["white", "red", "green", "yellow", "orange", "blue"].includes(String(c)),
            )),
      ) &&
      (data.scan.draft === null ||
        (Array.isArray(data.scan.draft) &&
          data.scan.draft.length === 9 &&
          data.scan.draft.every((c: unknown) =>
            ["white", "red", "green", "yellow", "orange", "blue"].includes(String(c)),
          )))
    )
      out.scan = data.scan;
    return out;
  } catch {
    return {};
  }
}
export function writeSolverSession(patch: SolverSession) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...readSolverSession(), ...patch }));
  } catch {
    /* Navigation still works when browser storage is unavailable. */
  }
}
export function faceletsToGraphString(state: Facelets) {
  if (!FACES.every((f) => state[f]?.length === 9 && !state[f].includes("x"))) return "";
  const letters = new Map(FACES.map((f) => [state[f][4], f]));
  if (letters.size !== 6) return "";
  return FACES.map((f) => state[f].map((c) => letters.get(c) || "").join("")).join("");
}
