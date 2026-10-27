"use client";

import { CarLivery } from "@/components/identity/CarLivery";
import { CarStage } from "@/components/identity/CarStage";
import { DriverPortrait } from "@/components/identity/DriverPortrait";
import { HelmetMark } from "@/components/identity/HelmetMark";
import { HouseMark } from "@/components/identity/HouseMark";
import {
  accentFor,
  compoundLetter,
  compoundOf,
  teammateId,
} from "@/lib/identity";
import { ageFromBorn, dossierFor } from "@/lib/driver-dossier";
import { getDriver, getTrackPackage } from "@/lib/session";
import type { Driver, Lap } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Shared identity banner for plate + racer detail — portrait, house, track car. */
export function RacerHero({
  driver,
  lap,
  role,
  className,
  carWidth = 320,
  portraitSize = 96,
}: {
  driver: Driver;
  lap: Lap;
  role?: string;
  className?: string;
  carWidth?: number;
  portraitSize?: number;
}) {
  const accent = accentFor(driver);
  const trackPkg = getTrackPackage();
  const compound = compoundOf(lap);
  const mate = teammateId(driver.id);
  const mateDriver = mate ? getDriver(mate) : undefined;
  const dossier = dossierFor(driver);
  const age = ageFromBorn(dossier?.born);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border px-3 py-3",
        className,
      )}
      style={{
        borderColor: `${accent.accent}66`,
        background: `linear-gradient(135deg, ${accent.accent}28 0%, rgba(5,7,10,0.88) 48%, ${accent.second}14 100%), var(--panel)`,
        boxShadow: `inset 0 0 40px ${accent.accent}18`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
        style={{ background: accent.accent }}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <DriverPortrait
          driver={driver}
          size={portraitSize}
          track={trackPkg}
          showCode
          preferHelmet
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              {role && (
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[var(--mute)]">
                  {role}
                </p>
              )}
              <p
                className="font-display text-4xl font-black leading-none tabular-nums"
                style={{
                  color: accent.accent,
                  textShadow: `0 0 28px ${accent.accent}66`,
                }}
              >
                {driver.number ?? "-"}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-[var(--chalk)]">
                {driver.name}
              </p>
              <p className="font-mono text-[0.72rem] text-[var(--mist)]">
                {driver.code} · {driver.team ?? "Independent"}
              </p>
            </div>
            <HouseMark
              house={accent.house}
              accent={accent.accent}
              second={accent.second}
              size={40}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-sm border border-[var(--signal)]/35 bg-[var(--signal-dim)]/40 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--signal)]"
              title={trackPkg.plain}
            >
              {trackPkg.chip}
            </span>
            <span className="rounded-sm border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mist)]">
              {compound} · L{lap.number}
            </span>
            {dossier?.nationality && (
              <span className="rounded-sm border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mist)]">
                {dossier.nationality}
                {age != null ? ` · ${age}` : ""}
              </span>
            )}
            {mateDriver && (
              <span className="rounded-sm border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]">
                Teammate {mateDriver.code}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <HelmetMark
              driver={driver}
              number={driver.number}
              accent={accent.accent}
              second={accent.second}
              size={64}
              track={trackPkg}
            />
            <p className="max-w-[12rem] font-mono text-[0.55rem] uppercase leading-snug tracking-[0.12em] text-[var(--mute)]">
              {trackPkg.id === "cota"
                ? "COTA weekend shell · Austin special when published"
                : `${trackPkg.chip} · season helmet`}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <CarStage track={trackPkg}>
          <CarLivery
            accent={accent}
            number={driver.number}
            compoundLetter={compoundLetter(compound)}
            width={carWidth}
            track={trackPkg}
          />
        </CarStage>
      </div>
    </div>
  );
}
