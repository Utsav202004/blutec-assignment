"use client";

import { useEffect, useRef, useState } from "react";
import { teddyPoses, type TeddyPose } from "./teddy-poses";
import { GESTURE_MS, floatHearts, pickTrick } from "@/lib/teddy-tricks";

type TeddyProps = {
  pose: TeddyPose;
  /** Positioning class from the section, e.g. "tp-hero__teddy" */
  className?: string;
  label: string;
  /** Greeting shown in a speech bubble when `greet` is set */
  bubble?: string;
  /** Show the bubble once shortly after mount */
  greet?: boolean;
  /** Keep this Teddy visible on phones (others are hidden below 768px) */
  lane?: boolean;
  /** Mirror Teddy so he faces left */
  facing?: "left" | "right";
  /** A stop on the roaming Teddy's route (see components/teddy/RoamingTeddy) */
  stop?: boolean;
  /** Stop behaviour: "peekaboo" (hero intro), "basket" (footer), "tilt" */
  act?: string;
  /** Teddy sits behind something here (quilt, basket front) */
  behind?: boolean;
};

/**
 * Teddy, the TeddyPups mascot, drawn in one of four poses. Each instance
 * is visible on its own; tapping him does a random trick with a line.
 * Instances marked `stop` are also waypoints for the roaming Teddy: while
 * he's active they hide (html[data-pup]) and he walks between them.
 */
export function Teddy({
  pose,
  className = "",
  label,
  bubble,
  greet,
  lane,
  facing = "right",
  stop,
  act,
  behind,
}: TeddyProps) {
  const [text, setText] = useState(bubble ?? "");
  const [show, setShow] = useState(false);
  const buddyRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) =>
    timers.current.push(setTimeout(fn, ms));

  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  /** Show a line for `ms` milliseconds (a newer line replaces an older one) */
  const say = (line: string, ms = 1400) => {
    setText(line);
    setShow(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShow(false), ms);
  };

  /** Tap: a random trick with its line (jump, woof, hearts, sneeze), like the reference */
  const tap = () => {
    const buddy = buddyRef.current;
    if (!buddy) return;
    const t = pickTrick();
    if (t.gesture) {
      delete buddy.dataset.gesture;
      void buddy.offsetWidth; // restart the animation
      buddy.dataset.gesture = t.gesture;
      later(() => delete buddy.dataset.gesture, GESTURE_MS[t.gesture]);
    }
    if (t.hearts) {
      const w = buddy.offsetWidth;
      const h = buddy.offsetHeight;
      floatHearts(
        buddy,
        (facing === "left" ? 88 : 212) * (w / 300),
        50 * (h / 240),
      );
    }
    if (t.sayDelay) later(() => say(t.say, 1100), t.sayDelay);
    else say(t.say);
  };

  // Optional greeting shortly after load (e.g. the hero's "peekaboo!")
  useEffect(() => {
    if (!greet || !bubble) return;
    const t1 = setTimeout(() => {
      setText(bubble);
      setShow(true);
    }, 1400);
    const t2 = setTimeout(() => setShow(false), 4000);
    const pending = timers.current;
    const hide = hideTimer;
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(hide.current);
      pending.forEach(clearTimeout);
    };
  }, [greet, bubble]);

  return (
    <div
      data-pose={pose}
      data-facing={facing}
      data-lane={lane ? "true" : undefined}
      data-pup-stop={stop ? "true" : undefined}
      data-act={act}
      data-behind={behind ? "true" : undefined}
      className={`pup-stop ${className}`}
    >
      <div
        ref={buddyRef}
        className="pup-buddy"
        data-facing={facing}
        data-gait="pose"
        data-live=""
        onClick={tap}
      >
        <svg
          viewBox="0 0 300 240"
          style={{ overflow: "visible" }}
          role="img"
          aria-label={label}
          focusable="false"
        >
          {facing === "left" ? (
            <g transform="translate(300 0) scale(-1 1)">{teddyPoses[pose]}</g>
          ) : (
            teddyPoses[pose]
          )}
        </svg>
        <span aria-hidden="true" className="pup-bubble" data-show={show}>
          {text}
        </span>
      </div>
    </div>
  );
}
