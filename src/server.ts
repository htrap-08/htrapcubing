import "./lib/error-capture";
import { seoRedirect, sitemapXml } from "./lib/seo";
import { proxySolver, securityHeaders } from "./lib/server-security";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleRequest(request: Request, env: unknown, ctx: unknown) {
  try {
    const url = new URL(request.url);
    const redirect = seoRedirect(url);
    if (redirect) return Response.redirect(redirect, 301);
    const path = url.pathname;
    if (path === "/sitemap.xml")
      return new Response(sitemapXml(), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    if (path.startsWith("/api/nxn/")) {
      const configured = env as { NXN_SOLVER_URL?: string; NXN_SOLVER_TOKEN?: string } | undefined;
      return proxySolver(request, {
        base:
          configured?.NXN_SOLVER_URL ??
          process.env["NXN_SOLVER_URL"] ??
          (import.meta.env.DEV ? "http://127.0.0.1:5174" : undefined),
        token: configured?.NXN_SOLVER_TOKEN ?? process.env["NXN_SOLVER_TOKEN"],
        development: import.meta.env.DEV,
      });
    }
    const handler = await getServerEntry();
    const response = await handler.fetch(request, env, ctx);
    return await normalizeCatastrophicSsrResponse(response);
  } catch (error) {
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const response = securityHeaders(await handleRequest(request, env, ctx));
    if (new URL(request.url).pathname.startsWith("/api/")) response.headers.set("X-Robots-Tag", "noindex");
    return response;
  },
};
