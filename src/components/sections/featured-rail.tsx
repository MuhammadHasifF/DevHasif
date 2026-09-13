"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { projects } from "@/content/projects";
import { Section } from "@/components/primitives/section";
import { OrgLogo } from "@/components/primitives/org-tag";
import { DiagonalArrow } from "@/components/primitives/diagonal-arrow";

const featured = projects.filter((p) => p.featured).slice(0, 5);

export function FeaturedRail() {
  const targetRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Measured: how many pixels the rail must travel so the last card's right
  // edge sits inside the viewport. Recomputes on resize. This guarantees the
  // last card is FULLY visible at scroll end on every breakpoint.
  const [endPx, setEndPx] = useState(0);
  useEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      if (!rail) return;
      const width = rail.scrollWidth;
      const vw = window.innerWidth;
      // 10vw gutter on each side, plus a small overscroll to fully clear.
      const gutter = vw * 0.1;
      const offset = Math.max(0, width - vw + gutter + 8);
      setEndPx(offset);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Translate the rail right to left as the user scrolls, ending at the
  // exact pixel offset that fully reveals the trailing card.
  const x = useTransform(scrollYProgress, [0, 1], [0, -endPx]);

  // Keep the section background as the page's normal dark feel
  // (transparent so the global cyber-grid shows through).
  // Only a small accent radial drifts across the background, condensed
  // and subtle. NO heavy black, to, red wash, NO stripes.
  const accentX = useTransform(scrollYProgress, [0, 1], ["20%", "80%"]);

  if (reduce) {
    return (
      <Section
        eyebrow="FEATURED"
        index={3}
        total={7}
        stamp="// CASE FILES"
        title={["Featured Work."]}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((p, i) => (
            <FeaturedStaticCard
              key={p.slug}
              project={p}
              index={i}
            />
          ))}
        </div>
      </Section>
    );
  }

  const total = featured.length + 1;

  return (
    <section
      ref={targetRef}
      aria-label="Featured projects rail"
      className="relative h-[340vh]"
    >
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden">
        {/* Subtle drifting accent only — no heavy bg, no stripes. The page's
            normal cyber-grid shows through (matches Experience-section feel). */}
        <SubtleAccent x={accentX} progress={scrollYProgress} />

        <div className="relative z-[1] mx-auto mb-6 flex w-full max-w-6xl items-end justify-between px-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-2)]">
              <span className="h-px w-8 bg-[var(--color-border)]" />
              Featured
            </div>
            <h2 className="mt-2 font-display text-4xl leading-tight text-[var(--color-text-0)] md:text-6xl">
              Featured Work.
            </h2>
          </div>
          <div className="hidden text-right font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-2)] md:block">
            Scroll →
          </div>
        </div>

        <motion.div ref={railRef} style={{ x }} className="relative z-[1] flex gap-6 px-[10vw]">
          {featured.map((p, i) => (
            <div key={p.slug} className="shrink-0 w-[80vw] md:w-[60vw] lg:w-[44vw]">
              <FeaturedCardMotion
                project={p}
                index={i}
                progress={scrollYProgress}
                total={total}
                count={featured.length}
              />
            </div>
          ))}
          <div className="shrink-0 w-[80vw] md:w-[60vw] lg:w-[44vw]">
            <Link
              href="/#all-projects"
              className="hud-panel group flex h-full min-h-[460px] w-full flex-col items-center justify-center gap-3 p-12 text-center transition-colors hover:border-[var(--color-accent)]"
            >
              <span className="font-display text-3xl text-[var(--color-text-0)] md:text-4xl">
                See every project
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-1)] transition-colors group-hover:text-[var(--color-accent)]">
                Browse the full grid below
                <DiagonalArrow />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Subtle drifting accent only. The section background stays the page's
 * default (Experience-section feel). The only visible scroll-bound
 * change is a soft red glow that drifts horizontally with the rail.
 */
function SubtleAccent({
  x,
  progress,
}: {
  x: MotionValue<string>;
  progress: MotionValue<number>;
}) {
  const primary = useTransform(
    x,
    (px) =>
      `radial-gradient(60% 85% at ${px} 50%, color-mix(in oklab, var(--color-accent) 60%, transparent) 0%, color-mix(in oklab, var(--color-accent) 28%, transparent) 35%, color-mix(in oklab, var(--color-accent) 10%, transparent) 65%, transparent 85%)`,
  );
  const secondary = useTransform(
    x,
    (px) =>
      `radial-gradient(120% 80% at ${px} 50%, color-mix(in oklab, #ff5560 30%, transparent) 0%, transparent 70%)`,
  );
  const primaryOpacity = useTransform(progress, [0, 0.15, 1], [0, 1, 1]);
  const secondaryOpacity = useTransform(progress, [0, 0.15, 1], [0, 0.7, 0.85]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: primary, opacity: primaryOpacity, mixBlendMode: "screen" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: secondary,
          opacity: secondaryOpacity,
          mixBlendMode: "screen",
          filter: "blur(20px)",
        }}
      />
    </>
  );
}

function FeaturedCardMotion({
  project: p,
  index,
  progress,
  total,
  count,
}: {
  project: (typeof projects)[number];
  index: number;
  progress: MotionValue<number>;
  total: number;
  count: number;
}) {
  const slot = index / Math.max(1, total - 1);

  // Border glow + accent rail intensity peak when the card is centered.
  const peak = useTransform(progress, (v) => {
    const dist = Math.abs(v - slot);
    return Math.max(0, 1 - dist * 2.4);
  });
  const borderColor = useTransform(
    peak,
    (p) =>
      `color-mix(in oklab, var(--color-accent) ${Math.round(15 + p * 55)}%, var(--color-border))`,
  );
  const railOpacity = useTransform(peak, (p) => 0.25 + p * 0.75);
  const railScale = useTransform(peak, (p) => 0.2 + p * 0.8);
  const haloOpacity = useTransform(peak, (p) => p * 0.45);

  const num = String(index + 1).padStart(2, "0");
  const totalStr = String(count).padStart(2, "0");

  return (
    <Link href={`/work/${p.slug}`} className="block h-full w-full text-left">
      <motion.div
        className="hud-panel group relative flex h-full min-h-[460px] flex-col overflow-hidden p-7 transition-[border-color,box-shadow,background] md:p-9"
        style={{ borderColor }}
      >
        {/* Left vertical accent rail that lights up as the card centers */}
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-[2px] origin-center"
          style={{
            scaleY: railScale,
            background:
              "linear-gradient(to bottom, transparent, var(--color-accent), transparent)",
            boxShadow:
              "0 0 12px color-mix(in oklab, var(--color-accent) 80%, transparent)",
            opacity: railOpacity,
          }}
        />
        {/* Halo behind the card when centered */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full blur-3xl"
          style={{
            background: "var(--color-accent)",
            opacity: haloOpacity,
            mixBlendMode: "screen",
          }}
        />
        {/* Hover accent intensifier */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 50%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Top row, slot index + category + year */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <OrgLogo orgKey={p.orgKey} size="md" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
                {p.category}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
                {p.year}
              </span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
            <span className="text-[var(--color-accent)]">{num}</span> / {totalStr}
          </div>
        </div>

        {/* Hairline divider */}
        <motion.div
          aria-hidden="true"
          className="relative mt-5 h-px w-full"
          style={{
            background:
              "linear-gradient(to right, var(--color-accent) 0%, transparent 100%)",
            opacity: railOpacity,
          }}
        />

        {/* Title + tagline */}
        <h3 className="relative mt-5 font-display text-3xl leading-tight text-[var(--color-text-0)] md:text-4xl">
          {p.title}
        </h3>
        <p className="relative mt-3 max-w-md text-sm text-[var(--color-text-1)] md:text-base">
          {p.tagline}
        </p>

        {/* Stack chips */}
        <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-8">
          {p.stack.slice(0, 5).map((s) => (
            <span
              key={s}
              className="rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-2)]/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-1)] transition-colors group-hover:border-[var(--color-accent)]/40"
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA row */}
        <div className="relative mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em]">
          <span className="text-[var(--color-text-2)]">{p.org}</span>
          <span className="inline-flex items-center gap-2 text-[var(--color-text-0)] transition-colors group-hover:text-[var(--color-accent)]">
            Read case study
            <DiagonalArrow />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function FeaturedStaticCard({
  project: p,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <Link
      href={`/work/${p.slug}`}
      className="hud-panel hud-panel-hover group relative block h-full min-h-[460px] w-full overflow-hidden p-7 text-left transition-colors md:p-9"
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <OrgLogo orgKey={p.orgKey} size="md" />
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
              {p.category}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
              {p.year}
            </span>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
          <span className="text-[var(--color-accent)]">{num}</span> / 05
        </div>
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-50" />
      <h3 className="mt-5 font-display text-3xl leading-tight text-[var(--color-text-0)] md:text-4xl">
        {p.title}
      </h3>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-1)] md:text-base">
        {p.tagline}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {p.stack.slice(0, 5).map((s) => (
          <span
            key={s}
            className="rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-2)]/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-1)]"
          >
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
