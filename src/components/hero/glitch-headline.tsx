"use client";
import {
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useSettings } from "@/components/layout/settings-provider";
import { createAnimationTimers } from "@/lib/animation-timers";

export function GlitchHeadline({
  frozen,
  children,
}: {
  frozen: MutableRefObject<boolean>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { reducedMotion } = useSettings();
  useEffect(() => {
    const heading = ref.current;
    if (!heading || reducedMotion) return;
    const timers = createAnimationTimers();
    let word =
      heading.querySelector("[data-first-name]")?.textContent ?? "MUHAMMAD";
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(heading);
    const settle = () => heading.classList.remove("is-switching");
    const tick = () => {
      if (frozen.current || document.hidden || !visible) {
        settle();
        timers.schedule(tick, 700);
        return;
      }
      heading.classList.add("is-switching");
      timers.schedule(() => {
        if (frozen.current || document.hidden) {
          settle();
          return;
        }
        word = word === "MUHAMMAD" ? "DEV" : "MUHAMMAD";
        heading.querySelectorAll("[data-first-name]").forEach((el) => {
          el.textContent = word;
        });
        heading.setAttribute("aria-label", word + " HASIF</>");
      }, 85);
      timers.schedule(settle, 220);
      timers.schedule(tick, 6400 + Math.random() * 2000);
    };
    timers.schedule(tick, 6500);
    return () => {
      timers.clear();
      observer.disconnect();
      settle();
    };
  }, [frozen, reducedMotion]);
  return (
    <h1 ref={ref} className="opening-title" aria-label="MUHAMMAD HASIF</>">
      <span className="opening-name-line opening-name" aria-hidden="true">
        <span data-first-name>MUHAMMAD</span>
        <span className="opening-name-ghost" data-first-name>
          MUHAMMAD
        </span>
      </span>
      <span className="opening-last-line" aria-hidden="true">
        <span className="opening-name">
          HASIF<span className="opening-name-ghost">HASIF</span>
        </span>
        {children}
      </span>
    </h1>
  );
}
