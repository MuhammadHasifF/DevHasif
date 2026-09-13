"use client";

import { useEffect, useRef, type MouseEvent } from "react";

/** Coalesce high-frequency pointer events into one read/write per frame. */
export function usePointerSpotlight() {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--mx", `${pointer.current.x - rect.left}px`);
      element.style.setProperty("--my", `${pointer.current.y - rect.top}px`);
    });
  };
  return { ref, onMove };
}
