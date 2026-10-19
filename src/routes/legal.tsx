import { seoMeta } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const Route = createFileRoute("/legal")({
  head: () =>
    seoMeta(
      "Licences & Project Information | scrambled eggs",
      "Software licences, tutorial attribution, project independence and limitations for scrambled eggs. Find source links and copyright contact information.",
    ),
  component: Legal,
});
function Legal() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <main className="legal-copy">
        <h1>Licences & information</h1>
        <p>
          scrambled eggs is an independent puzzle-tools project by Parth. It is not affiliated with
          or endorsed by Spin Master, the Rubik's brand, the World Cube Association, or the authors
          of linked tutorials.
        </p>
        <h2>Using these tools</h2>
        <p>
          Solutions, colour detection and timing tools can contain errors. Check that your entered
          colours match your puzzle and inspect moves before applying them. Never force a blocked
          puzzle turn. Timer results are personal practice records, not certified competition
          results. Tools may be unavailable and no perfect result is promised. Nothing on this page
          overrides rights you have under applicable law.
        </p>
        <h2>Open-source software</h2>
        <ul>
          <li>
            cubejs 1.3.2, copyright Petri Lehtinen and Ludovic Fernandez, under the{" "}
            <a href="/licenses/cubejs-MIT.txt">MIT licence</a>. The vendored module was adapted for
            ES modules. <a href="https://github.com/ldez/cubejs/tree/v1.3.2">Original source</a>;{" "}
            <a href="https://github.com/htrap-08/htrapcubing/tree/main/src/vendor/cubejs">
              adapted source
            </a>
            .
          </li>
          <li>
            cubing.js 0.63.7: original library code is used under{" "}
            <a href="/licenses/cubing-MPL-2.0.txt">MPL 2.0</a>.{" "}
            <a href="https://github.com/cubing/cubing.js/tree/65d4360d9775e6ecc19fe4a089e8a45369de06d3">
              Corresponding source, including upstream vendored notices
            </a>{" "}
            and{" "}
            <a href="https://github.com/cubing/cubing.js/archive/65d4360d9775e6ecc19fe4a089e8a45369de06d3.tar.gz">
              source archive
            </a>
            . Original library files have not been intentionally modified. Upstream vendored
            components retain their respective terms; the{" "}
            <a href="/licenses/cubing-vendor-cstimer-GPL-3.0.txt">upstream csTimer licence</a> is
            also provided.
          </li>
          <li>
            Square-1 uses Twips, with an adapter, under{" "}
            <a href="/square1/LICENSE-MPL.md">MPL 2.0</a>.{" "}
            <a href="/square1/NOTICE.txt">Source and modification notice</a>,{" "}
            <a href="/square1/THIRD_PARTY_NOTICES.txt">dependency notices</a>, and{" "}
            <a href="https://github.com/htrap-08/htrapcubing/tree/main/solver/square1">
              source patch and build instructions
            </a>
            .
          </li>
          <li>
            Additional installed runtime dependency notices are available in{" "}
            <a href="/licenses/runtime-dependencies.txt">the third-party notice collection</a>.
            Package-specific licences govern those components, not this entire application.
          </li>
        </ul>
        <h2>Fonts</h2>
        <p>
          Fonts are distributed with their SIL Open Font License notices:{" "}
          <a href="/fonts/inter-OFL.txt">Inter</a>,{" "}
          <a href="/fonts/spacegrotesk-OFL.txt">Space Grotesk</a>,{" "}
          <a href="/fonts/sour-gummy-OFL.txt">Sour Gummy</a>,{" "}
          <a href="/fonts/jetbrainsmono-OFL.txt">JetBrains Mono</a>,{" "}
          <a href="/fonts/jockeyone-OFL.txt">Jockey One</a> and{" "}
          <a href="/fonts/krona-one-OFL.txt">Krona One</a>.
        </p>
        <h2>Research and visual experiments</h2>
        <p>
          Move sequences describe puzzle methods. Linked sources explain particular cases and
          orientations. The sticker atlas in Cool stuff is independently coded using sticker
          permutations and circle intersections, with inspiration from{" "}
          <a href="https://sael.net/cube-graph/">Ryan Sael's Cube Graph</a>. Its source code and
          video are not distributed by this site; this credit does not claim endorsement or
          permission from the reference author.
        </p>
        <h2>Reporting a concern</h2>
        <p>
          For private copyright or licence enquiries, email{" "}
          <a href="mailto:parthg08@gmail.com">parthg08@gmail.com</a>. Use the{" "}
          <a href="https://github.com/htrap-08/htrapcubing/issues">project issue tracker</a> for
          non-sensitive licence, attribution or content concerns. Do not post confidential documents
          or personal information in public issues.
        </p>
      </main>
      <SiteFooter compact />
    </div>
  );
}
