import { useMemo } from "react";

const COLORS = ["var(--grape)", "var(--sun)", "var(--coral)", "var(--mint)", "var(--sky)"];

/**
 * A short, CSS-only burst on solve. Hidden for players who prefer reduced
 * motion (see styles.css). Positions are pre-computed so re-renders don't jitter.
 */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.1 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() - 0.5) * 900,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [pieces],
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className={b.round ? "round" : ""}
          style={
            {
              left: `${b.left}%`,
              background: b.color,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--drift": `${b.drift}px`,
              "--spin": `${b.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
