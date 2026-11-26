/**
 * Shared state for the page-change curtain (components/layout/PageCurtain.tsx).
 *
 * - `tp:navigate` fires when an internal link starts a page change.
 * - `tp:arrived` fires the moment the curtain starts lifting off the new page.
 *
 * Reveal animations use these to wait until the page is actually visible, so
 * they play as the curtain lifts instead of behind it (as on the reference).
 */
export const NAVIGATE_EVENT = "tp:navigate";
export const ARRIVED_EVENT = "tp:arrived";

/** Lift starts this long into the first-load intro (see curtain.css) */
export const INTRO_LIFT_MS = 560;

/** How far the first-load intro has played, in ms (Infinity once it's over) */
export function introElapsed() {
  const anim = document
    .querySelector(".tp-curtain")
    ?.getAnimations()
    .find((a) => (a as CSSAnimation).animationName === "tp-curtain-rest");
  return anim &&
    anim.playState !== "finished" &&
    typeof anim.currentTime === "number"
    ? anim.currentTime
    : Infinity;
}

/** True while the curtain hides the page */
export function curtainDown() {
  const state =
    document.querySelector<HTMLElement>(".tp-curtain")?.dataset.state;
  return (
    (state === "intro" && introElapsed() < INTRO_LIFT_MS) ||
    state === "covering" ||
    state === "covered" ||
    state === "snap"
  );
}
