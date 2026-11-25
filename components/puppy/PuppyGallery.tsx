"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { focal, type Media } from "@/lib/puppies";

/** Image shown for a media item (videos use their poster frame) */
const still = (m: Media) => (m.kind === "video" && m.poster ? m.poster : m);

/**
 * Photo/video carousel for a puppy: big "story page" with prev/next and a
 * counter, a strip of thumbnails, and a full-screen viewer (native <dialog>)
 * with keyboard arrows and swipe. Mirrors the reference's behaviour.
 */
export function PuppyGallery({
  name,
  media,
}: {
  name: string;
  media: Media[];
}) {
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  // Only animate after the first change, never on page load
  const [turned, setTurned] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = media.length;
  const current = media[at];

  /** Move by `step` photos (wraps around). Functional updates keep rapid clicks correct. */
  const step = (by: number) => {
    setDir(by > 0 ? 1 : -1);
    setAt((a) => (((a + by) % count) + count) % count);
    setTurned(true);
  };
  const jump = (i: number) => {
    if (i === at) return;
    setDir(i > at ? 1 : -1);
    setAt(i);
    setTurned(true);
  };

  const unlockScroll = () => (document.documentElement.style.overflow = "");
  const open = () => {
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => {
    dialogRef.current?.close();
    unlockScroll();
  };

  // Arrow keys move through photos while the viewer is open; Esc closes it
  // natively, so also unlock page scroll on the dialog's "close" event.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") stepRef.current(1);
      if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    // Esc fires "cancel" synchronously: close and unlock right away
    const onCancel = (e: Event) => {
      e.preventDefault();
      d.close();
      unlockScroll();
    };
    window.addEventListener("keydown", onKey);
    d.addEventListener("cancel", onCancel);
    d.addEventListener("close", unlockScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("close", unlockScroll);
    };
  }, []);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) =>
      (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  const kindLabel = (m: Media) => (m.kind === "video" ? "video" : "photo");
  const s = still(current);

  return (
    <div>
      <div
        className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]"
        {...swipe}
      >
        <button
          type="button"
          key={at}
          className={`${turned ? "tp-storypage__turn " : ""}absolute inset-0 block size-full`}
          data-dir={dir}
          aria-label={`Open ${name}, ${kindLabel(current)} ${at + 1} of ${count} full screen`}
          onClick={open}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="(min-width: 1024px) 55vw, 92vw"
            // The first photo is the page's LCP element
            loading={turned ? undefined : "eager"}
            fetchPriority={turned ? undefined : "high"}
            placeholder={s.blurDataUrl ? "blur" : "empty"}
            blurDataURL={s.blurDataUrl}
            style={{
              objectFit: "cover",
              objectPosition: focal(s),
              backgroundColor: s.color,
            }}
          />
          {current.kind === "video" && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-20 place-items-center rounded-full border-[3px] border-cocoa bg-milk/95 text-3xl text-cocoa">
                ▶
              </span>
            </span>
          )}
        </button>
        {count > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Previous photo"
              onClick={() => step(-1)}
            >
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">
              {at + 1} / {count}
            </span>
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Next photo"
              onClick={() => step(1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {count > 1 && (
        <ul
          className="mt-3 flex gap-3 overflow-x-auto px-1 pt-2 pb-2 [scrollbar-width:thin]"
          aria-label={`All photos of ${name}`}
        >
          {media.map((m, i) => {
            const t = still(m);
            const on = i === at;
            return (
              <li key={m.src} className="shrink-0">
                <button
                  type="button"
                  aria-label={`${name}, ${kindLabel(m)} ${i + 1} of ${count}`}
                  aria-current={on}
                  onClick={() => jump(i)}
                  className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${
                    on
                      ? "-translate-y-1 -rotate-3 border-toffee-deep"
                      : "border-cocoa/30 hover:-rotate-2 hover:border-cocoa"
                  }`}
                >
                  <Image
                    src={t.src}
                    alt=""
                    fill
                    sizes="96px"
                    style={{
                      objectFit: "cover",
                      objectPosition: focal(t),
                      backgroundColor: t.color,
                    }}
                  />
                  {m.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">
                      ▶
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Full-screen viewer */}
      <dialog
        ref={dialogRef}
        aria-label={`${name} photos`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
            <span className="font-semibold">
              {name} · {at + 1} / {count}
            </span>
            <button
              type="button"
              onClick={close}
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1" {...swipe}>
            {current.kind === "video" ? (
              <video
                key={current.src}
                src={current.src}
                poster={current.poster?.src}
                controls
                autoPlay
                playsInline
                className="size-full object-contain"
              />
            ) : (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={85}
                style={{ objectFit: "contain" }}
              />
            )}
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
      </dialog>
    </div>
  );
}
