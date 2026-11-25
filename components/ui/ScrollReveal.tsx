"use client";

import { useEffect } from "react";

/**
 * Scroll-in reveal for any element marked `data-reveal` inside `scope`.
 * Elements get `data-armed` once JS runs (so without JS everything stays
 * visible), then `data-revealed` when they enter the viewport. The actual
 * animation lives in CSS, keyed off those two attributes, as on the reference.
 * Renders nothing, so it doesn't add wrapper elements that could affect layout.
 */
export function ScrollReveal({ scope, threshold = 0.2 }: { scope: string; threshold?: number }) {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(`${scope} [data-reveal]`);
    if (!items.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { threshold },
    );
    items.forEach((el) => {
      // Already on screen at load? Reveal straight away, no flash.
      el.setAttribute("data-armed", "");
      io.observe(el);
    });
    return () => io.disconnect();
  }, [scope, threshold]);

  return null;
}
