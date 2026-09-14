"use client";
import Image from "next/image";
import { useEffect, useRef, type MutableRefObject } from "react";
import { useSettings } from "@/components/layout/settings-provider";
import { createAnimationTimers } from "@/lib/animation-timers";

export function HeroPortrait({
  frozen,
}: {
  frozen: MutableRefObject<boolean>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();
  useEffect(() => {
    const el = ref.current,
      hero = el?.closest(".opening-hero");
    if (!el || !hero || reducedMotion) return;
    const timers = createAnimationTimers();
    const burst = () => {
      if (frozen.current || document.hidden) return;
      el.classList.add("is-corrupted");
      timers.schedule(() => el.classList.remove("is-corrupted"), 340);
    };
    const onTitle = () => {
      timers.schedule(burst, 75);
    };
    const independent = () => {
      burst();
      timers.schedule(independent, 5900 + Math.random() * 1700);
    };
    hero.addEventListener("opening-glitch", onTitle);
    timers.schedule(independent, 4100);
    return () => {
      timers.clear();
      hero.removeEventListener("opening-glitch", onTitle);
      el.classList.remove("is-corrupted");
    };
  }, [frozen, reducedMotion]);
  return (
    <div className="opening-portrait-depth">
      <div className="opening-portrait" ref={ref}>
        <Image
          src="/me/bamboo-forest.jpg"
          alt="Muhammad Hasif"
          width={400}
          height={400}
          priority
          className="opening-portrait-photo"
        />
        <span
          className="opening-portrait-slice opening-portrait-slice-red"
          aria-hidden="true"
        />
        <span
          className="opening-portrait-slice opening-portrait-slice-white"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
