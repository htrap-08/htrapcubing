import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — scrambled eggs" }] }),
  component: Privacy,
});
function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader compact />
      <main className="legal-copy">
        <h1>Privacy</h1>
        <p>
          Updated 12 October 2026. htrap.in is Parth’s portfolio. It also hosts scrambled eggs, a
          puzzle-tools project operated by Parth.
        </p>
        <h2>Camera scanning</h2>
        <p>
          Scanning requests camera permission, without microphone access. Video frames are sampled
          and colours are classified in your browser. We do not upload camera images or record
          video. Camera tracks stop when you leave the scanner. You can revoke permission in your
          browser settings.
        </p>
        <h2>Cube solving</h2>
        <p>
          Small-cube and other puzzle solvers run in your browser. Solving a 4×4–10×10 cube sends
          its size and entered colours to the configured solver service through this website. If
          that service is unavailable, solving cannot complete. Camera images are not part of that
          request.
        </p>
        <h2>Information saved on your device</h2>
        <p>
          Your theme preference and up to 200 timer results are stored in local browser storage.
          Your 3×3 colours, detected scan colours and solution are saved in tab session storage so
          that you can visit Cool stuff and return. Session storage normally lasts for the tab
          session; browser session restoration may retain it. Clear this site's browser data to
          remove all saved information. Clearing data also removes your timer history and
          preferences.
        </p>
        <h2>Hosting and analytics</h2>
        <p>
          Vercel hosts the website and provides aggregated Web Analytics. Its documentation
          describes cookieless analytics, including page paths, referrer, approximate location,
          device and browser information. We remove query strings and fragments from analytics page
          URLs and do not deliberately send camera frames, cube colours or timer results as
          analytics events. Hosting and solver infrastructure may also process request metadata such
          as IP addresses for delivery, security and diagnostics.
        </p>
        <p>
          Vercel controls its service retention settings and policies; this site does not promise
          that infrastructure logs are immediately deleted. See{" "}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            rel="noreferrer"
            target="_blank"
          >
            Vercel Analytics privacy information
          </a>{" "}
          and{" "}
          <a href="https://vercel.com/legal/privacy-policy" rel="noreferrer" target="_blank">
            Vercel's privacy policy
          </a>
          .
        </p>
        <h2>External links</h2>
        <p>
          External guides and source-code links have their own privacy practices. The app has no
          account-registration or payment form and does not ask you to supply personal details.
        </p>
        <h2>Questions and changes</h2>
        <p>
          General, non-sensitive questions can be raised in the{" "}
          <a href="https://github.com/htrap-08/htrapcubing/issues" target="_blank" rel="noreferrer">
            project issue tracker
          </a>
          . Issues are public: do not post private information, camera images or credentials there.
          For private privacy enquiries, email{" "}
          <a href="mailto:parthg08@gmail.com">parthg08@gmail.com</a>. This notice will be updated
          when processing or contact arrangements change.
        </p>
      </main>
      <SiteFooter compact />
    </div>
  );
}
