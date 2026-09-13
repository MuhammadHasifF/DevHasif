"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { createAnimationTimers } from "@/lib/animation-timers";
import { useSettings } from "@/components/layout/settings-provider";

type GlitchPhase = "idle" | "burst" | "swap";

type Burst = {
  rgb: number; // pixels of RGB split
  slice: number; // % height of slice band
  sliceY: number; // % top of slice band
  shake: number; // pixels of horizontal shake
  invert: boolean;
};

const ZERO_BURST: Burst = { rgb: 0, slice: 0, sliceY: 0, shake: 0, invert: false };

/**
 * Cyberpunk 2077-style glitch headline.
 *
 * - Two render layers (red + cyan) shift apart on glitch beats for chromatic aberration.
 * - A scan band slices the text horizontally with a clip-path on heavy bursts.
 * - First word periodically swaps between "MUHAMMAD" and "DEV" with a quick burst.
 * - Reveal-line entrance is preserved so the section still cinematically settles in.
 */
export function GlitchHeadline({ className }: { className?: string }) {
  const { reducedMotion } = useSettings();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [first, setFirst] = useState<"MUHAMMAD" | "DEV">("MUHAMMAD");
  const [burst, setBurst] = useState<Burst>(ZERO_BURST);
  const [phase, setPhase] = useState<GlitchPhase>("idle");

  // Side-effect on first-word change: publish CSS var + dispatch swap event
  // for HeroLogoBridge. MUST live in an effect (not in a state updater),
  // because React calls updater fns multiple times in StrictMode/dev and
  // dispatching from inside the updater fired the event 2x per swap, which
  // caused HeroLogoBridge to flicker.
  // Skip the initial render so the very first effect call doesn't fire a
  // spurious MUHAMMAD swap event on mount.
  const isInitialFirstChange = useRef(true);
  useEffect(() => {
    if (isInitialFirstChange.current) {
      isInitialFirstChange.current = false;
      document.documentElement.style.setProperty("--hero-word-dev", "0");
      return;
    }
    document.documentElement.style.setProperty(
      "--hero-word-dev",
      first === "DEV" ? "1" : "0",
    );
    window.dispatchEvent(
      new CustomEvent("hero-word-swap", { detail: { word: first } }),
    );
  }, [first]);

  // Reveal on enter
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevealed(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Glitch + swap loop. Pauses when the hero scrolls out of view OR the
  // tab is hidden so we don't burn CPU running animations no one is seeing.
  useEffect(() => {
    if (!revealed) return;
    if (reducedMotion) {
      setBurst(ZERO_BURST);
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

    const trigger = () => {
      if (cancelled) return;
      if (!visible || !onScreen) {
        // Skip this beat, retry shortly when conditions allow.
        timers.schedule(trigger, 600);
        return;
      }
      const heavy = Math.random() < 0.42;
      const swap = Math.random() < 0.55;
      const beats = heavy ? 7 : 4;

      const runBeats = (i: number) => {
        if (cancelled) return;
        if (i >= beats) {
          setBurst(ZERO_BURST);
          setPhase("idle");
          const wait = 1800 + Math.random() * 2400;
          timers.schedule(trigger, wait);
          return;
        }
        const rgb = (heavy ? 6 : 3) + Math.random() * (heavy ? 6 : 3);
        setBurst({
          rgb,
          slice: 6 + Math.random() * (heavy ? 28 : 14),
          sliceY: Math.random() * 100,
          shake: (Math.random() - 0.5) * (heavy ? 12 : 4),
          invert: heavy && Math.random() < 0.4,
        });
        setPhase("burst");
        // Mid-burst, swap the first word. PURE state updater — side
        // effects (CSS var + dispatch event) live in the useEffect above
        // because StrictMode can call this updater 2x and we'd fire the
        // event twice per swap, causing avatar flicker.
        if (swap && i === Math.floor(beats / 2)) {
          setFirst((f) => (f === "MUHAMMAD" ? "DEV" : "MUHAMMAD"));
          setPhase("swap");
        }
        timers.schedule(() => runBeats(i + 1), 70 + Math.random() * 90);
      };

      runBeats(0);
    };

    timers.schedule(trigger, 1200);
    return () => {
      cancelled = true;
      timers.clear();
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [revealed, reducedMotion]);

  const sliceClip =
    phase === "burst" && burst.slice > 0
      ? `polygon(
          0% 0%,
          100% 0%,
          100% ${burst.sliceY}%,
          ${20 + Math.random() * 60}% ${burst.sliceY}%,
          ${20 + Math.random() * 60}% ${Math.min(100, burst.sliceY + burst.slice)}%,
          100% ${Math.min(100, burst.sliceY + burst.slice)}%,
          100% 100%,
          0% 100%
        )`
      : undefined;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <h1 aria-label="Muhammad Hasif" className="font-display text-[clamp(3rem,14vw,11rem)] font-bold leading-[0.88] tracking-[-0.04em] text-[var(--color-text-0)]">
        <GlitchLine revealed={revealed} delay={0}>
          <GlitchWord
            text={first}
            burst={burst}
            phase={phase}
            sliceClip={sliceClip}
          />
        </GlitchLine>
        <GlitchLine revealed={revealed} delay={90}>
          <GlitchWord
            text="HASIF"
            burst={burst}
            phase={phase}
            sliceClip={sliceClip}
            accent
          />
        </GlitchLine>
      </h1>
      {/* Stray noise sliver — only briefly visible during heavy glitches */}
      {phase === "burst" && burst.invert && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0"
          style={{
            top: `${burst.sliceY}%`,
            height: `${burst.slice}%`,
            background:
              "repeating-linear-gradient(to bottom, transparent 0 1px, rgba(255,30,60,0.18) 1px 2px)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  );
}

function GlitchLine({
  children,
  revealed,
  delay,
}: {
  children: React.ReactNode;
  revealed: boolean;
  delay: number;
}) {
  return (
    <span
      className={cn("reveal-line", revealed && "in-view")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span style={{ transitionDelay: `${delay}ms` }}>{children}</span>
    </span>
  );
}

function GlitchWord({
  text,
  burst,
  phase,
  sliceClip,
  accent = false,
}: {
  text: string;
  burst: Burst;
  phase: GlitchPhase;
  sliceClip?: string;
  accent?: boolean;
}) {
  const shake = phase === "burst" ? burst.shake : 0;
  return (
    <span
      className="relative inline-block align-baseline"
      style={{
        transform: `translate3d(${shake}px, 0, 0)`,
        transition: "transform 50ms linear",
      }}
    >
      {/* Red channel */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          color: "#ff1e3c",
          mixBlendMode: "screen",
          transform: `translate3d(${-burst.rgb}px, 0, 0)`,
          transition: "transform 60ms linear",
          opacity: phase === "idle" ? 0 : 0.9,
          pointerEvents: "none",
          clipPath: sliceClip,
          textShadow: "0 0 12px rgba(255,30,60,0.6)",
          willChange: "transform, opacity",
        }}
      >
        {text}
        {accent && <span style={{ color: "#ff1e3c" }}>.</span>}
      </span>
      {/* Cyan channel */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          color: "#00e5ff",
          mixBlendMode: "screen",
          transform: `translate3d(${burst.rgb}px, ${phase === "burst" ? -1 : 0}px, 0)`,
          transition: "transform 60ms linear",
          opacity: phase === "idle" ? 0 : 0.7,
          pointerEvents: "none",
          clipPath: sliceClip,
          textShadow: "0 0 10px rgba(0,229,255,0.45)",
          willChange: "transform, opacity",
        }}
      >
        {text}
        {accent && <span style={{ color: "#00e5ff" }}>.</span>}
      </span>
      {/* Main */}
      <span
        className="relative"
        style={{
          filter:
            phase === "burst"
              ? "drop-shadow(0 0 18px color-mix(in oklab, var(--color-accent) 50%, transparent))"
              : undefined,
        }}
      >
        {text}
        {accent && <span className="text-[var(--color-accent)]">.</span>}
      </span>
    </span>
  );
}
