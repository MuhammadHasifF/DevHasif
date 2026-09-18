"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/components/layout/settings-provider";
import { useLenisScroll } from "@/components/layout/lenis-provider";
import { clamp, lerp, smooth } from "./opening-math";
import { SIGNAL } from "./signal-material";
import type { createSignalWorld, SignalPose } from "./signal-world";
import "./signal-story.css";

/** One measured document-space story, independent of the city's pinned camera.
 * No wheel handlers, per-frame React state, or content duplication. */
export function SignalStory({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { reducedMotion } = useSettings();
  const { subscribeScroll } = useLenisScroll();
  useEffect(() => {
    const root = rootRef.current!,
      canvas = canvasRef.current!,
      fallback = fallbackRef.current!,
      path = pathRef.current!;
    const opening = root.querySelector<HTMLElement>(".opening-sequence")!;
    const about = root.querySelector<HTMLElement>("#about")!;
    const interaction = root.querySelector<HTMLElement>(".signal-interaction")!;
    const dock = root.querySelector<HTMLElement>(".signal-core-dock")!;
    const timeline = root.querySelector<HTMLElement>(
      "[data-experience-track]",
    )!;
    const rail = root.querySelector<HTMLElement>("[data-experience-rail]")!;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-signal-node]"),
    );
    const reduce =
      reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.motion = reduce ? "reduced" : "full";
    let world: ReturnType<typeof createSignalWorld> | undefined,
      disposed = false,
      lost = false;
    let w = innerWidth,
      h = innerHeight,
      rootTop = 0,
      openingEnd = 0,
      emergeStart = 0,
      aboutTop = 0,
      aboutBottom = 0;
    let dockX = 0,
      dockY = 0,
      sceneTop = 0,
      sceneEnd = 0,
      releaseY = 0,
      railX = 0,
      railY = 0,
      pathLength = 1;
    let nodeOffsets: number[] = [],
      railHeight = 1,
      lastTime = -1,
      lastScroll = -1,
      refreshFrame = 0;
    let pathSamples: number[] = [];
    const doc = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top + scrollY,
        width: r.width,
        height: r.height,
      };
    };
    const measure = () => {
      w = innerWidth;
      h = innerHeight;
      rootTop = doc(root).y;
      const o = doc(opening),
        a = doc(about),
        d = doc(dock),
        s = doc(interaction),
        r = doc(rail);
      openingEnd = o.y + o.height - h;
      emergeStart = openingEnd - (reduce ? h * 0.5 : (o.height - h) * 0.14);
      aboutTop = a.y;
      aboutBottom = a.y + a.height;
      dockX = d.x + d.width / 2;
      dockY = d.y + d.height / 2;
      sceneTop = s.y;
      sceneEnd = s.y + s.height - h * (reduce ? 1 : 1.45);
      releaseY = sceneEnd + h * 0.43 + Math.min(w * 0.32, 250) * 1.7;
      railX = r.x + r.width / 2;
      railY = r.y;
      railHeight = r.height;
      nodeOffsets = nodes.map((n) => doc(n).y + doc(n).height / 2 - railY);
      const side = w < 700 ? w - 14 : w - 18;
      const start = releaseY - rootTop,
        end = railY - rootTop,
        bend = Math.min(start + h * 0.4, end - 130);
      path.setAttribute(
        "d",
        `M ${w / 2} ${start} C ${w / 2} ${start + 60},${side} ${start + 60},${side} ${bend} L ${side} ${end - 72} Q ${side} ${end - 32},${side - 40} ${end - 32} L ${railX + 40} ${end - 32} Q ${railX} ${end - 32},${railX} ${end}`,
      );
      pathLength = path.getTotalLength();
      pathSamples = Array.from(
        { length: 129 },
        (_, i) => path.getPointAtLength((pathLength * i) / 128).y,
      );
      path.style.strokeDasharray = String(pathLength);
      fallback.setAttribute("viewBox", `0 0 ${w} ${h}`);
      world?.resize(w, h);
      lastScroll = -1;
    };
    // Only these layout sources can move the dock or target: resize, fonts,
    // About expansion, and Experience accordion changes.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(measure);
    });
    [root, about, interaction, timeline, dock].forEach((el) =>
      observer.observe(el),
    );
    ScrollTrigger.addEventListener("refresh", measure);
    const unsubscribe = subscribeScroll?.(() => ScrollTrigger.update());
    const refresh = gsap.delayedCall(1, measure);
    measure();
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      root.dataset.renderer = "fallback";
    };
    const onRestored = () => {
      lost = false;
      lastScroll = -1;
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    // Idle-load before the foundation enters view. Reduced motion keeps the
    // original vector stills and staged grip: no extra WebGL context required.
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || reduce) return;
        preload.disconnect();
        void import("./signal-world")
          .then(({ createSignalWorld }) => {
            if (disposed) return;
            try {
              world = createSignalWorld(canvas);
              world.resize(w, h);
              lastScroll = -1;
            } catch {
              root.dataset.renderer = "fallback";
            }
          })
          .catch(() => {
            root.dataset.renderer = "fallback";
          });
      },
      { rootMargin: "1200px" },
    );
    preload.observe(about);
    const tick = (seconds: number) => {
      if (document.hidden) return;
      const y = scrollY;
      if (seconds - lastTime < 1 / 30 && y === lastScroll) return;
      lastTime = seconds;
      lastScroll = y;
      const emerge = smooth(emergeStart, openingEnd, y);
      const handoff = smooth(openingEnd, aboutTop + h * 0.12, y);
      const leave =
        w < 700
          ? smooth(aboutTop + h * 0.05, aboutTop + h * 0.38, y)
          : smooth(aboutTop + h * 0.25, aboutBottom - h * 0.45, y);
      const approach = smooth(sceneTop - h * 0.65, sceneTop + h * 0.08, y);
      const scene = reduce
        ? clamp((y - sceneTop + h * 0.4) / (h * 0.8))
        : clamp((y - sceneTop) / Math.max(1, sceneEnd - sceneTop));
      const hand = smooth(0.08, 0.35, scene),
        grip = smooth(0.34, 0.57, scene),
        crush = smooth(0.62, 0.76, scene),
        release = smooth(0.74, 0.96, scene);
      const heroSize = lerp(9, Math.min(w * 0.2, 235), emerge);
      const dockSize = w < 700 ? 118 : 170;
      // Dock in the blank right half of the heading; then retreat to the gutter,
      // never passing over About paragraphs or the photograph's caption.
      const gutter = w < 700 ? w - 15 : Math.min(w - 36, (w + 1152) / 2 + 32);
      let x = lerp(w * 0.5, dockX, handoff),
        cy = lerp(h * 0.76, h * 0.5, emerge),
        size = heroSize;
      cy = lerp(cy, dockY - y, handoff);
      size = lerp(size, dockSize, handoff);
      x = lerp(x, gutter, leave);
      cy = lerp(cy, h * 0.34, leave);
      size = lerp(size, w < 700 ? 25 : 65, leave);
      const interactionY = h * 0.43 - Math.max(0, y - sceneEnd);
      x = lerp(x, w * 0.5, approach);
      cy = lerp(cy, interactionY, approach);
      size = lerp(size, Math.min(w * 0.32, 250), approach);
      const visible =
        smooth(emergeStart, emergeStart + h * 0.24, y) *
        (1 - smooth(sceneEnd + h * 0.42, sceneEnd + h * 0.9, y));
      const pose: SignalPose = {
        x,
        y: cy,
        size,
        reveal: visible,
        turn: lerp(-0.65, 0.35, emerge) - handoff * 0.6 + approach * 0.3,
        hand,
        grip,
        crush,
        release,
      };
      canvas.style.opacity = String(visible);
      fallback.style.opacity = String(visible);
      root.dataset.signalStage =
        y < emergeStart
          ? "city"
          : y < openingEnd
            ? "emerge"
            : y < sceneTop
              ? "about"
              : release > 0
                ? "release"
                : crush > 0
                  ? "crush"
                  : grip > 0
                    ? "grip"
                    : "approach";
      if (visible > 0.001) {
        if (world && !lost) {
          try {
            world.render(pose, reduce ? 0 : seconds);
            root.dataset.renderer = "webgl";
          } catch {
            world.dispose();
            world = undefined;
            root.dataset.renderer = "fallback";
          }
        }
        const g = fallback.querySelector<SVGGElement>("[data-fallback-rig]")!;
        g.setAttribute(
          "transform",
          `translate(${x} ${cy}) scale(${size / 210})`,
        );
        fallback
          .querySelector<SVGGElement>("[data-fallback-core]")!
          .setAttribute(
            "transform",
            `scale(${1 - crush * 0.3} ${1 - crush * 0.45})`,
          );
        fallback.querySelector<SVGGElement>(
          "[data-fallback-core]",
        )!.style.opacity = String(1 - release);
        fallback.querySelector<SVGGElement>(
          "[data-fallback-hand]",
        )!.style.opacity = String(hand);
        fallback
          .querySelector<SVGGElement>("[data-fallback-hand]")!
          .setAttribute("transform", `translate(0 ${(1 - hand) * 200})`);
        fallback.querySelector<SVGPathElement>(
          "[data-fallback-open]",
        )!.style.opacity = String(1 - grip);
        fallback.querySelector<SVGPathElement>(
          "[data-fallback-closed]",
        )!.style.opacity = String(grip);
        fallback.querySelector<SVGPathElement>(
          "[data-fallback-leak]",
        )!.style.opacity = String(release);
      }
      // Monotonic path measured in document space. Find where the viewport's
      // advancing charge intersects it, including the bend into the real rail.
      const front = y + h * 0.7 - rootTop;
      let low = 0,
        high = 128;
      while (high - low > 1) {
        const mid = Math.floor((low + high) / 2);
        if (pathSamples[mid] < front) low = mid;
        else high = mid;
      }
      const fraction = clamp(
        (front - pathSamples[low]) /
          Math.max(0.01, pathSamples[high] - pathSamples[low]),
      );
      const amount = reduce ? 1 : release > 0.001 ? (low + fraction) / 128 : 0;
      path.style.strokeDashoffset = String(pathLength * (1 - amount));
      path.style.opacity = String(reduce ? 1 : smooth(0.75, 0.89, scene));
      const charge = reduce ? 1 : smooth(railY - h * 0.72, railY - h * 0.58, y);
      timeline.style.setProperty("--signal-charge", String(charge));
      const lit =
        clamp((y - (railY - h * 0.8)) / (railHeight + h * 0.5)) * railHeight;
      nodes.forEach(
        (node, i) =>
          (node.dataset.charged =
            charge > 0.5 && lit >= nodeOffsets[i] ? "true" : "false"),
      );
    };
    gsap.ticker.add(tick);
    tick(0);
    return () => {
      disposed = true;
      observer.disconnect();
      preload.disconnect();
      cancelAnimationFrame(refreshFrame);
      refresh.kill();
      unsubscribe?.();
      ScrollTrigger.removeEventListener("refresh", measure);
      gsap.ticker.remove(tick);
      world?.dispose();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      timeline.style.removeProperty("--signal-charge");
      nodes.forEach((n) => delete n.dataset.charged);
    };
  }, [reducedMotion, subscribeScroll]);
  return (
    <div
      ref={rootRef}
      className="signal-story"
      style={
        {
          "--signal-red": SIGNAL.red,
          "--signal-hot": SIGNAL.hot,
          "--signal-dark": SIGNAL.dark,
        } as CSSProperties
      }
    >
      {children}
      <svg className="signal-conductor" aria-hidden="true">
        <path
          ref={pathRef}
          fill="none"
          stroke="var(--signal-red)"
          strokeWidth="2"
        />
      </svg>
      <canvas ref={canvasRef} className="signal-stage" aria-hidden="true" />
      <svg
        ref={fallbackRef}
        className="signal-stage signal-fallback"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="signal-shell" x2="1" y2="1">
            <stop stopColor="#666976" />
            <stop offset=".3" stopColor="#20222b" />
            <stop offset=".75" stopColor="#111218" />
            <stop offset="1" stopColor="#713240" />
          </linearGradient>
        </defs>
        <g data-fallback-rig>
          <g data-fallback-core stroke="#737480" strokeWidth="1">
            <path
              d="M-8-98-52-66-51 7-30 31-18-9ZM-50 12-30 36-42 82-21 99-6 22-19 7ZM24-99 8-27 21-7 51-31 46-81ZM21-3 51-28 50 66 11 99 16 32Z"
              fill="url(#signal-shell)"
            />
            <path
              d="m-22 94 10-4 34-184-10 5Z"
              fill={SIGNAL.red}
              stroke={SIGNAL.hot}
            />
          </g>
          <g
            data-fallback-hand
            fill="url(#signal-shell)"
            stroke="#7b727f"
            strokeWidth="1.2"
          >
            <path
              data-fallback-open
              d="M-39 203-51 94-78 32Q-85 6-70 1Q-57-3-49 20L-35 46-42-77Q-44-95-29-95Q-17-95-17-79L-12-9-10-97Q-8-114 5-110Q17-110 17-94L17-6 28-83Q31-98 43-94Q54-91 50-74L41 3 53-49Q57-65 69-60Q78-57 75-43L62 51 51 106 46 203Z"
            />
            <path
              data-fallback-closed
              d="M-39 203-49 105-64 20Q-68-13-48-25L-40-49Q-37-69-19-62L-2-67Q20-77 31-57Q52-62 61-44L66 8 56 72 43 110 44 203ZM-45-20Q-6-36 33-5L25 14Q-9 2-24 15"
            />
          </g>
          <path
            data-fallback-leak
            d="M-13 30Q-18 100-3 148T0 350M8 32Q19 102 4 160T0 350"
            stroke={SIGNAL.red}
            strokeWidth="3"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

export function SignalInteraction() {
  return (
    <div className="signal-interaction" aria-hidden="true">
      <div className="signal-interaction-space" />
    </div>
  );
}
