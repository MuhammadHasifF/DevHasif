"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ExternalLink, LockKeyhole } from "lucide-react";
import { experience } from "@/content/experience";
import { Section } from "@/components/primitives/section";
import { OrgLogo } from "@/components/primitives/org-tag";
import { Chip } from "@/components/primitives/chip";
import { cn } from "@/lib/utils";

export function ExperienceTimeline() {
  const [open, setOpen] = useState<string | null>(
    experience[0] ? experience[0].company + experience[0].title : null,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start 80%", "end 30%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section
      id="experience"
      eyebrow="EXPERIENCE"
      index={2}
      total={7}
      stamp="// TIMELINE"
      title={["Different contexts.", "One engineering thread."]}
      intro="Research, data, full-stack engineering, public operations, and cybersecurity—each role strengthened how I turn ambiguous requirements into reliable systems and clear decisions."
    >
      <div ref={wrapRef} className="relative" data-experience-track>
        <div
          data-experience-rail
          aria-hidden="true"
          className="absolute left-[31px] top-0 h-full w-[3px] rounded-full md:left-1/2 md:-translate-x-1/2"
          style={{
            background:
              "linear-gradient(var(--color-border), color-mix(in oklab, var(--color-border) 80%, transparent), var(--color-border))",
          }}
        />
        <motion.div
          data-experience-energy
          aria-hidden="true"
          style={{ height: lineHeight }}
          className="absolute left-[31px] top-0 w-[3px] origin-top rounded-full md:left-1/2 md:-translate-x-1/2"
        >
          <div
            className="experience-signal-material h-full w-full rounded-full"
          />
        </motion.div>
        <ol className="space-y-10 md:space-y-16">
          {experience.map((r, i) => {
            const isLeft = i % 2 === 0;
            const isOpen = open === r.company + r.title;
            const id = r.company + r.title;
            return (
              <li
                key={id}
                className="relative grid grid-cols-[64px_1fr] items-start gap-4 md:grid-cols-[1fr_64px_1fr] md:gap-10"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center md:col-start-2 md:mx-auto">
                  <span className="absolute inset-0 rounded-full bg-[var(--color-bg-0)]" />
                  <motion.span
                    data-signal-node
                    initial={false}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-1)]"
                  >
                    <OrgLogo orgKey={r.orgKey} size="xl" />
                  </motion.span>
                </div>
                <div className={cn("min-w-0", isLeft ? "md:col-start-1 md:row-start-1" : "md:col-start-3 md:row-start-1")}>
                  <RoleCard r={r} isOpen={isOpen} onToggle={() => setOpen(isOpen ? null : id)} align="left" panelId={`role-${i}`} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}

function RoleCard({
  r,
  isOpen,
  onToggle,
  align,
  panelId,
}: {
  r: (typeof experience)[number];
  isOpen: boolean;
  onToggle: () => void;
  align: "left" | "right";
  panelId: string;
}) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "hud-panel hud-panel-hover group p-5 text-left transition-colors",
        align === "right" && "text-left"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip>{r.type}</Chip>
        <span className="font-mono text-[11px] text-[var(--color-text-2)]">
          {r.start} → {r.end ?? "Present"}
        </span>
      </div>
      <h3 className="mt-3 font-display text-xl leading-tight text-[var(--color-text-0)] md:text-2xl">
        {r.title}
      </h3>
      <div className="mt-1 text-sm text-[var(--color-text-1)]">{r.company}</div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-1)]">{r.summary}</p>

      {(r.links?.length || r.repositoryNote) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-2)]">
          {r.links?.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-text-1)] transition-colors hover:text-[var(--color-accent)]"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {link.label}
            </a>
          ))}
          {r.repositoryNote && (
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3 w-3" aria-hidden="true" />
              {r.repositoryNote}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-0)]"
      >
        {isOpen ? "Hide highlights" : "Show highlights"}
        <ChevronDown className={cn("h-3 w-3 transition", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="highlights"
          id={panelId}
          initial={{ height: 0, opacity: 0, y: -6 }}
          animate={{ height: "auto", opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } }}
          exit={{ height: 0, opacity: 0, y: -6, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
          className="overflow-hidden"
        >
          <ul className="mt-4 space-y-2 border-l border-[var(--color-border)] pl-4 text-sm text-[var(--color-text-1)]">
            {r.highlights.map((h) => (
              <li key={h} className="relative">
                <span className="absolute -left-[21px] top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                {h}
              </li>
            ))}
          </ul>
          {r.tech && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {r.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-1)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
