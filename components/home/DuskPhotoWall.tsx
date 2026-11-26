"use client";

import { useState, type CSSProperties } from "react";
import type { Media } from "@/lib/puppies";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { Polaroid } from "@/components/families/Polaroid";

const SIZES = "(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw";
// Order the prints drop onto the wall (×110ms), as on the reference
const DROP_ORDER = [3, 0, 5, 1, 6, 2, 7, 4];

/**
 * The home page's wall of family photos: the first eight prints drop onto the
 * wall in a scattered order, and any of them opens the viewer on all 64.
 * Teddy glances at prints 2 and 5 while he sits under the wall
 * (data-pup-look, see RoamingTeddy).
 */
export function DuskPhotoWall({ photos }: { photos: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul
        className="tp-photowall__prints"
        aria-label="Photos from TeddyPups families"
      >
        {photos.slice(0, 8).map((p, i) => (
          <li
            key={p.src}
            data-reveal="true"
            data-pup-look={i === 1 || i === 4 ? "" : undefined}
            style={{ "--d": `${110 * DROP_ORDER[i]}ms` } as CSSProperties}
          >
            <button
              type="button"
              className="tp-photowall__print"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}${p.caption ? `: ${p.caption}` : ""}`}
            >
              <Polaroid photo={p} order={i} sizes={SIZES} />
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
