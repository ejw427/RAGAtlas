"use client";

import { DriverPortrait } from "@/components/identity/DriverPortrait";
import { CarSilhouette } from "@/components/identity/CarSilhouette";
import {
  accentFor,
  compoundLetter,
  compoundOf,
  formatDeltaSec,
} from "@/lib/identity";
import type { Driver, Lap } from "@/lib/types";
import { formatLapTime, formatSector, cn } from "@/lib/utils";
import { getSessionPack } from "@/lib/session";

export function Plate({
  driver,
  lap,
  activeSector,
  sectorDeltasMs,
  onSelectSector,
  compact = false,
}: {
  driver: Driver;
  lap: Lap;
  activeSector: string | null;
  sectorDeltasMs?: [number, number, number] | null;
  onSelectSector: (sector: string) => void;
  compact?: boolean;
}) {
  const accent = accentFor(driver);
  const compound = compoundOf(lap);
  const pack = getSessionPack();
  const stints = (pack.stints ?? []).filter(
    (s) => driver.number == null || s.driverNumber === driver.number,
  );
  const pits = (pack.pits ?? []).filter(
    (p) => driver.number == null || p.driverNumber === driver.number,
  );
  const radio = (pack.teamRadio ?? []).filter(
    (r) => driver.number == null || r.driverNumber === driver.number,
  );

  if (compact) {
    return (
      <div
        className="flex shrink-0 items-center gap-3 border-b border-[var(--hairline)] bg-[var(--panel)] px-3 py-2"
        style={{
          borderLeft: `4px solid ${accent.accent}`,
          boxShadow: `inset 0 0 24px ${accent.accent}14`,
        }}
      >
        <DriverPortrait driver={driver} size={52} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
            Focus
          </p>
          <p className="truncate font-display text-sm font-semibold text-[var(--chalk)]">
            {driver.name}
          </p>
          <p className="truncate font-mono text-[0.62rem] text-[var(--mist)]">
            {driver.team} · {compound} · L{lap.number}
          </p>
        </div>
        <CarSilhouette
          accent={accent.accent}
          second={accent.second}
          number={driver.number}
          compoundLetter={compoundLetter(compound)}
          width={168}
        />
      </div>
    );
  }

  return (
    <aside
      className="flex h-full min-h-0 flex-col border-[var(--hairline)] bg-[var(--rail)] md:border-r"
      style={{
        borderLeft: `4px solid ${accent.accent}`,
        boxShadow: `inset 12px 0 40px -24px ${accent.accent}55`,
      }}
      aria-label={`${driver.name}, car ${driver.number ?? "—"}, ${driver.team ?? "team"}, ${compound} tyre, lap ${lap.number}`}
    >
      <div className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain p-3">
        <div className="flex items-start gap-3">
          <DriverPortrait driver={driver} size={92} />
          <div className="min-w-0 flex-1 pt-1">
            <p
              className="font-display text-4xl font-black leading-none tabular-nums"
              style={{
                color: accent.accent,
                textShadow: `0 0 24px ${accent.accent}66`,
              }}
            >
              {driver.number ?? "—"}
            </p>
            <p className="mt-1 font-display text-[1rem] font-semibold leading-tight text-[var(--chalk)]">
              {driver.name}
            </p>
            <p className="font-mono text-[0.72rem] font-semibold" style={{ color: accent.accent }}>
              {driver.code}
            </p>
          </div>
        </div>

        <p
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--mist)]"
          title="Session accent. Not a team asset."
        >
          {driver.team ?? "Independent"}
        </p>

        <div className="rounded-md border border-[var(--hairline)] bg-[rgba(5,7,10,0.45)] px-2 py-3">
          <CarSilhouette
            accent={accent.accent}
            second={accent.second}
            number={driver.number}
            compoundLetter={compoundLetter(compound)}
            width={248}
          />
        </div>

        <div className="space-y-1 font-mono text-[0.62rem] text-[var(--mist)]">
          <p>
            <span className="text-[var(--mute)]">Compound</span>{" "}
            <span className="uppercase text-[var(--chalk)]">{compound}</span>
            {" · "}
            <span className="text-[var(--chalk)]">L{lap.number}</span>
            {" · "}
            <span className="tabular-nums text-[var(--chalk)]">
              {formatLapTime(lap.timeMs)}
            </span>
          </p>
          {stints[0]?.tyreAgeAtStart != null && (
            <p>
              Tyre age at start{" "}
              <span className="text-[var(--chalk)]">
                {stints[0].tyreAgeAtStart}
              </span>
            </p>
          )}
          {pits.length > 0 && (
            <p>
              Pits{" "}
              <span className="text-[var(--chalk)]">
                {pits
                  .map((p) =>
                    p.laneDurationS != null
                      ? `L${p.lapNumber} ${p.laneDurationS}s`
                      : `L${p.lapNumber}`,
                  )
                  .join(" · ")}
              </span>
            </p>
          )}
          <p>
            Radio{" "}
            <span className="text-[var(--chalk)]">{radio.length}</span> clips
          </p>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
            Sectors
          </p>
          <div className="grid grid-cols-2 gap-1">
            <SectorCell
              label="Lap"
              value={formatLapTime(lap.timeMs)}
              active={activeSector === "Lap"}
              onClick={() => onSelectSector("Lap")}
            />
            {(["S1", "S2", "S3"] as const).map((label, i) => (
              <SectorCell
                key={label}
                label={label}
                value={formatSector(lap.sectorsMs[i])}
                delta={
                  sectorDeltasMs
                    ? formatDeltaSec(sectorDeltasMs[i])
                    : undefined
                }
                deltaPositive={
                  sectorDeltasMs ? sectorDeltasMs[i] > 0 : undefined
                }
                active={activeSector === label}
                onClick={() => onSelectSector(label)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectorCell({
  label,
  value,
  delta,
  deltaPositive,
  active,
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
        active &&
          "border-[var(--signal)]/40 bg-[var(--signal-dim)] shadow-[inset_0_-2px_0_var(--signal)]",
      )}
    >
      <span className="block font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        {label}
      </span>
      <span className="block font-mono text-[0.72rem] tabular-nums text-[var(--chalk)]">
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            "block font-mono text-[0.58rem] tabular-nums",
            deltaPositive ? "text-[var(--trace-amber)]" : "text-[var(--signal)]",
          )}
        >
          Δ {delta}
        </span>
      )}
    </button>
  );
}
