import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { availablePuppies, goneHomePuppies } from "@/lib/puppies";
import { SketchCard } from "@/components/puppies/SketchCard";
import { PuppyBrowser } from "@/components/puppies/PuppyBrowser";
import { Teddy } from "@/components/illustrations/Teddy";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Available puppies",
  description:
    "Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on WhatsApp.",
};

// Ace, Leo, Mia, Sadie and the blue merle Pomeranian, as on the reference
const goneStrip = goneHomePuppies.slice(0, 5);

export default function PuppiesPage() {
  // Cards are server components; the client-side browser just picks which to show.
  const cards = Object.fromEntries(
    availablePuppies.map((p, i) => [
      p.slug,
      <SketchCard key={p.slug} puppy={p} index={i} priority={i < 4} />,
    ]),
  );

  // Shown while the filter UI (which reads the URL) hydrates: same grid, unfiltered
  const fallback = (
    <ul className="tp-sketches mt-20">
      {availablePuppies.map((p) => (
        <li key={p.slug}>{cards[p.slug]}</li>
      ))}
    </ul>
  );

  return (
    <div data-page="pups" className="tp-page">
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter mx-auto max-w-[110rem] pt-10 pb-24 md:pt-16">
          <div className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p
                className="font-scrawl text-lg text-toffee-ink"
                data-reveal="true"
              >
                from Teddy&apos;s sketchbook
              </p>
              <h1
                id="pups-title"
                className="font-plush text-giant tp-sketchbook__title"
                data-reveal="true"
              >
                Available puppies
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  className="tp-sketchbook__underline"
                >
                  <path
                    d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1"
                    pathLength="1"
                  />
                </svg>
              </h1>
              <p
                className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft"
                data-reveal="true"
              >
                Every listing shows real photos of the actual puppy. Open a
                profile to see them all, then ask us about them on WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal="true">
              <Teddy
                pose="sit"
                facing="left"
                label="Teddy, the TeddyPups puppy"
                bubble="that's me!"
                lane
              />
              <span className="font-scrawl tp-sketchbook__caption">
                self-portrait
              </span>
            </div>
          </div>
          <div className="mt-12">
            <Suspense fallback={fallback}>
              <PuppyBrowser puppies={availablePuppies} cards={cards} />
            </Suspense>
          </div>
        </div>
      </section>

      <section aria-labelledby="gone-title" className="tp-gone-strip">
        <div className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center">
          <div className="md:w-1/3" data-reveal="true">
            <h2 id="gone-title" className="font-plush text-big">
              Already gone home
            </h2>
            <p className="mt-3 text-cocoa-soft">
              These puppies have found their families.
            </p>
            <Link className="btn btn-primary mt-6" href="/gone-home">
              See the puppies who&apos;ve gone home
            </Link>
          </div>
          <ul
            className="tp-gone-strip__row"
            aria-label="Some puppies who have gone home"
          >
            {goneStrip.map((p, i) => (
              <li key={p.slug}>
                <SketchCard puppy={p} index={i} small />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ScrollReveal scope='[data-page="pups"]' />
    </div>
  );
}
