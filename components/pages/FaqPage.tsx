import type React from "react";
import { whatsappLink } from "@/lib/site";
import { faqs } from "@/lib/faqs";
import { NoticeBoard } from "@/components/faq/NoticeBoard";

export function FaqPage() {
  return (
    <div data-page="faq" className="tp-page">
      <section
        data-tone="dark"
        className="tp-scene tp-faqroom overflow-hidden"
        style={
          {
            "--sky-top": "#a95e32",
            "--sky-bottom": "#331c11",
          } as React.CSSProperties
        }
        aria-labelledby="faq-title"
      >
        <div className="gutter relative mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="max-w-4xl">
            <h1 id="faq-title" className="font-plush text-giant">
              Questions &amp; answers
            </h1>
            <p className="text-lede mt-6 max-w-[52ch] text-[var(--ink-soft)]">
              Can&apos;t find what you&apos;re looking for? Message us on
              WhatsApp — our team is available 24/7.
            </p>
          </header>
          <div className="mt-12 md:mt-16">
            <NoticeBoard faqs={faqs} askHref={whatsappLink()} />
          </div>
        </div>
      </section>
    </div>
  );
}
