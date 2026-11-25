"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { focal, type Puppy } from "@/lib/puppies";

export type Seat = { puppy: Puppy; x: string; w: string; peek: number; tilt: string };

const seatStyle = (s: Seat, i: number) =>
  ({ "--x": s.x, "--w": s.w, "--peek": s.peek, "--tilt": s.tilt, "--i": i }) as CSSProperties;

/**
 * Arched photo "windows" peeking over the quilt. Hovering/focusing one lifts
 * the photo and shows its name tag. Tags live in a second, pointer-transparent
 * list layered above the quilt, so they're never hidden behind it.
 */
export function HeroLineup({ seats }: { seats: Seat[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <ul className="tp-lineup" aria-label="Some of the puppies in our showroom">
        {seats.map((s, i) => (
          <li key={s.puppy.slug} className="tp-lineup__seat" style={seatStyle(s, i)}>
            <Link
              className="tp-lineup__pup"
              href={`/puppies/${s.puppy.slug}`}
              aria-label={`Meet ${s.puppy.displayName}, ${s.puppy.breed}`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="tp-lineup__photo">
                <Image
                  src={s.puppy.cover.src}
                  alt={s.puppy.cover.alt}
                  fill
                  sizes="11rem"
                  priority={i < 2}
                  placeholder={s.puppy.cover.blurDataUrl ? "blur" : "empty"}
                  blurDataURL={s.puppy.cover.blurDataUrl}
                  style={{ objectFit: "cover", objectPosition: focal(s.puppy.cover), backgroundColor: s.puppy.cover.color }}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {seats.map((s, i) => (
          <li key={s.puppy.slug} className="tp-lineup__seat" style={seatStyle(s, i)}>
            <span className="tp-lineup__ghost" data-tag={active === i ? "show" : undefined}>
              <span className="tp-lineup__name font-scrawl">{s.puppy.displayName}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
