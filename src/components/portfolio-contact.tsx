import { useEffect, useRef, type CSSProperties } from "react";

const contacts = [
  { text: "parthg08@gmail.com", href: "mailto:parthg08@gmail.com" },
  { text: "LinkedIn", href: "https://www.linkedin.com/in/parth-gupta-35254035" },
  { text: "GitHub", href: "https://github.com/htrap-08" },
];

/** A staggered horizontal text glide that settles into usable contact links. */
export function PortfolioContact() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} className="glide-contact" aria-labelledby="portfolio-contact-title">
      <h2 id="portfolio-contact-title" className="portfolio-eyebrow">
        Get in touch
      </h2>
      <div className="glide-contact-links">
        {contacts.map((contact, index) => (
          <a
            key={contact.href}
            href={contact.href}
            className="glide-contact-line"
            {...(contact.href.startsWith("https:")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            style={{ "--glide-delay": `${index * 160}ms` } as CSSProperties}
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
    </section>
  );
}
