"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function SectionPill() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // Only show on the home page where there are multiple long sections
    if (pathname !== "/") {
      setLabel(null);
      return;
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]"),
    ).filter((el) => el.id);

    if (!sections.length) return;

    const titles: Record<string, string> = {
      about: "About",
      experience: "Experience",
      work: "Work",
      skills: "Skills",
      credentials: "Credentials",
      github: "Live Feed",
      contact: "Contact",
    };

    const active = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        });
        const top = sections.find((section) => active.has(section));
        if (!top) {
          setLabel(null);
          return;
        }
        const id = top.id;
        const t = titles[id] ?? id.replace(/-/g, " ");
        setLabel(t);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  if (!label) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-1)]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-1)] backdrop-blur"
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
