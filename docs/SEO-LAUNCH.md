# SEO implementation and launch — 19 October 2026

## Implemented

- `/scrambled` permanently redirects to `/scrambledeggs`. Legacy solver links redirect directly to the default 3×3 URL. The www host redirects to the non-www host. Meaningful puzzle variants keep distinct canonical URLs; tracking and graph handoff parameters are excluded from canonicals.
- `/sitemap.xml` lists 34 canonical pages. robots.txt declares it. The sitemap does not invent modification dates or contain redirects, personal cube states or timer sessions.
- Puzzle-specific titles, descriptions, H1s and social metadata; one canonical per page; Person/WebSite/WebPage and visible BreadcrumbList data. Working browser tools also have descriptive WebApplication data. No invented reviews, ratings or credentials.
- API responses and downloadable font/licence files carry noindex headers; useful Privacy and Licences pages stay indexable.
- Visible breadcrumbs, an About page, tutorial bylines, references and contextual links between solver, guide, timer, graph and privacy pages.
- Availability disclosure above the big-cube editor; homepage copy no longer promises an available 4×4–10×10 solving service. Editors remain available.
- Shared outer-layer finishing material is consolidated into the 3×3 guide. Larger-cube pages include size-specific centre/edge checkpoints. 4×4 keeps its parity sequences, with the PLL sequence corrected to the linked source's wide-U turns and checked on a mock cube.
- More useful colour-entry, invalid-state, camera, privacy, timer-average, storage and sticker-permutation explanations. Constructed 2×2/3×3 starting-state examples use the inverse of the displayed sequence; they do not claim to cover every case.
- Public editorial HTML gets a ten-minute shared CDN cache, with stale-while-revalidate. Credentialed requests, errors, API responses and solver state pages are excluded.
- Inter regular was subset for this English site: 108,416 → 30,464 bytes. Versioned critical fonts have long immutable caching; images get a one-day browser cache. Removed blanket font preloading on the portfolio. Cube icons below the first two are lazy-loaded with explicit dimensions. Existing SVG diagrams were retained rather than converted to raster images.

## Checks

- Local production crawl: all 34 sitemap URLs returned 200, each with one H1, a matching canonical, a unique title and valid JSON-LD syntax. This is not Google's rich-result eligibility test or proof of indexing.
- 50 JavaScript tests passed, including SEO/redirect and algorithm regression checks. TypeScript and production build passed.
- Phone viewport: solver and tutorial pages had no horizontal overflow. The constructed 3×3 example loaded and played.
- Mobile Lighthouse baseline of the existing live cubing homepage: performance 99/100, LCP 1.813 s, CLS 0, TBT 0 ms. The first deployed follow-up measured 74/100, LCP 3.861 s, CLS 0, TBT 0 ms, with substantially longer document and asset waits. Selective CDN caching was then added; a second measurement is recorded below. These runs were not simultaneous and network/server conditions differed, so they are not a controlled causal comparison. A single lab run is not real-user Core Web Vitals or a guarantee of ranking changes.

## Search Console: owner action still needed

The owner confirmed Search Console is not set up. There is no verified property or Google account access for this task; a sitemap has not been submitted through that account.

1. Open https://search.google.com/search-console/ and sign in to the Google account that should own the site.
2. Add a **Domain** property for `htrap.in` (no scheme or path).
3. Copy the exact Google-generated TXT record. In the DNS provider that currently hosts the domain's nameservers, add that TXT value at the root (`@`). Do not remove or replace existing DNS records. A GoDaddy registration does not by itself establish where DNS is hosted.
4. Return to Search Console and verify after the record becomes visible. Keep the verification TXT record in place.
5. In Sitemaps, submit `https://htrap.in/sitemap.xml`.
6. Inspect `/scrambledeggs`, `/scrambledeggs/solver?puzzle=3x3`, `/scrambledeggs/algorithms?puzzle=3x3` and the sticker-graph page. Request indexing for a few important URLs, not every query-string combination.
7. Check indexing/canonical selections after Google crawls them. Search Console's Core Web Vitals report needs sufficient real-user data; an empty report is not a pass or a failure.

Official verification instructions: https://support.google.com/webmasters/answer/9008080 . Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap .

Bing Webmaster Tools can import a verified Search Console property: https://www.bing.com/webmasters/ . Account access/verification and submission are not completed here. No deprecated sitemap-ping endpoint was used and no search ranking is promised.

## Promotion prepared, not sent

No emails, forum posts or publication submissions were sent. Use a genuinely useful demo and identify the project creator; do not buy links, invent testimonials or imply endorsements.

- SpeedSolving resources / software community: https://www.speedsolving.com/pages/resources/ . Offer the scanner, timer and graph as a tool for feedback; disclose unavailable big-cube solving.
- TheCubicle blog: https://www.thecubicle.com/blogs/thecubicle-blogs . Propose a practical tutorial or learning-tool demonstration, not a request for an arbitrary backlink.
- Hackaday cube coverage: https://hackaday.com/tag/rubiks-cube/ . Pitch a reproducible explanation of sticker permutations and the browser visualisation. Acceptance and authority scores are unverified.

Draft for owner review:

> I’m Parth, the creator of scrambled eggs, a browser-based cubing project at https://htrap.in/scrambledeggs. It includes colour entry/scanning, move demonstrations, a practice timer and a synchronized cube/sticker-permutation visualisation. I’ve documented its limitations and sources. If it would be useful for your readers/community, I’d welcome feedback on the demonstration or a collaboration on a practical tutorial. Automatic big-cube solving is not currently available.

## Next review

After verification, use actual Search Console queries/impressions to select the next tutorials. Complete case-specific diagrams and worked solves with a knowledgeable human reviewer; the new example states are illustrative, not a full case catalogue. Broader puzzle tutorials remain expandable and cannot honestly be called exhaustive. Restore and test the separate big-cube backend before promoting automatic solving. Review indexing, broken links, solver availability and real-user performance periodically; no recurring monitoring was configured.

## Deployed verification and lab measurements

Production crawl passed for all 34 sitemap URLs after deployment. `www.htrap.in/solver` returned a direct 301 to the canonical 3×3 solver. The versioned Inter response advertised immutable one-year caching and noindex; repeat anonymous homepage requests returned `x-vercel-cache: HIT`. The phone number was absent from both the live HTML and the rendered contact list. GitHub CI passed the implementation commit.

| Mobile Lighthouse run | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Baseline, 18 October | 99 | 1.813 s | 0 | 0 ms |
| Initial deployment, 19 October | 74 | 3.861 s | 0 | 0 ms |
| With public-page CDN caching, 19 October | 87 | 2.495 s | 0 | 0 ms |

These are single Lighthouse lab runs on different deployments/times, not a controlled experiment or field Core Web Vitals. The final performance score remains below the baseline, so no overall speed improvement is claimed. Speed Index was particularly variable (2.484 / 7.849 / 9.305 s); the final run's filmstrip showed blank early captures despite recorded paint metrics. A representative multi-device/multi-region measurement is still needed before diagnosing that as a user-visible delay. The directly verified improvements are reduced font transfer size, long-lived font caching and shared CDN hits for eligible public pages. All 51 JavaScript tests passed after the cache guard was added; the type check and production build also passed.
