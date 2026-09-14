"use client";
import {
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useSettings } from "@/components/layout/settings-provider";
import { createAnimationTimers } from "@/lib/animation-timers";
import { PortalIcon } from "./portal-glyph";

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
    let visible = true,
      word =
        heading.querySelector("[data-first-name]")?.textContent ?? "MUHAMMAD",
      beats = 0;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(heading);
    const settle = () => {
      heading.classList.remove("is-switching", "is-signature");
    };
    const tick = () => {
      if (frozen.current || document.hidden || !visible) {
        settle();
        timers.schedule(tick, 450);
        return;
      }
      const signature = ++beats % 5 === 0;
      heading.classList.add("is-switching");
      if (signature) heading.classList.add("is-signature");
      heading.dispatchEvent(
        new CustomEvent("opening-glitch", {
          bubbles: true,
          detail: { signature },
        }),
      );
      timers.schedule(
        () => {
          if (frozen.current || document.hidden) {
            settle();
            return;
          }
          if (beats % 2 === 1) {
            word = word === "MUHAMMAD" ? "DEV" : "MUHAMMAD";
            heading.querySelectorAll("[data-first-name]").forEach((el) => {
              el.textContent = word;
            });
            heading.setAttribute("aria-label", word + " HASIF</>");
          }
        },
        signature ? 240 : 95,
      );
      timers.schedule(settle, signature ? 650 : 240);
      timers.schedule(tick, signature ? 3900 : 2600 + Math.random() * 1400);
    };
    timers.schedule(tick, 2800);
    return () => {
      timers.clear();
      observer.disconnect();
      settle();
    };
  }, [frozen, reducedMotion]);
  const lines = (ghost: boolean) => (
    <>
      <span className="opening-name-line">
        <span data-first-name>MUHAMMAD</span>
      </span>
      <span className="opening-last-line">
        <span>HASIF</span>
        {ghost ? (
          <span className="opening-portal-anchor">
            <PortalIcon />
          </span>
        ) : (
          children
        )}
      </span>
    </>
  );
  return (
    <h1 ref={ref} className="opening-title" aria-label="MUHAMMAD HASIF</>">
      <span
        className="opening-title-layer opening-title-main"
        aria-hidden="true"
      >
        {lines(false)}
      </span>
      <span
        className="opening-title-layer opening-title-ghost opening-title-red"
        aria-hidden="true"
      >
        {lines(true)}
      </span>
      <span
        className="opening-title-layer opening-title-ghost opening-title-white"
        aria-hidden="true"
      >
        {lines(true)}
      </span>
    </h1>
  );
}
