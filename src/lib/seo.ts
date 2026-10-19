export const SITE_ORIGIN = "https://htrap.in";
export const PUZZLE_IDS = [
  "2x2",
  "3x3",
  "4x4",
  "5x5",
  "6x6",
  "7x7",
  "8x8",
  "9x9",
  "10x10",
  "pyraminx",
  "megaminx",
  "skewb",
  "square1",
] as const;
export type SeoPuzzle = (typeof PUZZLE_IDS)[number];
export const puzzleName = (id: string) =>
  id === "square1"
    ? "Square-1"
    : /^\d+x\d+$/.test(id)
      ? id.replace("x", "×")
      : id.charAt(0).toUpperCase() + id.slice(1);
export function canonicalPath(path: string, search: Record<string, unknown> = {}): string {
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  if (clean === "/scrambledeggs/solver") {
    const id = PUZZLE_IDS.includes(search["puzzle"] as SeoPuzzle)
      ? String(search["puzzle"])
      : "3x3";
    return `${clean}?puzzle=${id}`;
  }
  if (clean === "/scrambledeggs/algorithms" && PUZZLE_IDS.includes(search["puzzle"] as SeoPuzzle))
    return `${clean}?puzzle=${search["puzzle"]}`;
  return clean;
}
export const canonicalUrl = (path: string, search: Record<string, unknown> = {}) =>
  SITE_ORIGIN + canonicalPath(path, search);
export function seoMeta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
export function solverMeta(id: string) {
  const name = puzzleName(id);
  const large = /^\d+x\d+$/.test(id) && Number(id.split("x")[0]) >= 4;
  return seoMeta(
    `${name} Cube Solver${large ? " & Colour Editor" : " — Enter Your Colours"} | scrambled eggs`,
    large
      ? `Enter or scan ${name} colours in the 3D editor and learn reduction. Automatic big-cube solving requires a separate service; check availability before entering colours.`
      : id === "square1"
        ? "Enter your Square-1 piece colours and shape, check legal slices, and follow a solution. Learn layer and slice notation with the linked guide."
        : `Enter your ${name} puzzle colours${/^\d/.test(id) ? " or scan its faces" : ""}, then follow the solution moves. Includes orientation help and colour-entry troubleshooting.`,
  );
}
export function algorithmMeta(id?: string) {
  if (!id)
    return seoMeta(
      "Cube Move Notation & 3D Algorithms | scrambled eggs",
      "Learn U, R, F, D, L and B with interactive 3D diagrams, inverse and half turns. Choose a puzzle for its tutorial, starting cases and algorithms.",
    );
  const name = puzzleName(id);
  const details: Record<string, string> = {
    "2x2":
      "Learn corner orientation, complete first layers and last-layer permutation on the 2×2. Check the grip before using each algorithm.",
    "3x3":
      "Learn the 3×3 beginner method and explore F2L, OLL and PLL. Match each algorithm’s case, grip and expected result with interactive 3D examples.",
    "4x4":
      "Build 2×2 centres, pair the twelve wing pairs and identify 4×4 OLL or PLL parity. Finish with the shared 3×3 method after reduction.",
    "5x5":
      "Use fixed centres to orient a 5×5, build 3×3 centre blocks and pair edge triples. Diagnose unfinished wing pairing before the reduced 3×3 solve.",
    "6x6":
      "Plan the 6×6 colour scheme, build 4×4 centres and pair two wing orbits per edge. Check every four-piece edge group before reduction.",
    "7x7":
      "Use the 7×7 fixed centres, assemble 5×5 centre blocks and join two wing orbits around each middle edge. Includes reduction checkpoints.",
    "8x8":
      "Organise 6×6 centre blocks and three wing orbits on the 8×8. Track inner slice widths and protect completed edge groups during reduction.",
    "9x9":
      "Reduce the 9×9 using fixed centre anchors, 7×7 centre blocks and three wing orbits around a middle edge. Check the seven-piece edge groups.",
    "10x10":
      "Plan a 10×10 reduction: 8×8 centre blocks, four wing orbits and eight-piece edge groups. Separate pairing mistakes from reduced parity cases.",
    pyraminx:
      "Align Pyraminx tips and centres, build the first face and identify the final edge cycle. Learn main-layer versus tip notation.",
    megaminx:
      "Build a Megaminx star and matching first layer, work around the middle layers and recognise the pentagonal last-layer cases.",
    skewb:
      "Learn the Skewb grip, complete a face and recognise corner and centre cycles. Keep one notation convention throughout the beginner method.",
    square1:
      "Learn Square-1 shape restoration, colour separation and permutation. Read (a,b) turns and slash notation, and check slice seams before moving.",
  };
  return seoMeta(
    `${name} Algorithms & Solving Guide | scrambled eggs`,
    details[id] ?? "Puzzle-specific learning guide and algorithms.",
  );
}
export function breadcrumbs(path: string, search: Record<string, unknown> = {}) {
  const home = { name: "scrambled eggs", path: "/scrambledeggs" };
  const names: Record<string, string> = {
    solver: "Solver",
    algorithms: "Algorithms",
    timer: "Timer",
    "cool-stuff": "Sticker graph",
    about: "About the project",
  };
  const section = path.split("/")[2];
  if (!section || !names[section]) return [];
  const items = [home, { name: names[section]!, path: `/scrambledeggs/${section}` }];
  if (
    (section === "solver" || section === "algorithms") &&
    PUZZLE_IDS.includes(search["puzzle"] as SeoPuzzle)
  )
    items.push({ name: puzzleName(String(search["puzzle"])), path: canonicalPath(path, search) });
  return items;
}
export function structuredData(path: string, search: Record<string, unknown> = {}) {
  const url = canonicalUrl(path, search);
  const crumbs = breadcrumbs(path, search);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Person",
      "@id": SITE_ORIGIN + "/#parth",
      name: "Parth Gupta",
      url: SITE_ORIGIN + "/",
      sameAs: ["https://github.com/htrap-08", "https://www.linkedin.com/in/parth-gupta-35254035"],
    },
    {
      "@type": "WebSite",
      "@id": SITE_ORIGIN + "/#website",
      name: "Parth Gupta — Portfolio",
      url: SITE_ORIGIN + "/",
      creator: { "@id": SITE_ORIGIN + "/#parth" },
    },
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      isPartOf: { "@id": SITE_ORIGIN + "/#website" },
      author: { "@id": SITE_ORIGIN + "/#parth" },
    },
  ];
  if (
    path === "/scrambledeggs/timer" ||
    (path === "/scrambledeggs/solver" && !/^(4|5|6|7|8|9|10)x/.test(String(search["puzzle"])))
  )
    graph.push({
      "@type": "WebApplication",
      name: path.includes("timer")
        ? "scrambled eggs Speedcubing Timer"
        : `${puzzleName(String(search["puzzle"] ?? "3x3"))} Solver`,
      url,
      applicationCategory: "GameApplication",
      operatingSystem: "Web browser",
      browserRequirements: "JavaScript enabled",
      creator: { "@id": SITE_ORIGIN + "/#parth" },
    });
  if (crumbs.length)
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: SITE_ORIGIN + c.path,
      })),
    });
  return { "@context": "https://schema.org", "@graph": graph };
}
export function sitemapXml() {
  const paths = [
    "/",
    "/scrambledeggs",
    "/scrambledeggs/algorithms",
    "/scrambledeggs/timer",
    "/scrambledeggs/cool-stuff",
    "/scrambledeggs/about",
    "/privacy",
    "/legal",
    ...PUZZLE_IDS.flatMap((id) => [
      `/scrambledeggs/solver?puzzle=${id}`,
      `/scrambledeggs/algorithms?puzzle=${id}`,
    ]),
  ];
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths
      .map((p) => `<url><loc>${SITE_ORIGIN}${p.replaceAll("&", "&amp;")}</loc></url>`)
      .join("\n") +
    "\n</urlset>\n"
  );
}
/** Normalize aliases and UI-only parameters in one hop; leave unknown paths as 404s. */
export function seoRedirect(url: URL): string | undefined {
  const aliases: Record<string, string> = {
    "/scrambled": "/scrambledeggs",
    "/solver": "/scrambledeggs/solver",
    "/algorithms": "/scrambledeggs/algorithms",
    "/timer": "/scrambledeggs/timer",
    "/cool-stuff": "/scrambledeggs/cool-stuff",
  };
  const trimmed = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  const path = aliases[trimmed] ?? trimmed;
  const params = new URLSearchParams(url.search);
  if (path === "/scrambledeggs/solver") {
    if (!PUZZLE_IDS.includes(params.get("puzzle") as SeoPuzzle)) params.set("puzzle", "3x3");
  } else if (
    path === "/scrambledeggs/algorithms" &&
    params.has("puzzle") &&
    !PUZZLE_IDS.includes(params.get("puzzle") as SeoPuzzle)
  )
    params.delete("puzzle");
  const search = params.size ? "?" + params.toString() : "";
  if (url.hostname === "www.htrap.in" || path !== url.pathname || search !== url.search)
    return `${url.hostname === "www.htrap.in" ? SITE_ORIGIN : url.origin}${path}${search}`;
  return undefined;
}

/** Cache only public editorial HTML, never APIs, errors or credentialed requests. */
export function cachePublicHtml(request: Request, response: Response): Response {
  const publicPaths = ["/", "/scrambledeggs", "/scrambledeggs/algorithms", "/scrambledeggs/about", "/privacy", "/legal"];
  if (request.method === "GET" && response.status === 200 &&
      publicPaths.includes(new URL(request.url).pathname) &&
      response.headers.get("content-type")?.includes("text/html") &&
      !request.headers.has("cookie") && !request.headers.has("authorization") &&
      !response.headers.has("set-cookie")) {
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=3600");
  }
  return response;
}
