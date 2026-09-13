export const PORTAL_END = 0.36;
export const GLYPH_PATHS = [
  "M54 12 10 50 54 88 62 78 30 50 62 22Z",
  "M106 4H120L74 96H60Z",
  "M126 12 170 50 126 88 118 78 150 50 118 22Z",
] as const;

export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export function smooth(a: number, b: number, value: number) {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type PortalBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export function portalPose(
  progress: number,
  start: PortalBounds,
  width: number,
  height: number,
) {
  const p = clamp(progress / PORTAL_END);
  const centre = smooth(0.1, 0.58, p);
  const base = start.width / 180;
  // The central slash, not the gap between characters, is the optical axis.
  // At full scale its interior covers every viewport corner: no scene swap.
  const cover = (Math.hypot(width, height) * 2) / Math.max(base * 12, 0.01);
  const zoom = Math.exp(Math.log(cover) * smooth(0.12, 0.91, p));
  return {
    x: lerp(start.x + start.width / 2, width / 2, centre),
    y: lerp(start.y + start.height / 2, height / 2, centre),
    scale: base * zoom,
    portal: p,
    cityOpacity: smooth(0.002, 0.16, p),
    heroOpacity: 1 - smooth(0.2, 0.6, p),
    secondaryOpacity: 1 - smooth(0.1, 0.36, p),
    edgeOpacity:
      (1 - smooth(0.4, 0.72, p)) * lerp(0.4, 0.8, smooth(0, 0.12, p)),
    descent: smooth(PORTAL_END * 0.83, 1, progress),
  };
}

export function cityCamera(t: number) {
  return {
    x: 6 + Math.sin(t * Math.PI * 1.3) * 7 - t * 10,
    y: lerp(365, -48, t),
    z: lerp(150, -150, t),
    targetY: lerp(185, -52, t),
    targetZ: lerp(-140, -265, t),
    roll: Math.sin(t * Math.PI * 2) * 0.012,
  };
}
