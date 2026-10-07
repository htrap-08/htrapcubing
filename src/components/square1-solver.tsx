import { useEffect, useRef, useState } from "react";
import { Square1Player } from "./square1-player";
import { solveSquare1State } from "@/lib/square1-engine";
import {
  square1StateAfter,
  square1StateFromPieces,
  square1PieceNames,
  square1PieceWidth,
  type Square1State,
} from "@/lib/square1";

export function Square1Solver({ scramble }: { scramble: string }) {
  const [mode, setMode] = useState<"pieces" | "scramble">("pieces");
  const [top, setTop] = useState(Array.from({ length: 8 }, (_, i) => i));
  const [bottom, setBottom] = useState(Array.from({ length: 8 }, (_, i) => i + 8));
  const [flipped, setFlipped] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ state: Square1State; solution: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const solve = async (sequence?: string) => {
    try {
      const state =
        sequence === undefined
          ? square1StateFromPieces(top, bottom, flipped)
          : square1StateAfter(sequence);
      pending.current?.abort();
      const controller = new AbortController();
      pending.current = controller;
      setBusy(true);
      setError("");
      setResult(null);
      const solution = await solveSquare1State(state, controller.signal);
      if (!controller.signal.aborted) setResult({ state, solution });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to solve this state.");
    } finally {
      setBusy(false);
    }
  };
  const editor = (label: string, pieces: number[], setPieces: (next: number[]) => void) => (
    <fieldset className="mt-4" disabled={busy}>
      <legend className="text-sm font-medium">
        {label} · {pieces.reduce((n, id) => n + square1PieceWidth(id), 0)} / 12 slots
      </legend>
      <div className="mt-2 space-y-1">
        {pieces.map((id, index) => (
          <div className="flex items-center gap-2" key={index}>
            <span className="w-5 text-xs text-muted">{index + 1}</span>
            <select
              aria-label={`${label} piece ${index + 1}`}
              value={id}
              onChange={(e) => {
                setResult(null);
                setPieces(pieces.map((p, i) => (i === index ? Number(e.target.value) : p)));
              }}
              className="min-w-0 flex-1 rounded border border-line bg-background p-1.5 text-xs"
            >
              {square1PieceNames.map((name, i) => (
                <option key={i} value={i}>
                  {name} ({square1PieceWidth(i) === 2 ? "60°" : "30°"})
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Remove ${label.toLowerCase()} piece ${index + 1}`}
              onClick={() => {
                setResult(null);
                setPieces(pieces.filter((_, i) => i !== index));
              }}
              className="px-1 text-xs text-muted"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={pieces.length >= 12}
        onClick={() => {
          const used = [...top, ...bottom];
          setResult(null);
          setPieces([
            ...pieces,
            square1PieceNames.findIndex((_, i) => !used.includes(i)) < 0
              ? 0
              : square1PieceNames.findIndex((_, i) => !used.includes(i)),
          ]);
        }}
        className="mt-2 rounded border border-line px-2 py-1 text-xs"
      >
        Add piece
      </button>
    </fieldset>
  );
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {(["pieces", "scramble"] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(m);
              setResult(null);
              setError("");
            }}
            className={`rounded border border-line px-3 py-2 text-xs ${mode === m ? "bg-display text-background" : ""}`}
          >
            {m === "pieces" ? "Enter my colours" : "Enter scramble"}
          </button>
        ))}
      </div>
      {mode === "pieces" ? (
        <>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Hold white on top, yellow below, green in front and orange on the right. Start at the
            front-right slice seam. List the top clockwise from above; list the bottom
            counter-clockwise from below (the same direction when viewed from above). Identify
            pieces by all their colours, including side stickers.
          </p>
          <p className="mt-2 text-xs text-muted">
            Each corner is one 60° piece, each edge one 30° piece. Use all 16 pieces once. Add or
            remove entries when a layer has more or fewer than eight pieces.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {editor("Top", top, setTop)}
            {editor("Bottom", bottom, setBottom)}
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={flipped}
              disabled={busy}
              onChange={(e) => {
                setFlipped(e.target.checked);
                setResult(null);
              }}
            />
            Right half of the middle layer is flipped
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void solve()}
              className="rounded bg-display px-3 py-2 text-sm text-background"
            >
              {busy ? "Solving…" : "Solve my Square-1"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setTop(Array.from({ length: 8 }, (_, i) => i));
                setBottom(Array.from({ length: 8 }, (_, i) => i + 8));
                setFlipped(false);
                setError("");
                setResult(null);
              }}
              className="rounded border border-line px-3 py-2 text-xs"
            >
              Reset to solved
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="square1-scramble" className="mt-3 block text-sm">
            Your Square-1 scramble
          </label>
          <textarea
            id="square1-scramble"
            rows={3}
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            placeholder="(1,0) / (0,3) /"
            className="mt-2 w-full rounded border border-line bg-background p-3 font-mono text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void solve(input)}
              className="rounded bg-display px-3 py-2 text-sm text-background"
            >
              {busy ? "Solving…" : "Solve scramble"}
            </button>
            <button
              type="button"
              disabled={busy || scramble === "…"}
              onClick={() => {
                setInput(scramble);
                void solve(scramble);
              }}
              className="rounded border border-line px-3 py-2 text-xs"
            >
              Use generated scramble
            </button>
          </div>
        </>
      )}
      {busy && (
        <div className="mt-3 text-xs text-muted">
          The first solve builds the search tables in your browser.{" "}
          <button type="button" onClick={() => pending.current?.abort()} className="underline">
            Cancel
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {result ? (
        <>
          <p className="mt-4 text-xs uppercase text-primary">Verified solution</p>
          <p className="mt-2 break-words font-mono text-sm">
            {result.solution || "Already solved"}
          </p>
          <Square1Player initialState={result.state} alg={result.solution} playback />
        </>
      ) : (
        <Square1Player />
      )}
      <p className="mt-3 text-xs text-muted">
        (a,b) turns the top/bottom in 30° units; / flips the right half. Solver: Twips two-phase
        search, running locally in your browser. Camera scanning is not available for Square-1.
      </p>
      <a
        className="mt-2 inline-block text-xs text-primary underline"
        href="/square1/NOTICE.txt"
        target="_blank"
        rel="noreferrer"
      >
        Solver source and attribution
      </a>
    </div>
  );
}
