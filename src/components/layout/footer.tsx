import Link from "next/link";
import { Github, Linkedin, Mail, FileText } from "lucide-react";
import { siteConfig } from "@/../site.config";
import { SettingsMenu } from "@/components/layout/settings-menu";
import { GlitchSwap } from "@/components/primitives/glitch-swap";

const buildTime = new Date().toISOString();

export function Footer() {
  return (
    <footer className="glass relative mt-32 border-t border-[var(--color-border)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-4xl leading-none text-[var(--color-text-0)] md:text-5xl lg:text-6xl">
            <span>Let&rsquo;s build</span>
            <br />
            {/* whitespace-nowrap forces "something amazing." onto a single
                line regardless of column width. GlitchSwap reserves the
                width of the LONGEST word so swapping to "real." doesn't
                shift any sibling layout. */}
            <span className="whitespace-nowrap">
              <span className="text-[var(--color-text-1)]">something </span>
              <GlitchSwap
                words={["amazing.", "real."]}
                reserve="amazing."
                intensity={1.2}
                className="text-[var(--color-accent)]"
              />
            </span>
          </div>
          <p className="mt-6 max-w-md text-sm text-[var(--color-text-1)]">
            I&rsquo;m open to data analytics, machine-learning, and AI engineering
            internships, research collaborations, and thoughtful engineering problems.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/#contact"
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-[box-shadow,transform] hover:shadow-[0_0_24px_-4px_var(--color-accent)] active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" /> Open channel
            </Link>
            <Link
              href="/resume"
              className="inline-flex h-10 items-center gap-2 rounded-sm border border-[var(--color-accent)]/50 bg-[color:color-mix(in_oklab,var(--color-accent)_6%,var(--color-bg-1))] px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-0)] transition-[border-color,background-color,box-shadow] hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_oklab,var(--color-accent)_14%,var(--color-bg-1))] hover:shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]"
            >
              <FileText className="h-4 w-4" /> Resume
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
            <span className="h-px w-6 bg-[var(--color-accent)]/60" /> Sitemap
          </div>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="text-[var(--color-text-1)] transition hover:text-[var(--color-text-0)]"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-2)]">
            <span className="h-px w-6 bg-[var(--color-accent)]/60" /> Elsewhere
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--color-text-1)] transition hover:text-[var(--color-text-0)]">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </li>
            <li>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--color-text-1)] transition hover:text-[var(--color-text-0)]">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={siteConfig.links.orcid} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--color-text-1)] transition hover:text-[var(--color-text-0)]">
                <FileText className="h-4 w-4" /> ORCID
              </a>
            </li>
            <li>
              <a href={siteConfig.links.email} className="inline-flex items-center gap-2 text-[var(--color-text-1)] transition hover:text-[var(--color-text-0)]">
                <Mail className="h-4 w-4" /> Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-2)] sm:flex-row sm:items-center sm:px-6">
          <div>
            <span className="text-[var(--color-accent)]">©</span> {new Date().getFullYear()} {siteConfig.fullName} · NODE_ACTIVE
          </div>
          <div className="flex items-center gap-4">
            <time dateTime={buildTime} title="Last deploy" className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_6px_var(--color-accent)]" />
              deploy · {buildTime.slice(0, 10)}
            </time>
            <SettingsMenu />
          </div>
        </div>
      </div>
    </footer>
  );
}
