/**
 * Spring physics as a CSS easing, so the Web Animations API can play the same
 * springs the reference gets from Framer Motion (e.g. stiffness 260, damping 26).
 *
 * The spring's motion from 0 to 1 is sampled into a CSS `linear()` easing, and
 * the duration is how long it takes to settle. Browsers without `linear()`
 * get a close cubic-bezier with a little overshoot.
 */
const cache = new Map<string, { easing: string; duration: number }>();

export function spring(stiffness: number, damping: number, mass = 1) {
  const key = `${stiffness}/${damping}/${mass}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const at = (t: number) => {
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return (
        1 -
        Math.exp(-zeta * w0 * t) *
          (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
      );
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t); // critically damped
  };

  // Settled once it stays within 0.1% of the target
  let duration = 0.1;
  for (let t = 2; t > 0; t -= 0.01) {
    if (Math.abs(1 - at(t)) > 0.001) {
      duration = t + 0.01;
      break;
    }
  }

  let easing = "cubic-bezier(0.2, 0.9, 0.3, 1.08)";
  if (
    typeof CSS !== "undefined" &&
    CSS.supports("animation-timing-function", "linear(0, 1)")
  ) {
    const steps = 40;
    const points = Array.from({ length: steps + 1 }, (_, i) =>
      i === steps ? "1" : at((i / steps) * duration).toFixed(4),
    );
    easing = `linear(${points.join(", ")})`;
  }
  const result = { easing, duration: Math.round(duration * 1000) };
  cache.set(key, result);
  return result;
}
