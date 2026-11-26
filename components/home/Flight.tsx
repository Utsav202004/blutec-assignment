"use client";

import { useEffect, useId, useRef } from "react";

const ROUTE = "M40 250 C 170 40, 470 20, 620 168";
const PORTHOLE_SRC =
  "/_next/image?url=%2Fassets%2Fmedia%2FgAaGwoGej2g6.jpg&w=128&q=75";

/**
 * Korea → Dubai flight. Scroll-linked like the reference: as the panel moves
 * from 95% down the screen (its top) to 25% (its bottom), the plane travels the
 * whole dotted route, banking to follow the curve, and fades in as it takes
 * off. With reduced motion it simply sits part-way along the route.
 */
export function Flight({ label }: { label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const clipId = useId();

  useEffect(() => {
    const box = boxRef.current;
    const route = routeRef.current;
    const plane = planeRef.current;
    if (!box || !route || !plane) return;

    const place = (progress: number) => {
      const len = route.getTotalLength();
      const at = Math.min(len, Math.max(0, progress * len));
      const p = route.getPointAtLength(at);
      const ahead = route.getPointAtLength(Math.min(len, at + 1));
      const behind = route.getPointAtLength(Math.max(0, at - 1));
      const angle =
        (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      plane.setAttribute(
        "transform",
        `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`,
      );
      plane.style.opacity = String(
        Math.min(1, Math.max(0, (progress - 0.11) / 0.06)),
      );
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(0.62);
      return;
    }

    // Scroll progress: 0 when the box's top is at 95% of the viewport,
    // 1 when its bottom reaches 25%
    const update = () => {
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = r.top - 0.95 * vh;
      const end = r.bottom - 0.25 * vh;
      place(Math.min(1, Math.max(0, start / (start - end))));
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
    <div ref={boxRef} className="tp-flight">
      <svg viewBox="0 0 660 300" role="img" aria-label={label}>
        <defs>
          <clipPath id={clipId}>
            <circle r="25" />
          </clipPath>
        </defs>
        <path ref={routeRef} d={ROUTE} className="tp-flight__route" />
        <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
        <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
        <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
          Korea
        </text>
        <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
          Dubai
        </text>
        <g ref={planeRef} transform="translate(410 70)">
          <g transform="translate(-126 -78)">
            <path
              d="M28 60 L8 26 L34 26 L60 54 Z"
              className="tp-flight__wing"
            />
            <path
              d="M108 112 L142 156 L172 156 L158 112 Z"
              className="tp-flight__wing tp-flight__wing--far"
            />
            <path
              d="M20 80 C20 52 52 44 80 44 L168 44 C200 44 224 60 232 80 C224 100 200 112 168 112 L80 112 C52 112 20 104 20 80 Z"
              className="tp-flight__body"
            />
            <path
              d="M104 44 L138 2 L168 2 L154 44 Z"
              className="tp-flight__wing"
            />
            <path
              d="M206 64 C215 67 221 73 224 80"
              className="tp-flight__line"
            />
          </g>
          <g transform="translate(10 2)">
            <image
              href={PORTHOLE_SRC}
              x="-25"
              y="-25"
              width="50"
              height="50"
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle r="25" className="tp-flight__porthole" />
          </g>
        </g>
      </svg>
    </div>
  );
}
