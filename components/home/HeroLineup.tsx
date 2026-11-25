"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { focal, type Puppy } from "@/lib/puppies";

export type Seat = {
  puppy: Puppy;
  x: string;
  w: string;
  peek: number;
  tilt: string;
};

// Pauses between swaps (ms), cycled; values from the reference
const PAUSES = [1900, 2500, 1700, 2300, 2000, 2800, 1800];

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const seatStyle = (s: Seat, i: number) =>
  ({
    "--x": s.x,
    "--w": s.w,
    "--peek": s.peek,
    "--tilt": s.tilt,
    "--i": i,
  }) as CSSProperties;

/**
 * Arched photo "windows" peeking over the quilt.
 *
 * - Hover/focus lifts a photo and shows its name tag.
 * - While the hero is on screen and the visitor is idle, one window at a time
 *   ducks into the quilt and pops back up with a different puppy (all available
 *   puppies rotate through the six seats), showing its name tag briefly. The
 *   next photo is preloaded in a hidden "wings" slot so the swap never shows a
 *   blank arch. It pauses while scrolling, when the tab is hidden, and once the
 *   roaming Teddy has left the hero (hero[data-here="false"]).
 *
 * Name tags live in a second, pointer-transparent list layered above the quilt.
 */
export function HeroLineup({
  seats,
  friends,
}: {
  seats: Seat[];
  friends: Puppy[];
}) {
  const [seated, setSeated] = useState<Puppy[]>(() =>
    seats.map((s) => s.puppy),
  );
  const [motion, setMotion] = useState<
    Record<number, "duck" | "pop" | undefined>
  >({});
  const [hovered, setHovered] = useState<number | null>(null);
  const [popped, setPopped] = useState<number | null>(null);
  const [nextUp, setNextUp] = useState<Puppy | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wingsRef = useRef<HTMLSpanElement>(null);
  const seatedRef = useRef(seated);

  useEffect(() => {
    seatedRef.current = seated;
  }, [seated]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const scene = list.closest<HTMLElement>("[data-pup-scene]");
    const rotate = friends.length > seats.length;

    let visible = true;
    let busyUntil = 0; // pause after scrolling / pointer activity
    let alive = true;
    let pauseIdx = 0;
    let lastSeat = -1;
    let seatQueue: number[] = [];
    let waitTries = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(list);
    const busy = () => (busyUntil = performance.now() + 1200);
    addEventListener("scroll", busy, { passive: true });
    addEventListener("pointerdown", busy, { passive: true });
    list.addEventListener("pointerover", busy, { passive: true });

    // Puppies waiting in the wings, the one up next first
    const offstage = () =>
      friends.filter((f) => !seatedRef.current.some((s) => s.slug === f.slug));
    let queue = shuffle(offstage());
    const announce = () => setNextUp(queue[0] ?? null);

    const swap = () => {
      if (!alive) return;
      if (!seatQueue.length) {
        seatQueue = shuffle(seats.map((_, i) => i)).filter(
          (s, i, a) => !(i === 0 && s === lastSeat && a.length > 1),
        );
      }
      const seat = seatQueue.shift()!;
      lastSeat = seat;
      const incoming = rotate ? queue.shift() : undefined;
      setMotion((m) => ({ ...m, [seat]: "duck" }));
      later(() => {
        if (incoming) {
          const outgoing = seatedRef.current[seat];
          setSeated((cur) => cur.map((p, i) => (i === seat ? incoming : p)));
          queue.push(outgoing);
          announce();
        }
        setMotion((m) => ({ ...m, [seat]: "pop" }));
        setPopped(seat);
        later(() => setPopped((p) => (p === seat ? null : p)), 1800);
        later(() => setMotion((m) => ({ ...m, [seat]: undefined })), 700);
      }, 360);
      later(loop, PAUSES[pauseIdx++ % PAUSES.length]);
    };

    function loop() {
      if (!alive) return;
      const idle =
        !document.hidden &&
        visible &&
        performance.now() > busyUntil &&
        scene?.dataset.here !== "false";
      if (!idle) return later(loop, 900);
      if (!rotate) return swap();
      if (!queue.length) {
        queue = shuffle(offstage());
        announce();
      }
      // Wait until the next photo has loaded in the wings
      const img = wingsRef.current?.querySelector("img");
      if (!img || !img.complete || !img.naturalWidth) {
        if (++waitTries < 15) return later(loop, 400);
        queue.push(queue.shift()!);
        announce();
        waitTries = 0;
        return later(loop, 800);
      }
      waitTries = 0;
      img.decode().then(swap, swap);
    }

    // Start once the photos' entrance animation has finished
    const intro = [...list.querySelectorAll(".tp-lineup__pup")]
      .flatMap((el) => el.getAnimations())
      .filter((a) => (a as CSSAnimation).animationName === "tp-peek");
    const begin = () => {
      if (!alive) return;
      if (rotate) announce();
      later(loop, 250);
    };
    Promise.all(intro.map((a) => a.finished)).then(begin, begin);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      io.disconnect();
      removeEventListener("scroll", busy);
      removeEventListener("pointerdown", busy);
      list.removeEventListener("pointerover", busy);
    };
  }, [friends, seats]);

  const tagShown = (i: number) => hovered === i || popped === i;

  return (
    <>
      <ul
        ref={listRef}
        className="tp-lineup"
        aria-label="Some of the puppies in our showroom"
      >
        {seats.map((s, i) => {
          const p = seated[i];
          return (
            <li key={i} className="tp-lineup__seat" style={seatStyle(s, i)}>
              <Link
                className="tp-lineup__pup"
                data-state={motion[i]}
                href={`/puppies/${p.slug}`}
                aria-label={`Meet ${p.displayName}, ${p.breed}`}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <span className="tp-lineup__photo">
                  <Image
                    key={p.slug}
                    src={p.cover.src}
                    alt={p.cover.alt}
                    fill
                    sizes="11rem"
                    loading={i < 2 ? "eager" : undefined}
                    fetchPriority={i < 2 ? "high" : undefined}
                    placeholder={p.cover.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={p.cover.blurDataUrl}
                    style={{
                      objectFit: "cover",
                      objectPosition: focal(p.cover),
                      backgroundColor: p.cover.color,
                    }}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {seats.map((s, i) => (
          <li key={i} className="tp-lineup__seat" style={seatStyle(s, i)}>
            <span
              className="tp-lineup__ghost"
              data-tag={tagShown(i) ? "show" : undefined}
            >
              <span className="tp-lineup__name font-scrawl">
                {seated[i].displayName}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {/* The next puppy's photo, preloaded off-screen so the swap is instant */}
      {nextUp && (
        <span ref={wingsRef} aria-hidden="true" className="tp-lineup__wings">
          <Image
            src={nextUp.cover.src}
            alt=""
            fill
            sizes="11rem"
            style={{ objectFit: "cover", objectPosition: focal(nextUp.cover) }}
          />
        </span>
      )}
    </>
  );
}
