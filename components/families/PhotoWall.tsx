"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { Media } from "@/lib/puppies";
import { PawIcon } from "@/components/ui/PawIcon";
import { PhotoViewer } from "@/components/ui/PhotoViewer";

// The reference cycles through these tilts, tape colours and reveal delays
const tilts = [-2.2, 1.6, -0.9, 2.4, -1.5, 0.8, -2.6, 1.2];
const tapes = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];

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
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
              onClick={() => setOpen(i)}
            >
              <span
                className="tp-polaroid"
                style={
                  {
                    "--tilt": `${tilts[i % tilts.length]}deg`,
                    "--tape": tapes[i % tapes.length],
                    "--i": i,
                  } as CSSProperties
                }
              >
                <span aria-hidden="true" className="tp-tape tp-tape--center" />
                <span className="tp-polaroid__photo">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
                    style={{ backgroundColor: p.color }}
                  />
                </span>
                <span className="tp-polaroid__caption font-scrawl">
                  {p.caption}
                </span>
              </span>
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
      />
    </>
  );
}
