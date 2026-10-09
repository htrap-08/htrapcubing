# Browser 4×4 physical layer-by-layer solver

This deterministic solver requires no lookup tables or server. It builds white-first physical layers with pure three-piece cycles, solves top corners, then top wings with three-cycles and a parity-changing two-cycle. It follows the layer milestones of the researched method; it replaces intuitive centre-bar construction with generated centre cycles. It does not reproduce every human technique from the video.

Every macro is generated from an exact cubing.js transformation. Setup paths are derived by breadth-first search over ordered cubie triples. Corner orientations use pure two-corner twist operations. Centre identity is tracked by colour, so harmless permutations of same-colour centres are allowed. The last-wing parity operation preserves lower layers and corners.

Each operation checks protected pieces. Each result is replayed against the input before returning. Invalid colours, counts, duplicate/mirrored pieces, impossible wing orientations, and total corner twist are rejected. Solutions are long (roughly hundreds of moves), prioritising correctness over speed. Tests are evidence, not a mathematical proof of all legal inputs.

## Verification

Run from the repository root:

```
node solver/layer-by-layer/verify.mjs 10000
python3 solver/layer-by-layer/geometric-verify.py
```

The first command uses a seeded xorshift generator with outer and inner turns and mixed scramble lengths. It decodes sticker input, solves with white first, checks protected pieces and replays the final solution. It records failures and exports the first 1,000 full solutions for independent replay.

The Python check uses integer-coordinate sticker rotations, independently of cubing.js. It compares face colours after replay, handling inner slice and whole-cube moves.

Earlier 40-move-only tests passed 10,000 cases; the broader mixed-length suite also passed 10,000. The committed `verification.json` and `geometric-verification.json` record the latest results. Raw replay corpora are generated locally and ignored by Git.

For the browser worker check, build the site, run `node solver/layer-by-layer/browser-harness.mjs`, serve the production output with a server that supports SSR and HTML MIME types, and open `/4x4-worker-check.html`. This temporary page is for local checks; rebuilding removes it.

Physical camera accuracy and physical cube execution are not covered by synthetic tests. Cubes 5×5–10×10 continue to use the existing backend.

## Sources

The stage order was researched from J Perm's layer-by-layer demonstration and the transcript/screenshots supplied by the user. The pure wing cycles and two-wing parity operation are adapted from Thom Barlow's K4 algorithms, as reproduced in Andy Klise's guide: https://www.kungfoomanchu.com/guides/k4.pdf . The implementation derives explicit setup paths and checks the actual transformation rather than interpreting informal slice placeholders.
