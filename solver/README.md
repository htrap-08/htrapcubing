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
error. Localhost setup alone does not enable solving on the published website.

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

## Ubuntu/Oracle server deployment (persistent tables, HTTPS)

The supplied `solver/deploy/compose.yaml` runs on Linux (Arm64 or x86-64).
It needs Docker Engine with Compose installed on the server. The engine compiles
on that server, so no Mac binaries are uploaded. Setup downloads the lookup tables
straight into a Docker volume and resumes completed files after a restart.
Allow enough disk for compressed and extracted tables (20 GB spare recommended).
The solver is limited to one active job and 8 GB of container memory; large solves
still need real hardware testing before promising capacity or solve times.

1. Create an Ubuntu server, then point GoDaddy's `solver` A record at its public IPv4.
   Permit inbound TCP 80/443 in the cloud firewall and OS firewall. Keep SSH limited
   to your IP. Do not expose port 5174: Python binds only to loopback.
2. On the server, clone this repository and enter `solver/deploy`.
3. Run `cp environment.sample .env` and `chmod 600 .env`. Generate a secret with
   `openssl rand -hex 32`, then put it in `.env` as `NXN_SOLVER_TOKEN`.
4. Run `sudo docker compose up -d --build` and
   `sudo docker compose logs -f solver`. The first boot downloads and unpacks tables;
   wait for “Cube solver listening”. Tables survive container rebuilds.
5. Set these **server-side** Vercel environment variables and redeploy:
   `NXN_SOLVER_URL=https://solver.htrap.in` and `NXN_SOLVER_TOKEN` with the same secret.
   Never prefix the token with `VITE_` or commit `.env`.
6. Check `/api/nxn/health` through htrap.in. It must return `{"ready":true}`.
   Requests directly to the solver hostname without the secret return 401.
7. Run the existing integration check against the configured website and verify a
   nontrivial colour state for every supported size before advertising readiness.

The public website continues using `/api/nxn/…`; browsers never receive the secret
or download the lookup tables. Vercel handles only short submission/poll requests;
Python/C does the long solve on the persistent server. Table storage such as Vercel
Blob alone cannot execute this engine. Do not run `docker compose down -v` unless
you intend to delete the downloaded tables.
