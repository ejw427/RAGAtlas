"use client";

import { useMemo } from "react";
import { RacerDossier } from "@/components/identity/RacerDossier";
import { RacerHero } from "@/components/identity/RacerHero";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { compoundOf, formatDeltaSec } from "@/lib/identity";
import {
  formatChannelValue,
  getChannel,
  getLapsForDriver,
  getSample,
  getSessionPack,
  getTrackPackage,
} from "@/lib/session";
import type { Driver, Lap } from "@/lib/types";
import { formatLapTime, formatSector, interpolateAt, cn } from "@/lib/utils";

const LIVE_CHANNELS = [
  "speed",
  "throttle",
  "brake",
  "brake_pressure",
  "n_gear",
  "steering",
  "rpm",
  "drs",
  "brake_temp",
  "tyre_surf_fl",
] as const;

export function RacerDetailSheet({
  open,
  onOpenChange,
  driver,
  lap,
  playheadM,
  role,
  compareLap,
  onMakeFocus,
  onMakeReference,
  onSelectLap,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver;
  lap: Lap;
  playheadM: number;
  role: "Focus" | "Reference" | "Plate";
  compareLap?: Lap | null;
  onMakeFocus?: () => void;
  onMakeReference?: () => void;
  onSelectLap?: (n: number) => void;
}) {
  const pack = getSessionPack();
  const trackPkg = getTrackPackage();
  const compound = compoundOf(lap);
  const laps = getLapsForDriver(driver.id);
  const stints =
    pack.stints?.filter(
      (s) =>
        s.driverNumber == null ||
        s.driverNumber === driver.number ||
        true,
    ) ?? [];
  const driverStints = stints.filter(
    (s) => s.driverNumber == null || s.driverNumber === driver.number,
  );

  const live = useMemo(() => {
    return LIVE_CHANNELS.map((id) => {
      const ch = getChannel(id);
      const sample = getSample(id, lap.id);
      const v = sample ? interpolateAt(sample.series, playheadM) : null;
      return { id, ch, v };
    }).filter((row) => row.ch && row.v != null);
  }, [lap.id, playheadM]);

  const sectorDelta = useMemo(() => {
    if (!compareLap) return null;
    return lap.sectorsMs.map((ms, i) => ms - compareLap.sectorsMs[i]) as [
      number,
      number,
      number,
    ];
  }, [lap, compareLap]);

  const lapDelta =
    compareLap != null ? lap.timeMs - compareLap.timeMs : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent variant="popup" className="w-[min(100vw-1.25rem,640px)]">
        <div className="flex items-start justify-between gap-3">
          <SheetTitle>
            Racer card · {role}
          </SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-sm border border-[var(--hairline-strong)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--mist)] hover:border-[var(--signal)]/50 hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <RacerHero
            driver={driver}
            lap={lap}
            role={`Racer card · ${role}`}
            carWidth={440}
            portraitSize={104}
          />
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            {trackPkg.note}
          </p>

          <RacerDossier driver={driver} />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Lap time
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-[var(--chalk)]">
                {formatLapTime(lap.timeMs)}
              </p>
              <p className="font-mono text-[0.58rem] text-[var(--mist)]">
                L{lap.number} · {compound}
              </p>
            </div>
            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                vs other racer
              </p>
              {lapDelta != null ? (
                <>
                  <p
                    className={cn(
                      "font-display text-2xl font-bold tabular-nums",
                      lapDelta <= 0
                        ? "text-[var(--signal)]"
                        : "text-[var(--fault)]",
                    )}
                  >
                    {formatDeltaSec(lapDelta)}
                  </p>
                  <p className="font-mono text-[0.58rem] text-[var(--mist)]">
                    Focus minus Reference
                  </p>
                </>
              ) : (
                <p className="mt-2 font-mono text-[0.7rem] text-[var(--mute)]">
                  Solo - pick a Reference to unlock delta
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
              Sector times
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["S1", "S2", "S3"] as const).map((label, i) => {
                const dlt = sectorDelta?.[i];
                return (
                  <div
                    key={label}
                    className={cn(
                      "rounded-md border px-2 py-2",
                      dlt != null && dlt <= 0
                        ? "border-[var(--signal)]/40 bg-[var(--signal-dim)]/40"
                        : dlt != null && dlt > 0
                          ? "border-[var(--fault)]/40 bg-[rgba(255,77,94,0.12)]"
                          : "border-[var(--hairline)] bg-[var(--panel)]",
                    )}
                  >
                    <p className="font-mono text-[0.5rem] uppercase text-[var(--mute)]">
                      {label}
                    </p>
                    <p className="font-mono text-[0.85rem] font-semibold tabular-nums text-[var(--chalk)]">
                      {formatSector(lap.sectorsMs[i])}
                    </p>
                    {dlt != null && (
                      <p
                        className={cn(
                          "font-mono text-[0.65rem] font-bold tabular-nums",
                          dlt <= 0
                            ? "text-[var(--signal)]"
                            : "text-[var(--fault)]",
                        )}
                      >
                        {formatDeltaSec(dlt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {lap.openf1 && (
            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2">
              <p className="mb-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Speed traps · OpenF1
              </p>
              <div className="flex flex-wrap gap-3 font-mono text-[0.72rem] text-[var(--chalk)]">
                {lap.openf1.i1_speed != null && (
                  <span>I1 {lap.openf1.i1_speed} km/h</span>
                )}
                {lap.openf1.i2_speed != null && (
                  <span>I2 {lap.openf1.i2_speed} km/h</span>
                )}
                {lap.openf1.st_speed != null && (
                  <span>ST {lap.openf1.st_speed} km/h</span>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
              Live at {Math.round(playheadM)} m
            </p>
            <div className="grid grid-cols-2 gap-1">
              {live.map(({ id, ch, v }) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1.5"
                >
                  <span className="truncate font-mono text-[0.62rem] text-[var(--mist)]">
                    {ch!.displayName ?? ch!.name}
                  </span>
                  <span className="shrink-0 font-mono text-[0.72rem] font-semibold tabular-nums text-[var(--chalk)]">
                    {formatChannelValue(ch!, v!)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {lap.tags && lap.tags.length > 0 && (
            <p className="font-mono text-[0.62rem] text-[var(--mute)]">
              Tags: {lap.tags.join(" · ")}
            </p>
          )}

          {driverStints.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Stints
              </p>
              <ul className="space-y-1">
                {driverStints.slice(0, 4).map((s, i) => (
                  <li
                    key={`${s.stintNumber}-${i}`}
                    className="font-mono text-[0.65rem] text-[var(--mist)]"
                  >
                    Stint {s.stintNumber}: L{s.lapStart}-L{s.lapEnd} ·{" "}
                    {s.compound}
                    {s.tyreAgeAtStart != null
                      ? ` · age ${s.tyreAgeAtStart}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
              Flyer bank · this racer
            </p>
            <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">
              {laps.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectLap?.(l.number)}
                  className={cn(
                    "flex items-center justify-between rounded-sm border px-2 py-1.5 text-left font-mono text-[0.65rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                    l.id === lap.id
                      ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                      : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40",
                  )}
                >
                  <span>
                    L{l.number}{" "}
                    <span className="uppercase text-[var(--mute)]">
                      {compoundOf(l)}
                    </span>
                  </span>
                  <span className="tabular-nums text-[var(--chalk)]">
                    {formatLapTime(l.timeMs)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-3">
            {onMakeFocus && role !== "Focus" && (
              <Button size="sm" onClick={onMakeFocus}>
                Set as Focus
              </Button>
            )}
            {onMakeReference && role !== "Reference" && (
              <Button size="sm" variant="rail" onClick={onMakeReference}>
                Set as Reference
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
