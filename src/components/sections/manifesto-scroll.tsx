"use client";

import { useEffect, useRef, type RefObject } from "react";

/** The parent owns scroll progress; this component only measures typography. */
export function ManifestoScroll({
  momentRef,
}: {
  momentRef: RefObject<HTMLDivElement | null>;
}) {
  const textRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      if (window.innerWidth < 700) {
        text.style.removeProperty("font-size");
        return;
      }
      text.style.fontSize = "100px";
      text.style.fontSize = `${Math.min(120, ((window.innerWidth * 0.86) / text.scrollWidth) * 100)}px`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={momentRef} className="opening-manifesto">
      <h2 ref={textRef}>
        <span>BUILT FOR THE FIELD</span>
        <span className="opening-manifesto-dot"> · </span>
        <span>TUNED FOR SCALE</span>
      </h2>
    </div>
  );
}
