# Square-1 browser solver

The website uses Twips's specialized two-phase Square-1 search, compiled to
WebAssembly, rather than reversing a known scramble. No backend or lookup-table
download is required. It builds its pruning tables in a disposable browser worker.
The first solve is slower than subsequent computation; cancelled workers are terminated.

Upstream: https://github.com/cubing/twips
Pinned commit: a9d702a2a3edfea7ddec001c8e1d037214705903
License selected: Mozilla Public License 2.0. See public/square1/LICENSE-MPL.md.
The unmodified source is available at the pinned GitHub commit; all source
modifications are supplied in twips-adapter.patch beside this file.

## Rebuild

1. Clone upstream and check out the pinned commit.
2. Apply twips-adapter.patch with `git apply`.
3. Install Rust nightly-2026-02-01 with the wasm32-unknown-unknown target.
4. Run `cargo build -p twips-wasm --locked --release --target wasm32-unknown-unknown`.
5. Use wasm-bindgen-cli 0.2.105:
   `wasm-bindgen target/wasm32-unknown-unknown/release/twips_wasm.wasm --target web --out-dir output --out-name square1`
6. Copy output/square1.js and output/square1_bg.wasm into public/square1/.

The adapter adds a pattern-state entry point and exports only the specialized
Square-1 solver. Piece entry is converted to the upstream 24-wedge KPattern.
Every result is replayed against the entered state before the website displays it.
