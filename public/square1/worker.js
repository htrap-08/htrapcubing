import init, { wasmSolveSquare1 } from './square1.js';
const ready = init();
self.onmessage = async ({data}) => {
  try {
    await ready;
    const solution = wasmSolveSquare1(JSON.stringify(data));
    self.postMessage({solution});
  } catch (error) {
    self.postMessage({error: error instanceof Error ? error.message : String(error)});
  }
};
