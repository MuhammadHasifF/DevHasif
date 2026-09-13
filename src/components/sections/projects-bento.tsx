"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePointerSpotlight } from "@/components/primitives/use-pointer-spotlight";
import { DiagonalArrow } from "@/components/primitives/diagonal-arrow";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { projects, projectCategories, type ProjectCategory } from "@/content/projects";
import { Section } from "@/components/primitives/section";
import { OrgLogo } from "@/components/primitives/org-tag";
import { Chip } from "@/components/primitives/chip";
import { GlitchReveal } from "@/components/primitives/glitch-reveal";
import { cn } from "@/lib/utils";

export function ProjectsBento() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <Section
      id="all-projects"
      eyebrow="PROJECTS"
      index={3}
      total={7}
      stamp="// FULL ARCHIVE"
      title={["Selected Projects."]}
      intro="Six projects outside my employed roles—from privacy-first workflows and AI agents to classification and large-scale forecasting. Explore the implementation, evaluation, and trade-offs."
    >
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {projectCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "relative inline-flex h-8 items-center rounded-full border px-3 text-xs transition",
              filter === c
                ? "border-transparent bg-[var(--color-text-0)] text-[var(--color-bg-0)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-1)] text-[var(--color-text-1)] hover:text-[var(--color-text-0)]"
            )}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto hidden font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-2)] md:block">
          {filtered.length} project{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      <LayoutGroup id="projects-bento">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="h-full"
              >
                {/* Odd index → slide in from left, even index → from right */}
                <GlitchReveal side={i % 2 === 0 ? "left" : "right"} className="group h-full">
                  <BentoCardLink href={`/work/${p.slug}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <OrgLogo orgKey={p.orgKey} size="md" />
                        <Chip>{p.category}</Chip>
                      </div>
                      <span className="text-[var(--color-text-2)] transition-colors group-hover:text-[var(--color-accent)]">
                        <DiagonalArrow />
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-display text-xl leading-tight text-[var(--color-text-0)] md:text-2xl">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-1)]">{p.tagline}</p>
                      <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-1)]">{p.preview}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-1)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                      <span>{p.year}</span>
                      <span>{p.org}</span>
                    </div>
                  </BentoCardLink>
                </GlitchReveal>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </Section>
  );
}

function BentoCardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { ref, onMove } = usePointerSpotlight();
  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      className="hud-panel hud-panel-hover group/card relative flex h-full min-h-[170px] flex-col justify-between overflow-hidden p-6 text-left transition-colors w-full"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 -z-10 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover/card:opacity-50"
        style={{ background: "var(--color-accent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,var(--color-text-0)_1px,transparent_1px)] [background-size:14px_14px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx) var(--my), color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 60%)",
        }}
      />
      {children}
    </Link>
  );
}
