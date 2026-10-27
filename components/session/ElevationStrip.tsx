"use client";

import { useId, useMemo } from "react";
import {
  COTA_CLIMB_M,
  COTA_ELEVATION_DISCLAIMER,
  COTA_LENGTH_M,
  elevationAt,
  elevationSeries,
  gradePctAt,
} from "@/lib/cota-elevation";
import { cn } from "@/lib/utils";

export function ElevationStrip({
  playheadM,
  lengthM = COTA_LENGTH_M,
  viewWindow = null,
  className,
}: {
  playheadM: number;
  lengthM?: number;
  /** Stretch profile x-domain to match map zoom. */
  viewWindow?: { startM: number; endM: number } | null;
  className?: string;
}) {
  const uid = useId();
  const domainStart = viewWindow?.startM ?? 0;
  const domainEnd = viewWindow?.endM ?? lengthM;
  const domainSpan = Math.max(domainEnd - domainStart, 1);
  const series = useMemo(() => elevationSeries(160), []);
  const grade = gradePctAt(playheadM);
  const zNow = elevationAt(playheadM);
  const zStart = elevationAt(domainStart);
  const zEnd = elevationAt(domainEnd);
  const zDelta = zEnd - zStart;

  const W = 640;
  const H = 56;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const windowPts = useMemo(() => {
    const pts: { d: number; z: number }[] = [];
    for (let i = 0; i < series.d.length; i++) {
      const d = series.d[i];
      if (d < domainStart - 1 || d > domainEnd + 1) continue;
      pts.push({ d, z: series.z[i] });
    }
    if (pts.length < 2) {
      pts.length = 0;
      pts.push({ d: domainStart, z: zStart }, { d: domainEnd, z: zEnd });
    }
    return pts;
  }, [series, domainStart, domainEnd, zStart, zEnd]);

  const zMax = Math.max(...windowPts.map((p) => p.z), 1);
  const zMin = Math.min(...windowPts.map((p) => p.z), 0);
  const zSpan = Math.max(zMax - zMin, 8);

  const xAt = (d: number) =>
    padL + ((d - domainStart) / domainSpan) * plotW;
  const yAt = (z: number) =>
    padT + plotH - ((z - zMin) / zSpan) * plotH;

  const area = useMemo(() => {
    const pts = windowPts.map((p) => `${xAt(p.d).toFixed(1)},${yAt(p.z).toFixed(1)}`);
    const lastX = padL + plotW;
    const base = padT + plotH;
    return `M${padL},${base} L${pts.join(" L")} L${lastX},${base} Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowPts, domainStart, domainSpan, zMin, zSpan, plotW, plotH]);

  const line = useMemo(() => {
    return windowPts
      .map((p, i) => {
        return `${i === 0 ? "M" : "L"}${xAt(p.d).toFixed(1)},${yAt(p.z).toFixed(1)}`;
      })
      .join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowPts, domainStart, domainSpan, zMin, zSpan]);

  const px = xAt(Math.min(domainEnd, Math.max(domainStart, playheadM)));
  const t1InView = 420 >= domainStart && 420 <= domainEnd;

  return (
    <div
      className={cn(
        "border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.55)] px-2.5 py-1.5",
        className,
      )}
    >
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Elevation
          {viewWindow
            ? ` · ${Math.round(domainStart)}–${Math.round(domainEnd)} m`
            : ` · T1 climb +${COTA_CLIMB_M} m`}
        </p>
        <p className="font-mono text-[0.55rem] tabular-nums text-[var(--mist)]">
          {zNow.toFixed(0)} m · {grade >= 0 ? "+" : ""}
          {grade.toFixed(1)}%
          {viewWindow && (
            <span className="text-[var(--mute)]">
              {" "}
              · Δz {zDelta >= 0 ? "+" : ""}
              {zDelta.toFixed(0)} m
            </span>
          )}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-14 w-full"
        role="img"
        aria-label={`COTA elevation profile. Playhead ${Math.round(playheadM)} metres, ${zNow.toFixed(0)} metres relative.`}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,77,94,0.45)" />
            <stop offset="55%" stopColor="rgba(58,215,255,0.18)" />
            <stop offset="100%" stopColor="rgba(58,215,255,0.02)" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${uid}-fill)`} />
        <path
          d={line}
          fill="none"
          stroke="rgba(232,238,245,0.75)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {t1InView && (
          <>
            <line
              x1={xAt(420)}
              x2={xAt(420)}
              y1={padT}
              y2={padT + plotH}
              stroke="rgba(198,255,74,0.35)"
              strokeDasharray="2 3"
            />
            <text
              x={xAt(420) + 3}
              y={padT + 8}
              fill="var(--signal)"
              fontSize="8"
              fontFamily="var(--font-mono)"
            >
              T1
            </text>
          </>
        )}
        <line
          x1={px}
          x2={px}
          y1={padT}
          y2={padT + plotH}
          stroke="var(--signal)"
          strokeWidth="1.25"
        />
        <circle
          cx={px}
          cy={yAt(zNow)}
          r="3.5"
          fill="var(--signal)"
          stroke="var(--void)"
          strokeWidth="1"
        />
      </svg>
      <p className="font-mono text-[0.48rem] text-[var(--mute)]">
        {COTA_ELEVATION_DISCLAIMER}
      </p>
    </div>
  );
}
