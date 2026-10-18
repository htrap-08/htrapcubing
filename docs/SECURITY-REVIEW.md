# Security review — 19 October 2026

## Verified changes

- Two transitive dependency advisories were identified by npm audit: shell-quote (GHSA-pqg4-j6r4-53mv) and source-map-js (GHSA-68fv-2mgg-jv7q). The 19 initial package alerts included dependency-chain effects, not 19 separately demonstrated exploits. Overrides select shell-quote 1.12.0 and source-map-js 1.2.2. npm is the documented installer; the obsolete Bun lockfile was removed so deployments use package-lock.json.
- Solver requests are limited to explicit routes/methods and 4 KiB, even when Content-Length is absent or false. JSON, cube dimensions, sticker counts and fixed centres are checked before forwarding. Body reads have a five-second deadline.
- Cross-origin writes, plain-text/form submissions and compressed bodies are rejected. This blocks browser-based cross-site abuse, not direct API clients.
- Production engine requests require HTTPS and a server-side token. Redirects fail closed so the engine cannot redirect a credential-bearing request. Client authorization headers, cookies and arbitrary paths are not forwarded. Engine cookies/HTML/other internal response headers are not relayed.
- Application responses receive nosniff, frame protection, referrer policy, a camera-preserving permissions policy and CSP restrictions for objects, frames, base URLs and forms. This is a partial CSP: nonce-based script restrictions remain future work because SSR currently embeds inline bootstrap scripts. It is not claimed to prevent every XSS flaw. Static files served directly by Vercel bypass the application wrapper.
- The loopback Python service rejects direct browser-origin writes and has a connection read timeout. It still relies on authenticated Caddy in production and must never be exposed directly.
- A GitHub Actions workflow runs the dependency audit, security regression tests, Python service tests and build on pushes/PRs. Workflow execution/branch protection must be verified in GitHub.

## Test results

- 43 JavaScript tests passed, including 13 new proxy/header regression tests.
- 8 Python tests passed, including 4 HTTP service security tests.
- TypeScript no-emit check and production build passed.
- npm audit after patching: zero known vulnerabilities.
- Local built-server checks verified security headers on portfolio, cubing, solver, algorithms, API and 404 responses; /.env and /.git/HEAD returned 404.
- No common credential-pattern matches were found in the scanned current tracked text files. History and files over 2 MB were not exhaustively scanned.

## Scope and limits

Reviewed the server proxy, local Python service, deployment authentication config, client storage and dynamic HTML sinks. Ran deterministic local negative tests; only normal read-only requests were made to production. No load test, exploit flood or destructive production scan was performed. No SQL/database or user-login system was found in the reviewed app. Dependency reports do not establish that an advisory was reachable from public routes.

A scan of current tracked files for common credential patterns is a limited check, not proof that repository history contains no secrets. No cloud-account, registrar, SSH or hosting dashboard security settings were verified.

## Strix status

The requested repository was reviewed: https://github.com/usestrix/strix . Its documented local scanner requires Docker and a provider LLM API key. Neither Docker/Strix nor LLM_API_KEY was configured here, so **no Strix scan was run**. Running Strix's own unit tests would test Strix, not this website. No paid Strix Cloud scan or provider API spend was initiated.

Once Docker, Strix and a provider key are configured locally, a bounded starting command is:

```sh
strix -n -t . --scan-mode quick --max-budget 1
```

The budget is a scanner limit, not a guarantee of a complete assessment. Review `strix_runs/<run>/run.json` for completion status and actual usage, then manually validate findings. Target a local/staging instance, do not expand targets to unrelated infrastructure, and never put provider credentials in tracked files. Official run options: https://github.com/usestrix/strix/blob/main/AGENTS.md .

## Remaining deployment work

- Before enabling the CPU-intensive big-cube backend, configure a shared edge rate limit/challenge for POST /api/nxn/solve, plus backend capacity/concurrency limits. The one-job backend cap is not distributed DDoS protection. An in-memory serverless limiter would not reliably cover all instances.
- Enable MFA/passkeys and review GitHub/Vercel/registrar account access, production environment variables, deployment permissions and recovery methods. Check DNS ownership/records and keep services patched. These settings were not accessed.
- Add nonce-based CSP after testing SSR streaming, workers, WebAssembly and analytics together. Keep camera access same-origin for the scanner.
- Review GitHub secret-scanning results and historical commits; rotate any exposed credential. Do not assume deleting a file removes a secret from history.
- Re-run dependency/security checks on future changes. Zero known npm advisories is not a guarantee of security.
