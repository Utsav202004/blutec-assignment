/**
 * Geometry for the roaming Teddy.
 *
 * The page contains static Teddy "stops" (`.pup-stop[data-pup-stop]`). One
 * roaming Teddy visits them in order as you scroll:
 *   - every stop gets a scroll range (a "hold") during which Teddy sits at
 *     that stop in its pose;
 *   - between two holds he travels from one stop to the next, with progress
 *     tied to the scroll position, and stays on screen while doing so.
 *
 * Coordinates: a stop's `x` is the viewport x of its 300x240 SVG box; its
 * vertical position depends on the "track" (page-anchored, pinned inside a
 * sticky section, or fixed to the screen on phones). Teddy's feet sit at
 * (150, 228) inside that box, scaled by `s`.
 *
 * Modelled on the reference site's behaviour; the implementation is our own.
 */
import type { TeddyPose } from "@/components/illustrations/teddy-poses";

export const FEET = { x: 150, y: 228 };
/** Visible bounds of each pose inside the 300x240 box: [left, top, right, bottom] */
const POSE_BOX: Record<TeddyPose, [number, number, number, number]> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
const WALK_BOX: [number, number, number, number] = [48, 30, 288, 236];
/** On phones Teddy peeks up from the bottom edge; this is the pose's chin line */
const PEEK_LINE = 159;

type Track =
  | { kind: "page"; top: number }
  | { kind: "pin"; top: number; from: number; to: number }
  | { kind: "screen"; top: number };

export type Stop = {
  x: number;
  track: Track;
  s: number;
  pose: TeddyPose;
  facing: 1 | -1;
  act: string;
  /** Sits behind something (hero quilt, footer basket) */
  behind: boolean;
  /** Phone "lane" stop that dips below the screen edge between scenes */
  sink: boolean;
  scene: HTMLElement | null;
  /** Element whose horizontal movement means "walk on the spot" (door hallway) */
  treadmill: HTMLElement | null;
};

export type Journey = {
  lane: boolean;
  stops: Stop[];
  holds: [number, number][];
  bounds: { left: number; top: number; right: number; bottom: number };
};

export type Place = {
  x: number;
  y: number;
  s: number;
  /** Index of the current (or departing) stop */
  k: number;
  /** 0 while holding at stop k, otherwise travel progress towards k + 1 */
  t: number;
  airborne: boolean;
  behind: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Soft clamps: ease into a limit instead of hitting it (softplus) */
const softMin = (v: number, lo: number, k: number) => {
  const z = (v - lo) / k;
  return z > 20 ? v : lo + k * Math.log1p(Math.exp(z));
};
const softMax = (v: number, hi: number, k: number) => -softMin(-v, -hi, k);

/** Viewport y of a stop's box top at a given scroll position */
function trackY(track: Track, scroll: number) {
  if (track.kind === "screen") return track.top;
  if (track.kind === "page") return track.top - scroll;
  if (scroll < track.from) return track.top - (scroll - track.from);
  if (scroll > track.to) return track.top - (scroll - track.to);
  return track.top;
}

/** Work out how a stop moves: with the page, or pinned inside a sticky ancestor */
function trackFor(el: HTMLElement, rect: DOMRect): Track {
  let sticky: HTMLElement | null = null;
  for (
    let p = el.parentElement;
    p && p !== document.body;
    p = p.parentElement
  ) {
    if (getComputedStyle(p).position === "sticky") {
      sticky = p;
      break;
    }
  }
  if (!sticky) return { kind: "page", top: rect.top + scrollY };

  const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const offset = rect.top - sticky.getBoundingClientRect().top;
  // Measure where the sticky element would sit if it weren't stuck
  const prev = sticky.style.position;
  sticky.style.position = "relative";
  const natural = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const parentBottom =
    parent.getBoundingClientRect().bottom -
    (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = prev;

  const from = natural.top + scrollY - stickyTop;
  const to = parentBottom + scrollY - natural.height - stickyTop;
  return to <= from
    ? { kind: "page", top: natural.top + scrollY + offset }
    : { kind: "pin", top: stickyTop + offset, from, to };
}

export function measureJourney(): Journey {
  const lane = matchMedia(
    "(max-width: 767px), (pointer: coarse) and (max-height: 519px)",
  ).matches;
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  const header = document.getElementById("site-header")?.offsetHeight ?? 76;
  const bar = document.querySelector<HTMLElement>("[data-whatsapp-bar]");
  const barH = bar?.getClientRects().length
    ? bar.getBoundingClientRect().height
    : 0;
  const bounds = {
    left: 10,
    top: header + 10,
    right: vw - 10,
    bottom: vh - 10 - barH,
  };
  const H = bounds.bottom - bounds.top;
  // Band of the screen in which a stop is "the current one"
  const band = lane ? [0.6, 0.86] : [0.42, 0.78];

  const stops: Stop[] = [];
  const ranges: [number, number][] = [];

  const addStop = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = (el.dataset.pose as TeddyPose) || "sit";
    const scene = el.closest<HTMLElement>("[data-pup-scene]");
    const treadmill =
      scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null;
    const stop: Stop = {
      x: rect.left,
      track: trackFor(el, rect),
      s: rect.width / 300,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act: el.dataset.act ?? (treadmill ? "treadmill" : ""),
      behind: el.dataset.behind === "true",
      sink: false,
      scene,
      treadmill,
    };
    stops.push(stop);

    if (stop.track.kind === "pin") {
      ranges.push([stop.track.from, stop.track.to]);
      return;
    }
    const box = POSE_BOX[pose];
    const top = stop.track.top;
    const boxTop = top + box[1] * stop.s;
    const boxBottom = top + box[3] * stop.s;
    const mid = (boxTop + boxBottom) / 2;
    let lo = mid - (bounds.top + band[1] * H);
    let hi = mid - (bounds.top + band[0] * H);
    // ...but only while Teddy is fully on screen
    lo = Math.max(lo, boxBottom - bounds.bottom);
    hi = Math.min(hi, boxTop - bounds.top);
    if (lo > hi) lo = hi = mid - (bounds.top + H / 2);

    // Desktop: leave a stop once its section has scrolled up near the top of
    // the screen, so stops that sit close together near the end of the page
    // still each get their moment (as on the reference).
    if (!lane && scene && stop.act !== "basket" && stop.act !== "peekaboo") {
      const leaveBy = scene.getBoundingClientRect().top + scrollY - bounds.top + 0.08 * H;
      const firstFullyVisible = boxBottom - bounds.bottom;
      if (hi > leaveBy) {
        const end = Math.max(leaveBy, firstFullyVisible + 0.12 * H);
        lo = Math.max(firstFullyVisible, end - Math.max(hi - lo, 0.2 * H));
        hi = end;
      }
    }
    ranges.push([lo, hi]);
  };

  const all = [
    ...document.querySelectorAll<HTMLElement>("[data-pup-stop]"),
  ].filter((el) => el.getClientRects().length > 0);

  if (!lane) {
    all.forEach(addStop);
  } else {
    // Phones: start and end at the "lane" stops (hero, footer basket); in
    // between, Teddy peeks up from alternating screen edges in each section.
    const laneStops = all.filter((el) => el.dataset.lane === "true");
    const first = laneStops[0];
    const last =
      laneStops.length > 1 ? laneStops[laneStops.length - 1] : undefined;
    if (first) addStop(first);
    const firstScene = stops[0]?.scene ?? null;
    const scenes = [
      ...document.querySelectorAll<HTMLElement>("#main [data-pup-scene]"),
    ].filter((sc) => sc !== firstScene && sc.getClientRects().length > 0);
    const s = Math.min(0.62, Math.max(0.5, vw / 650));
    const box = POSE_BOX.peek;
    scenes.forEach((scene, i) => {
      const fromLeft = i % 2 === 0;
      stops.push({
        x: fromLeft
          ? bounds.left + 2 - box[0] * s
          : bounds.right - 2 - box[2] * s,
        track: { kind: "screen", top: 0 }, // set every frame from the bottom bar
        s,
        pose: "peek",
        facing: fromLeft ? 1 : -1,
        act: "lane",
        behind: false,
        sink: true,
        scene,
        treadmill: null,
      });
      const r = scene.getBoundingClientRect();
      const lo = r.top + scrollY - 0.42 * vh;
      const hi = r.bottom + scrollY - 0.58 * vh;
      ranges.push(lo <= hi ? [lo, hi] : [(lo + hi) / 2, (lo + hi) / 2]);
    });
    if (last) addStop(last);
  }

  // Travel needs scroll room proportional to the distance between stops
  const gaps = stops.slice(1).map((b, i) => {
    const a = stops[i];
    const dx = Math.abs(b.x + FEET.x * b.s - (a.x + FEET.x * a.s));
    return Math.min(
      1.4 * vh,
      Math.max(
        (lane ? 0.32 : 0.5) * vh,
        1.15 * Math.hypot(dx, (band[1] - band[0]) * vh),
      ),
    );
  });
  const maxScroll = document.documentElement.scrollHeight - vh;
  return { lane, stops, holds: resolveHolds(ranges, gaps, maxScroll, 0.1 * vh), bounds };
}

/** Make holds ordered and non-overlapping, leaving each travel its needed gap */
function resolveHolds(
  ranges: [number, number][],
  gaps: number[],
  maxScroll: number,
  minHold: number,
) {
  // How much of a hold may be given up for travel: every stop keeps at least
  // `minHold` of scroll (if it had that much), so Teddy never just walks past
  const spare = (r: [number, number]) =>
    Math.max(0, r[1] - r[0] - Math.min(minHold, r[1] - r[0]));
  const h = ranges.map(
    ([a, b]) =>
      (a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]) as [number, number],
  );
  if (!h.length) return h;
  h[0][0] = -Infinity;
  const last = h[h.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);

  for (let i = 0; i < h.length - 1; i++) {
    const a = h[i];
    const b = h[i + 1];
    if (b[0] < a[1]) {
      const mid = (a[1] + b[0]) / 2;
      a[1] = Math.max(a[0], mid);
      b[0] = Math.min(b[1], mid);
      if (b[0] < a[1]) b[0] = a[1];
    }
    let need = (gaps[i] ?? 0) - (b[0] - a[1]);
    if (need > 0) {
      // Take the missing room half from each hold, then from whichever has
      // some spare left; if that's still not enough, the walk is just quicker
      const fromA = Math.min(need / 2, spare(a));
      const fromB = Math.min(need / 2, spare(b));
      a[1] -= fromA;
      b[0] += fromB;
      need -= fromA + fromB;
      const moreB = Math.min(need, spare(b));
      b[0] += moreB;
      need -= moreB;
      if (need > 0) a[1] -= Math.min(need, spare(a));
    }
  }
  for (const r of h) if (r[1] < r[0]) r[1] = r[0];

  // Safety net: the last stop must be reachable before the page ends. Pull
  // the tail of the route back, compressing travel gaps (never below a
  // short minimum) so every hold stays in order.
  let limit = maxScroll - 1;
  for (let i = h.length - 1; i >= 0 && h[i][0] > limit; i--) {
    const shift = h[i][0] - limit;
    h[i][0] -= shift;
    if (Number.isFinite(h[i][1])) h[i][1] = Math.max(h[i][0], h[i][1] - shift);
    limit = h[i][0] - Math.min(gaps[i - 1] ?? 0, 0.3 * (maxScroll / Math.max(1, h.length)));
    if (i > 0 && h[i - 1][1] > limit) h[i - 1][1] = Math.max(h[i - 1][0], limit);
  }
  return h;
}

/** Which stop/segment a scroll position falls in */
export function segmentAt(holds: [number, number][], scroll: number) {
  if (!holds.length || scroll <= holds[0][1]) return { k: 0, t: 0 };
  for (let i = 0; i < holds.length - 1; i++) {
    const end = holds[i][1];
    const nextStart = holds[i + 1][0];
    if (scroll < nextStart)
      return {
        k: i,
        t: clamp01((scroll - end) / Math.max(1, nextStart - end)),
      };
    if (scroll <= holds[i + 1][1]) return { k: i + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

/** Teddy's box position (viewport) for a scroll position */
export function placeAt(j: Journey, scroll: number, laneBottom: number): Place {
  if (j.lane) {
    for (const st of j.stops)
      if (st.track.kind === "screen")
        st.track.top = laneBottom - PEEK_LINE * st.s;
  }
  const { k, t } = segmentAt(j.holds, scroll);
  const a = j.stops[k];
  const ax = a.x;
  const ay = trackY(a.track, scroll);
  if (t <= 0 || k >= j.stops.length - 1) {
    return { x: ax, y: ay, s: a.s, k, t: 0, airborne: false, behind: a.behind };
  }

  const b = j.stops[k + 1];
  const bx = b.x;
  const by = trackY(b.track, scroll);
  const u = smooth(t);
  const s = lerp(a.s, b.s, u);
  let x = lerp(ax, bx, u);
  let y = lerp(ay, by, u);

  // Hop out from behind the quilt/basket, and dip below the edge between lane stops
  const airborne = (a.behind && t < 0.36) || (b.behind && t > 0.64);
  if (airborne)
    y -= Math.sin(Math.PI * (a.behind ? t / 0.36 : (1 - t) / 0.36)) * 70 * s;
  if (a.sink && b.sink) y += Math.sin(Math.PI * t) * (240 - PEEK_LINE + 60) * s;

  // Keep the whole of Teddy on screen while walking between far-apart stops
  if (!(a.sink && b.sink)) {
    const [l, top, r, bottom] = WALK_BOX;
    const B = j.bounds;
    const left = (FEET.x - l) * s;
    const right = (r - FEET.x) * s;
    const up = (FEET.y - top) * s;
    const down = (bottom - FEET.y) * s;
    let fx = x + FEET.x * s;
    let fy = y + FEET.y * s;
    fx =
      B.right - B.left > left + right
        ? softMax(softMin(fx, B.left + left, 8), B.right - right, 8)
        : (B.left + B.right) / 2;
    fy =
      B.bottom - B.top > up + down
        ? softMax(softMin(fy, B.top + up, 8), B.bottom - down, 8)
        : B.bottom - down;
    x = fx - FEET.x * s;
    y = fy - FEET.y * s;
  }

  return {
    x,
    y,
    s,
    k,
    t,
    airborne,
    behind: (a.behind && t < 0.36) || (b.behind && t > 0.64),
  };
}
