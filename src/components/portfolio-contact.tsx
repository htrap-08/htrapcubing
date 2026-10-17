import { useEffect, useRef } from "react";

const contacts = [
  { text: "parthg08@gmail.com", href: "mailto:parthg08@gmail.com" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/parth-gupta-35254035" },
  { text: "GitHub", href: "https://github.com/htrap-08" },
];

/** The first scroll into view starts one complete, independent Glide playback. */
export function PortfolioContact() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.classList.add("is-ready");
    let frame = 0;
    const check = () => {
      frame = 0;
      const bounds = element.querySelector(".glide-contact-links")?.getBoundingClientRect();
      if (!bounds || bounds.top > window.innerHeight * 0.9 || bounds.bottom < 0) return;
      element.classList.add("is-playing");
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={section} className="glide-contact" aria-labelledby="portfolio-contact-title">
      <div className="glide-contact-stage">
        <h2 id="portfolio-contact-title" className="portfolio-eyebrow">
          Get in touch
        </h2>
        <div className="glide-contact-links">
          {contacts.map((contact) => (
            <a
              key={contact.href}
              href={contact.href}
              className="glide-contact-line"
              {...(contact.href.startsWith("https:")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="glide-contact-word">
                {contact.text}
                <span className="glide-contact-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
