/**
 * Lets page sections "cue" the roaming Teddy, e.g. the WhatsApp chat makes
 * him say "ooh, photos!" when the photos arrive. Teddy only reacts if he's
 * currently sitting in the section the cue comes from.
 */
export const TEDDY_CUE = "pup:cue";

export type TeddyCue = {
  /** Speech bubble text */
  say?: string;
  /** Element to look at (also scopes the cue to its section) */
  near?: Element | null;
  /** How long to look, in seconds */
  secs?: number;
};

export function cueTeddy(cue: TeddyCue) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TeddyCue>(TEDDY_CUE, { detail: cue }));
}
