import puppiesData from "./data/puppies.json";

/**
 * Puppy data was exported from the reference site's page payload and every
 * image/video URL was rewritten to a local file in /public/assets/media.
 */
export type Media = {
  src: string;
  kind: "image" | "video";
  width: number;
  height: number;
  alt: string;
  focalX: number;
  focalY: number;
  /** Average colour, used as a placeholder background while loading */
  color: string;
  caption?: string;
  blurDataUrl?: string;
  durationS?: number;
  poster?: Media;
};

export type Puppy = {
  slug: string;
  name: string;
  displayName: string;
  breed: string;
  gender: "male" | "female" | "male-female";
  genderLabel: string;
  age: string;
  description: string;
  status: "available" | "gone-home";
  origin: "imported" | "local";
  breeds: string[];
  collections: string[];
  cover: Media;
  media: Media[];
};

export const puppies = puppiesData as Puppy[];

export function getPuppy(slug: string) {
  return puppies.find((p) => p.slug === slug);
}

export const hasVideo = (p: Puppy) => p.media.some((m) => m.kind === "video");

/** "boy", "girl" or "boy & girl", as used in the short card blurbs */
export function genderWord(p: Puppy) {
  return p.gender === "male" ? "boy" : p.gender === "female" ? "girl" : "boy & girl";
}

/**
 * Short blurb under a puppy's name on the home page, e.g.
 * "Maltipoo, boy, 3 months, with video". The breed is left out when it
 * already is the display name.
 */
export function puppyBlurb(p: Puppy, sep = ", ") {
  const parts = [p.breed !== p.displayName ? p.breed : null, genderWord(p), p.age];
  return parts.filter(Boolean).join(sep);
}

/** CSS object-position from the photo's focal point */
export const focal = (m: Media) =>
  `${(m.focalX * 100).toFixed(1)}% ${(m.focalY * 100).toFixed(1)}%`;
