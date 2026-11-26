/**
 * What Teddy does when you tap him, shared by the roaming Teddy and the static
 * Teddys on other pages (as on the reference: jump, woof, love, sneeze).
 * `gesture` names a CSS animation in app/styles/roaming.css; `hearts` floats a
 * few hearts up from his head.
 */
export type Trick = {
  gesture?: "jump" | "jolt" | "sneeze";
  say: string;
  hearts?: boolean;
  sayDelay?: number;
};

export const TRICKS: Trick[] = [
  { gesture: "jump", say: "wheee!" },
  { gesture: "jolt", say: "woof!" },
  { hearts: true, say: "love you!" },
  { gesture: "sneeze", say: "achoo!", sayDelay: 520 },
];

export const GESTURE_MS: Record<string, number> = {
  tilt: 2400,
  yawn: 1800,
  jolt: 550,
  jump: 700,
  sneeze: 900,
};

let lastTrick = -1;
/** A random trick, never the same one twice in a row */
export function pickTrick(): Trick {
  let i = Math.floor(Math.random() * TRICKS.length);
  if (i === lastTrick) i = (i + 1) % TRICKS.length;
  lastTrick = i;
  return TRICKS[i];
}

/** Float three hearts up from (x, y) inside `container` (an absolutely positioned layer) */
export function floatHearts(container: HTMLElement, x: number, y: number) {
  [0, 1, 2].forEach((i) => {
    const h = document.createElement("span");
    h.className = "pup-heart";
    h.textContent = "♥";
    container.appendChild(h);
    const dx = (i - 1) * 22 + (Math.random() - 0.5) * 10;
    h.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(0.4)`, opacity: 0 },
        {
          transform: `translate(${x + dx * 0.4}px, ${y - 24}px) scale(1)`,
          opacity: 1,
          offset: 0.25,
        },
        {
          transform: `translate(${x + dx}px, ${y - 80}px) scale(0.9)`,
          opacity: 0,
        },
      ],
      { duration: 1300, delay: i * 140, easing: "ease-out", fill: "backwards" },
    ).finished.then(
      () => h.remove(),
      () => h.remove(),
    );
  });
}
