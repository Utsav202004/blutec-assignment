"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { TeddyRunner } from "@/components/illustrations/TeddyRunner";
import { PAW_PATH } from "@/components/ui/PawIcon";
import {
  ARRIVED_EVENT,
  INTRO_LIFT_MS,
  NAVIGATE_EVENT,
  introElapsed,
} from "@/lib/curtain";
import { jumpTo } from "@/lib/smooth-scroll";

type CurtainState =
  "intro" | "covering" | "covered" | "snap" | "lifting" | "idle";

const COVER_MS = 300; // tp-curtain-cover duration
const LIFT_MS = 460; // tp-curtain-lift duration
const INTRO_MS = 1080; // first-load intro, until the curtain is fully up
const MIN_COVERED_MS = 140; // let Teddy be seen for a moment, even on fast pages

// Paw prints Teddy leaves across the curtain: [left %, top px, angle]
const PRINTS: [number, number, number][] = [
  [18, 6, -76],
  [27, -4, -84],
  [36, 7, -72],
  [45, -3, -86],
  [54, 6, -74],
];

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Quilt "curtain" that plays on first load and on every internal page change,
 * ported from the reference: it drops over the page while Teddy runs across,
 * and lifts once the new route has rendered.
 *
 * - Internal link clicks are intercepted so the curtain covers the page
 *   *before* navigation starts (and the route is prefetched meanwhile).
 * - A link to the page you're already on also plays it, landing at the top.
 * - Back/forward "snaps" the curtain shut at once, then lifts.
 * - `tp:navigate` / `tp:arrived` events let other parts of the page react
 *   (scroll reveals wait for `tp:arrived`, see lib/curtain.ts).
 *
 * The state lives on the element's data-state (not React state) so it can
 * change between React renders, exactly when the timers say.
 */
export function PageCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const coveredAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastPath = useRef(pathname);
  const byKeyboard = useRef(false);
  const lift = useRef<() => void>(() => {});

  useEffect(() => {
    const el = ref.current!;
    const root = document.documentElement;
    const set = (state: CurtainState) => {
      el.dataset.state = state;
      if (state === "idle") delete root.dataset.curtain;
      else root.dataset.curtain = state;
    };
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn: () => void, ms: number) =>
      timers.current.push(setTimeout(fn, ms));

    const doLift = () => {
      const state = el.dataset.state;
      if (state === "idle" || state === "lifting") return;
      clear();
      // Open the new page at the top while it's still covered (unless the
      // link pointed at a #section, or back/forward restored a position)
      const target = pending.current;
      pending.current = null;
      if (target && !target.includes("#")) jumpTo(0);
      set("lifting");
      dispatchEvent(new Event(ARRIVED_EVENT));
      if (byKeyboard.current) {
        byKeyboard.current = false;
        document.getElementById("main")?.focus({ preventScroll: true });
      }
      later(() => set("idle"), LIFT_MS);
    };
    lift.current = doLift;

    const go = (href: string) => {
      const url = new URL(href, location.href);
      if (
        url.pathname === location.pathname &&
        url.search === location.search
      ) {
        // Same page: back to the top behind the curtain, then lift
        pending.current = null;
        jumpTo(0);
        later(doLift, 120);
        return;
      }
      router.push(url.pathname + url.search + url.hash);
      later(doLift, 6000); // never leave the page covered
    };

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !a ||
        (a.target && a.target !== "_self") ||
        a.hasAttribute("download") ||
        a.dataset.noCurtain !== undefined
      )
        return;
      const url = new URL(a.href, location.href);
      if (
        url.origin !== location.origin ||
        /^\/(api|_next)(\/|$)/.test(url.pathname)
      )
        return;
      // #links and filter (query-only) changes on this page: no curtain
      const samePage = url.pathname === location.pathname;
      if (samePage && (url.hash || url.search !== location.search)) return;
      if (reduced()) return;

      e.preventDefault();
      e.stopPropagation();
      byKeyboard.current = e.detail === 0;
      router.prefetch(url.pathname + url.search);
      dispatchEvent(new Event(NAVIGATE_EVENT));
      const href = url.pathname + url.search + url.hash;
      pending.current = href;
      const state = el.dataset.state;
      if (state === "covered" || state === "snap") return go(href);
      if (state === "covering") return; // already on its way down
      clear();
      if (state === "intro" && introElapsed() < INTRO_MS) {
        // Clicked during the first-load intro: the curtain is still (mostly) down
        set("covered");
        coveredAt.current = performance.now();
        go(href);
      } else {
        set("covering");
        later(() => {
          set("covered");
          coveredAt.current = performance.now();
          if (pending.current) go(pending.current);
        }, COVER_MS);
      }
    };

    const onPopState = () => {
      if (reduced() || location.pathname === lastPath.current) return;
      clear();
      pending.current = null;
      set("snap");
      coveredAt.current = performance.now();
      later(doLift, 1400);
      // Lift as soon as the previous page has rendered
      const waitForPage = () => {
        if (lastPath.current === location.pathname)
          later(() => requestAnimationFrame(doLift), MIN_COVERED_MS);
        else later(waitForPage, 50);
      };
      later(waitForPage, 50);
    };
    // Back to a page from the browser's back/forward cache: never covered
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        clear();
        set("idle");
      }
    };

    if (el.dataset.state === "intro") {
      const elapsed = Math.min(introElapsed(), INTRO_MS);
      const t = Number.isFinite(elapsed) ? elapsed : 0;
      later(
        () => dispatchEvent(new Event(ARRIVED_EVENT)),
        Math.max(0, INTRO_LIFT_MS - t),
      );
      later(
        () => el.dataset.state === "intro" && set("idle"),
        Math.max(0, INTRO_MS - t),
      );
    }
    if (reduced()) set("idle");

    document.addEventListener("click", onClick, true);
    addEventListener("popstate", onPopState);
    addEventListener("pageshow", onPageShow);
    return () => {
      clear();
      delete root.dataset.curtain;
      document.removeEventListener("click", onClick, true);
      removeEventListener("popstate", onPopState);
      removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  // New route rendered: lift the curtain
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const state = ref.current?.dataset.state;
    if (state !== "covered" && state !== "snap" && state !== "covering") return;
    const wait =
      state === "covering"
        ? COVER_MS + 40
        : Math.max(0, MIN_COVERED_MS - (performance.now() - coveredAt.current));
    const t = setTimeout(
      () => requestAnimationFrame(() => lift.current()),
      wait,
    );
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={ref} className="tp-curtain" data-state="intro" aria-hidden="true">
      <div className="tp-curtain__blanket">
        <svg
          className="tp-curtain__edge tp-curtain__edge--top"
          width="100%"
          height="40"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="tp-curtain-scallop"
              width="76"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 40V27A38 25 0 0 1 76 27V40Z" fill="#fbe3b4" />
              <path
                d="M0 27A38 25 0 0 1 76 27"
                fill="none"
                stroke="#2a170e"
                strokeWidth="3"
              />
              <path
                d="M11 33A27 19 0 0 1 65 33"
                fill="none"
                stroke="#2a170e"
                strokeWidth="1.6"
                strokeDasharray="3.5 5.5"
                strokeLinecap="round"
                opacity=".42"
              />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
        <div className="tp-curtain__stage">
          <div className="tp-curtain__prints">
            {PRINTS.map(([left, top, angle], i) => (
              <svg
                key={i}
                viewBox="0 0 64 64"
                className="tp-curtain__print"
                style={{
                  left: `${left}%`,
                  top: `${top}px`,
                  rotate: `${angle + 90}deg`,
                  animationDelay: `${0.16 + 0.12 * i}s`,
                }}
              >
                <path d={PAW_PATH} />
              </svg>
            ))}
          </div>
          <div className="tp-curtain__runner">
            <TeddyRunner />
          </div>
          <p className="tp-curtain__note font-scrawl">every puppy is family</p>
        </div>
        <svg
          className="tp-curtain__edge tp-curtain__edge--bottom"
          width="100%"
          height="40"
          preserveAspectRatio="none"
        >
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
      </div>
    </div>
  );
}
