"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/components/layout/settings-provider";
import { useLenisScroll } from "@/components/layout/lenis-provider";
import { ManifestoScroll } from "@/components/sections/manifesto-scroll";
import { Hero } from "./hero";
import { PortalAperture } from "./portal-glyph";
import { portalPose, portalViewportPath, smooth, type PortalBounds } from "./opening-math";
import type { CityWorld } from "./city-world";
import "./opening.css";

gsap.registerPlugin(ScrollTrigger);

export function OpeningSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<SVGPathElement>(null);
  const momentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frozen = useRef(false);
  const { reducedMotion } = useSettings();
  const { subscribeScroll } = useLenisScroll();

  useEffect(() => {
    const root = rootRef.current!,
      stage = stageRef.current!,
      anchor = portalRef.current!;
    const canvas = canvasRef.current!,
      moment = momentRef.current!;
    const city = stage.querySelector<HTMLElement>(".opening-city")!;
    const hero = stage.querySelector<HTMLElement>(".opening-hero")!;
    let world: CityWorld | undefined,
      disposed = false,
      inView = true,
      contextLost = false;
    let worldVisible = false;
    let width = stage.clientWidth,
      height = window.innerHeight;
    let bounds: PortalBounds = { x: 0, y: 0, width: 100, height: 100 / 1.8 };
    let progress = 0,
      descent = 0,
      lastRender = -1,
      lastTime = -1;
    let trigger: ScrollTrigger | undefined;
    const motion =
      !reducedMotion &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.enhanced = motion ? "true" : "false";
    const paint = (value: number) => {
      // ScrollTrigger can report a fractional epsilon at its pinned start.
      // Snap it to the actual resting pose instead of compositing near-zero SVGs.
      if (value < 0.00002) value = 0;
      progress = value;
      const pose = portalPose(value, bounds, width, height);
      const aperturePath = portalViewportPath(pose, width, height);
      // Once the slash covers all corners, retire clipping without changing pixels.
      root.style.setProperty(
        "--portal-clip",
        pose.portal >= 0.99 ? "none" : `path("${aperturePath}")`,
      );
      descent = pose.descent;
      edgeRef.current?.setAttribute("d", aperturePath);
      edgeRef.current?.setAttribute("opacity", String(pose.edgeOpacity));
      root.style.setProperty("--portal-material", String(pose.materialOpacity));
      root.style.setProperty(
        "--portal-inline",
        String(1 - smooth(0, 0.04, pose.portal)),
      );
      root.style.setProperty(
        "--opening-portrait",
        String(pose.portraitOpacity),
      );
      root.style.setProperty("--world-position", `${pose.descent * 100}%`);
      root.style.setProperty(
        "--city-end",
        String(smooth(0.82, 1, value)),
      );
      root.dataset.progress = value.toFixed(4);
      root.style.setProperty("--opening-city", String(pose.cityOpacity));
      root.style.setProperty("--opening-name", String(pose.heroOpacity));
      root.style.setProperty(
        "--opening-secondary",
        String(pose.secondaryOpacity),
      );
      root.style.setProperty(
        "--opening-ambient",
        String(1 - smooth(0.05, 0.48, pose.portal)),
      );
      const opacity =
        smooth(0.53, 0.59, value) * (1 - smooth(0.78, 0.86, value));
      moment.style.opacity = String(opacity);
      moment.style.transform = `translate3d(0,${(1 - smooth(0.53, 0.59, value)) * 28 - smooth(0.78, 0.86, value) * 18}px,0)`;
      hero.inert = pose.secondaryOpacity < 0.05;
      if (value < 0.00002 && (trigger?.progress ?? 0) < 0.00002) {
        frozen.current = false;
        root.dataset.frozen = "false";
        if (world?.ready && !contextLost) {
          worldVisible = true;
          canvas.style.opacity = "1";
        }
      }
    };
    const measure = () => {
      const rect = stage.getBoundingClientRect(),
        glyph = anchor.getBoundingClientRect();
      width = rect.width;
      height = motion ? rect.height : rect.height / 2;
      bounds = {
        x: glyph.left - rect.left,
        y: glyph.top - rect.top,
        width: glyph.width,
        height: glyph.height,
      };
      world?.resize(width, height);
      if (motion) paint(progress);
    };
    if (motion) {
      measure();
      trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${root.offsetHeight - stage.offsetHeight}`,
        pin: stage,
        pinSpacing: false,
        pinType: "fixed",
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (self.progress > 0.00015) {
            frozen.current = true;
            root.dataset.frozen = "true";
          }
          paint(self.progress);
        },
        onRefresh: measure,
      });
    } else {
      frozen.current = true;
      root.dataset.frozen = "true";
      moment.removeAttribute("aria-hidden");
    }
    const unsubscribe = subscribeScroll?.(() => ScrollTrigger.update());
    // The existing route wrapper enters with a small transform. Re-measure once
    // it settles rather than changing that shared transition or polling layout.
    const entranceRefresh = gsap.delayedCall(0.8, () => trigger?.refresh());
    let refreshFrame = 0;
    const observer = new ResizeObserver(() => {
      measure();
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => trigger?.refresh());
    });
    observer.observe(stage);
    observer.observe(anchor);
    void document.fonts.ready.then(() => {
      if (!disposed) {
        measure();
        trigger?.refresh();
      }
    });
    const intersection = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
      },
      { rootMargin: "100px" },
    );
    intersection.observe(root);
    const onLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      canvas.style.opacity = "0";
    };
    const onRestored = () => {
      contextLost = false;
      lastRender = -1;
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    // Lazy import never blocks the landing. Reduced motion uses the original still.
    if (motion)
      void import("./city-world")
        .then(({ createCityWorld }) => {
          if (disposed) return;
          try {
            world = createCityWorld(
              canvas,
              window.matchMedia("(max-width: 699px)").matches,
            );
            measure();
            world.render(descent, 0);
            // Never swap the fallback for a different world halfway through a zoom.
            worldVisible = world.ready && progress < 0.0001;
            canvas.style.opacity = worldVisible ? "1" : "0";
          } catch {
            world?.dispose();
            world = undefined;
            canvas.style.opacity = "0";
          }
        })
        .catch(() => {
          canvas.style.opacity = "0";
        });
    const tick = (seconds: number) => {
      if (world?.ready && !worldVisible && progress < 0.0001 && !contextLost) {
        worldVisible = true;
        try {
          world.render(descent, seconds);
          canvas.style.opacity = "1";
        } catch {
          worldVisible = false;
          canvas.style.opacity = "0";
          world.dispose();
          world = undefined;
        }
      }
      if (
        !world ||
        !worldVisible ||
        !inView ||
        document.hidden ||
        contextLost ||
        !motion ||
        progress < 0.0001
      )
        return;
      // Full rate while scrolling; environmental motion is capped at 30 fps at rest.
      if (
        Math.abs(lastRender - progress) < 0.000001 &&
        seconds - lastTime < 1 / 30
      )
        return;
      try {
        world.render(descent, seconds);
        lastRender = progress;
        lastTime = seconds;
        canvas.style.opacity = "1";
      } catch {
        worldVisible = false;
        canvas.style.opacity = "0";
        world.dispose();
        world = undefined;
      }
    };
    gsap.ticker.add(tick);
    city.dataset.static = motion ? "false" : "true";
    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      intersection.disconnect();
      unsubscribe?.();
      gsap.ticker.remove(tick);
      entranceRefresh.kill();
      trigger?.kill(true);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      world?.dispose();
      canvas.style.opacity = "0";
      hero.inert = false;
      frozen.current = false;
      delete root.dataset.enhanced;
      delete root.dataset.frozen;
      root.removeAttribute("style");
      moment.removeAttribute("style");
    };
  }, [reducedMotion, subscribeScroll]);

  return (
    <div className="opening-sequence" ref={rootRef}>
      <div className="opening-stage" ref={stageRef}>
        <div className="opening-city" aria-hidden="true">
          {/* A local, original still—not a reference image or a second WebGL world. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/textures/monolith-world.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <canvas ref={canvasRef} />
          <div className="opening-city-vignette" />
        </div>
        <PortalAperture edgeRef={edgeRef} />
        <div className="opening-atmosphere" aria-hidden="true">
          <div />
        </div>
        <Hero frozen={frozen} portalRef={portalRef} />
        <ManifestoScroll momentRef={momentRef} />
      </div>
    </div>
  );
}
