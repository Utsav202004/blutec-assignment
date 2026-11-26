"use client";

import { useEffect, useRef } from "react";
import { PAW_PATH } from "@/components/ui/PawIcon";

const COLOR = "#c2622b"; // toffee ink
const STEP = 46; // px of mouse travel between prints
const LIFE = 1000; // ms a print stays (fully visible for the first 600)
const MAX = 14;

type Print = { x: number; y: number; angle: number; born: number };

/**
 * Little paw prints that follow the mouse, as on the reference: every 46px of
 * travel a print is stamped just behind the cursor, alternating left and right
 * feet and pointing the way you moved, then fades out after a second.
 * Drawn on one full-screen canvas (no DOM nodes per print). Mouse only, and
 * off for reduced motion.
 */
export function PawTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const paw = new Path2D(PAW_PATH);
    const prints: Print[] = [];
    let dpr = 1;
    let frame = 0;
    let running = false;
    let lastX = NaN;
    let lastY = NaN;
    let travelled = 0;
    let side = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    resize();

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        const age = now - p.born;
        if (age > LIFE) {
          prints.splice(i, 1);
          continue;
        }
        const fade = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = 0.42 * fade * fade;
        ctx.setTransform(0.27 * dpr, 0, 0, 0.27 * dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = COLOR;
        ctx.fill(paw);
      }
      if (prints.length) frame = requestAnimationFrame(draw);
      else running = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (Number.isNaN(lastX)) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      travelled += Math.hypot(dx, dy);
      if (travelled >= STEP) {
        travelled = 0;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        side = -side;
        const off = 7 * side;
        prints.push({
          x: e.clientX + Math.cos(angle) * off + 14,
          y: e.clientY + Math.sin(angle) * off + 16,
          angle,
          born: performance.now(),
        });
        if (prints.length > MAX) prints.shift();
        if (!running) {
          running = true;
          frame = requestAnimationFrame(draw);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] size-full"
    />
  );
}
