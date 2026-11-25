import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { focal, getPuppy, puppies, siblings, whereLabel } from "@/lib/puppies";
import { whatsappLink } from "@/lib/site";
import { PawIcon } from "@/components/ui/PawIcon";
import { Teddy } from "@/components/illustrations/Teddy";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PuppyGallery } from "@/components/puppy/PuppyGallery";
import { EnquiryForm } from "@/components/puppy/EnquiryForm";
import { StoryRibbon } from "@/components/puppy/StoryRibbon";

/** Pre-render every puppy page (available + gone home) at build time */
export function generateStaticParams() {
  return puppies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getPuppy(slug);
  if (!p) return {};
  const title =
    p.name && p.name !== p.breed
      ? `${p.displayName}, ${p.breed} puppy`
      : `${p.breed} puppy`;
  return {
    title,
    description: `${title}: ${p.genderLabel.toLowerCase()}, ${p.age}. Real photos, health checked and vaccinated. Ask TeddyPups about this puppy on WhatsApp.`,
    openGraph: { images: [p.cover.src] },
  };
}

const promise = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

const stepsAbroad = [
  ["Reserve your puppy", "Tell us which puppy has captured your heart."],
  [
    "Personalized consultation",
    "We finalize details with you and share updates on your puppy's journey.",
  ],
  [
    "Import and arrival",
    "We manage health checks, travel arrangements, and documentation.",
  ],
  [
    "Welcome home",
    "We help your new puppy settle in and ensure a smooth transition into your home.",
  ],
];

// Copy from the reference's "How it works" page (local puppies)
const stepsLocal = [
  [
    "Explore our puppies",
    "Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.",
  ],
  [
    "Choose your puppy",
    "Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.",
  ],
  ["Meet before you choose", "Spend time bonding before making your decision."],
  [
    "Pick-up or delivery",
    "Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.",
  ],
];

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="tp-chapter">
      <span aria-hidden="true" className="tp-chapter__n font-plush">
        {n}
      </span>
      <span className="font-scrawl">{children}</span>
    </p>
  );
}

/**
 * Every slug is prerendered by generateStaticParams, so reading `params` at
 * the top level is fine: opting this segment out of Next 16's "instant
 * navigation" check lets the page render as plain static HTML instead of
 * streaming into a placeholder (which caused a layout shift on load).
 */
export const instant = false;

export default async function PuppyPage({
  params,
}: PageProps<"/puppies/[slug]">) {
  return (
    <div data-page="pup" className="tp-page">
      <PuppyContent params={params} />
    </div>
  );
}

async function PuppyContent({
  params,
}: Pick<PageProps<"/puppies/[slug]">, "params">) {
  const { slug } = await params;
  const p = getPuppy(slug);
  if (!p) notFound();

  const gone = p.status === "gone-home";
  const { prev, next } = siblings(p);
  // "Ace (Pomeranian)", or just "Poodle" when the puppy has no name of its own
  const label =
    p.displayName !== p.breed ? `${p.displayName} (${p.breed})` : p.displayName;
  const steps = p.origin === "local" ? stepsLocal : stepsAbroad;

  return (
    <>
      <article
        className="tp-storybook"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${p.cover.color} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
        }}
      >
        <StoryRibbon />
        <div className="gutter mx-auto max-w-[110rem] pt-8 pb-20 md:pt-12">
          <nav
            aria-label="Breadcrumb"
            className="text-[0.95rem] font-semibold text-cocoa-soft"
          >
            <Link className="link-ink" href={gone ? "/gone-home" : "/puppies"}>
              {gone ? "Gone home" : "Available puppies"}
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{p.displayName}</span>
          </nav>

          <Chapter n={1}>
            {gone ? "the day they went home" : "hello, it's me"}
          </Chapter>

          <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="min-w-0 lg:col-span-7">
              <PuppyGallery name={p.displayName} media={p.media} />
            </div>

            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
                {/* The puppy's name tag, with Teddy peeking over it */}
                <div
                  className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20"
                  data-reveal="true"
                >
                  <span aria-hidden="true" className="tp-tag__ring" />
                  <Teddy
                    pose="peek"
                    className="absolute right-6 -top-[4.8rem] w-[9.5rem]"
                    label={`Teddy, peeking over ${p.displayName}'s tag`}
                    bubble="hi friend!"
                    lane
                  />
                  {gone ? (
                    <span className="font-scrawl inline-grid -rotate-6 place-items-center rounded-full border-[3px] border-current px-3 py-1 text-sm tracking-wide text-toffee-deep uppercase">
                      Gone home ♥
                    </span>
                  ) : (
                    <span className="chip">
                      <PawIcon className="size-4 text-toffee" />
                      Available
                    </span>
                  )}
                  <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">
                    {p.displayName}
                  </h1>
                  <p className="mt-2 text-lg font-semibold text-cocoa-soft">
                    {p.breed}
                  </p>
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      ["Breed", p.breed],
                      ["Boy or girl", p.genderLabel],
                      ["Age", p.age],
                      ["Where", whereLabel(p)],
                    ].map(([dt, dd]) => (
                      <div key={dt}>
                        <dt className="font-scrawl text-sm text-cocoa-soft">
                          {dt}
                        </dt>
                        <dd className="mt-0.5 text-[1.05rem] font-semibold">
                          {dd}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {p.description && (
                    <p className="mt-6 text-cocoa-soft">{p.description}</p>
                  )}
                  <div className="mt-8 flex flex-col gap-3">
                    <a
                      href={whatsappLink(
                        `Hi TeddyPups! I'd love to know more about ${label}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                    >
                      {gone
                        ? "Ask about a puppy like this"
                        : `Ask about ${p.displayName} on WhatsApp`}
                    </a>
                    <a href={`#enquire-${p.slug}`} className="btn btn-ghost">
                      Send an enquiry
                    </a>
                  </div>
                </div>

                <div className="tp-paper mt-8 -rotate-1">
                  <Chapter n={2}>what comes with {p.displayName}</Chapter>
                  <h2 className="font-plush mt-1 text-[1.9rem]">
                    Every Teddy Pup comes
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {promise.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 font-semibold"
                      >
                        <svg
                          viewBox="0 0 32 32"
                          className="mt-0.5 size-6 shrink-0 text-toffee-deep"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 17l7 7L27 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {!gone && (
            <section aria-labelledby={`home-steps-${p.slug}`} className="mt-20">
              <Chapter n={3}>the way home</Chapter>
              <h2
                id={`home-steps-${p.slug}`}
                className="font-plush text-big mt-3"
              >
                {p.origin === "local"
                  ? "Meet your puppy in person"
                  : "Coming home from abroad"}
              </h2>
              <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
                {steps.map(([title, text], i) => (
                  <li key={title}>
                    <span
                      aria-hidden="true"
                      className="tp-trail__num font-plush"
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-plush-text text-xl leading-tight font-bold">
                      {title}
                    </h3>
                    <p className="mt-2 max-w-[38ch] text-cocoa-soft">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section
            id={`enquire-${p.slug}`}
            aria-labelledby={`enquire-title-${p.slug}`}
            className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
          >
            <span aria-hidden="true" className="tp-letter__stamp">
              <PawIcon className="size-9" />
            </span>
            <div className="lg:col-span-4">
              <Chapter n={gone ? 3 : 4}>dear TeddyPups…</Chapter>
              <h2
                id={`enquire-title-${p.slug}`}
                className="font-plush text-big mt-2"
              >
                {gone
                  ? "Looking for a puppy like this?"
                  : `Ask about ${p.displayName}`}
              </h2>
              <p className="mt-4 text-cocoa-soft">
                Leave your details and our team will get back to you promptly —
                or message us on WhatsApp for the quickest reply.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <EnquiryForm puppySlug={p.slug} puppyLabel={label} />
            </div>
          </section>

          <nav
            aria-label="More puppies"
            className="mt-16 grid gap-4 sm:grid-cols-2"
          >
            {[
              { pup: prev, kicker: "Previous pup" },
              { pup: next, kicker: "Next pup" },
            ].map(({ pup, kicker }) => (
              <Link
                key={kicker}
                href={`/puppies/${pup.slug}`}
                className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
              >
                <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
                  <Image
                    src={pup.cover.src}
                    alt={pup.cover.alt}
                    fill
                    sizes="80px"
                    style={{
                      objectFit: "cover",
                      objectPosition: focal(pup.cover),
                      backgroundColor: pup.cover.color,
                    }}
                  />
                </span>
                <span>
                  <span className="font-scrawl block text-sm text-cocoa-soft">
                    {kicker}
                  </span>
                  <span className="font-plush text-[1.6rem]">
                    {pup.displayName}
                  </span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </article>
      <ScrollReveal scope='[data-page="pup"]' />
    </>
  );
}
