import { useEffect, useRef } from "react";

const contacts = [
  { text: "parthg08@gmail.com", href: "mailto:parthg08@gmail.com" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/parth-gupta-35254035" },
  { text: "GitHub", href: "https://github.com/htrap-08" },
];

/** The viewport holds the contact links while scroll scrubs their staggered glide. */
export function PortfolioContact() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lines = element.querySelectorAll<HTMLElement>(".glide-contact-line");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const distance = bounds.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, distance)));
      lines.forEach((line, index) => {
        const step = Math.max(0, Math.min(1, (progress - index * 0.12) / 0.76));
        line.style.setProperty("--glide-progress", String(1 - Math.pow(1 - step, 3)));
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
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
