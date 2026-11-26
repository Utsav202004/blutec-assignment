"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { NAVIGATE_EVENT } from "@/lib/curtain";
import { glideTo, setLenis } from "@/lib/smooth-scroll";

/**
 * Smooth, slightly weighted wheel scrolling with Lenis, as on the reference
 * (lerp 0.1, wheel ×0.85). Only for mouse/trackpad users who haven't asked
 * for reduced motion; touch scrolling stays native. Dialogs and anything
 * marked `data-lenis-prevent` scroll natively, and nothing scrolls while
 * the page is locked (overflow: hidden, e.g. under the curtain or a menu).
 *
 * Also makes same-page #links glide to their section.
 */
export function SmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.detail === 0 ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[href*='#']",
      );
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        url.hash.length < 2
      )
        return;
      const id = decodeURIComponent(url.hash.slice(1));
      const target = [
        ...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`),
      ].find((el) => el.getClientRects().length);
      if (!target) return;
      e.preventDefault();
      glideTo(target);
      history.pushState(history.state, "", url.hash);
    };
    addEventListener("click", onClick);
    return () => removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const root = document.documentElement;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      virtualScroll: () => getComputedStyle(root).overflowY !== "hidden",
    });
    setLenis(lenis);
    // Leaving a page or going back: drop any glide that's still running
    const settle = () =>
      lenis.scrollTo(lenis.actualScroll, { immediate: true, force: true });
    addEventListener(NAVIGATE_EVENT, settle);
    addEventListener("popstate", settle);
    return () => {
      removeEventListener(NAVIGATE_EVENT, settle);
      removeEventListener("popstate", settle);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
