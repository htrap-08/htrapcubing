import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  routeRules: {
    "/licenses/**": { headers: { "x-robots-tag": "noindex" } },
    "/fonts/**": { headers: { "x-robots-tag": "noindex" } },
    "/fonts/inter-regular-latin-v1.woff2": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/fonts/spacegrotesk-bold-v1.woff2": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/fonts/sour-gummy-bold-v1.woff2": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/images/**": { headers: { "cache-control": "public, max-age=86400" } },
  },
});
