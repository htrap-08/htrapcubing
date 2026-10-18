import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const compiled = ts.transpileModule(
  fs.readFileSync(new URL("../src/lib/server-security.ts", import.meta.url), "utf8"),
  {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  },
).outputText;
const { proxySolver, securityHeaders } = await import(
  "data:text/javascript," + encodeURIComponent(compiled)
);
const config = { base: "https://engine.example", token: "test-backend-token" };
const state = [..."URFDLB"].map((f) => f.repeat(16)).join("");
const request = (path = "/api/nxn/solve", init = {}) =>
  new Request("https://htrap.in" + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ n: 4, state }),
    ...init,
  });
let calls = 0;
const upstream = async () => {
  calls++;
  return Response.json({ status: "solving" });
};
const rejected = async (req, status) => {
  calls = 0;
  const res = await proxySolver(req, config, upstream);
  assert.equal(res.status, status);
  assert.equal(calls, 0);
};
test("security headers preserve body, status and camera access", async () => {
  const response = securityHeaders(Response.json({ error: "missing" }, { status: 404 }));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "missing" });
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(response.headers.get("permissions-policy"), /camera=\(self\)/);
});
test("reject unknown endpoints and wrong methods before contacting engine", async () => {
  await rejected(request("/api/nxn/admin"), 404);
  await rejected(request("/api/nxn/health"), 405);
  await rejected(request("/api/nxn/jobs/not-a-job", { method: "DELETE", body: undefined }), 404);
});
test("reject cross-site and opaque origins", async () => {
  for (const origin of ["https://attacker.example", "null"])
    await rejected(
      request(undefined, { headers: { origin, "content-type": "application/json" } }),
      403,
    );
  await rejected(
    request(undefined, {
      headers: { "sec-fetch-site": "cross-site", "content-type": "application/json" },
    }),
    403,
  );
});
test("reject cross-site cancellation too", async () => {
  await rejected(
    request("/api/nxn/jobs/" + "a".repeat(32), {
      method: "DELETE",
      body: undefined,
      headers: { origin: "https://attacker.example" },
    }),
    403,
  );
});
test("reject form and encoded bodies", async () => {
  await rejected(request(undefined, { headers: { "content-type": "text/plain" } }), 415);
  await rejected(
    request(undefined, {
      headers: { "content-type": "application/json", "content-encoding": "gzip" },
    }),
    415,
  );
});
test("reject large bodies with or without trustworthy Content-Length", async () => {
  await rejected(
    request(undefined, {
      headers: { "content-type": "application/json", "content-length": "99999" },
    }),
    413,
  );
  await rejected(request(undefined, { body: "x".repeat(4097) }), 413);
  await rejected(
    request(undefined, {
      headers: { "content-type": "application/json", "content-length": "2" },
      body: "x".repeat(4097),
    }),
    413,
  );
});
test("reject oversized streamed body without buffering the complete upload", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new Uint8Array(4097));
    },
    cancel() {
      cancelled = true;
    },
  });
  await rejected(request(undefined, { body: stream, duplex: "half" }), 413);
  assert.equal(cancelled, true);
});
test("reject malformed JSON, invalid sizes, counts and fixed centres", async () => {
  for (const body of [
    "{",
    "null",
    "[]",
    JSON.stringify({ n: true, state }),
    JSON.stringify({ n: 4, state: "U".repeat(96) }),
  ])
    await rejected(request(undefined, { body }), 400);
  const odd = [..."URFDLB"]
    .map((f) => f.repeat(25))
    .join("")
    .split("");
  [odd[12], odd[37]] = [odd[37], odd[12]];
  await rejected(request(undefined, { body: JSON.stringify({ n: 5, state: odd.join("") }) }), 400);
});
test("valid same-origin input uses only configured credentials and strips extra fields", async () => {
  let seen;
  const res = await proxySolver(
    request(undefined, {
      headers: {
        origin: "https://htrap.in",
        "content-type": "application/json",
        authorization: "attacker-token",
      },
      body: JSON.stringify({ n: 4, state, extra: "ignored" }),
    }),
    config,
    async (url, init) => {
      seen = { url, init };
      return Response.json(
        { id: "a".repeat(32) },
        { status: 202, headers: { "Set-Cookie": "unwanted=1" } },
      );
    },
  );
  assert.equal(res.status, 202);
  assert.equal(String(seen.url), "https://engine.example/api/nxn/solve");
  assert.equal(seen.init.headers.Authorization, "Bearer test-backend-token");
  assert.equal(seen.init.redirect, "error");
  assert.deepEqual(JSON.parse(seen.init.body), { n: 4, state });
  assert.equal(res.headers.get("set-cookie"), null);
  assert.equal(res.headers.get("cache-control"), "no-store");
});
test("production fails closed on missing credentials and insecure upstream", async () => {
  for (const cfg of [
    {},
    { base: config.base },
    { ...config, base: "http://engine.example" },
    { ...config, base: "https://user:pass@engine.example" },
  ]) {
    calls = 0;
    assert.equal((await proxySolver(request(), cfg, upstream)).status, 503);
    assert.equal(calls, 0);
  }
});
test("health and cancellation routes work without request bodies", async () => {
  for (const [path, method] of [
    ["/api/nxn/health", "GET"],
    ["/api/nxn/jobs/" + "b".repeat(32), "GET"],
    ["/api/nxn/jobs/" + "b".repeat(32), "DELETE"],
  ])
    assert.equal(
      (await proxySolver(new Request("https://htrap.in" + path, { method }), config, upstream))
        .status,
      200,
    );
});
test("upstream failures do not expose internals", async () => {
  const response = await proxySolver(request(), config, async () => {
    throw new Error("private engine token");
  });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private engine token/);
});
test("unexpected upstream HTML is not returned as an executable response", async () => {
  const response = await proxySolver(
    request(),
    config,
    async () =>
      new Response("<script>bad()</script>", { headers: { "content-type": "text/html" } }),
  );
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /<script>/);
});
