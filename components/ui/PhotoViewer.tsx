"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Media } from "@/lib/puppies";
import { spring } from "@/lib/spring";

/** Width the full-size photo is shown at: the screen, minus the controls */
const fitWidth = (m: Media) =>
  Math.ceil(
    Math.min(innerWidth, Math.max(1, innerHeight - 150) * (m.width / m.height)),
  );

/**
 * Full-screen photo viewer on a native <dialog>, matching the reference:
 *
 * - Esc, the Close button or a click on the backdrop closes it, and focus is
 *   trapped inside.
 * - Arrow keys, Previous/Next and swiping (or dragging with the mouse) move
 *   between photos. The new photo springs in from the side you're heading to
 *   while the old one swings out the other way.
 * - Each photo first shows the copy already loaded on the page, then the
 *   sharp full-size one fades in over it; the neighbours are preloaded.
 *
 * Controlled by the parent via `index` (null = closed).
 */
export function PhotoViewer({
  photos,
  index,
  onChange,
  onClose,
  pageSizes = "50vw",
  label = "Photo viewer",
}: {
  photos: Media[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
  /** The `sizes` the photos have on the page, so their loaded copy is reused */
  pageSizes?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const count = photos.length;

  // Direction of travel (1 = next, -1 = previous) and the photo on its way out
  const [dir, setDir] = useState(1);
  const [shown, setShown] = useState(index);
  const [leaving, setLeaving] = useState<{ i: number; dir: number } | null>(
    null,
  );
  if (index !== shown) {
    setShown(index);
    const animate =
      shown !== null &&
      index !== null &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLeaving(animate ? { i: shown, dir } : null);
  }

  const step = (by: number) => {
    if (index === null) return;
    setDir(by);
    onChange((index + by + count) % count);
  };

  // Keep the dialog in sync with `index`
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setDir(1);
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open) {
      if (d.open) d.close();
      document.documentElement.style.overflow = ""; // always unlock page scroll
    }
  }, [open]);

  const stepRef = useRef(step);
  const closeRef = useRef(onClose);
  useEffect(() => {
    stepRef.current = step;
    closeRef.current = onClose;
  });
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") stepRef.current(1);
      if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    const onDialogClose = () => {
      document.documentElement.style.overflow = "";
      closeRef.current();
    };
    // Esc fires "cancel" right away; route it through React state so the
    // dialog closes and page scroll unlocks in one place
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    d.addEventListener("cancel", onCancel);
    d.addEventListener("close", onDialogClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("close", onDialogClose);
    };
  }, []);

  // Slide: the new photo springs in, the old one swings out (0.22s)
  useLayoutEffect(() => {
    if (!leaving) return;
    const d = leaving.dir;
    const { easing, duration } = spring(300, 26);
    currentRef.current?.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${70 * d}px) rotate(${5 * d}deg) scale(0.92)`,
        },
        { opacity: 1, transform: "none" },
      ],
      { duration, easing },
    );
    const out = leavingRef.current?.animate(
      [
        {
          opacity: 1,
          transform: getComputedStyle(leavingRef.current).transform,
        },
        {
          opacity: 0,
          transform: `translateX(${-70 * d}px) rotate(${-5 * d}deg) scale(0.92)`,
        },
      ],
      { duration: 220, easing: "ease-out", fill: "forwards" },
    );
    if (!out) return;
    const done = () => setLeaving(null);
    out.finished.then(done, () => {});
    // Even if the animation can't run (e.g. a background tab)
    const fallback = setTimeout(done, 300);
    return () => {
      clearTimeout(fallback);
      out.cancel();
    };
  }, [leaving]);

  // Drag to swipe: the photo follows the pointer (with some give), and a pull
  // of more than 80px moves to the next or previous photo
  const drag = useRef<{ id: number; x: number; dx: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || leaving) return;
    drag.current = { id: e.pointerId, x: e.clientX, dx: 0 };
    stageRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId || !currentRef.current) return;
    g.dx = e.clientX - g.x;
    currentRef.current.style.transform = `translateX(${(g.dx * 0.6).toFixed(1)}px)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g || g.id !== e.pointerId) return;
    drag.current = null;
    const el = currentRef.current;
    if (g.dx < -80 || g.dx > 80) {
      step(g.dx < 0 ? 1 : -1); // the leaving photo starts from where it was let go
      return;
    }
    if (!el) return;
    const from = el.style.transform;
    el.style.transform = "";
    if (from) {
      const { easing, duration } = spring(300, 26);
      el.animate([{ transform: from }, { transform: "none" }], {
        duration,
        easing,
      });
    }
  };

  const photo = shown !== null ? photos[shown] : null;
  const neighbours =
    shown !== null && count > 1
      ? [...new Set([(shown - 1 + count) % count, (shown + 1) % count])]
      : [];

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-lenis-prevent=""
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
    >
      {photo && shown !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {shown + 1} / {count}
              {photo.caption ? ` — ${photo.caption}` : ""}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-11 shrink-0 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>
          <div
            ref={stageRef}
            className="relative flex-1 touch-pan-y overflow-hidden select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {leaving && (
              <div
                ref={leavingRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                <Slide media={photos[leaving.i]} pageSizes={pageSizes} />
              </div>
            )}
            <div ref={currentRef} key={photo.src} className="absolute inset-0">
              <Slide media={photo} pageSizes={pageSizes} />
            </div>
            <span aria-hidden="true" className="sr-only">
              {neighbours.map((n) => (
                <Image
                  key={photos[n].src}
                  src={photos[n].src}
                  alt=""
                  fill
                  sizes={`${fitWidth(photos[n])}px`}
                  loading="eager"
                />
              ))}
            </span>
          </div>
          {count > 1 && (
            <div className="flex justify-center gap-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => step(-1)}
                className="h-12 rounded-full border-2 border-milk px-6 font-semibold"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/** One photo: the copy already loaded on the page, then the sharp one over it */
function Slide({ media, pageSizes }: { media: Media; pageSizes: string }) {
  const [sharp, setSharp] = useState(false);
  return (
    <>
      <Image
        src={media.src}
        alt=""
        fill
        sizes={pageSizes}
        loading="eager"
        draggable={false}
        className={
          sharp ? "tp-viewer__first tp-viewer__first--done" : "tp-viewer__first"
        }
        style={{ objectFit: "contain" }}
      />
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={`${fitWidth(media)}px`}
        loading="eager"
        draggable={false}
        className="tp-viewer__sharp object-contain"
        data-sharp={sharp || undefined}
        onLoad={(e) => {
          e.currentTarget
            .decode()
            .catch(() => {})
            .then(() => setSharp(true));
        }}
      />
    </>
  );
}
