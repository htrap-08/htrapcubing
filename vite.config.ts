// Shared build preset: provides routing, React, styles and server bundling.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { worker: { format: "es" } },
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
