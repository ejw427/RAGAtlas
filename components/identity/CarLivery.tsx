"use client";

import { useState } from "react";
import {
  carSrcForAccent,
  carSrcForHouse,
  carSrcForTeam,
} from "@/lib/team-media";
import type { TeamAccent } from "@/lib/identity";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";
import { cn } from "@/lib/utils";

/**
 * Editorial 2026 team side render (cached under /cars) for demo recognition.
 * Not a commercial licence — see site disclaimer. Falls back if missing.
 */
export function CarLivery({
  accent,
  team,
  house,
  number,
  compoundLetter,
  width = 280,
  track = "cota",
  className,
}: {
  accent?: TeamAccent;
  team?: string;
  house?: string;
  number?: number;
  compoundLetter?: string;
  width?: number;
  track?: TrackPackageId | TrackPackage;
  className?: string;
}) {
  const pkg = typeof track === "string" ? TRACK_PACKAGES[track] : track;
  const src =
    (accent ? carSrcForAccent(accent) : null) ??
    carSrcForTeam(team) ??
    carSrcForHouse(house) ??
    carSrcForHouse("ferrari");
  const [failed, setFailed] = useState(false);
  const height = Math.round(width * 0.38);

  return (
    <div
      className={cn("relative", className)}
      style={{ width, height }}
      role="img"
      aria-label={
        number != null
          ? `2026 team car number ${number}, ${pkg.chip}`
          : `2026 team car, ${pkg.chip}`
      }
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={width}
          height={height}
          className="h-full w-full object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)]"
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-mono text-[0.65rem] text-[var(--mute)]"
          style={{
            background: `linear-gradient(90deg, ${accent?.accent ?? "#ED1131"}33, transparent)`,
          }}
        >
          Car
        </div>
      )}

      {(number != null || compoundLetter) && (
        <div className="pointer-events-none absolute bottom-1 right-1 flex items-center gap-1">
          {compoundLetter && (
            <span
              className="rounded-sm px-1.5 py-0.5 font-mono text-[0.55rem] font-bold text-[var(--void)]"
              style={{
                background: accent?.accent ?? "var(--signal)",
                boxShadow: "0 0 0 1px rgba(5,7,10,0.45)",
              }}
            >
              {compoundLetter}
            </span>
          )}
          {number != null && (
            <span className="rounded-sm bg-[rgba(5,7,10,0.82)] px-1.5 py-0.5 font-mono text-[0.55rem] font-bold tabular-nums text-[var(--chalk)]">
              #{number}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
