"use client";

import { useMemo } from "react";
import { getSessionPack } from "@/lib/session";
import { cn } from "@/lib/utils";

export function TrackSchematic({
  activeSector,
  playheadM,
  evidence,
}: {
  activeSector: string | null;
  playheadM: number;
  evidence?: { startM: number; endM: number } | null;
}) {
  const pack = getSessionPack();
  const { x, y, d } = pack.trackXY.series;

  const pathD = useMemo(() => {
    if (!x.length) return "";
    let s = `M ${x[0]} ${y[0]}`;
    for (let i = 1; i < x.length; i++) s += ` L ${x[i]} ${y[i]}`;
    return s + " Z";
  }, [x, y]);

  const sectorPaths = useMemo(() => {
    return pack.sectors.map((sec) => {
      const pts: string[] = [];
      for (let i = 0; i < d.length; i++) {
        if (d[i] >= sec.startM && d[i] <= sec.endM) {
          pts.push(`${i === 0 || d[i - 1] < sec.startM ? "M" : "L"} ${x[i]} ${y[i]}`);
        }
      }
      return { ...sec, path: pts.join(" ") };
    });
  }, [pack.sectors, d, x, y]);

  const car = useMemo(() => {
    if (!d.length) return { cx: x[0], cy: y[0] };
    let lo = 0;
    for (let i = 0; i < d.length; i++) {
      if (d[i] <= playheadM) lo = i;
    }
    const hi = Math.min(lo + 1, d.length - 1);
    const t =
      d[hi] === d[lo] ? 0 : (playheadM - d[lo]) / (d[hi] - d[lo] || 1);
    return {
      cx: x[lo] + (x[hi] - x[lo]) * t,
      cy: y[lo] + (y[hi] - y[lo]) * t,
    };
  }, [d, x, y, playheadM]);

  const evidenceArc = useMemo(() => {
    if (!evidence) return "";
    const pts: string[] = [];
    for (let i = 0; i < d.length; i++) {
      if (d[i] >= evidence.startM && d[i] <= evidence.endM) {
        pts.push(
          `${pts.length === 0 ? "M" : "L"} ${x[i]} ${y[i]}`,
        );
      }
    }
    return pts.join(" ");
  }, [evidence, d, x, y]);

  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const pad = 40;

  return (
    <div className="rounded-sm border border-[var(--hairline)] bg-[var(--asphalt)] p-2">
      <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        Circuit
      </p>
      <svg
        viewBox={`${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`}
        className="h-36 w-full"
        role="img"
        aria-label={`Track schematic, active sector ${activeSector ?? "none"}, distance ${Math.round(playheadM)} meters`}
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(232,238,245,0.12)"
          strokeWidth="18"
          strokeLinejoin="round"
        />
        {sectorPaths.map((sec) => (
          <path
            key={sec.id}
            d={sec.path}
            fill="none"
            strokeWidth={activeSector === sec.label ? 14 : 8}
            strokeLinejoin="round"
            className={cn(
              activeSector === sec.label
                ? "stroke-[var(--signal)] opacity-80"
                : "stroke-[var(--hairline-strong)]",
            )}
            style={
              activeSector === sec.label
                ? { filter: "drop-shadow(0 0 6px rgba(198,255,74,0.35))" }
                : undefined
            }
          />
        ))}
        {evidenceArc && (
          <path
            d={evidenceArc}
            fill="none"
            stroke="var(--trace-cyan)"
            strokeWidth="6"
            strokeOpacity="0.85"
          />
        )}
        <circle
          cx={car.cx}
          cy={car.cy}
          r="10"
          fill="var(--signal)"
          stroke="var(--asphalt)"
          strokeWidth="2"
        />
      </svg>
      <div className="mt-1 flex gap-2 font-mono text-[0.6rem] text-[var(--mute)]">
        {pack.sectors.map((s) => (
          <span
            key={s.id}
            className={cn(
              activeSector === s.label && "text-[var(--signal)]",
            )}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
