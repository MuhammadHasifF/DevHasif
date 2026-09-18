export const PORTAL_END = 0.34;
export const GLYPH_PATHS = [
  "M55 19 10 46V54L55 81V67L26 50 55 33Z",
  "M102 9H116L78 91H64Z",
  "M125 19 170 46V54L125 81V67L154 50 125 33Z",
] as const;
const GLYPH_POINTS = [
  [[55,19],[10,46],[10,54],[55,81],[55,67],[26,50],[55,33]],
  [[102,9],[116,9],[78,91],[64,91]],
  [[125,19],[170,46],[170,54],[125,81],[125,67],[154,50],[125,33]],
] as const;

/** Viewport-space CSS path avoids cross-layer SVG reference clipping artifacts. */
export function portalViewportPath(pose: {x:number;y:number;scale:number}, width:number, height:number) {
  return GLYPH_POINTS.map(points => {
    let polygon: number[][] = points.map(([x,y]) => [pose.x+(x-90)*pose.scale, pose.y+(y-50)*pose.scale]);
    // Clip geometry before handing it to the compositor: the apparent zoom can
    // be enormous, but no raster layer ever needs to exceed the viewport.
    for (const [axis, limit, direction] of [[0,-2,1],[0,width+2,-1],[1,-2,1],[1,height+2,-1]]) {
      const input = polygon;
      polygon = [];
      input.forEach((b, i) => {
        const a = input[(i+input.length-1)%input.length];
        const aIn = (a[axis]-limit)*direction >= 0;
        const bIn = (b[axis]-limit)*direction >= 0;
        if (aIn !== bIn) {
          const t = (limit-a[axis])/(b[axis]-a[axis]);
          polygon.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)]);
        }
        if (bIn) polygon.push(b);
      });
    }
    return polygon.length ? polygon.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")+"Z" : "";
  }).join(" ");
}

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
  const centre = smooth(0.08, 0.65, p);
  const base = start.width / 180;
  // The central slash, not the gap between characters, is the optical axis.
  // At full scale its interior covers every viewport corner: no scene swap.
  const cover = (Math.hypot(width, height) * 2) / Math.max(base * 12, 0.01);
  const zoom = Math.exp(Math.log(cover) * smooth(0.16, 0.97, p));
  return {
    x: lerp(start.x + start.width / 2, width / 2, centre),
    y: lerp(start.y + start.height / 2, height / 2, centre),
    scale: base * zoom,
    portal: p,
    cityOpacity: smooth(0, 0.06, p),
    heroOpacity: 1 - smooth(0.12, 0.43, p),
    secondaryOpacity: 1 - smooth(0.06, 0.3, p),
    edgeOpacity: smooth(0, 0.04, p) * (1 - smooth(0.88, 0.99, p)),
    materialOpacity: 1 - smooth(0.08, 0.66, p),
    portraitOpacity: 1 - smooth(0.3, 0.57, p),
    descent: smooth(PORTAL_END, 1, progress),
  };
}

export function cityCamera(t: number) {
  return {
    x: 12 + Math.sin(t * Math.PI * 1.3) * 32 - t * 35,
    y: lerp(2450, 65, t),
    z: lerp(160, -80, t),
    targetY: lerp(2260, 50, t),
    targetZ: -1600,
    roll: Math.sin(t * Math.PI * 2) * 0.005,
  };
}
