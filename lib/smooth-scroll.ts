import type Lenis from "lenis";

/** The page's Lenis instance while smooth scrolling is on (fine pointers only) */
let lenis: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  lenis = next;
}

/** Jump straight to a scroll position, cancelling any smooth scroll under way */
export function jumpTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, left: 0, behavior: "instant" });
}

/** Glide to an element (a #section link) */
export function glideTo(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el);
  else
    el.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
