"use client";

import { useEffect, useRef } from "react";

/**
 * Bookmark ribbon down the side of a puppy's "storybook" page that fills up
 * as you scroll through it (progress from the article top at 30% of the
 * viewport to its end), like the reference.
 */
export function StoryRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = ref.current?.parentElement;
    if (!article || !band.current) return;
    const update = () => {
      const r = article.getBoundingClientRect();
      const start = window.innerHeight * 0.3;
      const total = r.height - window.innerHeight + start;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, total)));
      band.current!.style.transform = `scaleY(${p})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="tp-ribbon">
      <div className="tp-ribbon__track">
        <span
          ref={band}
          className="tp-ribbon__band"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
    </div>
  );
}
