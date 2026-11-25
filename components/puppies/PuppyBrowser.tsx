"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { breedFilters, type Puppy } from "@/lib/puppies";
import { whatsappLink } from "@/lib/site";
import { Teddy } from "@/components/illustrations/Teddy";

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
 */
export function PuppyBrowser({
  puppies,
  cards,
}: {
  puppies: Puppy[];
  cards: Record<string, ReactNode>;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  /** Toggle one filter value and write the new state to the URL */
  const set = (key: keyof Filters, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const clear = () => router.replace(pathname, { scroll: false });

  const chip = (label: string, pressed: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      aria-pressed={pressed}
      className="tp-sticker-chip"
      onClick={onClick}
    >
      {label}
    </button>
  );
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
          {chip("Everywhere", !f.origin && !f.collection, clear)}
          {chip("Imported", f.origin === "imported", () =>
            set("origin", "imported"),
          )}
          {chip("Korean Teacup", f.collection === "korean-teacup", () =>
            set("collection", "korean-teacup"),
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>breed</span>
          {breedFilters.map((b) =>
            chip(b.label, f.breed === b.slug, () => set("breed", b.slug)),
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={rowLabel}>boy or girl</span>
          {chip("Boys", f.gender === "male", () => set("gender", "male"))}
          {chip("Girls", f.gender === "female", () => set("gender", "female"))}
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
        // Re-keying the list on filter change replays the cards' pop-in animation
        <ul
          key={params.toString()}
          className="tp-sketches tp-sketches--filtered mt-8"
        >
          {shown.map((p) => (
            <li key={p.slug}>{cards[p.slug]}</li>
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
