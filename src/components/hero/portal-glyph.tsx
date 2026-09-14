import { forwardRef, type RefObject } from "react";
import { GLYPH_PATHS } from "./opening-math";

export function PortalIcon() {
  return (
    <svg
      viewBox="0 0 180 100"
      className="opening-portal-rest"
      aria-hidden="true"
    >
      {GLYPH_PATHS.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
export const PortalAnchor = forwardRef<HTMLSpanElement>(
  function PortalAnchor(_, ref) {
    return (
      <span ref={ref} className="opening-portal-anchor" aria-hidden="true">
        <PortalIcon />
      </span>
    );
  },
);
export function PortalAperture({
  edgeRef,
}: {
  edgeRef: RefObject<SVGPathElement | null>;
}) {
  return (
    <svg
      className="opening-aperture"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <path
        ref={edgeRef}
        fill="#ed183c"
        fillOpacity="var(--portal-material,1)"
        stroke="#ff4058"
        strokeWidth="1"
      />
    </svg>
  );
}
