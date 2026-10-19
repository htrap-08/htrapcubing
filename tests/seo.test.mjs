import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalUrl,
  cachePublicHtml,
  solverMeta,
  algorithmMeta,
  sitemapXml,
  seoRedirect,
  structuredData,
  PUZZLE_IDS,
} from "../src/lib/seo.ts";
test("canonicals retain meaningful puzzle variants and remove incidental state", () => {
  assert.equal(
    canonicalUrl("/scrambledeggs/solver", { puzzle: "4x4", utm_source: "test" }),
    "https://htrap.in/scrambledeggs/solver?puzzle=4x4",
  );
  assert.equal(
    canonicalUrl("/scrambledeggs/solver", { puzzle: "invalid" }),
    "https://htrap.in/scrambledeggs/solver?puzzle=3x3",
  );
  assert.equal(
    canonicalUrl("/scrambledeggs/cool-stuff", { source: "solver" }),
    "https://htrap.in/scrambledeggs/cool-stuff",
  );
  assert.equal(canonicalUrl("/scrambledeggs/"), "https://htrap.in/scrambledeggs");
});
test("all puzzle pages have distinct titles and descriptions", () => {
  for (const factory of [solverMeta, algorithmMeta])
    for (const key of ["title", "description"]) {
      const values = PUZZLE_IDS.map(
        (id) =>
          factory(id).meta.find((m) => (key === "title" ? "title" in m : m.name === "description"))[
            key === "title" ? "title" : "content"
          ],
      );
      assert.equal(new Set(values).size, PUZZLE_IDS.length);
    }
});
test("legacy default solver and www redirect directly to the final URL", () => {
  assert.equal(
    seoRedirect(new URL("https://htrap.in/solver")),
    "https://htrap.in/scrambledeggs/solver?puzzle=3x3",
  );
  assert.equal(
    seoRedirect(new URL("https://www.htrap.in/solver?puzzle=4x4")),
    "https://htrap.in/scrambledeggs/solver?puzzle=4x4",
  );
  assert.equal(
    seoRedirect(new URL("https://htrap.in/scrambled")),
    "https://htrap.in/scrambledeggs",
  );
  assert.equal(seoRedirect(new URL("https://htrap.in/scrambledeggs/solver?puzzle=3x3")), undefined);
  assert.equal(seoRedirect(new URL("https://htrap.in/nonexistent")), undefined);
});
test("sitemap contains unique canonical URLs and no aliases", () => {
  const urls = [...sitemapXml().matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.equal(urls.length, 34);
  assert.equal(new Set(urls).size, 34);
  for (const url of urls) {
    assert.match(url, /^https:\/\/htrap.in\//);
    assert.doesNotMatch(url, /www\.|source=|utm_/);
  }
  for (const id of PUZZLE_IDS)
    assert.ok(urls.includes("https://htrap.in/scrambledeggs/solver?puzzle=" + id));
});
test("schema describes the creator, current page and visible breadcrumb", () => {
  const graph = structuredData("/scrambledeggs/algorithms", { puzzle: "4x4" })["@graph"];
  assert.equal(graph.find((g) => g["@type"] === "Person").name, "Parth Gupta");
  const list = graph.find((g) => g["@type"] === "BreadcrumbList").itemListElement;
  assert.equal(list[2].item, "https://htrap.in/scrambledeggs/algorithms?puzzle=4x4");
  assert.ok(!JSON.stringify(graph).includes("aggregateRating"));
  assert.ok(
    !structuredData("/scrambledeggs/solver", { puzzle: "4x4" })["@graph"].some(
      (g) => g["@type"] === "WebApplication",
    ),
  );
});

test('only anonymous successful public HTML gets a shared cache policy',()=>{
 const response=()=>new Response('page',{headers:{'Content-Type':'text/html'}});
 assert.match(cachePublicHtml(new Request('https://htrap.in/scrambledeggs'),response()).headers.get('cache-control'),/s-maxage=600/);
 for(const request of [new Request('https://htrap.in/api/nxn/health'),new Request('https://htrap.in/scrambledeggs',{headers:{cookie:'session=private'}}),new Request('https://htrap.in/scrambledeggs',{headers:{authorization:'private'}})])
   assert.equal(cachePublicHtml(request,response()).headers.get('cache-control'),null);
 for(const r of [new Response('error',{status:500,headers:{'Content-Type':'text/html'}}),Response.json({private:true}),new Response('page',{headers:{'Content-Type':'text/html','Set-Cookie':'session=private'}})])
   assert.equal(cachePublicHtml(new Request('https://htrap.in/scrambledeggs'),r).headers.get('cache-control'),null);
});
