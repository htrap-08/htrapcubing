# Physical 4×4–10×10 cube solver

The site sends painted facelets (URFDLB order) to a local Python service. It uses
[Daniel Walton's MIT-licensed NxNxN solver](https://github.com/dwalton76/rubiks-cube-NxNxN-solver),
pinned to `6c9663d95bc81aadfdc069397902e0b9a163c705`, and the site's existing MIT-licensed
cubejs solver for the final 3×3 stage. The engine and its license are installed
under `solver/.runtime/engine`; generated data is excluded from Git.

## Local setup

Requires Python 3, Git, curl, a C compiler and Node (already used by the site).

```
npm run solver:setup
npm run dev -- --host 127.0.0.1 --port 5173
```

Setup downloads approximately 2.7 GB of compressed lookup tables. Allow additional
space for extracted tables. Re-running setup skips completed files. The development
command starts both the website and solver service. `npm run solver` starts the
solver alone on loopback port 5174.

Select a cube, choose **Enter my colours**, hold white up and green front, and paint
all six faces. Odd cubes retain their fixed centres. Each colour must occur N² times.
**Solve it** calculates a solution without needing the scramble history. The worker
replays every returned move on the entered state and only returns verified solutions.
The browser shows the entered cube and a scrollable move list; the playback bar
remains removed. **Cancel solve** or leaving colour entry stops the job.

One job runs at a time to limit memory usage. Jobs time out after ten minutes.
Impossible patterns or engine failures return errors rather than fabricated moves.
The client also handles offline services and incomplete setup.

## Hosting

The existing Cloudflare build cannot run the native Python/C engine. Deploy this
service on a machine/container with its tables, keeping the loopback service behind
a private reverse proxy, and configure the website server's `NXN_SOLVER_URL` to that
trusted service base URL. Do not expose the worker directly to the public internet.
A production deployment needs appropriate access controls and resource limits at
that proxy. Without a configured service, production returns a clear unavailable
error. Localhost setup alone does not enable solving on the published Lovable site.

The JSON API has `GET /api/nxn/health`, `POST /api/nxn/solve` with `{n,state}`,
`GET /api/nxn/jobs/:id`, and `DELETE /api/nxn/jobs/:id`. No third-party solve API receives
the entered colours in the local configuration.

## Checks

```
python3 -m unittest discover -s solver/tests -v
node --test solver/tests/client.test.mjs
python3 solver/tests/integration.py
```

The integration check submits deterministic scrambled colour states for all seven
sizes through the website API, waits for results, and independently replays each
solution. It requires the tables and both local servers.
