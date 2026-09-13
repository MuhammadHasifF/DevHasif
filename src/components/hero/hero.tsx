"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";
import { siteConfig } from "@/../site.config";
import { ArrowLink } from "@/components/primitives/arrow-link";
import { Cityscape } from "@/components/hero/cityscape";
import { GlitchHeadline } from "@/components/hero/glitch-headline";
import { HeroLogoBridge } from "@/components/hero/logo-bridge";
import { useAnimationVisibility } from "@/components/primitives/use-animation-visibility";

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useAnimationVisibility(sectionRef);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden"
    >
      <Cityscape progress={scrollYProgress} />

      <motion.div
        style={reduce ? undefined : { y: titleY, opacity: titleOpacity }}
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-32 sm:px-6 md:pt-28"
      >
        {/* Top mono bar */}
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[var(--color-accent)]">00 / 07</span>
            <span className="text-[var(--color-text-1)]">/ INDEX · MUHAMMAD HASIF</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-dot" />
            <span>OPEN TO DATA, ML &amp; AI INTERNSHIPS</span>
          </div>
        </div>

        {/* Editorial display title — masked-line reveal + cyberpunk glitch.
            The avatar mark sits inline so the logo lives in two coordinated
            positions: here in the hero, and in the top-left nav after scroll. */}
        <div className="flex min-w-0 items-center gap-[0.18em]">
          <GlitchHeadline className="min-w-0 flex-1" />
          <HeroLogoBridge />
        </div>

        {/* Two-column tagline + meta */}
        <div className="grid gap-10 border-t border-[var(--color-border)] pt-8 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7">
            <p className="text-balance text-lg leading-relaxed text-[var(--color-text-1)] md:text-xl">
              {siteConfig.tagline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ArrowLink href="/work" variant="primary">View work</ArrowLink>
              <ArrowLink href="/#contact">Get in touch</ArrowLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:col-span-5 md:grid-cols-2">
            <HeroMeta k="FOCUS" v="Data Analytics / ML / AI" />
            <HeroMeta k="LOCALE" v={(<><MapPin className="mr-1 inline h-3 w-3 text-[var(--color-accent)]" />Singapore</>)} />
            <HeroMeta k="STUDY" v="SIT · Applied AI" />
            <HeroMeta k="GRADUATION" v="Expected 2028" />
          </div>
        </div>

        {/* Bottom scroll cue */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="flex items-center justify-between border-t border-[var(--color-border)] pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]"
        >
          <span>SCROLL TO BEGIN</span>
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">SECTIONS</span>
            <span className="text-[var(--color-text-1)]">/</span>
            <span className="text-[var(--color-accent)]">07</span>
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

function HeroMeta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
        / {k}
      </div>
      <div className="mt-1 font-mono text-sm text-[var(--color-text-0)]">{v}</div>
    </div>
  );
}
