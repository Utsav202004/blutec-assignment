"use client";

import { useState, type CSSProperties } from "react";
import type { Media } from "@/lib/puppies";
import { PawIcon } from "@/components/ui/PawIcon";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { Polaroid } from "@/components/families/Polaroid";

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";

/**
 * Wall of taped-up polaroids from TeddyPups families. Each one drops onto the
 * wall as it scrolls into view (data-reveal, see ScrollReveal) and opens in a
 * full-screen viewer when clicked.
 */
export function PhotoWall({ photos }: { photos: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="tp-wall" aria-label="Photos from TeddyPups families">
        {photos.map((p, i) => (
          <li
            key={p.src}
            className="tp-wall__item"
            data-reveal="true"
            style={{ "--d": `${(i % 4) * 60}ms` } as CSSProperties}
          >
            <button
              type="button"
              className="tp-wall__print"
              aria-label={`Open photo ${i + 1} of ${photos.length}${p.caption ? `: ${p.caption}` : ""}`}
              onClick={() => setOpen(i)}
            >
              <Polaroid photo={p} order={i} sizes={SIZES} priority={i < 2} />
              <PawIcon className="tp-wall__paw" />
            </button>
          </li>
        ))}
      </ul>
      <PhotoViewer
        photos={photos}
        index={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
        pageSizes={SIZES}
      />
    </>
  );
}
