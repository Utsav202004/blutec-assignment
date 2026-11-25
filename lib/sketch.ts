/**
 * Hand-drawn "sketch" shapes for the puppy cards. Each card gets a wobbly
 * watercolour wash, a wobbly photo mask, an ink outline with a partial
 * re-trace stroke, and a couple of doodles (paw, heart, sparkle…). Shapes are
 * generated from a seed (the puppy's slug), so every card looks different but
 * renders identically on the server and the client.
 */

/** Small, fast seeded PRNG (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

type Pt = [number, number];
const f = (n: number) => n.toFixed(2);

/** Points around a circle (centre 50,50) whose radius wobbles smoothly */
function wobblyPoints(
  rand: () => number,
  radius: number,
  wobble: number,
  steps = 40,
  from = 0,
  sweep = 360,
): Pt[] {
  // Sum of a few low-frequency sines gives a soft, hand-drawn wobble
  const waves = [2, 3, 5].map((k) => ({
    k,
    amp: ((wobble * (0.4 + rand() * 0.6)) / k) * 2,
    ph: rand() * Math.PI * 2,
  }));
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + (sweep * i) / steps) * Math.PI) / 180;
    const r =
      radius + waves.reduce((s, w) => s + w.amp * Math.sin(w.k * a + w.ph), 0);
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  return pts;
}

/** Smooth path through points (Catmull-Rom converted to cubic Béziers) */
function smoothPath(pts: Pt[], closed: boolean) {
  const p = closed ? pts.slice(0, -1) : pts;
  const n = p.length;
  const at = (i: number) =>
    closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}

export type DoodleKind =
  "dots" | "sparkle" | "heart" | "swirl" | "zoom" | "paw";
export type Doodle = {
  kind: DoodleKind;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  color: string;
};

export type Sketch = {
  wash: string;
  washShift: string;
  mask: string;
  line: string;
  retrace: string;
  doodles: Doodle[];
  tilt: number;
};

const washes = ["#f2be6b", "#bfddf5", "#f9cdbf", "#fbe3b4"];
const inks = ["#c2622b", "#a24a1a", "#d4893f", "#2a170e"];
const kinds: DoodleKind[] = [
  "dots",
  "sparkle",
  "heart",
  "swirl",
  "zoom",
  "paw",
];

export function makeSketch(seed: string): Sketch & { washColor: string } {
  const rand = rng(hash(seed));
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];

  // Doodles sit just outside the outline, at random spots around it
  const doodles: Doodle[] = Array.from(
    { length: 2 + Math.floor(rand() * 2) },
    () => {
      const a = rand() * Math.PI * 2;
      const r = 52 + rand() * 6;
      return {
        kind: pick(kinds),
        x: 50 + r * Math.cos(a),
        y: 50 + r * Math.sin(a),
        rotate: Math.round(-16 + rand() * 32),
        scale: 0.85 + rand() * 0.27,
        color: pick(inks),
      };
    },
  );

  const retraceFrom = 90 + rand() * 60;
  return {
    wash: smoothPath(wobblyPoints(rand, 47, 3.2), true),
    washShift: `${f(-5 + rand() * 6)}% ${f(4 + rand() * 3)}%`,
    washColor: pick(washes),
    mask: smoothPath(wobblyPoints(rand, 45.5, 2.6), true),
    // Slightly more than a full turn, like a pen overshooting its start
    line: smoothPath(wobblyPoints(rand, 48.5, 2.2, 42, 0, 378), false),
    retrace: smoothPath(
      wobblyPoints(rand, 49.5, 2.4, 14, retraceFrom, 115),
      false,
    ),
    doodles,
    tilt: Number((-0.9 + rand() * 1.8).toFixed(2)),
  };
}

/** SVG data URL used as a CSS mask so the photo takes the wobbly shape */
export function maskUrl(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
