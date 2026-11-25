import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { focal, genderWord, goneHomePuppies } from "@/lib/puppies";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// Tickets lean alternately, cycling through these tilts as on the reference
const tilts = [-1.4, 1.1, -0.6, 1.6, -1.1, 0.8];
import { Teddy } from "@/components/illustrations/Teddy";

export function GoneHomePage() {
  return (
    <div data-page="gone" className="tp-page">
      <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
        <header className="tp-boothhead">
          <div className="max-w-3xl">
            <h1 className="font-plush text-giant">
              Gone home
              <svg
                viewBox="0 0 48 44"
                className="ml-3 inline-block w-[0.45em] -translate-y-[0.15em] text-toffee"
                aria-hidden="true"
              >
                <path
                  d="M24 40C10 30 4 22 4 14.5 4 8.7 8.6 4 14.3 4c4.1 0 7.6 2.4 9.7 6 2.1-3.6 5.6-6 9.7-6C39.4 4 44 8.7 44 14.5 44 22 38 30 24 40z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h1>
            <p className="text-lede mt-6 text-cocoa-soft">
              Every puppy here has already joined a loving family. Looking for
              one just like them? Tell us — we&apos;ll help you find your match.
            </p>
            <Link className="btn btn-primary mt-8" href="/puppies">
              See available puppies
            </Link>
          </div>
          <div aria-hidden="true" className="tp-booth">
            <Teddy
              pose="peek"
              className="tp-booth__teddy"
              label="Teddy the puppy"
              lane
            />
            <div className="tp-booth__counter">
              <span className="font-plush">tickets home</span>
            </div>
          </div>
        </header>
        <div>
          <ul className="tp-tickets" aria-label="Puppies who have gone home">
            {goneHomePuppies.map((p, i) => {
              const named = p.displayName !== p.breed;
              const meta = named
                ? `${p.breed}, ${genderWord(p)}`
                : p.genderLabel || genderWord(p);
              return (
                <li
                  key={p.slug}
                  className="tp-ticket"
                  data-reveal="true"
                  style={
                    {
                      "--tilt": `${tilts[i % tilts.length]}deg`,
                      "--i": i,
                    } as React.CSSProperties
                  }
                >
                  <Link className="tp-ticket__link" href={`/puppies/${p.slug}`}>
                    <span className="tp-ticket__main">
                      <span className="tp-ticket__photo">
                        <Image
                          src={p.cover.src}
                          alt={p.cover.alt}
                          fill
                          sizes="7rem"
                          style={{
                            objectFit: "cover",
                            objectPosition: focal(p.cover),
                            backgroundColor: p.cover.color,
                          }}
                        />
                      </span>
                      <span className="tp-ticket__body">
                        <span className="font-scrawl tp-ticket__kicker">
                          one ticket home
                        </span>
                        <span className="font-plush tp-ticket__name">
                          {p.displayName}
                        </span>
                        <span className="tp-ticket__meta">{meta}</span>
                        <span className="tp-ticket__route">
                          {/* Where the journey started: our showroom, or TeddyPups for imports */}
                          <span>
                            {p.origin === "local"
                              ? "Dubai showroom"
                              : "TeddyPups"}
                          </span>
                          <svg viewBox="0 0 60 12" aria-hidden="true">
                            <path d="M2 6h46" />
                            <path d="M44 2l6 4-6 4" />
                          </svg>
                          <span>home ♥</span>
                        </span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="tp-ticket__stub">
                      <span className="font-plush">admit one</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <ScrollReveal scope='[data-page="gone"]' threshold={0.1} />
    </div>
  );
}
