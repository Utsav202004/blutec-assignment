"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Media } from "@/lib/puppies";

/**
 * Full-screen photo viewer on a native <dialog>: Esc closes it, focus is
 * trapped inside, arrow keys and swipes move between photos, and page scroll
 * is locked while it's open. Controlled by the parent via `index`.
 */
export function PhotoViewer({
  photos,
  index,
  onChange,
  onClose,
  label = "Photo viewer",
}: {
  photos: Media[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = photos.length;
  const step = (by: number) =>
    index !== null && onChange((index + by + count) % count);

  // Keep the dialog in sync with `index`
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
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

  const photo = index !== null ? photos[index] : null;

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
    >
      {photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
            <span className="font-semibold">
              {index! + 1} / {count}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
            >
              Close
            </button>
          </div>
          <div
            className="relative min-h-0 flex-1"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              quality={85}
              style={{ objectFit: "contain" }}
            />
          </div>
          {photo.caption && (
            <p className="font-scrawl px-4 pt-3 text-center text-lg">
              {photo.caption}
            </p>
          )}
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
