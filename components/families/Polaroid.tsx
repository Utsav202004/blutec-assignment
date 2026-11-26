import Image from "next/image";
import type { CSSProperties } from "react";
import type { Media } from "@/lib/puppies";

// The reference cycles through these by the photo's position on the wall
const TILTS = [-2.2, 1.6, -0.9, 2.4, -1.5, 0.8, -2.6, 1.2];
const TAPE_SPOTS = [
  "center",
  "left",
  "right",
  "corners",
  "center",
  "right",
  "left",
  "center",
];
const TAPE_COLORS = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];

/** A taped-up polaroid print (Happy families wall and the home photo wall) */
export function Polaroid({
  photo,
  order,
  sizes,
  priority = false,
}: {
  photo: Media;
  order: number;
  sizes: string;
  priority?: boolean;
}) {
  const spot = TAPE_SPOTS[order % TAPE_SPOTS.length];
  return (
    <span
      className="tp-polaroid"
      style={
        {
          "--tilt": `${TILTS[order % TILTS.length]}deg`,
          "--tape": TAPE_COLORS[order % TAPE_COLORS.length],
          "--i": order,
        } as CSSProperties
      }
    >
      {spot === "corners" ? (
        <>
          <span aria-hidden="true" className="tp-tape tp-tape--tl" />
          <span aria-hidden="true" className="tp-tape tp-tape--tr" />
        </>
      ) : (
        <span aria-hidden="true" className={`tp-tape tp-tape--${spot}`} />
      )}
      <span className="tp-polaroid__photo">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          placeholder={photo.blurDataUrl ? "blur" : "empty"}
          blurDataURL={photo.blurDataUrl}
          preload={priority}
          style={{ backgroundColor: photo.color }}
        />
      </span>
      <span className="tp-polaroid__caption font-scrawl">{photo.caption}</span>
    </span>
  );
}
