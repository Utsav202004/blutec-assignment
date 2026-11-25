"use client";

import {
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

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: keyof EnquiryErrors;
  error?: string;
  hint?: string;
};

/** Labelled input with hint / error text wired up for screen readers */
function Field({ label, name, error, hint, required, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[0.95rem] font-semibold">
        {label}
        {required ? (
          <span className="text-toffee-ink"> *</span>
        ) : (
          <span className="font-normal text-cocoa-soft"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className="mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]"
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-cocoa-soft">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-err`}
          className="mt-1 text-sm font-semibold text-[#b3261e]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Enquiry form used on each puppy page. Validates in the browser first
 * (same rules as the server), focuses the first problem, then posts JSON to
 * /api/enquiry and swaps to an envelope "Message received!" card.
 */
export function EnquiryForm({
  puppySlug,
  puppyLabel,
}: {
  puppySlug: string;
  puppyLabel: string;
}) {
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messageId = useId();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as EnquiryInput;
    const found = validateEnquiry(data);
    setErrors(found);
    setMessage(null);
    const first = Object.keys(found)[0];
    if (first) {
      form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, puppy: puppySlug }),
      });
      const json = await res.json();
      if (json.ok) return setStatus("sent");
      setErrors(json.errors ?? {});
      setMessage(json.message ?? "Please check the highlighted fields.");
    } catch {
      setMessage(
        "Something went wrong sending your message. Please try again, or message us on WhatsApp.",
      );
    }
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="tp-sent rounded-[2rem] border-[3px] border-cocoa bg-honey p-8 text-center"
      >
        <svg
          viewBox="0 0 120 84"
          className="tp-envelope mx-auto w-32"
          aria-hidden="true"
        >
          <path
            d="M6 10h108v68H6z"
            fill="#fffdf8"
            stroke="#2a170e"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M6 10l54 40 54-40"
            fill="none"
            stroke="#2a170e"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle
            cx="94"
            cy="62"
            r="12"
            fill="#c2622b"
            stroke="#2a170e"
            strokeWidth="2.5"
          />
        </svg>
        <p className="font-plush mt-4 text-[2rem]">{enquirySuccess.heading}</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-cocoa-soft">
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
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      {message && (
        <p
          role="alert"
          className="rounded-2xl bg-blush px-4 py-3 font-semibold"
        >
          {message}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          error={errors.name}
        />
        <Field
          label="Phone or WhatsApp"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          error={errors.phone}
          hint="With country code, e.g. +971 50 123 4567"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Your area"
          name="area"
          autoComplete="address-level2"
          maxLength={80}
          error={errors.area}
          hint="e.g. Dubai Marina"
        />
      </div>
      <div>
        <label
          htmlFor={messageId}
          className="block text-[0.95rem] font-semibold"
        >
          Message{" "}
          <span className="font-normal text-cocoa-soft">(optional)</span>
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={4}
          maxLength={2000}
          defaultValue={`Hi! I'd love to know more about ${puppyLabel}.`}
          className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)]"
        />
      </div>
      {/* Honeypot field, hidden from people and screen readers */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            name="website"
            defaultValue=""
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary w-full disabled:opacity-70 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
