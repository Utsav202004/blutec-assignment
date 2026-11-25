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
};

/**
 * Teddy, the TeddyPups mascot. The original moves one animated Teddy between
 * these "stops" with a JS rig; here each stop renders its own static pose with
 * CSS idle animations, and tapping Teddy pops a speech bubble.
 */
export function Teddy({ pose, className = "", label, bubble, greet, lane }: TeddyProps) {
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
      data-facing="right"
      data-lane={lane ? "true" : undefined}
      className={`pup-stop ${className}`}
    >
      <div
        className="pup-buddy"
        data-facing="right"
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
          {teddyPoses[pose]}
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
