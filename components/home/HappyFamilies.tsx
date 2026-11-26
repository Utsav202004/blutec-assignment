import type React from "react";
import Link from "next/link";
import { Teddy } from "@/components/illustrations/Teddy";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DuskPhotoWall } from "@/components/home/DuskPhotoWall";
import homeFamilyPhotosData from "@/lib/data/home-family-photos.json";
import type { Media } from "@/lib/puppies";

// Only the eight prints on the wall need their blur placeholders; the rest
// are just for the viewer, so keep what's sent to the browser small
const homeFamilyPhotos = (homeFamilyPhotosData as Media[]).map((p, i) =>
  i < 8
    ? p
    : {
        src: p.src,
        kind: p.kind,
        width: p.width,
        height: p.height,
        alt: p.alt,
        caption: p.caption,
      },
) as Media[];

export function HappyFamilies() {
  return (
    <section
      data-pup-scene="true"
      data-tone="dark"
      className="tp-scene tp-dusk"
      style={
        {
          "--sky-top": "#a65a30",
          "--sky-bottom": "#4d2b19",
        } as React.CSSProperties
      }
      aria-labelledby="dusk-title"
    >
      <div className="tp-dusk__sky gutter">
        <div className="tp-dusk__head">
          <h2 id="dusk-title" className="font-plush text-huge">
            Happy families &amp; puppies
          </h2>
          <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">
            We are truly honored to see our puppies become cherished members of
            loving families. These heartwarming moments have been shared by our
            valued clients who welcomed a Teddy Pup into their homes and hearts.
          </p>
        </div>
        <figure className="tp-dusk__note">
          <blockquote className="font-plush-text">
            “TeddyPups truly made our dream a reality. They supported us at
            every step of the import journey. Our Maltipoo arrived healthy,
            cheerful, and absolutely perfect. Having 24/7 support throughout the
            process gave us complete peace of mind.”
          </blockquote>
          <figcaption className="font-scrawl">Sarah M., Dubai, UAE</figcaption>
        </figure>
      </div>
      <div className="tp-photowall">
        <div className="tp-photowall__wall">
          <DuskPhotoWall photos={homeFamilyPhotos} />
          <div className="tp-facade__ground">
            <span aria-hidden="true" className="tp-facade__door" />
            <span aria-hidden="true" className="tp-lamp">
              <span className="tp-lamp__light" />
            </span>
            <Link
              className="btn btn-primary tp-facade__cta"
              href="/happy-families"
            >
              See every happy family
            </Link>
            <Teddy
              pose="sit"
              className="tp-dusk__teddy"
              stop
              label="Teddy the puppy"
            />
          </div>
        </div>
        <div aria-hidden="true" className="tp-street__pavement" />
      </div>
      <ScrollReveal scope=".tp-dusk .tp-photowall" />
    </section>
  );
}
