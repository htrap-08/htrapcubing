/** Server-only request guards. Do not import credentials into client modules. */
const MAX_BODY_BYTES = 4096;

export function securityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  );
  // SSR currently needs inline bootstrap scripts. These directives can be enforced
  // without weakening script-src with unsafe-inline or breaking hydration.
  headers.set(
    "Content-Security-Policy",
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function error(status: number, message: string, extra: Record<string, string> = {}) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store", ...extra } },
  );
}

async function readCube(request: Request): Promise<string> {
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES))
    throw new Error("size");
  if (!request.body) throw new Error("json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel();
  }, 5000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (timedOut) throw new Error("timeout");
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  const n = data?.n,
    state = data?.state;
  if (
    !Number.isInteger(n) ||
    n < 4 ||
    n > 10 ||
    typeof state !== "string" ||
    state.length !== 6 * n * n ||
    /[^URFDLB]/.test(state) ||
    [..."URFDLB"].some((face) => state.split(face).length - 1 !== n * n) ||
    (n % 2 && [..."URFDLB"].some((face, i) => state[i * n * n + Math.floor((n * n) / 2)] !== face))
  )
    throw new Error("json");
  return JSON.stringify({ n, state });
}

export async function proxySolver(
  request: Request,
  config: { base?: string | undefined; token?: string | undefined; development?: boolean },
  upstreamFetch: typeof fetch = fetch,
): Promise<Response> {
  const url = new URL(request.url);
  const job = /^\/api\/nxn\/jobs\/[a-f0-9]{32}$/.test(url.pathname);
  const allowed =
    url.pathname === "/api/nxn/health"
      ? ["GET"]
      : url.pathname === "/api/nxn/solve"
        ? ["POST"]
        : job
          ? ["GET", "DELETE"]
          : [];
  if (!allowed.length) return error(404, "Not found.");
  if (!allowed.includes(request.method))
    return error(405, "Method not allowed.", { Allow: allowed.join(", ") });
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (
      (origin !== null && origin !== url.origin) ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      return error(403, "Cross-site requests are not allowed.");
  }
  let body: string | undefined;
  if (request.method === "POST") {
    if (
      request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json"
    )
      return error(415, "Use application/json.");
    if (request.headers.has("content-encoding"))
      return error(415, "Encoded request bodies are not supported.");
    try {
      body = await readCube(request);
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "json";
      return error(
        reason === "size" ? 413 : reason === "timeout" ? 408 : 400,
        "Invalid cube request.",
      );
    }
  }
  if (!config.base || (!config.development && !config.token))
    return error(503, "The larger-cube solver is not available on this server yet.");
  try {
    const base = new URL(config.base);
    const local =
      config.development &&
      base.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
    if ((!local && base.protocol !== "https:") || base.username || base.password)
      throw new Error("Invalid upstream");
    const response = await upstreamFetch(new URL(url.pathname, base), {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      ...(body !== undefined ? { body } : {}),
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    // Never relay cookies, redirects, or internal server headers from the engine.
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new Error("Invalid response");
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return error(503, "The larger-cube solver is offline. Please try again later.");
  }
}
