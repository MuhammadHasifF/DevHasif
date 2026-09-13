"use client";

import { useEffect, type RefObject } from "react";

/** Pause CSS loops only while hidden; preserve their phase and appearance. */
export function useAnimationVisibility(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = true;
    const update = () => {
      element.dataset.animationPaused = String(!inView || document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      delete element.dataset.animationPaused;
    };
  }, [ref]);
}
