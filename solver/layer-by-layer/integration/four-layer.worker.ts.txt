self.onmessage = async (event: MessageEvent<Record<string, string[]>>) => {
  try {
    const { solveFaceletInput } = await import("../../solver/layer-by-layer/facelets.mjs");
    const result = solveFaceletInput(event.data);
    self.postMessage({ ok: true, solution: result.moves, stages: result.stages });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : "The 4×4 state could not be solved.",
    });
  }
};
