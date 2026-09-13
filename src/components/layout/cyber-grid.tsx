"use client";

import { useEffect, useRef } from "react";
import { useAnimationVisibility } from "@/components/primitives/use-animation-visibility";

export function CyberGrid() {
  const ref = useRef<HTMLDivElement>(null);
  useAnimationVisibility(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hover = window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The 12+ visual layers each consume --sp via calc()/color-mix()
    // expressions. Writing --sp on every rAF with 4-decimal precision
    // forces a fresh recalc + repaint of all of them per frame, which
    // shows up as scroll jank. Quantize to 200 steps (0.005 each), and
    // only write to the DOM when a value actually moves to a new step.
    let pending = false;
    let frame = 0;
    let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let mx = 0;
    let my = 0;
    let sp = 0;
    let lastSpStep = -1;
    let lastMxStep = -2;
    let lastMyStep = -2;
    const apply = () => {
      pending = false;
      const spStep = Math.round(sp * 200);
      if (spStep !== lastSpStep) {
        lastSpStep = spStep;
        el.style.setProperty("--sp", (spStep / 200).toFixed(3));
      }
      // Round pointer coords to 4px buckets — spotlight gradient doesn't
      // benefit visually from sub-pixel precision and the writes are
      // expensive at high mouse-move frequency.
      const mxStep = Math.round(mx / 4);
      const myStep = Math.round(my / 4);
      if (mxStep !== lastMxStep) {
        lastMxStep = mxStep;
        el.style.setProperty("--mx", `${mxStep * 4}px`);
      }
      if (myStep !== lastMyStep) {
        lastMyStep = myStep;
        el.style.setProperty("--my", `${myStep * 4}px`);
      }
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      schedule();
    };
    const onScroll = () => {
      sp = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      schedule();
    };
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      onScroll();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("resize", measure, { passive: true });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (hover && !reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      style={
        {
          backgroundColor: "#000",
          ["--mx" as string]: "50vw",
          ["--my" as string]: "50vh",
          ["--sp" as string]: "0",
          // burn now stays subtle — HomeBgRamp owns the bright-red dominance.
          ["--burn" as string]: "calc(max(0, var(--sp) - 0.5) * 1.0)",
          // phase A: hero zone (1 → 0 by sp ~0.25)
          ["--phase-a" as string]: "calc(1 - min(1, var(--sp) * 4))",
          // phase B: mid-page (peaks around sp 0.45, fades out around sp 0.78)
          ["--phase-b" as string]:
            "calc(min(1, max(0, (var(--sp) - 0.22) * 3.6)) * (1 - max(0, (var(--sp) - 0.62) * 2.6)))",
          // phase C: deeper page — soft accent only; HomeBgRamp handles the heavy red.
          ["--phase-c" as string]:
            "calc(min(1, max(0, (var(--sp) - 0.55) * 2.0)) * 0.55)",
        } as React.CSSProperties
      }
    >
      {/* Phase A: hero accent bloom — fades out as you leave the hero */}
      <div
        className="absolute left-1/2 top-[10%] h-[120vmax] w-[120vmax] -translate-x-1/2 will-change-transform motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 70%)",
          opacity: "calc(0.35 + var(--sp) * 0.45)",
          transform:
            "translate(-50%, calc(-12vh + var(--sp) * -32vh)) scale(calc(1 + var(--sp) * 0.35))",
        }}
      />

      {/* Cyber grid (always on, drifts up as you scroll) */}
      <div
        className="absolute inset-0 bg-cyber-grid opacity-[0.22] motion-reduce:opacity-15"
        style={{
          animation: "var(--animate-grid-drift)",
          transform: "translateY(calc(var(--sp) * -6vh))",
        }}
      />

      {/* Phase B: dot constellation fades in over the grid (mid-page) */}
      <div
        className="absolute inset-0 bg-cyber-dots motion-reduce:hidden"
        style={{
          opacity: "calc(var(--phase-b) * 0.5)",
          transform: "translateY(calc(var(--sp) * -4vh))",
        }}
      />

      {/* Phase B: diagonal scanstripes (mid-page accent) */}
      <div
        className="absolute inset-0 motion-reduce:hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 56px, color-mix(in oklab, var(--color-accent) 14%, transparent) 56px 57px, transparent 57px 120px)",
          opacity: "calc(var(--phase-b) * 0.55)",
        }}
      />

      {/* Phase C: bottom-anchored bright red wash ramping in past mid-page */}
      <div
        className="absolute inset-0 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 90%, #ff1830 0%, #c8112a 40%, transparent 80%)",
          opacity: "calc(var(--phase-c) * 0.55)",
          mixBlendMode: "screen",
        }}
      />

      {/* Phase C: bright red core that intensifies into the deep page */}
      <div
        className="absolute inset-x-0 bottom-0 h-[80vh] motion-reduce:hidden"
        style={{
          background:
            "linear-gradient(to top, color-mix(in oklab, #ff1e3c 75%, transparent) 0%, color-mix(in oklab, var(--color-accent) 32%, transparent) 35%, transparent 80%)",
          opacity: "calc(var(--phase-c) * 0.9)",
          mixBlendMode: "screen",
        }}
      />

      {/* Conic spin — saturation/brightness ramp up with --burn for hot-red dominance */}
      <div
        className="absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2 will-change-transform motion-reduce:hidden"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, color-mix(in oklab, var(--color-accent) 18%, transparent) 70deg, transparent 140deg, transparent 220deg, color-mix(in oklab, var(--color-accent) 14%, transparent) 320deg, transparent 360deg)",
          filter:
            "blur(80px) saturate(calc(1 + var(--burn) * 0.8)) brightness(calc(1 + var(--burn) * 0.45))",
          opacity: "calc(0.18 + var(--burn) * 0.35)",
          animation: "var(--animate-conic-spin)",
        }}
      />

      {/* Mouse-tracked spotlight — intensifies with scroll */}
      <div
        className="absolute left-0 top-0 h-[840px] w-[840px] motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(420px circle at center, color-mix(in oklab, var(--color-accent) 12%, transparent), transparent 70%)",
          transform: "translate3d(calc(var(--mx) - 420px), calc(var(--my) - 420px), 0)",
          opacity: "calc(0.7 + var(--burn) * 0.6)",
        }}
      />

      {/* Top scan line — hero only */}
      <div
        className="absolute inset-x-0 top-0 h-[36vh] motion-reduce:hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-accent) 12%, transparent) 50%, transparent)",
          mixBlendMode: "screen",
          opacity: "calc(var(--phase-a) * 0.18)",
          animation: "var(--animate-scan)",
        }}
      />

      {/* Always-on scanline texture */}
      <div className="absolute inset-0 bg-scanlines opacity-[0.28] mix-blend-overlay" />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* Top/bottom shading helps section edges blend into the bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 25%, transparent 70%, rgba(0,0,0,0.45))",
        }}
      />
    </div>
  );
}
