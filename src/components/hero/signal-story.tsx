"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/components/layout/settings-provider";
import { useLenisScroll } from "@/components/layout/lenis-provider";
import { clamp, lerp, smooth } from "./opening-math";
import { SIGNAL } from "./signal-material";
import { captureProgress, signalSegment } from "./signal-math";
import type { createSignalWorld, SignalPose } from "./signal-world";
import "./signal-story.css";

/** One scroll authority for extraction, capture, fracture and signal. The rail's
 * measured X is authoritative at every stage, including the mobile layout. */
export function SignalStory({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<SVGSVGElement>(null),
    handRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();
  const { subscribeScroll } = useLenisScroll();
  useEffect(() => {
    const root = rootRef.current!,
      canvas = canvasRef.current!,
      fallback = fallbackRef.current!,
      handStill = handRef.current!,
      beam = beamRef.current!;
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
    const rig = fallback.querySelector<SVGGElement>("[data-core-rig]")!;
    const fallbackPlates = Array.from(
      fallback.querySelectorAll<SVGPathElement>("[data-core-plate]"),
    );
    const doors = Array.from(
      fallback.querySelectorAll<SVGPathElement>("[data-core-door]"),
    );
    const reduce =
      reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.motion = reduce ? "reduced" : "full";
    root.dataset.renderer = "fallback";
    let world: ReturnType<typeof createSignalWorld> | undefined,
      disposed = false,
      lost = false;
    let w = innerWidth,
      h = innerHeight,
      rootTop = 0,
      openingEnd = 0,
      emergeStart = 0,
      aboutTop = 0,
      dockY = 0,
      sceneTop = 0,
      sceneBottom = 0,
      sceneEnd = 0,
      railX = 0,
      railY = 0,
      railHeight = 1;
    let offsets: number[] = [],
      lastTime = -1,
      lastScroll = -1,
      refreshFrame = 0;
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
      emergeStart = openingEnd - (reduce ? h * 0.7 : (o.height - h) * 0.3);
      aboutTop = a.y;
      dockY = d.y + d.height / 2;
      sceneTop = s.y;
      sceneBottom = s.y + s.height;
      sceneEnd = s.y + Math.max(h * 0.1, s.height - h);
      railX = r.x + r.width / 2;
      railY = r.y;
      railHeight = r.height;
      offsets = nodes.map((n) => {
        const box = doc(n);
        return box.y + box.height / 2 - railY;
      });
      root.style.setProperty("--signal-axis", `${railX}px`);
      fallback.setAttribute("viewBox", `0 0 ${w} ${h}`);
      world?.resize(w, h);
      lastScroll = -1;
    };
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
    // Load before the visible foundation seam, not at the moment of extraction.
    let loading = false;
    const load = () => {
      if (loading || reduce) return;
      loading = true;
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
    };
    const tick = (seconds: number) => {
      if (document.hidden) return;
      const y = scrollY;
      if (y > emergeStart - h * 2) load();
      if (
        y === lastScroll &&
        (reduce || y < emergeStart || y > railY + railHeight + h)
      )
        return;
      if (seconds - lastTime < 1 / 30 && y === lastScroll) return;
      lastTime = seconds;
      lastScroll = y;
      const mobile = w < 768;
      const foundation = smooth(emergeStart, openingEnd - h * 0.2, y);
      const unlock = smooth(0.35, 0.57, foundation);
      const lift =
        smooth(0.57, 0.66, foundation) * 0.12 +
        smooth(0.73, 1, foundation) * 0.88;
      const handoff = smooth(openingEnd, aboutTop + h * 0.12, y);
      const approach = smooth(sceneTop - h * 0.7, sceneTop + h * 0.08, y);
      const scene = clamp((y - sceneTop) / (sceneEnd - sceneTop));
      const capture = captureProgress(scene);
      const hand = reduce ? (scene > 0.22 ? 1 : 0) : capture.hand;
      const { grip, crush, release } = capture;
      const heroSize = lerp(12, mobile ? 150 : 250, foundation);
      let size = lerp(heroSize, mobile ? 126 : 194, handoff);
      let cy = lerp(h * 1.05, h * 0.68, foundation) - lift * h * 0.2;
      cy = lerp(cy, dockY - y, handoff);
      // The header-sized object settles into the column gap as copy scrolls by.
      // Its axis stays fixed; mobile reserves the matching left-side gutter.
      const carry = smooth(aboutTop + h * 0.12, aboutTop + h * 0.42, y);
      cy = lerp(cy, Math.max(h * 0.26, dockY - y), carry);
      size = lerp(size, mobile ? 60 : 74, carry);
      const interactionY = h * 0.4 - Math.max(0, y - sceneEnd);
      cy = lerp(cy, interactionY, approach);
      size = lerp(size, mobile ? 145 : 238, approach);
      const active = y >= emergeStart && y < sceneEnd + h * 1.05;
      const pose: SignalPose = {
        x: railX,
        y: cy,
        size,
        turn: lerp(-0.34, 0.28, lift) * (1 - approach * 0.8),
        unlock,
        lift,
        hand,
        grip,
        crush,
        release,
        mobile,
      };
      canvas.style.visibility = active ? "visible" : "hidden";
      fallback.style.visibility = active ? "visible" : "hidden";
      root.dataset.signalStage =
        y < emergeStart
          ? "city"
          : foundation < 0.35
            ? "foundation"
            : lift < 1
              ? "extraction"
              : y < sceneTop
                ? "about"
                : release > 0
                  ? "release"
                  : crush > 0
                    ? "crush"
                    : grip > 0
                      ? "grip"
                      : "approach";
      if (active) {
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
        rig.setAttribute(
          "transform",
          `translate(${railX} ${cy}) scale(${size / 320})`,
        );
        fallbackPlates.forEach((plate, i) => {
          const sign = i < 2 ? -1 : 1,
            snap = smooth(0.48, 0.78, crush) * (i === 1 || i === 2 ? 1 : 0);
          plate.setAttribute(
            "transform",
            `translate(${-sign * crush * 9 + sign * snap * 13} ${snap * 19}) rotate(${sign * snap * 7})`,
          );
        });
        doors.forEach((door, i) => {
          door.style.visibility = lift < 1 ? "visible" : "hidden";
          door.setAttribute(
            "transform",
            `translate(${(i ? -1 : 1) * unlock * 75} ${lift * 800})`,
          );
        });
        handStill.style.cssText = `left:${railX}px;top:${cy}px;width:${size * 1.94}px;height:${size * 1.94}px;opacity:${hand};background-position:${grip > 0.7 ? 100 : grip > 0.25 ? 50 : 0}% 50%;transform:translate(-50%,-45%) rotate(${mobile ? -40 : 0}deg);`;
      } else handStill.style.opacity = "0";
      // One straight document-space conduit. Its first pixel is the lower core
      // socket, and its last pixel is the existing rail: no curve, spline or X lerp.
      const {
        x,
        start: origin,
        length,
      } = signalSegment(railX, railY, y, cy, size, h, release);
      beam.style.left = `${x}px`;
      beam.style.top = `${origin - rootTop}px`;
      beam.style.height = `${length}px`;
      beam.style.opacity = release > 0 ? "1" : "0";
      beam.style.setProperty(
        "--signal-flow",
        `${reduce ? 0 : seconds * 110}px`,
      );
      // Suppress the connector across the existing logo strip and heading, without
      // moving it sideways or changing those sections' layout/content.
      const denseStart = sceneBottom - origin;
      const denseEnd = railY - origin - 55;
      beam.style.maskImage = `linear-gradient(to bottom,#000 0px,#000 ${Math.max(0, denseStart - 45)}px,#0002 ${Math.max(0, denseStart)}px,#0002 ${Math.max(0, denseEnd - 40)}px,#000 ${Math.max(0, denseEnd)}px)`;
      const charge = reduce ? 1 : smooth(railY - h * 0.89, railY - h * 0.8, y);
      timeline.style.setProperty("--signal-charge", String(charge));
      timeline.style.setProperty(
        "--signal-impact",
        String(Math.sin(charge * Math.PI)),
      );
      const lit =
        clamp((y - (railY - h * 0.8)) / (railHeight + h * 0.5)) * railHeight;
      nodes.forEach((node, i) => {
        node.dataset.charged =
          charge > 0.5 && lit >= offsets[i] ? "true" : "false";
      });
    };
    gsap.ticker.add(tick);
    tick(0);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(refreshFrame);
      refresh.kill();
      unsubscribe?.();
      ScrollTrigger.removeEventListener("refresh", measure);
      gsap.ticker.remove(tick);
      world?.dispose();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      timeline.style.removeProperty("--signal-charge");
      timeline.style.removeProperty("--signal-impact");
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
      <div ref={beamRef} className="signal-conductor" aria-hidden="true">
        <i />
        <b />
        <span />
      </div>
      <canvas ref={canvasRef} className="signal-stage" aria-hidden="true" />
      <div ref={handRef} className="signal-hand-still" aria-hidden="true" />
      <svg
        ref={fallbackRef}
        className="signal-stage signal-fallback"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cipher-shell">
            <stop stopColor="#51525a" />
            <stop offset=".18" stopColor="#202127" />
            <stop offset="1" stopColor="#101116" />
          </linearGradient>
        </defs>
        <g data-core-rig>
          <path d="M-2-136 2-135 7 140 0 143Z" fill={SIGNAL.red} />
          <g fill="url(#cipher-shell)" stroke="#44454b" strokeWidth=".6">
            <path data-core-plate d="M-43-147-16-161-8-29-19-9-43-23Z" />
            <path data-core-plate d="M-43-19-18-5-9 140-34 155-43 136Z" />
            <path data-core-plate d="M2-138 34-149 41-36 11-15Z" />
            <path data-core-plate d="M11-10 43-30 43 131 18 152 10 28Z" />
          </g>
          <g fill="#17171b" stroke="#2b2b30">
            <path data-core-door d="M4-180 100-203 136-151 136 500 4 500Z" />
            <path data-core-door d="M-4-180-100-203-136-151-136 500-4 500Z" />
          </g>
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
