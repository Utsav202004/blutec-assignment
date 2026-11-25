import { site, whatsappLink } from "@/lib/site";

// Temporary token preview — replaced by the real home page in Phase 3.
const swatches = [
  "toffee",
  "toffee-deep",
  "toffee-ink",
  "honey",
  "honey-soft",
  "cocoa",
  "cocoa-soft",
  "milk",
  "sky",
  "sky-deep",
  "blush",
  "whatsapp",
] as const;

const bg: Record<(typeof swatches)[number], string> = {
  toffee: "bg-toffee",
  "toffee-deep": "bg-toffee-deep",
  "toffee-ink": "bg-toffee-ink",
  honey: "bg-honey",
  "honey-soft": "bg-honey-soft",
  cocoa: "bg-cocoa",
  "cocoa-soft": "bg-cocoa-soft",
  milk: "bg-milk",
  sky: "bg-sky",
  "sky-deep": "bg-sky-deep",
  blush: "bg-blush",
  whatsapp: "bg-whatsapp",
};

export default function Home() {
  return (
    <main className="gutter mx-auto max-w-7xl py-20">
      <p className="font-scrawl text-xl text-toffee-deep">{site.tagline}</p>
      <h1 className="font-plush mt-2 text-6xl md:text-8xl">
        Premium teacup puppies in Dubai
      </h1>
      <p className="mt-6 max-w-xl text-cocoa-soft">{site.description}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="btn btn-primary" href="/puppies">
          View available puppies
        </a>
        <a className="btn btn-ghost" href={whatsappLink()}>
          Enquire on WhatsApp
        </a>
        <a className="btn btn-whatsapp" href={whatsappLink()}>
          WhatsApp us
        </a>
      </div>
      <ul className="mt-16 grid grid-cols-3 gap-4 sm:grid-cols-6">
        {swatches.map((name) => (
          <li key={name} className="text-sm">
            <div
              className={`${bg[name]} h-16 rounded-2xl border border-cocoa/10`}
            />
            <span className="mt-1 block">{name}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
