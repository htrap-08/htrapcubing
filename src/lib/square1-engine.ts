import { square1PatternData, square1StateAfter, solvedSquare1, type Square1State } from "./square1";
export function solveSquare1State(state: Square1State, signal?: AbortSignal): Promise<string> {
  const pattern = square1PatternData(state);
  // Twips uses a 2-state equator; cubing.js uses orientation 0 or 3 of 6.
  pattern.EQUATOR.orientation = [0, state.flipped ? 1 : 0];
  return new Promise((resolve, reject) => {
    const worker = new Worker("/square1/worker.js", { type: "module" });
    const cleanup = () => {
      worker.terminate();
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      reject(new Error("Solve cancelled."));
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error("The solver reached its 90-second limit. Check your piece order and try again."),
      );
    }, 90000);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    worker.onerror = () => {
      cleanup();
      reject(new Error("Unable to load the Square-1 solver. Refresh and try again."));
    };
    worker.onmessage = (event: MessageEvent<{ solution?: string; error?: string }>) => {
      cleanup();
      if (event.data.error) {
        reject(new Error(event.data.error));
        return;
      }
      try {
        const solution = event.data.solution!;
        const actual = square1StateAfter(solution, state),
          expected = solvedSquare1();
        if (JSON.stringify(actual) !== JSON.stringify(expected))
          throw new Error(
            "The returned solution failed verification. Check the orientation and pieces.",
          );
        resolve(solution);
      } catch (error) {
        reject(error);
      }
    };
    worker.postMessage(pattern);
  });
}
