"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { focal, hasVideo, puppyBlurb, type Puppy } from "@/lib/puppies";
import { PawIcon } from "@/components/ui/PawIcon";
import { Teddy } from "@/components/illustrations/Teddy";

// Door colours cycle in this order on the reference
const doorColours = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];

/** Desktop gets the pinned, sideways-scrolling hallway */
const PIN_QUERY = "(min-width: 1024px) and (min-height: 520px) and (prefers-reduced-motion: no-preference)";

/**
 * "Meet the pups". On desktop the section is pinned (position: sticky) and is
 * made as tall as the hallway is wide, so scrolling down moves the doors left.
 * Each door swings open once it passes Teddy, who waits on the left.
 * Below 1024px it's a plain grid (doors open via a CSS scroll-driven animation).
 */
export function MeetThePups({ puppies }: { puppies: Puppy[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [pinned, setPinned] = useState(false);
  const [openUpTo, setOpenUpTo] = useState(-1); // index of the last opened door

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const wrap = section.firstElementChild as HTMLElement;

    if (!pinned) {
      wrap.style.height = "";
      track.style.transform = "";
      return;
    }

    // Measured on the reference: the hallway travels 1.25px per 1px scrolled
    const SPEED = 1.25;
    let distance = 0; // horizontal travel in px
    let range = 0; // vertical scroll needed for that travel

    const measure = () => {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      range = distance / SPEED;
      wrap.style.height = `calc(${range}px + 100vh)`;
      apply();
    };

    const apply = () => {
      const top = wrap.getBoundingClientRect().top;
      const progress = range ? Math.min(1, Math.max(0, -top / range)) : 0;
      const x = -progress * distance;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      section.style.setProperty("--floor-x", `${x}px`);
      // Doors start 38vw from the left (track padding) and swing open as soon
      // as they begin sliding left past that line.
      const line = window.innerWidth * 0.38 - 1;
      let last = -1;
      track.querySelectorAll<HTMLElement>(".tp-door").forEach((door, i) => {
        if (door.getBoundingClientRect().left < line) last = i;
      });
      setOpenUpTo(last);
    };

    // Scroll events already fire at most once per frame, so update directly
    // (no rAF: it keeps the hallway in sync even when the tab is throttled).
    measure();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", measure);
      wrap.style.height = "";
      track.style.transform = "";
    };
  }, [pinned]);

  const isOpen = (i: number) => !pinned || i <= openUpTo;

  return (
    <section
      ref={sectionRef}
      data-tone="light"
      data-pinned={pinned ? "" : undefined}
      className="tp-scene tp-meet"
      style={{ "--sky-top": "#fff1d8", "--sky-bottom": "#fbe3b4" } as CSSProperties}
      aria-labelledby="meet-title"
    >
      <div>
        <div className="tp-meet__stage">
          <header className="tp-meet__head gutter">
            <div>
              <h2 id="meet-title" className="font-plush text-huge">
                Meet the pups
              </h2>
              <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
                Real puppies, real photos, looking for their families right now.
              </p>
            </div>
            <Link className="btn btn-primary shrink-0" href="/puppies">
              See all available puppies
            </Link>
          </header>

          <div className="tp-meet__hall">
            <ol ref={trackRef} className="tp-meet__track" aria-label="Puppies looking for a family">
              {puppies.map((p, i) => (
                <li key={p.slug} className="tp-door" data-open={isOpen(i)}>
                  <Link
                    className="tp-door__link"
                    style={{ "--door": doorColours[i % doorColours.length] } as CSSProperties}
                    href={`/puppies/${p.slug}`}
                  >
                    <span className="tp-door__plate">
                      <span className="font-plush tp-door__name">{p.displayName}</span>
                      <span className="tp-door__meta">
                        {puppyBlurb(p)}
                        {hasVideo(p) && ", with video"}
                      </span>
                    </span>
                    <span className="tp-door__frame">
                      <span className="tp-door__room">
                        <Image
                          src={p.cover.src}
                          alt={p.cover.alt}
                          fill
                          sizes="(min-width: 1024px) 15rem, 44vw"
                          placeholder={p.cover.blurDataUrl ? "blur" : "empty"}
                          blurDataURL={p.cover.blurDataUrl}
                          style={{ objectFit: "cover", objectPosition: focal(p.cover), backgroundColor: p.cover.color }}
                        />
                      </span>
                      <span aria-hidden="true" className="tp-door__way">
                        <span className="tp-door__leaf">
                          <PawIcon className="tp-door__peephole" />
                          <span className="tp-door__knob" />
                        </span>
                      </span>
                      <span className="tp-door__tag font-scrawl">Available</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="tp-door tp-door--all" data-open="true">
                <Link className="tp-door__link" href="/puppies">
                  <span className="tp-door__frame tp-door__frame--all">
                    <span className="font-plush tp-door__all">Meet them all</span>
                  </span>
                </Link>
              </li>
            </ol>
            <div aria-hidden="true" className="tp-meet__floor" />
            <Teddy pose="sit" className="tp-meet__teddy" label="Teddy waiting by the doors" bubble="pick a door!" />
          </div>
        </div>
      </div>
    </section>
  );
}
