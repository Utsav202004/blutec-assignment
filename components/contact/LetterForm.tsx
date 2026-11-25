"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import {
  enquirySuccess,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryInput,
} from "@/lib/enquiry";
import { whatsappLink } from "@/lib/site";
import { PawIcon } from "@/components/ui/PawIcon";

type Phase = "writing" | "sealing" | "posting" | "sent";

/** A fill-in-the-blank input sitting inline in the letter's sentences */
function Blank({
  name,
  label,
  error,
  size = 14,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  name: keyof EnquiryErrors;
  label: string;
  error?: string;
  size?: number;
}) {
  return (
    <span
      className="tp-blank"
      style={{ "--size": `${size}ch` } as React.CSSProperties}
    >
      <input
        name={name}
        aria-label={label}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${name}-err` : undefined}
        {...rest}
      />
    </span>
  );
}

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Contact form written as a letter ("Dear TeddyPups, my name is ___ …").
 * On a successful send the letter folds into an envelope ("sealing"), drops
 * into a post box ("posting"), then a confirmation replaces it ("sent").
 * Errors are listed at the top of the letter and the first bad field is focused.
 */
export function LetterForm({
  puppies,
}: {
  puppies: { value: string; label: string }[];
}) {
  const [phase, setPhase] = useState<Phase>("writing");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [minHeight, setMinHeight] = useState<number>();
  const boxRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const noteId = useId();

  // Focus the first invalid blank whenever errors come back
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [errors]);

  // Move focus to the confirmation and make sure it's on screen
  useEffect(() => {
    if (phase !== "sent" || !sentRef.current) return;
    sentRef.current.focus({ preventScroll: true });
    const top = sentRef.current.getBoundingClientRect().top;
    if (top < 100)
      window.scrollBy({
        top: top - 100,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
  }, [phase]);

  const playPostingAnimation = () => {
    if (reducedMotion()) return setPhase("sent");
    setMinHeight(boxRef.current?.offsetHeight); // keep the layout steady while it animates
    setPhase("sealing");
    setTimeout(() => setPhase("posting"), 750);
    setTimeout(() => {
      setMinHeight(undefined);
      setPhase("sent");
    }, 1750);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(
      new FormData(e.currentTarget),
    ) as EnquiryInput & { puppyId?: string };
    const found = validateEnquiry(data);
    if (Object.keys(found).length) {
      setMessage("A couple of blanks need filling in:");
      setErrors(found);
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, puppy: data.puppyId || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        setErrors({});
        playPostingAnimation();
      } else {
        setMessage(json.message ?? "A couple of blanks need filling in:");
        setErrors(json.errors ?? {});
      }
    } catch {
      setMessage(
        "Something went wrong posting your letter. Please try again, or message us on WhatsApp.",
      );
    }
    setPending(false);
  };

  const errorList = Object.entries(errors);

  return (
    <div
      ref={boxRef}
      className="tp-post"
      data-phase={phase}
      style={{ minHeight }}
    >
      {phase !== "sent" && (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          noValidate
          className="tp-letterform"
          aria-hidden={phase !== "writing" || undefined}
          inert={phase !== "writing"}
        >
          <span aria-hidden="true" className="tp-letter__stamp">
            <PawIcon className="size-9" />
          </span>
          <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>
          {message && (
            <div role="alert" className="tp-letterform__alert">
              <p className="font-semibold">{message}</p>
              {errorList.length > 0 && (
                <ul>
                  {errorList.map(([field, text]) => (
                    <li key={field} id={`${field}-err`}>
                      {text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="tp-letterform__line">
            my name is{" "}
            <Blank
              name="name"
              label="Your name (required)"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              size={16}
              error={errors.name}
            />
            , and you can reach me on{" "}
            <Blank
              name="phone"
              label="Phone or WhatsApp number with country code (required)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              size={15}
              placeholder="+971 50 123 4567"
              error={errors.phone}
            />{" "}
            or by email at{" "}
            <Blank
              name="email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              size={20}
              placeholder="optional"
              error={errors.email}
            />
            .
          </p>
          <p className="tp-letterform__line">
            I live in{" "}
            <Blank
              name="area"
              label="Your area (optional)"
              autoComplete="address-level2"
              maxLength={80}
              size={13}
              placeholder="e.g. Dubai Marina"
              error={errors.area}
            />
            , and I&apos;m curious about{" "}
            <span className="tp-blank tp-blank--select">
              <label htmlFor={selectId} className="sr-only">
                Puppy you&apos;re interested in (optional)
              </label>
              <select id={selectId} name="puppyId" defaultValue="">
                <option value="">any puppy (not sure yet)</option>
                {puppies.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </span>
            .
          </p>
          <label htmlFor={noteId} className="sr-only">
            Your message (optional)
          </label>
          <textarea
            id={noteId}
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Anything else you'd like to tell us…"
            className="tp-letterform__note"
          />
          {/* Honeypot for bots */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label>
              Website
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </label>
          </div>
          <div className="tp-letterform__sign">
            <p className="font-scrawl">with love, a future puppy parent</p>
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary disabled:opacity-70"
            >
              {pending ? "Sealing the envelope…" : "Post my letter"}
            </button>
          </div>
        </form>
      )}

      {(phase === "sealing" || phase === "posting") && (
        <div aria-hidden="true" className="tp-post__scene">
          <svg viewBox="0 0 160 112" className="tp-post__envelope">
            <rect
              x="4"
              y="18"
              width="152"
              height="90"
              rx="6"
              fill="#fffdf8"
              stroke="#2a170e"
              strokeWidth="4"
            />
            <path
              d="M6 104 64 62M154 104 96 62"
              fill="none"
              stroke="#2a170e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="tp-post__flap"
              d="M6 22 80 74 154 22"
              fill="#fbe3b4"
              stroke="#2a170e"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle
              cx="80"
              cy="72"
              r="11"
              fill="#a24a1a"
              stroke="#2a170e"
              strokeWidth="3"
            />
          </svg>
          <svg viewBox="0 0 200 260" className="tp-post__box">
            <rect
              x="86"
              y="170"
              width="28"
              height="86"
              fill="#5a3a28"
              stroke="#2a170e"
              strokeWidth="4"
            />
            <path
              d="M30 70a70 54 0 0 1 140 0v104H30z"
              fill="#c2622b"
              stroke="#2a170e"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <rect x="58" y="86" width="84" height="14" rx="7" fill="#2a170e" />
            <path
              d="M44 128h112"
              stroke="#2a170e"
              strokeWidth="3"
              strokeLinecap="round"
              opacity=".35"
            />
            <g className="tp-post__flag">
              <path
                d="M170 120V64"
                stroke="#2a170e"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M170 64h22v16h-22"
                fill="#f2be6b"
                stroke="#2a170e"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
      )}

      {phase === "sent" && (
        <div
          ref={sentRef}
          tabIndex={-1}
          role="status"
          className="tp-post__sent"
        >
          <svg
            viewBox="0 0 200 150"
            aria-hidden="true"
            className="tp-post__box tp-post__box--sent"
          >
            <rect
              x="86"
              y="96"
              width="28"
              height="52"
              fill="#5a3a28"
              stroke="#2a170e"
              strokeWidth="4"
            />
            <path
              d="M30 50a70 44 0 0 1 140 0v52H30z"
              fill="#c2622b"
              stroke="#2a170e"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <rect x="58" y="58" width="84" height="12" rx="6" fill="#2a170e" />
            <path
              d="M170 92V22"
              stroke="#2a170e"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M170 22h22v16h-22"
              fill="#f2be6b"
              stroke="#2a170e"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-plush mt-4 text-[2rem]">
            {enquirySuccess.heading}
          </p>
          <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">
            {enquirySuccess.body}
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-6"
          >
            WhatsApp us
          </a>
        </div>
      )}
    </div>
  );
}
