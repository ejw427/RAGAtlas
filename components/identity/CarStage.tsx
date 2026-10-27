"use client";

import type { ReactNode } from "react";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";
import { cn } from "@/lib/utils";

/** Quiet venue pad behind the car — one landmark, one chip, no clutter. */
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
        background: `linear-gradient(165deg, ${atmo.skyTop} 0%, ${atmo.skyBot} 42%, ${atmo.ground} 100%)`,
      }}
    >
      {/* Soft horizon wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            atmo.landmark === "tower"
              ? "radial-gradient(ellipse 55% 40% at 78% 18%, rgba(255,77,94,0.14), transparent 60%), radial-gradient(ellipse 70% 50% at 20% 80%, rgba(58,215,255,0.07), transparent 55%)"
              : atmo.landmark === "desert"
                ? "radial-gradient(ellipse 60% 45% at 70% 0%, rgba(255,160,80,0.22), transparent 55%)"
                : "radial-gradient(ellipse 50% 40% at 50% 70%, rgba(58,215,255,0.05), transparent 60%)",
        }}
        aria-hidden
      />

      {atmo.landmark === "tower" && (
        <svg
          className="pointer-events-none absolute -right-1 top-1 h-[70%] w-12 opacity-35 sm:w-14"
          viewBox="0 0 48 100"
          aria-hidden
        >
          <path
            d="M22 96 L24 8 L26 96 Z"
            fill="rgba(255,90,100,0.7)"
            stroke="rgba(232,238,245,0.35)"
            strokeWidth="0.8"
          />
          <path
            d="M24 40 Q38 52 44 78"
            fill="none"
            stroke="rgba(255,77,94,0.55)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="24" cy="10" r="2.2" fill="rgba(198,255,74,0.75)" />
        </svg>
      )}

      {/* Asphalt ellipse under the car */}
      {atmo.asphalt && (
        <div
          className="pointer-events-none absolute inset-x-[8%] bottom-[12%] h-[22%] rounded-[100%] opacity-70"
          style={{
            background: `radial-gradient(ellipse at center, ${atmo.asphalt} 0%, transparent 70%)`,
          }}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "relative z-[1] flex flex-col items-center",
          compact ? "px-2 py-2" : "px-3 pb-2.5 pt-2.5",
        )}
      >
        {!compact && (
          <p className="mb-1 self-start font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[var(--signal)]">
            {pkg.chip}
            <span className="ml-2 text-[var(--mute)]">
              {pkg.id === "cota"
                ? "T1 · stadium"
                : pkg.id === "bahrain"
                  ? "heat package"
                  : "baseline"}
            </span>
          </p>
        )}
        {children}
        {showNote && !compact && (
          <p
            className="mt-1 max-w-[18rem] text-center font-mono text-[0.48rem] uppercase tracking-[0.1em] text-[var(--mute)]"
            suppressHydrationWarning
          >
            {pkg.note} · editorial 2026 livery
          </p>
        )}
      </div>

      {atmo.kerb && (
        <div className="cota-kerb absolute inset-x-0 bottom-0 h-1" aria-hidden />
      )}
    </div>
  );
}
