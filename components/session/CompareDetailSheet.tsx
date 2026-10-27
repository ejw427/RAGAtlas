"use client";

import { useMemo } from "react";
import { DriverPortrait } from "@/components/identity/DriverPortrait";
import { ElevationStrip } from "@/components/session/ElevationStrip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  accentFor,
  compoundOf,
  formatDeltaSec,
} from "@/lib/identity";
import { speedDeltaSeries } from "@/lib/compare-series";
import { lapDistanceM } from "@/lib/session";
import type { Driver, Lap } from "@/lib/types";
import { formatLapTime, interpolateAt, cn } from "@/lib/utils";

export function CompareDetailSheet({
  open,
  onOpenChange,
  focusDriver,
  focusLap,
  referenceDriver,
  referenceLap,
  deltas,
  gainLabel,
  lossLabel,
  playheadM,
  onJumpSector,
  onPlayhead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusDriver: Driver;
  focusLap: Lap;
  referenceDriver: Driver;
  referenceLap: Lap;
  deltas: { lapMs: number; sectorsMs: [number, number, number] };
  gainLabel: string | null;
  lossLabel: string | null;
  playheadM: number;
  onJumpSector: (sector: string) => void;
  onPlayhead: (m: number) => void;
}) {
  const focusAccent = accentFor(focusDriver);
  const refAccent = accentFor(referenceDriver);
  const lengthM = lapDistanceM();
  const compoundsDiffer =
    compoundOf(focusLap) !== compoundOf(referenceLap);

  const delta = useMemo(
    () => speedDeltaSeries(focusLap.id, referenceLap.id, lengthM, 200),
    [focusLap.id, referenceLap.id, lengthM],
  );

  const live = delta ? interpolateAt(delta, playheadM) : null;

  const spark = useMemo(() => {
    if (!delta) return null;
    const W = 560;
    const H = 96;
    const pad = 8;
    const vmin = Math.min(...delta.v);
    const vmax = Math.max(...delta.v);
    const span = vmax - vmin || 1;
    const yAt = (v: number) =>
      H - pad - ((v - vmin) / span) * (H - pad * 2);
    const xAt = (m: number) => pad + (m / lengthM) * (W - pad * 2);
    const line = delta.d
      .map(
        (d, i) =>
          `${i === 0 ? "M" : "L"}${xAt(d).toFixed(1)},${yAt(delta.v[i]).toFixed(1)}`,
      )
      .join(" ");
    const zeroY = yAt(0);
    return { W, H, line, zeroY, xAt, pad };
  }, [delta, lengthM]);

  const peakLossM = useMemo(() => {
    if (!delta) return null;
    let worst = 0;
    for (let i = 1; i < delta.v.length; i++) {
      if (delta.v[i] < delta.v[worst]) worst = i;
    }
    return delta.d[worst];
  }, [delta]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:max-h-none md:w-[min(100vw,440px)] md:rounded-none md:border-l">
        <SheetTitle>Compare detail · Focus - Reference</SheetTitle>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div
              className="rounded-md border px-2.5 py-2"
              style={{ borderColor: `${focusAccent.accent}66` }}
            >
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Focus
              </p>
              <div className="mt-1 flex items-center gap-2">
                <DriverPortrait driver={focusDriver} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-[var(--chalk)]">
                    {focusDriver.code}
                  </p>
                  <p className="font-mono text-[0.58rem] text-[var(--mist)]">
                    {compoundOf(focusLap)} · L{focusLap.number}
                  </p>
                  <p className="font-display text-lg font-bold tabular-nums">
                    {formatLapTime(focusLap.timeMs)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "font-display text-xl font-black tabular-nums",
                  deltas.lapMs <= 0
                    ? "text-[var(--signal)]"
                    : "text-[var(--trace-amber)]",
                )}
              >
                {formatDeltaSec(deltas.lapMs)}
              </p>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]">
                lap Delta
              </p>
            </div>
            <div
              className="rounded-md border px-2.5 py-2"
              style={{ borderColor: `${refAccent.accent}66` }}
            >
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Reference
              </p>
              <div className="mt-1 flex items-center gap-2">
                <DriverPortrait driver={referenceDriver} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-[var(--chalk)]">
                    {referenceDriver.code}
                  </p>
                  <p className="font-mono text-[0.58rem] text-[var(--mist)]">
                    {compoundOf(referenceLap)} · L{referenceLap.number}
                  </p>
                  <p className="font-display text-lg font-bold tabular-nums">
                    {formatLapTime(referenceLap.timeMs)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {compoundsDiffer && (
            <p className="rounded-sm border border-[var(--trace-amber)]/40 bg-[var(--trace-amber)]/10 px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--trace-amber)]">
              Compounds differ - read the delta with the Soft vs Hard story in
              mind.
            </p>
          )}

          <div>
            <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
              Sector gaps · click to lock map + traces
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["S1", "S2", "S3"] as const).map((label, i) => {
                const ms = deltas.sectorsMs[i];
                const ahead = ms <= 0;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onJumpSector(label);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "rounded-md border px-2 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                      ahead
                        ? "border-[var(--signal)]/40 bg-[var(--signal-dim)]/50"
                        : "border-[var(--trace-amber)]/40 bg-[var(--trace-amber)]/10",
                    )}
                  >
                    <span className="block font-mono text-[0.5rem] uppercase text-[var(--mute)]">
                      {label}
                      {gainLabel === label
                        ? " · gain"
                        : lossLabel === label
                          ? " · loss"
                          : ""}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block font-display text-lg font-bold tabular-nums",
                        ahead
                          ? "text-[var(--signal)]"
                          : "text-[var(--trace-amber)]",
                      )}
                    >
                      {formatDeltaSec(ms)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] p-2.5">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Delta speed · distance domain
              </p>
              <p
                className={cn(
                  "font-mono text-[0.7rem] font-semibold tabular-nums",
                  live != null && live < 0
                    ? "text-[var(--trace-amber)]"
                    : "text-[var(--signal)]",
                )}
              >
                {live != null
                  ? `${live >= 0 ? "+" : ""}${live.toFixed(1)} km/h @ ${Math.round(playheadM)} m`
                  : "-"}
              </p>
            </div>
            {spark && delta && (
              <svg
                viewBox={`0 0 ${spark.W} ${spark.H}`}
                className="h-24 w-full cursor-crosshair"
                role="img"
                aria-label="Speed delta sparkline Focus minus Reference"
                onPointerDown={(e) => {
                  const rect = (
                    e.currentTarget as SVGSVGElement
                  ).getBoundingClientRect();
                  const t = (e.clientX - rect.left) / rect.width;
                  onPlayhead(Math.max(0, Math.min(lengthM, t * lengthM)));
                }}
              >
                <line
                  x1={spark.pad}
                  x2={spark.W - spark.pad}
                  y1={spark.zeroY}
                  y2={spark.zeroY}
                  stroke="rgba(232,238,245,0.2)"
                  strokeDasharray="3 3"
                />
                <path
                  d={spark.line}
                  fill="none"
                  stroke="var(--signal)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line
                  x1={spark.xAt(playheadM)}
                  x2={spark.xAt(playheadM)}
                  y1={8}
                  y2={spark.H - 8}
                  stroke="var(--signal)"
                  strokeWidth="1.25"
                />
              </svg>
            )}
          </div>

          <ElevationStrip playheadM={playheadM} lengthM={lengthM} />

          <div className="flex flex-wrap gap-2">
            {lossLabel && (
              <Button
                size="sm"
                onClick={() => {
                  onJumpSector(lossLabel);
                  onOpenChange(false);
                }}
              >
                Jump to biggest loss · {lossLabel}
              </Button>
            )}
            {peakLossM != null && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPlayhead(peakLossM)}
              >
                Scrub worst DeltaSpd · {Math.round(peakLossM)} m
              </Button>
            )}
            {gainLabel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onJumpSector(gainLabel);
                  onOpenChange(false);
                }}
              >
                Biggest gain · {gainLabel}
              </Button>
            )}
          </div>

          <p className="font-mono text-[0.55rem] leading-relaxed text-[var(--mute)]">
            Same metre for both cars. Green = Focus faster / higher speed. Amber
            = Reference ahead. Map ribbon and traces share this playhead.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
