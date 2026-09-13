"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { useSettings } from "./settings-provider";

type ScrollTarget = string | HTMLElement | number;
type ScrollOptions = { offset?: number; immediate?: boolean; duration?: number };
type LenisCtx = {
  scrollTo: (target: ScrollTarget, opts?: ScrollOptions) => void;
  subscribeScroll?: (callback: () => void) => () => void;
};

const Ctx = createContext<LenisCtx | null>(null);

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function LenisProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Lenis | null>(null);
  const subscribers = useRef(new Set<() => void>());
  const subscribeScroll = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => { subscribers.current.delete(callback); };
  }, []);
  const { reducedMotion } = useSettings();

  useEffect(() => {
    const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    // Skip Lenis on touch + reduced motion — let native scroll behave naturally.
    if (reducedMotion || touch) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: easeOutExpo,
      smoothWheel: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    ref.current = lenis;
    lenis.on("scroll", () => subscribers.current.forEach(callback => callback()));

    let raf = 0;
    const tick = (time: number) => {
      if (document.hidden) return;
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      lenis.destroy();
      ref.current = null;
    };
  }, [reducedMotion]);

  const scrollTo = useCallback((target: ScrollTarget, opts: ScrollOptions = {}) => {
    const duration = opts.duration ?? 1.6;
    const offset = opts.offset ?? -72; // clear sticky nav
    const lenis = ref.current;
    if (lenis) {
      lenis.scrollTo(target, { duration, easing: easeOutExpo, offset, immediate: opts.immediate });
      return;
    }
    // Fallback (touch / reduced motion / SSR-mounted before Lenis ready)
    let el: HTMLElement | null = null;
    if (typeof target === "string") {
      el = target.startsWith("#") ? document.getElementById(target.slice(1)) : document.querySelector(target);
    } else if (target instanceof HTMLElement) {
      el = target;
    }
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: opts.immediate || reducedMotion ? "instant" : "smooth" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target + offset, behavior: opts.immediate || reducedMotion ? "instant" : "smooth" });
    }
  }, [reducedMotion]);

  return <Ctx.Provider value={{ scrollTo, subscribeScroll }}>{children}</Ctx.Provider>;
}

export function useLenisScroll(): LenisCtx {
  const v = useContext(Ctx);
  if (v) return v;
  // Headless fallback if a consumer renders outside the provider (e.g., during tests)
  return {
    scrollTo: (target, opts = {}) => {
      const offset = opts.offset ?? -72;
      let el: HTMLElement | null = null;
      if (typeof target === "string") el = document.querySelector(target);
      else if (target instanceof HTMLElement) el = target;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target + offset, behavior: "smooth" });
      }
    },
  };
}
