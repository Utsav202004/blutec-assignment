/**
 * Enquiry validation, shared by the form (instant feedback in the browser)
 * and the API route (never trust the client). Same fields and limits as the
 * reference: name 2–80 chars, phone required, email/area optional.
 */
export type EnquiryInput = {
  name?: string;
  phone?: string;
  email?: string;
  area?: string;
  message?: string;
  puppy?: string;
  /** Honeypot: real people never fill this hidden field */
  website?: string;
};

export type EnquiryErrors = Partial<
  Record<"name" | "phone" | "email" | "area", string>
>;

const PHONE = /^\+?[0-9\s().-]{7,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(input: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const area = input.area?.trim() ?? "";

  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 80)
    errors.name = "That name is a little long — 80 characters max.";

  const digits = phone.replace(/\D/g, "");
  if (!phone) errors.phone = "Please add a phone or WhatsApp number.";
  else if (!PHONE.test(phone) || digits.length < 7)
    errors.phone = "Please enter a valid number, with country code.";

  if (email && !EMAIL.test(email))
    errors.email = "That email doesn't look right.";
  if (area.length > 80) errors.area = "Please keep this under 80 characters.";

  return errors;
}

export const enquirySuccess = {
  heading: "Message received!",
  body: "Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.",
};
