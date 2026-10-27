"use client";

import { useState } from "react";
import { HelmetMark } from "@/components/identity/HelmetMark";
import { headshotFor } from "@/lib/driver-media";
import { accentFor } from "@/lib/identity";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";
import type { Driver } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DriverPortrait({
  driver,
  size = 88,
  className,
  track,
  showCode = false,
}: {
  driver: Driver;
  size?: number;
  className?: string;
  /** Venue ring treatment — COTA kerb ticks, Bahrain heat wash, etc. */
  track?: TrackPackageId | TrackPackage;
  showCode?: boolean;
}) {
  const accent = accentFor(driver);
  const src = headshotFor(driver);
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  const pkg =
    track == null
      ? null
      : typeof track === "string"
        ? TRACK_PACKAGES[track]
        : track;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute -inset-[2px] rounded-full opacity-95"
        style={{
          background: pkg
            ? `conic-gradient(from 200deg, ${accent.accent}, ${pkg.id === "cota" ? "#C6FF4A" : accent.second}, ${accent.accent}, ${accent.second}, ${accent.accent})`
            : `conic-gradient(from 210deg, ${accent.accent}, ${accent.second}, ${accent.accent})`,
          boxShadow: `0 0 22px ${accent.accent}55`,
        }}
        aria-hidden
      />
      {pkg?.atmosphere.kerb && (
        <div
          className="cota-kerb pointer-events-none absolute -inset-[5px] rounded-full opacity-80"
          style={{
            maskImage:
              "radial-gradient(circle, transparent 62%, #000 63%, #000 78%, transparent 79%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 62%, #000 63%, #000 78%, transparent 79%)",
          }}
          aria-hidden
        />
      )}
      <div className="absolute inset-[3px] overflow-hidden rounded-full bg-[var(--asphalt)] shadow-[inset_0_0_12px_rgba(0,0,0,0.55)]">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `radial-gradient(circle at 40% 30%, ${accent.accent}33, var(--panel) 70%)`,
            }}
          >
            <HelmetMark
              number={driver.number}
              accent={accent.accent}
              second={accent.second}
              size={Math.round(size * 0.78)}
            />
          </div>
        )}
      </div>
      {driver.number != null && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-mono text-[0.65rem] font-bold text-[var(--void)] shadow-[0_0_0_2px_var(--asphalt)]"
          style={{ background: accent.accent }}
        >
          {driver.number}
        </span>
      )}
      {showCode && driver.code && (
        <span className="absolute -left-0.5 -top-0.5 rounded-sm bg-[var(--void)] px-1 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-wide text-[var(--chalk)] shadow-[0_0_0_1px_var(--hairline)]">
          {driver.code}
        </span>
      )}
    </div>
  );
}
