"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { breedFilters, type Puppy } from "@/lib/puppies";
import { whatsappLink } from "@/lib/site";
import { Teddy } from "@/components/illustrations/Teddy";
import { spring } from "@/lib/spring";

type Filters = {
  origin?: string;
  collection?: string;
  breed?: string;
  gender?: string;
};
const KEYS = ["collection", "breed", "gender", "origin"] as const;

/**
 * Filter chips + the puppy grid. Filters live in the URL (?origin=, ?collection=,
 * ?breed=, ?gender=) so filtered views can be shared and the back button works,
 * matching the reference: "Imported" and "Korean Teacup" toggle independently,
 * breed and boy/girl are single-choice toggles, and "Everywhere" clears all.
 *
 * Cards are rendered on the server and passed in as `cards` (keyed by slug), so
 * this component only decides which ones to show.
 *
 * Changing a filter animates the grid like the reference's Framer Motion
 * "popLayout": cards that stay glide to their new places on a spring
 * (stiffness 260, damping 26), new cards spring up from 86% scale, and cards
 * that are filtered out shrink and fade where they stood (0.2s).
 */
export function PuppyBrowser({
  puppies,
  cards,
}: {
  puppies: Puppy[];
  cards: Record<string, ReactNode>;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const before = useRef<Snapshot | null>(null);

  const f: Filters = Object.fromEntries(
    KEYS.map((k) => [k, params.get(k) ?? undefined]),
  );
  const active = KEYS.some((k) => f[k]);

  const shown = useMemo(
    () =>
      puppies.filter(
        (p) =>
          (!f.origin || p.origin === f.origin) &&
          (!f.collection || p.collections.includes(f.collection)) &&
          (!f.breed || p.breeds.includes(f.breed)) &&
          (!f.gender || p.gender === f.gender),
      ),
    [puppies, f.origin, f.collection, f.breed, f.gender],
  );

  /** Remember where every card is, just before the filters change */
  const capture = () => {
    const ul = listRef.current;
    if (!ul || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rects = new Map<string, DOMRect>();
    const nodes = new Map<string, HTMLElement>();
    ul.querySelectorAll<HTMLElement>(":scope > li[data-slug]").forEach((li) => {
      rects.set(li.dataset.slug!, li.getBoundingClientRect());
      nodes.set(li.dataset.slug!, li);
    });
    before.current = { rects, nodes };
  };

  /**
   * Write the filters to the URL. Like the reference this uses
   * history.replaceState (Next keeps useSearchParams in sync), so filtering is
   * instant: no server round trip, no new history entry.
   */
  const write = (next: URLSearchParams) => {
    capture();
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };

  /** Toggle one filter value */
  const set = (key: keyof Filters, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    write(next);
  };
  const clear = () => write(new URLSearchParams());

  const shownKey = shown.map((p) => p.slug).join(" ");
  useLayoutEffect(() => {
    const snap = before.current;
    before.current = null;
    const ul = listRef.current;
    if (!snap || !ul) return;
    animateGrid(ul, snap);
  }, [shownKey]);

  const hasLocal = puppies.some((p) => p.origin === "local");
  const rowLabel = "font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28";

  const count =
    shown.length === 1
      ? "1 puppy match"
      : active
        ? `${shown.length} puppies match`
        : `${shown.length} puppies looking for a home`;

  return (
    <div>
      <div
        role="group"
        aria-label="Filter puppies"
        className="tp-sketchpad flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>where</span>
          <Chip
            key="Everywhere"
            pressed={!f.origin && !f.collection}
            onClick={clear}
          >
            Everywhere
          </Chip>
          {hasLocal && (
            <Chip
              key="In Dubai"
              pressed={f.origin === "local"}
              onClick={() => set("origin", "local")}
            >
              In Dubai
            </Chip>
          )}
          <Chip
            key="Imported"
            pressed={f.origin === "imported"}
            onClick={() => set("origin", "imported")}
          >
            Imported
          </Chip>
          <Chip
            key="Korean Teacup"
            pressed={f.collection === "korean-teacup"}
            onClick={() => set("collection", "korean-teacup")}
          >
            Korean Teacup
          </Chip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>breed</span>
          {breedFilters.map((b) => (
            <Chip
              key={b.label}
              pressed={f.breed === b.slug}
              onClick={() => set("breed", b.slug)}
            >
              {b.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>boy or girl</span>
          <Chip
            key="Boys"
            pressed={f.gender === "male"}
            onClick={() => set("gender", "male")}
          >
            Boys
          </Chip>
          <Chip
            key="Girls"
            pressed={f.gender === "female"}
            onClick={() => set("gender", "female")}
          >
            Girls
          </Chip>
          {active && (
            <button
              type="button"
              className="link-ink ml-auto text-[0.95rem] font-semibold"
              onClick={clear}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p
        className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]"
        aria-live="polite"
      >
        {count}
      </p>

      {shown.length ? (
        <ul ref={listRef} className="tp-sketches relative mt-8">
          {shown.map((p) => (
            <li key={p.slug} data-slug={p.slug}>
              {cards[p.slug]}
            </li>
          ))}
        </ul>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <Teddy
            pose="sit"
            className="mx-auto w-44 md:w-52"
            label="Teddy, tilting his head"
            bubble="hmm…"
            lane
          />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know
              what&apos;s in our showroom or what we can bring in for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                Ask on WhatsApp
              </a>
              <button type="button" className="btn btn-ghost" onClick={clear}>
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Snapshot = {
  rects: Map<string, DOMRect>;
  nodes: Map<string, HTMLElement>;
};

/** Play the filter change: glide, pop in, and shrink away (see PuppyBrowser) */
function animateGrid(ul: HTMLUListElement, snap: Snapshot) {
  const { easing, duration } = spring(260, 26);
  const box = ul.getBoundingClientRect();
  const here = new Set<string>();

  ul.querySelectorAll<HTMLElement>(":scope > li[data-slug]").forEach((li) => {
    const slug = li.dataset.slug!;
    here.add(slug);
    const was = snap.rects.get(slug);
    if (was) {
      const now = li.getBoundingClientRect();
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)
        li.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
          { duration, easing },
        );
    } else {
      li.animate(
        [
          { opacity: 0, transform: "scale(0.86)" },
          { opacity: 1, transform: "none" },
        ],
        { duration, easing, fill: "backwards" },
      );
    }
  });

  // Filtered-out cards: a lookalike stays where the card was and shrinks away
  // (React has already removed the real one)
  snap.nodes.forEach((node, slug) => {
    if (here.has(slug)) return;
    const was = snap.rects.get(slug)!;
    const ghost = node.cloneNode(true) as HTMLElement;
    ghost.removeAttribute("data-slug");
    ghost.inert = true;
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      position: "absolute",
      left: `${was.left - box.left - ul.clientLeft}px`,
      top: `${was.top - box.top - ul.clientTop}px`,
      width: `${was.width}px`,
      height: `${was.height}px`,
      margin: "0",
      translate: "none",
      pointerEvents: "none",
    });
    ul.appendChild(ghost);
    // Remove it even if the animation never gets to run (e.g. background tab)
    setTimeout(() => ghost.remove(), 400);
    ghost
      .animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "scale(0.86)" },
        ],
        { duration: 200, easing: "ease-out", fill: "forwards" },
      )
      .finished.finally(() => ghost.remove());
  });
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className="tp-sticker-chip"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
