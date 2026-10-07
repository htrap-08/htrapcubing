import { useState } from "react";
import { Square1Player } from "./square1-player";
import { solveSquare1Scramble, square1StateAfter } from "@/lib/square1";

export function Square1Solver({ scramble }: { scramble: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ setup: string; solution: string } | null>(null);
  const [error, setError] = useState("");
  const solve = (sequence: string) => {
    try {
      square1StateAfter(sequence);
      const solution = solveSquare1Scramble(sequence);
      if (!sequence.trim()) throw new Error("Enter the scramble used on your Square-1.");
      setResult({ setup: sequence, solution });
      setError("");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid scramble.");
    }
  };
  return (
    <div className="mt-4">
      <p className="text-sm text-muted">
        Enter the moves applied to a solved Square-1. The verified reverse sequence solves that
        scramble; it is not a shortest-path colour solver.
      </p>
      <label className="mt-3 block text-sm" htmlFor="square1-scramble">
        Your Square-1 scramble
      </label>
      <textarea
        id="square1-scramble"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="(1,0) / (0,3) /"
        className="mt-2 w-full rounded-lg border border-line bg-background p-3 font-mono text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => solve(input)}
          className="rounded-md bg-display px-3 py-2 text-sm text-background"
        >
          Solve scramble
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(scramble);
            solve(scramble);
          }}
          disabled={scramble === "…"}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          Use generated scramble
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {result ? (
        <>
          <p className="mt-4 text-xs uppercase tracking-wide text-primary">Solution moves</p>
          <p className="mt-2 break-words font-mono text-sm">
            {result.solution || "Already solved"}
          </p>
          <Square1Player setup={result.setup} alg={result.solution} playback />
        </>
      ) : (
        <Square1Player />
      )}
      <p className="mt-3 text-xs text-muted">
        (a,b) turns the top and bottom in 30° units. / flips the right half 180°. Use the
        walkthrough for a physical puzzle with an unknown scramble. Colour scanning is not available
        for Square-1.
      </p>
    </div>
  );
}
