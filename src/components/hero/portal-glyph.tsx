import { forwardRef, useId, type RefObject } from "react";
import { GLYPH_PATHS } from "./opening-math";

export const PortalAnchor = forwardRef<HTMLSpanElement>(
  function PortalAnchor(_, ref) {
    return (
      <span ref={ref} className="opening-portal-anchor" aria-hidden="true">
        <svg viewBox="0 0 180 100" className="opening-portal-rest">
          <g fill="currentColor">
            {GLYPH_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
      </span>
    );
  },
);

export function PortalAperture({
  maskRef,
  edgeRef,
}: {
  maskRef: RefObject<SVGGElement | null>;
  edgeRef: RefObject<SVGGElement | null>;
}) {
  const id = "portal-" + useId().replace(/:/g, "");
  return (
    <svg
      className="opening-aperture"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <defs>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
          style={{ maskType: "luminance" }}
        >
          <rect width="100%" height="100%" fill="white" />
          <g ref={maskRef} fill="black">
            {GLYPH_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="#070709" mask={`url(#${id})`} />
      <g
        ref={edgeRef}
        fill="#7f1528"
        fillOpacity=".28"
        stroke="#ff304a"
        strokeWidth="1.2"
      >
        {GLYPH_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
