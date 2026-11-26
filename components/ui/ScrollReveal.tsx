"use client";

import { useEffect } from "react";
import { ARRIVED_EVENT, curtainDown } from "@/lib/curtain";

/**
 * Scroll-in reveal for every `[data-reveal]` element inside `scope`, ported
 * from the reference's RevealScope. The animations themselves live in CSS,
 * keyed off two attributes:
 *
 * - `data-armed`: hidden, waiting to animate in
 * - `data-revealed`: shown (animates if it was armed)
 *
 * Rules:
 * - Already on screen when the page is visible: shown at once, no animation.
 * - On screen but the page curtain is still down (first load or a page
 *   change): armed, then revealed the moment the curtain starts lifting, so
 *   the animation plays as the page appears instead of behind the curtain.
 * - Below the fold: armed, revealed when 8% of it scrolls into view.
 * - Elements added later (e.g. puppy cards after a filter change) follow the
 *   same rules.
 * - Reduced motion: everything is simply shown.
 *
 * Renders nothing, so it doesn't add wrappers that could affect layout.
 */
export function ScrollReveal({ scope }: { scope: string }) {
  useEffect(() => {
    const roots = [...document.querySelectorAll<HTMLElement>(scope)];
    if (!roots.length) return;
    const pending = (root: HTMLElement) =>
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const showAll = () =>
        roots.forEach((r) =>
          pending(r).forEach((el) => (el.dataset.revealed = "true")),
        );
      showAll();
      const mo = new MutationObserver(showAll);
      roots.forEach((r) => mo.observe(r, { childList: true, subtree: true }));
      return () => mo.disconnect();
    }

    const queued = new Set<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      el.dataset.revealed = "true";
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (curtainDown()) queued.add(el);
          else reveal(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    const arm = (el: HTMLElement) => {
      if (el.dataset.armed) return io.observe(el);
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && !curtainDown()) {
        el.dataset.revealed = "true";
        return;
      }
      el.dataset.armed = "true";
      io.observe(el);
    };
    const scan = () => roots.forEach((r) => pending(r).forEach(arm));
    scan();
    const mo = new MutationObserver(scan);
    roots.forEach((r) => mo.observe(r, { childList: true, subtree: true }));

    const flush = () => {
      queued.forEach(reveal);
      queued.clear();
    };
    addEventListener(ARRIVED_EVENT, flush);
    // Safety net in case the arrival event was missed
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if (curtainDown()) timer = setTimeout(check, 400);
      else flush();
    };
    timer = setTimeout(check, 1600);

    return () => {
      clearTimeout(timer);
      io.disconnect();
      mo.disconnect();
      removeEventListener(ARRIVED_EVENT, flush);
    };
  }, [scope]);

  return null;
}
