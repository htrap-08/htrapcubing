# Vercel deployment

The Vite configuration uses Nitro’s Vercel preset. Deploy this project with Vercel’s TanStack Start framework detection and `npm run build`. Do not use `npm run dev` as a production command.

Add `htrap.in` and `www.htrap.in` in the Vercel project’s Settings → Domains. Keep GoDaddy as the DNS provider and copy the exact A/CNAME records Vercel displays into GoDaddy’s DNS management page. Preserve unrelated MX and TXT records. Choose one hostname as the primary domain and redirect the other to it. Vercel provisions HTTPS after DNS verification.

## Larger cube solver

2×2, 3×3, Pyraminx, Skewb and Megaminx solve in the browser. Physical-colour solving for 4×4–10×10 requires the separate Python/C service documented in solver/README.md, with persistent lookup-table storage. Its local tables are excluded from deployment.

Set the server-side Vercel environment variable `NXN_SOLVER_URL` to the reachable base URL of that hosted service, then redeploy. Never use localhost or 127.0.0.1 here: those refer to the Vercel function itself. Until this service is hosted, larger-cube physical-colour solving reports that the server is unavailable.
