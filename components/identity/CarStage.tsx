"use client";

import type { ReactNode } from "react";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";
import { cn } from "@/lib/utils";

/** Venue atmosphere behind a car mark — COTA tower, Bahrain haze, or quiet void. */
export function CarStage({
  track = "cota",
  children,
  className,
  compact = false,
  showNote = true,
}: {
  track?: TrackPackageId | TrackPackage;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  showNote?: boolean;
}) {
  const pkg = typeof track === "string" ? TRACK_PACKAGES[track] : track;
  const atmo = pkg.atmosphere;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-[var(--hairline)]",
        className,
      )}
      style={{
        background: `linear-gradient(180deg, ${atmo.skyTop} 0%, ${atmo.skyBot} 55%, ${atmo.ground} 100%)`,
      }}
    >
      {atmo.landmark === "tower" && (
        <svg
          className="pointer-events-none absolute right-2 top-1 h-[72%] w-16 opacity-40 sm:right-3 sm:w-20"
          viewBox="0 0 80 120"
          aria-hidden
        >
          <path
            d="M36 118 L40 8 L44 118 Z"
            fill="rgba(255,77,94,0.55)"
            stroke="rgba(232,238,245,0.35)"
            strokeWidth="1.2"
          />
          <path
            d="M40 48 Q62 62 72 92"
            fill="none"
            stroke="rgba(255,77,94,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="40" cy="14" r="3" fill="rgba(198,255,74,0.65)" />
        </svg>
      )}
      {atmo.landmark === "desert" && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 70% 0%, rgba(255,160,80,0.28), transparent 60%)",
          }}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "relative z-[1] flex flex-col items-center",
          compact ? "px-2 py-2" : "px-3 py-3",
        )}
      >
        {!compact && (
          <p className="mb-1 self-start font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[var(--signal)]">
            {pkg.chip}
          </p>
        )}
        {children}
        {showNote && !compact && (
          <p
            className="mt-1.5 max-w-[18rem] text-center font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]"
            suppressHydrationWarning
          >
            {`${pkg.note} · original mark · not a team livery`}
          </p>
        )}
      </div>

      {atmo.kerb && (
        <div className="cota-kerb absolute inset-x-0 bottom-0 h-1" aria-hidden />
      )}
    </div>
  );
}
