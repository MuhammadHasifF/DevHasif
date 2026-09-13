"use client";

import { useEffect } from "react";
import { useLenisScroll } from "@/components/layout/lenis-provider";

/**
 * On home-page mount (or hash change), scroll to the URL hash with Lenis.
 * Runs after layout is settled to avoid landing mid-paint.
 */
export function HomeHashWatch() {
  const { scrollTo } = useLenisScroll();

  useEffect(() => {
    const go = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return;
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      // Two rAFs let images / fonts / Section IO observers settle before scrolling.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollTo(hash, { duration: 1.6 });
        });
      });
    };

    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [scrollTo]);

  return null;
}
