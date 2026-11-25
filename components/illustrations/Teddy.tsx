"use client";

import { useEffect, useRef, useState } from "react";
import { teddyPoses, type TeddyPose } from "./teddy-poses";

type TeddyProps = {
  pose: TeddyPose;
  /** Positioning class from the section, e.g. "tp-hero__teddy" */
  className?: string;
  label: string;
  /** Speech bubble text shown when Teddy is tapped (and optionally on load) */
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
 * is visible on its own (with idle animations and a speech bubble on tap).
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
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const say = (ms = 1800) => {
    if (!bubble) return;
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), ms);
  };

  useEffect(() => {
    if (!greet || !bubble) return;
    const t = setTimeout(() => {
      setShow(true);
      timer.current = setTimeout(() => setShow(false), 2600);
    }, 1400);
    return () => {
      clearTimeout(t);
      clearTimeout(timer.current);
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
        className="pup-buddy"
        data-facing={facing}
        data-live={bubble ? "" : undefined}
        onClick={() => say()}
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
        {bubble && (
          <span aria-hidden="true" className="pup-bubble" data-show={show}>
            {bubble}
          </span>
        )}
      </div>
    </div>
  );
}
