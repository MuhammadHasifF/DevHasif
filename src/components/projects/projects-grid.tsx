"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePointerSpotlight } from "@/components/primitives/use-pointer-spotlight";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projectCategories, projects, type ProjectCategory } from "@/content/projects";
import { OrgLogo } from "@/components/primitives/org-tag";
import { Chip } from "@/components/primitives/chip";
import { cn } from "@/lib/utils";

type Sort = "recent" | "chronological";

export function ProjectsGrid() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [sort, setSort] = useState<Sort>("recent");

  const list = useMemo(() => {
    const base = filter === "All" ? projects : projects.filter((p) => p.category === filter);
    const withYear = (y: string) => parseInt(y.match(/\d{4}/)?.[0] ?? "0", 10);
    return [...base].sort((a, b) =>
      sort === "recent" ? withYear(b.year) - withYear(a.year) : withYear(a.year) - withYear(b.year)
    );
  }, [filter, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {projectCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-xs transition",
              filter === c
                ? "border-transparent bg-[var(--color-text-0)] text-[var(--color-bg-0)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-1)] text-[var(--color-text-1)] hover:text-[var(--color-text-0)]"
            )}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-text-2)]">
          <label htmlFor="sort" className="font-mono uppercase tracking-widest">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-1)] px-2 py-1 text-[var(--color-text-0)]"
          >
            <option value="recent">Recent first</option>
            <option value="chronological">Chronological</option>
          </select>
        </div>
      </div>

      <LayoutGroup id="projects-grid">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div
                key={p.slug}
                layout
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                <SpotlightCardLink href={`/work/${p.slug}`} hue={p.hue}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <OrgLogo orgKey={p.orgKey} size="md" />
                      <Chip>{p.category}</Chip>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--color-text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-5">
                    <h3 className="font-display text-xl leading-tight text-[var(--color-text-0)]">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-1)]">{p.tagline}</p>
                    <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-1)]">{p.preview}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                    <span>{p.year}</span>
                    <span>{p.org}</span>
                  </div>
                </SpotlightCardLink>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}

function SpotlightCardLink({
  href,
  hue,
  children,
}: {
  href: string;
  hue?: string;
  children: React.ReactNode;
}) {
  const { ref, onMove } = usePointerSpotlight();
  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      className="hud-panel hud-panel-hover group relative flex h-full flex-col justify-between overflow-hidden p-5 transition-colors"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          hue ?? "from-[var(--color-accent)] to-[var(--color-accent-2)]",
        )}
        style={{ maskImage: "radial-gradient(ellipse at top left, black 30%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx) var(--my), color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 60%)",
        }}
      />
      {children}
    </Link>
  );
}
