"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "./settings-provider";

/**
 * Tiny red "monster" that lives in the navbar. Three modes:
 *   - patrol: walks left to right then back, looping. Legs swing in
 *     opposite phases (4-leg gallop). Eyes look the way it's facing.
 *   - chase:  cursor enters the nav, monster sprints toward the cursor x,
 *     legs go double-time, body tilts forward, eyes lock on cursor.
 *   - attack: when the cursor is within ~30px, monster lunges, body
 *     squashes, a brief red claw/teeth flash bursts toward the cursor.
 *
 * Hidden on touch + reduced-motion devices.
 */
export function NavMonster({ scopeRef }: { scopeRef: React.RefObject<HTMLElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const { reducedMotion } = useSettings();

  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnabled(hover && !reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) return;
    const scope = scopeRef.current;
    const el = wrapRef.current;
    if (!scope || !el) return;

    let raf = 0;
    const NAV_H = 64; // h-16
    const FLOOR_Y = NAV_H - 14; // baseline for feet
    const PAD = 80; // patrol left/right padding from edges
    const PATROL_SPEED_PX_PER_S = 28;
    const CHASE_SPEED_PX_PER_S = 280;
    const ATTACK_DIST = 36;

    let mouseInside = false;
    let cursorX = 0;
    let cursorY = NAV_H / 2;
    let monsterX = PAD;
    let direction: 1 | -1 = 1;
    let attacking = false;
    let attackTimer = 0;
    let prevTs = performance.now();
    let lastPaintTs = 0;
    let scopeWidth = scope.clientWidth;
    let scopeRect = scope.getBoundingClientRect();
    let paused = document.hidden;
    const onVisibility = () => {
      paused = document.hidden;
      cancelAnimationFrame(raf);
      if (!paused) {
        prevTs = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = (ts: number) => {
      if (paused) {
        return;
      }
      const frameInterval = mouseInside ? 1000 / 60 : 1000 / 30;
      if (ts - lastPaintTs < frameInterval) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastPaintTs = ts;
      const dt = Math.min(0.05, (ts - prevTs) / 1000);
      prevTs = ts;
      const w = scopeWidth;
      const minX = PAD;
      const maxX = Math.max(PAD + 20, w - PAD);

      let speed = PATROL_SPEED_PX_PER_S;
      let leg = "patrol";

      if (mouseInside) {
        // Chase the cursor
        const dx = cursorX - monsterX;
        const sign = Math.sign(dx) || 1;
        direction = sign as 1 | -1;
        speed = CHASE_SPEED_PX_PER_S * Math.min(1, Math.abs(dx) / 200 + 0.4);
        leg = "chase";

        if (Math.abs(dx) < ATTACK_DIST && attackTimer <= 0) {
          attacking = true;
          attackTimer = 0.32; // 320ms attack window
        }
      } else if (attacking) {
        // Tail end of attack: keep moving briefly then resume patrol
        speed = CHASE_SPEED_PX_PER_S * 0.4;
        leg = "chase";
      } else {
        // Patrol back and forth
        const at = monsterX;
        if (at >= maxX) direction = -1;
        if (at <= minX) direction = 1;
        leg = "patrol";
      }

      monsterX += direction * speed * dt;
      monsterX = Math.max(minX, Math.min(maxX, monsterX));

      attackTimer -= dt;
      if (attackTimer <= 0) attacking = false;

      // Walking phase advances faster when chasing
      const phaseRate = leg === "chase" ? 12 : 5; // rad/s
      const phase = (ts / 1000) * phaseRate;

      // Body bob (small vertical sine when walking, bigger lunge on attack)
      const bob = Math.sin(phase * 2) * (leg === "chase" ? 1.5 : 0.8);
      const lunge = attacking ? Math.sin((1 - attackTimer / 0.32) * Math.PI) * 4 : 0;

      // Tilt forward when chasing
      const tilt = mouseInside ? direction * (leg === "chase" ? 12 : 4) : 0;

      // Eye target offset (toward cursor)
      const eyeDx = mouseInside ? Math.max(-1.6, Math.min(1.6, (cursorX - monsterX) * 0.04)) : direction * 0.6;
      const eyeDy = mouseInside ? Math.max(-1.2, Math.min(1.2, (cursorY - NAV_H / 2) * 0.08)) : 0;

      el.style.setProperty("--mx", `${monsterX}px`);
      el.style.setProperty("--my", `${FLOOR_Y - bob - lunge}px`);
      el.style.setProperty("--dir", `${direction}`);
      el.style.setProperty("--tilt", `${tilt}deg`);
      el.style.setProperty("--ex", `${eyeDx}px`);
      el.style.setProperty("--ey", `${eyeDy}px`);
      el.style.setProperty("--phase", `${phase}`);
      el.style.setProperty("--leg-a", `${Math.sin(phase) * (leg === "chase" ? 7 : 4)}px`);
      el.style.setProperty("--leg-b", `${Math.sin(phase + Math.PI) * (leg === "chase" ? 7 : 4)}px`);
      el.style.setProperty("--leg-c", `${Math.sin(phase + 1.3) * (leg === "chase" ? 7 : 4)}px`);
      el.style.setProperty("--leg-d", `${Math.sin(phase + 1.3 + Math.PI) * (leg === "chase" ? 7 : 4)}px`);
      el.style.setProperty("--attack", attacking ? "1" : "0");
      el.style.setProperty("--squash", attacking ? "0.86" : "1");
      el.style.setProperty("--stretch", attacking ? "1.18" : "1");

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      cursorX = e.clientX - scopeRect.left;
      cursorY = e.clientY - scopeRect.top;
      mouseInside = true;
    };
    const onLeave = () => {
      mouseInside = false;
    };
    const onEnter = (e: PointerEvent) => {
      scopeRect = scope.getBoundingClientRect();
      scopeWidth = scopeRect.width;
      cursorX = e.clientX - scopeRect.left;
      cursorY = e.clientY - scopeRect.top;
      mouseInside = true;
    };

    const onResize = () => {
      scopeRect = scope.getBoundingClientRect();
      scopeWidth = scopeRect.width;
    };

    scope.addEventListener("pointermove", onMove, { passive: true });
    scope.addEventListener("pointerenter", onEnter);
    scope.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      scope.removeEventListener("pointermove", onMove);
      scope.removeEventListener("pointerenter", onEnter);
      scope.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, scopeRef]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-[1] hidden md:block"
      style={
        {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transform: "translate3d(var(--mx), var(--my), 0)",
          ["--mx" as string]: "80px",
          ["--my" as string]: "42px",
          ["--dir" as string]: "1",
          ["--tilt" as string]: "0deg",
          ["--ex" as string]: "0px",
          ["--ey" as string]: "0px",
          ["--phase" as string]: "0",
          ["--leg-a" as string]: "0px",
          ["--leg-b" as string]: "0px",
          ["--leg-c" as string]: "0px",
          ["--leg-d" as string]: "0px",
          ["--attack" as string]: "0",
          ["--squash" as string]: "1",
          ["--stretch" as string]: "1",
        } as React.CSSProperties
      }
    >
      {/* Soft red haze under the monster (more intense when attacking) */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          transform: "translate(-50%, -10%)",
          width: 56,
          height: 14,
          background:
            "radial-gradient(50% 60% at 50% 50%, color-mix(in oklab, var(--color-accent) calc(38% + var(--attack) * 30%), transparent) 0%, transparent 75%)",
          filter: "blur(5px)",
        }}
      />

      {/* Body group, tilts forward when chasing/attacking */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          transform:
            "translate(-50%, -100%) rotate(var(--tilt)) scale(var(--squash, 1), var(--stretch, 1))",
          width: 30,
          height: 18,
          transformOrigin: "50% 100%",
        }}
      >
        {/* Legs (4 lines, two pairs in opposite phase) */}
        <Leg side="front" varName="leg-a" attached="left" />
        <Leg side="back" varName="leg-b" attached="left" />
        <Leg side="front" varName="leg-c" attached="right" />
        <Leg side="back" varName="leg-d" attached="right" />

        {/* Body, dark blob with red rim */}
        <div
          className="absolute inset-x-0 bottom-1.5 mx-auto"
          style={{
            width: 28,
            height: 14,
            borderRadius: 999,
            background:
              "radial-gradient(60% 100% at 50% 30%, #1a0608 0%, #0a0306 70%, #000 100%)",
            boxShadow:
              "0 0 8px color-mix(in oklab, var(--color-accent) calc(60% + var(--attack) * 30%), transparent), inset 0 0 0 1px color-mix(in oklab, var(--color-accent) 60%, transparent)",
          }}
        />
        {/* Eyes (stacked horizontally, pupils tilt toward cursor) */}
        <Eye offsetX={-5} />
        <Eye offsetX={5} />

        {/* Attack flash, red claw/teeth burst at the front when attacking */}
        <div
          className="absolute"
          style={{
            top: "44%",
            left: "calc(50% + var(--dir) * 14px)",
            transform: "translate(-50%, -50%)",
            width: 12,
            height: 8,
            opacity: "var(--attack)",
            transition: "opacity 60ms linear",
            background:
              "radial-gradient(50% 70% at 50% 50%, #ffd6c2 0%, var(--color-accent-3) 35%, var(--color-accent) 70%, transparent 100%)",
            filter: "blur(0.6px)",
            boxShadow:
              "0 0 10px var(--color-accent), 0 0 18px color-mix(in oklab, var(--color-accent) 70%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

function Leg({
  side,
  varName,
  attached,
}: {
  side: "front" | "back";
  varName: string;
  attached: "left" | "right";
}) {
  const x = attached === "left" ? (side === "front" ? 6 : 9) : side === "front" ? 21 : 24;
  return (
    <div
      className="absolute bottom-0"
      style={{
        left: x,
        width: 1.5,
        height: 6,
        background: "color-mix(in oklab, var(--color-accent) 70%, #2a0408)",
        borderRadius: 1,
        transform: `translateY(var(--${varName}))`,
        transformOrigin: "50% 0%",
        boxShadow:
          "0 0 4px color-mix(in oklab, var(--color-accent) 50%, transparent)",
      }}
    />
  );
}

function Eye({ offsetX }: { offsetX: number }) {
  return (
    <div
      className="absolute"
      style={{
        top: 4,
        left: `calc(50% + ${offsetX}px)`,
        transform: "translateX(-50%)",
        width: 6,
        height: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "#0a0306",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 4,
          height: 4,
          borderRadius: 999,
          background:
            "radial-gradient(circle, #ffd6c2 0%, var(--color-accent-3) 40%, var(--color-accent) 80%, transparent 100%)",
          boxShadow:
            "0 0 6px var(--color-accent), 0 0 12px color-mix(in oklab, var(--color-accent) 70%, transparent)",
          transform:
            "translate(calc(-50% + var(--ex)), calc(-50% + var(--ey)))",
        }}
      />
    </div>
  );
}
