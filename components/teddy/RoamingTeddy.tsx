"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  teddyPoses,
  type TeddyPose,
} from "@/components/illustrations/teddy-poses";
import { TeddyRunnerParts } from "@/components/illustrations/TeddyRunner";
import { measureJourney, placeAt, type Journey } from "@/lib/teddy-journey";
import { TEDDY_CUE, type TeddyCue } from "@/lib/teddy-cue";
import { GESTURE_MS, floatHearts, pickTrick } from "@/lib/teddy-tricks";

type Mode = "pose" | "walk" | "stand" | "hop";
type Look = { mode: Mode; pose: TeddyPose; facing: 1 | -1; beat: number };

const PAW =
  "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z";
const PRINTS = 24; // recycled pool of paw-print elements

/**
 * The roaming Teddy. On pages with two or more Teddy stops (the home page),
 * a single Teddy in a fixed layer walks from stop to stop as you scroll,
 * using the geometry in lib/teddy-journey.ts:
 *   - at a stop he takes that stop's pose (and the static Teddy there hides);
 *   - between stops he walks (or hops out from behind the quilt/basket),
 *     faces the way he's going and leaves fading paw prints;
 *   - if you stop scrolling mid-way he stands and asks "coming?";
 *   - in the pinned door hallway he walks on the spot while the doors slide;
 *   - sections get data-here / data-visited, which the hero (photos sink once
 *     he's gone) and the front door (opens when he arrives) react to.
 * On phones he peeks up from alternating screen edges instead. Disabled for
 * prefers-reduced-motion, where the static Teddys stay.
 */
export function RoamingTeddy() {
  const pathname = usePathname();
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleAtRef = useRef<HTMLDivElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const sayRef = useRef<(text: string, secs?: number) => void>(() => {});
  const trickRef = useRef<() => void>(() => {});
  const [look, setLook] = useState<Look>({
    mode: "pose",
    pose: "peek",
    facing: 1,
    beat: 0,
  });
  const [bubble, setBubble] = useState({ text: "", show: false });

  useEffect(() => {
    const layer = layerRef.current!;
    const actor = actorRef.current!;
    const body = bodyRef.current!;
    const bubbleAt = bubbleAtRef.current!;
    const printsBox = printsRef.current!;
    const html = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let journey: Journey | null = null;
    let frame = 0;
    let measureTimer: ReturnType<typeof setTimeout> | undefined;
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    let running = false;

    // Per-frame state
    let lastT = 0;
    let prev: { x: number; y: number; scroll: number } | null = null;
    let heldK = -1;
    let idle = 0;
    let askedComing = false;
    let walked = 0;
    let lastStep = -1;
    let printIdx = 0;
    let treadLeft: number | null = null;
    let treadIdle = 0;
    let current: Look = { mode: "pose", pose: "peek", facing: 1, beat: 0 };
    let lastPlace: { x: number; y: number; s: number } | null = null;
    let lastScrollAt = 0;
    let lastScrollY = scrollY;
    let nextHabitAt = 0; // next idle gesture at the current stop
    const sceneState = new Map<HTMLElement, string>();

    const show = (next: Partial<Look>, bump = false) => {
      const merged = {
        ...current,
        ...next,
        beat: bump ? current.beat + 1 : current.beat,
      };
      if (
        merged.mode === current.mode &&
        merged.pose === current.pose &&
        merged.facing === current.facing &&
        !bump
      )
        return;
      current = merged;
      setLook(merged);
    };

    const say = (text: string, secs = 1.6) => {
      clearTimeout(bubbleTimer);
      setBubble({ text, show: true });
      bubbleTimer = setTimeout(
        () => setBubble((b) => ({ ...b, show: false })),
        secs * 1000,
      );
    };
    sayRef.current = say;

    // ---- Gestures -------------------------------------------------------
    // Played by setting data-gesture on the actor; the CSS in roaming.css
    // animates the named parts of the drawing (head, eyes, mouth, tail…).
    let gestureTimer: ReturnType<typeof setTimeout> | undefined;
    let gestureUntil = 0;
    const gesture = (name: string) => {
      clearTimeout(gestureTimer);
      delete actor.dataset.gesture;
      void actor.offsetWidth; // restart the CSS animation if it's the same gesture again
      actor.dataset.gesture = name;
      const ms = GESTURE_MS[name] ?? 1000;
      gestureUntil = performance.now() / 1000 + ms / 1000;
      gestureTimer = setTimeout(() => delete actor.dataset.gesture, ms);
    };

    /** A few hearts float up from Teddy's head */
    const hearts = () => {
      if (!lastPlace) return;
      const p = lastPlace;
      floatHearts(
        layer,
        p.x + (current.facing > 0 ? 212 : 88) * p.s,
        p.y + 50 * p.s,
      );
    };

    /** Tap: a random trick (shared with the static Teddys) */
    const trick = () => {
      const t = pickTrick();
      // Give the trick room: no habit (yawn, tilt…) for a moment afterwards
      nextHabitAt = Math.max(nextHabitAt, performance.now() / 1000 + 3);
      if (t.gesture) gesture(t.gesture);
      if (t.hearts) hearts();
      if (t.sayDelay) setTimeout(() => say(t.say, 1.1), t.sayDelay);
      else say(t.say, 1.3);
    };
    trickRef.current = trick;

    // Looking at things: Teddy turns towards the mouse while it moves, and
    // towards links/buttons that get keyboard focus or are cued by the page
    let pointer: { x: number; t: number } | null = null;
    let lookAt: { el: Element; until: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse")
        pointer = { x: e.clientX, t: performance.now() / 1000 };
    };
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        t.matches("a, button, input, textarea, select, summary")
      )
        lookAt = { el: t, until: performance.now() / 1000 + 1.4 };
    };
    // Cues from page sections, e.g. the WhatsApp chat ("ooh, photos!")
    const onCue = (e: Event) => {
      const { say: text, near, secs } = (e as CustomEvent<TeddyCue>).detail;
      if (!journey || heldK < 0) return;
      const scene = journey.stops[heldK]?.scene;
      if (!scene || (near && !scene.contains(near))) return;
      if (near)
        lookAt = { el: near, until: performance.now() / 1000 + (secs ?? 1.6) };
      if (text) say(text);
    };
    const onPet = (on: boolean) => () => {
      if (on) actor.dataset.pet = "";
      else delete actor.dataset.pet;
    };
    const petOn = onPet(true);
    const petOff = onPet(false);

    const laneBottom = () => {
      const bar = document.querySelector<HTMLElement>("[data-whatsapp-bar]");
      const r = bar?.getClientRects().length
        ? bar.getBoundingClientRect()
        : null;
      return r && r.height ? r.top : innerHeight - 6;
    };

    const prints = () => [...printsBox.children] as SVGElement[];

    const dropPrint = (fx: number, fy: number, angle: number, size: number) => {
      const el = prints()[printIdx++ % PRINTS];
      if (!el) return;
      el.style.width = el.style.height = `${size.toFixed(1)}px`;
      el.style.transform = `translate(${(fx - size / 2).toFixed(1)}px, ${(fy - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
      el.animate(
        [
          { opacity: 0 },
          { opacity: 0.45, offset: 0.08 },
          { opacity: 0.45, offset: 0.5 },
          { opacity: 0 },
        ],
        { duration: 2600, easing: "ease-out" },
      );
    };

    /** Mark which section Teddy is in, and which he has already passed */
    const markScenes = (k: number, t: number, holding: boolean) => {
      journey?.stops.forEach((st, i) => {
        if (!st.scene) return;
        const here = String(holding && i === k);
        const visited = String(i <= k || (i === k + 1 && t > 0.92));
        const key = here + visited;
        if (sceneState.get(st.scene) === key) return;
        sceneState.set(st.scene, key);
        st.scene.dataset.here = here;
        st.scene.dataset.visited = visited;
      });
    };

    // Runs every animation frame, and on scroll too (so he keeps up even when
    // the browser throttles animation frames, e.g. in background tabs)
    const tick = (nowMs: number) => {
      frame = requestAnimationFrame(tick);
      update(nowMs);
    };
    const onScroll = () => update(performance.now());

    const update = (nowMs: number) => {
      if (!journey) return;
      const now = nowMs / 1000;
      const dt = Math.min(0.05, now - lastT || 0.016);
      lastT = now;
      const scroll = scrollY;

      const p = placeAt(journey, scroll, laneBottom());
      const holding = p.t === 0;
      const stop = journey.stops[p.k];
      lastPlace = p;
      if (Math.abs(scroll - lastScrollY) > 0.5) lastScrollAt = now;
      lastScrollY = scroll;

      actor.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0)`;
      body.style.transform = `scale(${p.s.toFixed(4)})`;
      layer.dataset.front = String(!p.behind && !(holding && stop.behind));
      const bx = p.x + (current.facing > 0 ? 0.72 : 0.28) * 300 * p.s;
      bubbleAt.style.transform = `translate3d(${bx.toFixed(1)}px, ${(p.y + 0.16 * 240 * p.s).toFixed(1)}px, 0)`;

      if (holding) {
        if (heldK !== p.k) {
          heldK = p.k;
          treadLeft = null;
          askedComing = false;
          lookAt = null;
          nextHabitAt =
            now + (stop.act === "tilt" ? 1.2 : stop.act === "basket" ? 2.4 : 9);
          show({ mode: "pose", pose: stop.pose, facing: stop.facing }, true);
        }

        if (current.mode === "pose" && now > gestureUntil) {
          // Habits: head tilts in the night sky, yawns and wiggles in the basket,
          // and elsewhere a tilt or a wiggle after ~9s without scrolling
          if (now >= nextHabitAt) {
            if (stop.act === "tilt") {
              gesture("tilt");
              nextHabitAt = now + 3.4;
            } else if (stop.act === "basket") {
              gesture(Math.random() < 0.7 ? "jolt" : "yawn");
              nextHabitAt = now + 4.5 + Math.random() * 3;
            } else if (now - lastScrollAt > 9) {
              gesture(Math.random() < 0.55 ? "tilt" : "jolt");
              nextHabitAt = now + 9;
            } else {
              nextHabitAt = lastScrollAt + 9;
            }
          }

          // Glance (eyes only, like the reference) towards the pointer or a
          // focused/cued element; he doesn't turn his body
          if (lookAt && lookAt.until < now) lookAt = null;
          let targetX: number | null = null;
          if (lookAt) {
            const r = lookAt.el.getBoundingClientRect();
            targetX = r.left + r.width / 2;
          } else if (pointer && now - pointer.t < 2.5) targetX = pointer.x;
          const centre = p.x + 212 * p.s;
          const glance =
            targetX === null
              ? 0
              : Math.max(-1, Math.min(1, (targetX - centre) / 400));
          // Drawn coordinates are mirrored when he faces left
          const lookX = (glance * current.facing).toFixed(2);
          if (actor.style.getPropertyValue("--look-x") !== lookX)
            actor.style.setProperty("--look-x", lookX);
        }
        // Door hallway: walk on the spot while the doors slide past
        if (stop.treadmill) {
          const left = stop.treadmill.getBoundingClientRect().left;
          const moved = treadLeft === null ? 0 : left - treadLeft;
          treadLeft = left;
          if (Math.abs(moved) > 0.15) {
            treadIdle = 0;
            show({ mode: "walk", facing: moved < 0 ? 1 : -1 });
          } else if ((treadIdle += dt) > 0.25 && current.mode === "walk") {
            show({ mode: "stand" });
          }
        }
      } else {
        heldK = -1;
        if (prev) {
          const dx = p.x - prev.x;
          const dyPage = p.y + scroll - (prev.y + prev.scroll);
          const moved = Math.hypot(dx, dyPage);
          if (moved > 0.25) {
            idle = 0;
            askedComing = false;
          } else idle += dt;

          const mode: Mode = p.airborne ? "hop" : idle > 0.3 ? "stand" : "walk";
          const facing =
            Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(dyPage)
              ? ((dx > 0 ? 1 : -1) as 1 | -1)
              : current.facing;
          show({ mode, facing });
          if (idle > 2.6 && !askedComing) {
            askedComing = true;
            say("coming?");
          }

          // Paw prints every ~34 "Teddy pixels" walked (desktop only)
          walked += moved;
          const step = Math.floor(walked / (34 * p.s));
          if (!journey.lane && !p.airborne && step !== lastStep && moved > 0) {
            const odd = step & 1;
            const along = odd ? 186 : 110;
            const fx = p.x + (current.facing > 0 ? along : 300 - along) * p.s;
            const fy = p.y + scroll + 226 * p.s + (odd ? -4 : 4) * p.s;
            dropPrint(
              fx,
              fy,
              Math.atan2(dyPage, dx) + Math.PI / 2,
              14 * Math.max(0.75, 1.5 * p.s),
            );
          }
          lastStep = step;
        }
      }
      prev = { x: p.x, y: p.y, scroll };
      markScenes(p.k, p.t, holding);
    };

    // The paw-print layer covers the page so prints can sit in page
    // coordinates. Collapse it before reading the page height so it never
    // counts itself (otherwise it could only ever grow), and collapse it
    // again whenever Teddy stops, e.g. after navigating away from Home,
    // so it can't leave empty scroll space on other pages.
    const sizePrints = () => {
      printsBox.style.height = "0px";
      printsBox.style.height = `${document.documentElement.scrollHeight}px`;
    };
    const clearPrints = () => {
      printsBox.style.height = "0px";
      prints().forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    };

    const measure = () => {
      const j = measureJourney();
      if (j.stops.length < 2) return stop();
      journey = j;
      html.dataset.pup = j.lane ? "lane" : "live";
      sizePrints();
    };

    const start = () => {
      if (running || reduce.matches) return;
      const j = measureJourney();
      if (j.stops.length < 2) return;
      running = true;
      journey = j;
      html.dataset.pup = j.lane ? "lane" : "live";
      sizePrints();
      layer.hidden = false;
      prev = null;
      heldK = -1;
      // Hero intro: Teddy pops up with a "peekaboo!"
      const first = placeAt(j, scrollY, laneBottom());
      if (first.k === 0 && first.t === 0 && j.stops[0].act === "peekaboo") {
        setTimeout(() => say("peekaboo!"), 700);
      }
      frame = requestAnimationFrame(tick);
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("pointermove", onPointerMove, { passive: true });
      addEventListener("focusin", onFocusIn);
      addEventListener(TEDDY_CUE, onCue);
      body.addEventListener("pointerenter", petOn);
      body.addEventListener("pointerleave", petOff);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("focusin", onFocusIn);
      removeEventListener(TEDDY_CUE, onCue);
      body.removeEventListener("pointerenter", petOn);
      body.removeEventListener("pointerleave", petOff);
      clearTimeout(gestureTimer);
      delete actor.dataset.gesture;
      delete actor.dataset.pet;
      clearPrints();
      layer.hidden = true;
      delete html.dataset.pup;
      journey?.stops.forEach((st) => {
        if (st.scene) {
          delete st.scene.dataset.here;
          delete st.scene.dataset.visited;
        }
      });
      sceneState.clear();
      journey = null;
    };

    // Re-measure (debounced) whenever layout can change
    const remeasure = () => {
      clearTimeout(measureTimer);
      measureTimer = setTimeout(() => (running ? measure() : start()), 120);
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    document.fonts?.ready.then(remeasure);
    const onMotion = () => (reduce.matches ? stop() : start());
    reduce.addEventListener("change", onMotion);

    // Wait a frame so sections (e.g. the pinned hallway) have their final size,
    // then re-check shortly after in case late layout (pinning, fonts, images)
    // wasn't reported yet
    const boot = requestAnimationFrame(() => start());
    const settle = [600, 1600].map((ms) => setTimeout(remeasure, ms));

    return () => {
      cancelAnimationFrame(boot);
      settle.forEach(clearTimeout);
      clearTimeout(measureTimer);
      clearTimeout(bubbleTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      reduce.removeEventListener("change", onMotion);
      stop();
    };
  }, [pathname]);

  const art: ReactNode =
    look.mode === "pose" ? teddyPoses[look.pose] : <TeddyRunnerParts />;

  return (
    <>
      <div ref={printsRef} aria-hidden="true" className="pup-prints">
        {Array.from({ length: PRINTS }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={PAW} />
          </svg>
        ))}
      </div>
      <div
        ref={layerRef}
        className="pup-layer"
        data-front="true"
        hidden
        aria-hidden="true"
      >
        <div
          ref={actorRef}
          className="pup-actor"
          data-gait={look.mode}
          data-pose={look.pose}
        >
          <div
            ref={bodyRef}
            className="pup-actor__body"
            onClick={() => trickRef.current()}
          >
            <svg
              viewBox="0 0 300 240"
              focusable="false"
              className={look.mode !== "pose" ? "tp-runner" : undefined}
            >
              <g key={look.beat} className="pup-actor__pose">
                {look.facing < 0 ? (
                  <g transform="translate(300 0) scale(-1 1)">{art}</g>
                ) : (
                  art
                )}
              </g>
            </svg>
          </div>
        </div>
        <div ref={bubbleAtRef} className="pup-bubble-at">
          <span className="pup-bubble" data-show={bubble.show}>
            {bubble.text}
          </span>
        </div>
      </div>
    </>
  );
}
