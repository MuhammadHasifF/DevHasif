"use client";

import { useEffect, useRef, useState } from "react";
import { createAnimationTimers } from "@/lib/animation-timers";
import { useSettings } from "@/components/layout/settings-provider";

/**
 * Single-word red glitch swap. Cycles between two strings on a randomized
 * interval, the same way the hero MUHAMMAD ↔ DEV swap works in
 * glitch-headline.tsx. Each transition runs a brief burst of stepped
 * RGB offsets so the new word arrives through a glitch, not a fade.
 *
 * Pauses when document is hidden OR when the element is out of view.
 *
 * Reduced motion: shows the first word statically, no swap.
 */
type Phase = "idle" | "burst";

export function GlitchSwap({
  words,
  className,
  intensity = 1,
  reserve,
}: {
  /** Two or more words to cycle between. */
  words: [string, string, ...string[]];
  className?: string;
  intensity?: number;
  /** A string to reserve layout width for, so the slot doesn't shrink/grow
   *  as words swap. Default: longest word in `words`. */
  reserve?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useSettings();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reducedMotion) {
      setShift(0);
      setPhase("idle");
      return;
    }

    let cancelled = false;
    let visible = !document.hidden;
    let onScreen = true;
    const timers = createAnimationTimers();

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const sentinel = ref.current;
    let io: IntersectionObserver | null = null;
    if (sentinel && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) onScreen = e.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(sentinel);
    }

    const swap = () => {
      if (cancelled) return;
      if (!visible || !onScreen) {
        timers.schedule(swap, 800);
        return;
      }
      const beats = 5;
      const runBeats = (i: number) => {
        if (cancelled) return;
        if (i >= beats) {
          setShift(0);
          setPhase("idle");
          const wait = 2200 + Math.random() * 3200;
          timers.schedule(swap, wait);
          return;
        }
        // Mid-burst, flip to the next word
        if (i === Math.floor(beats / 2)) {
          setIndex((n) => (n + 1) % words.length);
        }
        setShift((Math.random() - 0.5) * 12 * intensity);
        setPhase("burst");
        timers.schedule(() => runBeats(i + 1), 60 + Math.random() * 90);
      };
      runBeats(0);
    };

    // First swap after a beat of breathing room
    timers.schedule(swap, 1800);

    return () => {
      cancelled = true;
      timers.clear();
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [words, intensity, reducedMotion]);

  const text = words[index];
  const burst = phase === "burst";
  // Reserve width: render the longest word invisibly, then absolute-position
  // the active word over it so the slot can't shrink/grow between swaps.
  const reserveWord =
    reserve ?? words.reduce((a, b) => (b.length > a.length ? b : a), words[0]);

  return (
    <span
      ref={ref}
      className={`relative inline-block align-baseline ${className ?? ""}`}
      style={{
        transform: `translate3d(${burst ? shift * 0.4 : 0}px, 0, 0)`,
        transition: "transform 60ms linear",
      }}
    >
      {/* Width reservation: invisible longest word locks the slot size. */}
      <span aria-hidden="true" style={{ visibility: "hidden" }}>
        {reserveWord}
      </span>
      {/* Red ghost */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          color: "var(--color-accent)",
          mixBlendMode: "screen",
          transform: `translate3d(${burst ? -Math.abs(shift) : 0}px, 0, 0)`,
          opacity: burst ? 0.9 : 0,
          textShadow: "0 0 14px color-mix(in oklab, var(--color-accent) 70%, transparent)",
          transition: "transform 60ms linear, opacity 60ms linear",
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      >
        {text}
      </span>
      {/* Hot-red ghost on the other side */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          color: "#ff5560",
          mixBlendMode: "screen",
          transform: `translate3d(${burst ? Math.abs(shift) : 0}px, 0, 0)`,
          opacity: burst ? 0.65 : 0,
          transition: "transform 60ms linear, opacity 60ms linear",
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      >
        {text}
      </span>
      {/* Active word, absolutely positioned so it doesn't shift the slot */}
      <span className="absolute inset-0">{text}</span>
    </span>
  );
}
