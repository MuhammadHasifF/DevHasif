"use client";
import type { MutableRefObject, RefObject } from "react";
import { MapPin } from "lucide-react";
import { siteConfig } from "@/../site.config";
import { ArrowLink } from "@/components/primitives/arrow-link";
import { GlitchHeadline } from "./glitch-headline";
import { PortalAnchor } from "./portal-glyph";
import { HeroPortrait } from "./hero-portrait";

export function Hero({
  frozen,
  portalRef,
}: {
  frozen: MutableRefObject<boolean>;
  portalRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <section className="opening-hero" aria-label="Introduction">
      <div className="opening-content">
        <div className="opening-topline opening-secondary">
          <div>
            <span className="opening-index">00 / 07</span>
            <span>/ INDEX · MUHAMMAD HASIF</span>
          </div>
          <div>
            <span className="opening-status" />
            <span>OPEN TO DATA, ML &amp; AI INTERNSHIPS</span>
          </div>
        </div>
        <div className="opening-identity">
          <GlitchHeadline frozen={frozen}>
            <PortalAnchor ref={portalRef} />
          </GlitchHeadline>
          <HeroPortrait frozen={frozen} />
        </div>
        <div className="opening-details opening-secondary">
          <div className="opening-description">
            <p>{siteConfig.tagline}</p>
            <div className="opening-actions">
              <ArrowLink href="/work" variant="primary">
                View work
              </ArrowLink>
              <ArrowLink href="/#contact">Get in touch</ArrowLink>
            </div>
          </div>
          <div className="opening-meta">
            <HeroMeta k="FOCUS" v="Data Analytics / ML / AI" />
            <HeroMeta
              k="LOCALE"
              v={
                <>
                  <MapPin className="mr-1 inline h-3 w-3 text-[var(--color-accent)]" />
                  Singapore
                </>
              }
            />
            <HeroMeta k="STUDY" v="SIT · Applied AI" />
            <HeroMeta k="GRADUATION" v="Expected 2028" />
          </div>
        </div>
        <div className="opening-bottom opening-secondary">
          <span>SCROLL TO BEGIN</span>
          <span>
            SECTIONS <span>/</span> <span className="opening-index">07</span>
          </span>
        </div>
      </div>
    </section>
  );
}
function HeroMeta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <div className="opening-meta-label">/ {k}</div>
      <div className="opening-meta-value">{v}</div>
    </div>
  );
}
