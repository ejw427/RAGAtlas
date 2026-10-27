"use client";

import { useState } from "react";
import { helmetPickFor } from "@/lib/team-media";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";
import type { Driver } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Real helmet art — Austin special on COTA when published, else season kit.
 * Badge says which shell you're looking at.
 */
export function HelmetMark({
  driver,
  code,
  number,
  accent,
  second,
  size = 72,
  track,
  className,
}: {
  driver?: Driver;
  code?: string;
  number?: number;
  accent: string;
  second: string;
  size?: number;
  track?: TrackPackageId | TrackPackage;
  className?: string;
}) {
  const resolvedCode = driver?.code ?? code;
  const pick = helmetPickFor(resolvedCode, track);
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(pick?.src) && !failed;
  const pkg =
    track == null
      ? null
      : typeof track === "string"
        ? TRACK_PACKAGES[track]
        : track;
  const isCota = pkg?.id === "cota";
  const isDesert = pkg?.id === "bahrain";
  const isAustinSpecial = pick?.kind === "austin";

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-md", className)}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1px ${accent}55, 0 8px 20px rgba(0,0,0,0.45)`,
        background: isDesert
          ? `radial-gradient(circle at 70% 0%, rgba(255,160,80,0.35), ${second}22 55%, #0b0f14)`
          : `radial-gradient(circle at 40% 20%, ${accent}44, #0b0f14 70%)`,
      }}
      role="img"
      aria-label={
        number != null
          ? `Helmet #${number}${pick ? ` · ${pick.label}` : ""}`
          : pick?.label ?? "Driver helmet"
      }
      title={pick?.label}
    >
      {isCota && (
        <div
          className="cota-kerb pointer-events-none absolute inset-x-0 top-0 z-[2] h-1 opacity-90"
          aria-hidden
        />
      )}
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pick!.src}
          alt=""
          width={size}
          height={size}
          className={cn(
            "h-full w-full",
            isAustinSpecial
              ? "object-contain object-center bg-[rgba(5,7,10,0.55)] p-0.5"
              : "object-cover object-[center_12%]",
          )}
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-mono text-[0.7rem] font-bold"
          style={{ color: accent }}
        >
          {number ?? "H"}
        </div>
      )}
      <span
        className={cn(
          "absolute bottom-0.5 left-0.5 z-[2] max-w-[72%] truncate rounded-sm px-1 py-px font-mono text-[0.38rem] uppercase tracking-[0.1em]",
          isAustinSpecial
            ? "bg-[var(--signal)] text-[var(--void)]"
            : "bg-[rgba(5,7,10,0.82)] text-[var(--mist)]",
        )}
      >
        {isAustinSpecial ? "Austin" : isCota ? "Season" : pick?.kind === "season" ? "Kit" : "—"}
      </span>
      {number != null && (
        <span
          className="absolute bottom-0.5 right-0.5 z-[2] rounded-sm px-1 py-px font-mono text-[0.45rem] font-bold text-[var(--void)]"
          style={{ background: accent }}
        >
          {number}
        </span>
      )}
    </div>
  );
}
