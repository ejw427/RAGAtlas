"use client";

import { useId, useMemo } from "react";
import {
  COTA_CLIMB_M,
  COTA_ELEVATION_DISCLAIMER,
  COTA_LENGTH_M,
  elevationSeries,
  gradePctAt,
} from "@/lib/cota-elevation";
import { cn } from "@/lib/utils";

export function ElevationStrip({
  playheadM,
  lengthM = COTA_LENGTH_M,
  className,
}: {
  playheadM: number;
  lengthM?: number;
  className?: string;
}) {
  const uid = useId();
  const series = useMemo(() => elevationSeries(160), []);
  const grade = gradePctAt(playheadM);
  const zNow =
    series.z[
      Math.min(
        series.z.length - 1,
        Math.round((playheadM / lengthM) * (series.z.length - 1)),
      )
    ] ?? 0;

  const W = 640;
  const H = 56;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 14;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const zMax = Math.max(...series.z, 1);

  const area = useMemo(() => {
    const pts = series.d.map((d, i) => {
      const x = padL + (d / lengthM) * plotW;
      const y = padT + plotH - (series.z[i] / zMax) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const lastX = padL + plotW;
    const base = padT + plotH;
    return `M${padL},${base} L${pts.join(" L")} L${lastX},${base} Z`;
  }, [series, lengthM, plotW, plotH, zMax]);

  const line = useMemo(() => {
    return series.d
      .map((d, i) => {
        const x = padL + (d / lengthM) * plotW;
        const y = padT + plotH - (series.z[i] / zMax) * plotH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [series, lengthM, plotW, plotH, zMax]);

  const px = padL + (playheadM / lengthM) * plotW;

  return (
    <div
      className={cn(
        "border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.55)] px-2.5 py-1.5",
        className,
      )}
    >
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Elevation · T1 climb +{COTA_CLIMB_M} m
        </p>
        <p className="font-mono text-[0.55rem] tabular-nums text-[var(--mist)]">
          {zNow.toFixed(0)} m · {grade >= 0 ? "+" : ""}
          {grade.toFixed(1)}%
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
        {/* T1 crest marker */}
        <line
          x1={padL + (420 / lengthM) * plotW}
          x2={padL + (420 / lengthM) * plotW}
          y1={padT}
          y2={padT + plotH}
          stroke="rgba(198,255,74,0.35)"
          strokeDasharray="2 3"
        />
        <text
          x={padL + (420 / lengthM) * plotW + 3}
          y={padT + 8}
          fill="var(--signal)"
          fontSize="8"
          fontFamily="var(--font-mono)"
        >
          T1
        </text>
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
          cy={padT + plotH - (zNow / zMax) * plotH}
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
