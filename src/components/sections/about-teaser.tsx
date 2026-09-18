"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";

export function AboutTeaser() {
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  return (
    <Section
      id="about"
      eyebrow="ABOUT"
      index={1}
      total={7}
      stamp="// ORIGIN"
      title={["Engineer.", "Researcher.", "Builder."]}
    >
      <div className="signal-core-dock" aria-hidden="true" />
      <div className="grid items-start gap-12 md:grid-cols-2">
        <Reveal>
          <p className="text-pretty text-lg leading-relaxed text-[var(--color-text-0)]/90">
            I&rsquo;m an Applied Artificial Intelligence undergraduate at SIT,
            graduating in 2028, and a research developer working across{" "}
            <span className="text-[var(--color-accent)]">data analytics</span>,{" "}
            <span className="text-[var(--color-accent)]">machine learning</span>, and{" "}
            <span className="text-[var(--color-accent)]">AI engineering</span>.
          </p>
          <p className="mt-6 max-w-xl text-[var(--color-text-1)]">
            My work connects reliable data pipelines and evaluated models to
            usable software—from maritime condition monitoring and browser-based
            3D research tools to LLM applications, forecasting, automation, and
            cybersecurity operations.
          </p>

          {/* Inline expand. Vertical reveal animation unique to About. */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="long"
                id="about-long-version"
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, y: -8 }}
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { height: "auto", opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } }
                }
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, y: -8, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
                className="overflow-hidden"
              >
                <div className="mt-6 max-w-xl space-y-4 border-l border-[var(--color-accent)]/40 pl-5 text-[var(--color-text-1)]">
                  <p>
                    I currently develop an end-to-end maritime platform for
                    SIT&rsquo;s Future Ship &amp; Systems Design project. It turns
                    electric-harbour-craft SCADA, sensor, and alarm data into
                    near-real-time vessel-health monitoring, explainable fault
                    evidence, and engineering decision support using Django REST
                    Framework, SQL Server, React, TypeScript, and Python.
                  </p>
                  <p className="text-[var(--color-accent)]/85 font-mono text-sm uppercase tracking-[0.18em]">
                    &gt; I care about traceable data, honest evaluation, and
                    software that survives real users and imperfect inputs.
                  </p>
                  <p>
                    Earlier roles span R3CAP&rsquo;s open-source 3D digital-twin
                    stack, SOC monitoring and incident response at HTX, public
                    sector data and automation, and forecasting work at Deloitte.
                    Outside work, I build and test AI products around active
                    recall, care coordination, productivity agents, and model
                    evaluation. I&rsquo;m seeking data analytics, machine learning,
                    and AI engineering internships where I can contribute hands-on,
                    learn from experienced teams, and build on my research and consulting experience.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="about-long-version"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-0)] transition-colors hover:text-[var(--color-accent)]"
            >
              {expanded ? "Collapse" : "Read the long version"}
              <ChevronDown
                className="h-4 w-4 transition-transform"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="hud-panel relative aspect-[4/5] overflow-hidden p-0">
            <Image
              src="/me/pagoda.jpg"
              alt="Hōkan-ji Pagoda, Higashiyama, Kyoto"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority={false}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.85) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 mix-blend-overlay"
              style={{
                background:
                  "radial-gradient(60% 80% at 70% 90%, color-mix(in oklab, var(--color-accent) 32%, transparent) 0%, transparent 60%)",
              }}
            />
            <div className="absolute inset-0 bg-scanlines opacity-25" />

            <div className="absolute right-5 top-5 text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
                ID · 001
              </div>
              <div className="mt-1 font-display text-5xl leading-none text-[var(--color-text-0)]">
                H<span className="text-[var(--color-accent)]">.</span>
              </div>
            </div>

            <figcaption className="absolute left-5 bottom-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-1)]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
                <span>HŌKAN-JI · KYOTO</span>
              </div>
              <div className="mt-1 text-[var(--color-text-2)]">SG · NODE_2026</div>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
