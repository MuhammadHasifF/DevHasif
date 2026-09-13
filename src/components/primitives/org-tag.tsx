"use client";

import { useState } from "react";
import { getOrg, hueFromString, monogramFor } from "@/lib/logos";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; text: string; gap: string }> = {
  sm: { box: "h-5 w-5", text: "text-[10px]", gap: "gap-1.5" },
  md: { box: "h-6 w-6", text: "text-xs", gap: "gap-2" },
  lg: { box: "h-9 w-9", text: "text-sm", gap: "gap-3" },
  xl: { box: "h-11 w-11", text: "text-base", gap: "gap-3.5" },
};

export function OrgLogo({
  orgKey,
  size = "md",
  className,
}: {
  orgKey: string;
  size?: Size;
  className?: string;
}) {
  const org = getOrg(orgKey);
  const [failed, setFailed] = useState(false);
  const sz = sizeMap[size].box;

  const label = org?.short ?? org?.name ?? orgKey;
  const hue = hueFromString(orgKey);
  const monogram = org ? monogramFor(org) : orgKey.slice(0, 2).toUpperCase();
  const localLogo = org?.localLogo ?? null;
  const src = localLogo;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ring-1 ring-[var(--color-border)]",
        sz,
        className,
      )}
      role="img"
      aria-label={`${label} logo`}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          className="h-full w-full object-contain bg-white p-0.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center font-mono text-[10px] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 35%))`,
          }}
        >
          {monogram}
        </span>
      )}
    </span>
  );
}

export function OrgTag({
  orgKey,
  size = "md",
  className,
  withName = true,
}: {
  orgKey: string;
  size?: Size;
  className?: string;
  withName?: boolean;
}) {
  const org = getOrg(orgKey);
  const label = org?.name ?? orgKey;
  const sz = sizeMap[size];
  return (
    <span className={cn("inline-flex items-center", sz.gap, className)}>
      <OrgLogo orgKey={orgKey} size={size} />
      {withName && (
        <span className={cn("text-[var(--color-text-1)]", sz.text)}>
          {label}
        </span>
      )}
    </span>
  );
}
