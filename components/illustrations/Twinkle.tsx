import type { CSSProperties } from "react";

/** Four-point twinkling star (animation: .tp-twinkle in app/styles/footer.css). */
export function Twinkle({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={`tp-twinkle ${className}`} style={style} aria-hidden="true">
      <path
        d="M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z"
        fill="currentColor"
      />
    </svg>
  );
}
