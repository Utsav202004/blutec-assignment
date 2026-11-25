import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { Teddy } from "@/components/illustrations/Teddy";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
          <ul
            className="tp-photowall__prints"
            aria-label="Photos from TeddyPups families"
          >
            <li
              data-reveal="true"
              style={{ "--d": "330ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 1 of 64: Lulu 🧸 with her new mummy ❤️"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "-2.2deg",
                      "--tape": "#f6d79a",
                      "--i": "0",
                    } as React.CSSProperties
                  }
                >
                  <span
                    aria-hidden="true"
                    className="tp-tape tp-tape--center"
                  />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/dI8Jv0KRTiLJ.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#d8b898" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    Lulu 🧸 with her new mummy ❤️
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "0ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 2 of 64: Adorable Maltipoo baby 🧸❤️"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "1.6deg",
                      "--tape": "#f9cdbf",
                      "--i": "1",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tp-tape tp-tape--left" />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/TI-WtaFssfQt.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#d8b888" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    Adorable Maltipoo baby 🧸❤️
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "550ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 3 of 64: My new teddy puppy 🥰🧸"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "-0.9deg",
                      "--tape": "#cfe5f6",
                      "--i": "2",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tp-tape tp-tape--right" />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/j6T9eswP2eS8.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#c8b898" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    My new teddy puppy 🥰🧸
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "110ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 4 of 64: Our new puppies 🧸🥰🤗"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "2.4deg",
                      "--tape": "#f6d79a",
                      "--i": "3",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tp-tape tp-tape--tl" />
                  <span aria-hidden="true" className="tp-tape tp-tape--tr" />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/HJgL4rRnmReV.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#c8a888" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    Our new puppies 🧸🥰🤗
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "660ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 5 of 64: New puppy 🧸😍"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "-1.5deg",
                      "--tape": "#e9dcc4",
                      "--i": "4",
                    } as React.CSSProperties
                  }
                >
                  <span
                    aria-hidden="true"
                    className="tp-tape tp-tape--center"
                  />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/uc5ANs5jm7r7.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#e8d8b8" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    New puppy 🧸😍
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "220ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 6 of 64: Gang of 3 😍🧸"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "0.8deg",
                      "--tape": "#f6d79a",
                      "--i": "5",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tp-tape tp-tape--right" />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/pRJubyqHw8p7.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#b89878" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    Gang of 3 😍🧸
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "770ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 7 of 64: So happy 😍😍"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "-2.6deg",
                      "--tape": "#f9cdbf",
                      "--i": "6",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" className="tp-tape tp-tape--left" />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/4wOJk9azop_-.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#583838" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    So happy 😍😍
                  </span>
                </span>
              </button>
            </li>
            <li
              data-reveal="true"
              style={{ "--d": "440ms" } as React.CSSProperties}
            >
              <button
                type="button"
                className="tp-photowall__print"
                aria-label="Open photo 8 of 64: New pup 🤗💫"
              >
                <span
                  className="tp-polaroid"
                  style={
                    {
                      "--tilt": "1.2deg",
                      "--tape": "#cfe5f6",
                      "--i": "7",
                    } as React.CSSProperties
                  }
                >
                  <span
                    aria-hidden="true"
                    className="tp-tape tp-tape--center"
                  />
                  <span className="tp-polaroid__photo">
                    <Image
                      src="/assets/media/3h20rIasJCOa.jpg"
                      alt="A happy TeddyPups family with their new puppy"
                      width={433}
                      height={433}
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                      style={{ backgroundColor: "#182848" }}
                    />
                  </span>
                  <span className="tp-polaroid__caption font-scrawl">
                    New pup 🤗💫
                  </span>
                </span>
              </button>
            </li>
          </ul>
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
      <dialog
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
        data-lenis-prevent="true"
      ></dialog>
      <ScrollReveal scope=".tp-dusk .tp-photowall" />
    </section>
  );
}
