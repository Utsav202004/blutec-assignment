/**
 * Single source of truth for brand details, contact info and navigation.
 * Change the WhatsApp number / email here and it updates everywhere.
 *
 * Note: the reference site uses placeholder contact details; we keep
 * placeholders too, so no real business or person is contacted.
 */
const whatsappNumber = "971500000000"; // digits only, used in wa.me links

export const site = {
  name: "TeddyPups U.A.E.",
  shortName: "TeddyPups",
  tagline: "every puppy is family",
  description:
    "Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders worldwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "+971 50 000 0000",
  phoneHref: "tel:+971500000000",
  email: "hello@example.com",
  address: "Downtown Dubai, United Arab Emirates",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Downtown+Dubai",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],
} as const;

/** Build a wa.me link with a pre-filled message. */
export function whatsappLink(
  message = "Hi TeddyPups! I'd love to know more about your puppies.",
) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Puppies", href: "/puppies" },
  { label: "Happy families", href: "/happy-families" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Visit & contact", href: "/contact" },
] as const;

export const footerNav = [
  { label: "Available puppies", href: "/puppies" },
  { label: "Gone home", href: "/gone-home" },
  { label: "Happy families", href: "/happy-families" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Delivery & collection", href: "/how-it-works#delivery" },
  { label: "FAQ", href: "/faq" },
  { label: "Visit & contact", href: "/contact" },
] as const;
