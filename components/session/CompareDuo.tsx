"use client";

import { DriverPortrait } from "@/components/identity/DriverPortrait";
import {
  accentFor,
  compoundOf,
  formatDeltaSec,
  sectorDeltas,
} from "@/lib/identity";
import type { Driver, Lap } from "@/lib/types";
import { formatLapTime, cn } from "@/lib/utils";
import { getDrivers } from "@/lib/session";

export function CompareDuo({
  focusDriver,
  focusLap,
  focusLaps,
  referenceDriver,
  referenceLap,
  referenceLaps,
  onFocusDriver,
  onFocusLap,
  onReferenceDriver,
  onReferenceLap,
  onSwap,
  onClear,
  onTeammate,
  onFieldBest,
  onOtherCompound,
  canOtherCompound,
  onOpenCompare,
}: {
  focusDriver: Driver;
  focusLap: Lap;
  focusLaps: Lap[];
  referenceDriver: Driver | null;
  referenceLap: Lap | null;
  referenceLaps: Lap[];
  onFocusDriver: (id: string) => void;
  onFocusLap: (n: number) => void;
  onReferenceDriver: (id: string) => void;
  onReferenceLap: (n: number) => void;
  onSwap: () => void;
  onClear: () => void;
  onTeammate: () => void;
  onFieldBest: () => void;
  onOtherCompound: () => void;
  canOtherCompound: boolean;
  onOpenCompare?: () => void;
}) {
  const focusAccent = accentFor(focusDriver);
  const refAccent = accentFor(referenceDriver ?? undefined);
  const deltas = sectorDeltas(focusLap, referenceLap);
  const compoundsDiffer =
    referenceLap != null &&
    compoundOf(focusLap) !== compoundOf(referenceLap);
  const comparing = Boolean(referenceDriver && referenceLap && deltas);

  return (
    <div className="shrink-0 border-b border-[var(--hairline)]">
      <div
        className="relative overflow-hidden"
        style={{
          background: comparing
            ? `linear-gradient(90deg, ${focusAccent.accent}22 0%, ${focusAccent.accent}08 42%, transparent 50%, ${refAccent.accent}08 58%, ${refAccent.accent}22 100%), var(--asphalt)`
            : `linear-gradient(90deg, ${focusAccent.accent}18 0%, var(--asphalt) 55%)`,
        }}
      >
        <div className="flex flex-col gap-1.5 px-2.5 py-1.5 sm:flex-row sm:items-stretch sm:gap-2">
          {/* FOCUS */}
          <div
            className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-md border px-2.5 py-1.5"
            style={{
              borderColor: `${focusAccent.accent}66`,
              boxShadow: `inset 0 0 0 1px ${focusAccent.accent}22, 0 0 20px ${focusAccent.accent}14`,
              background: "rgba(5,7,10,0.55)",
            }}
          >
            <span
              className="absolute left-0 top-0 rounded-br-md px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
              style={{ background: focusAccent.accent }}
            >
              Focus
            </span>
            <DriverPortrait driver={focusDriver} size={52} className="mt-1.5" />
            <div className="min-w-0 flex-1 pt-2">
              <p className="truncate font-display text-base font-bold leading-tight text-[var(--chalk)]">
                {focusDriver.name}
              </p>
              <p className="font-mono text-[0.68rem] text-[var(--mist)]">
                <span style={{ color: focusAccent.accent }}>{focusDriver.code}</span>
                {" · "}
                {focusDriver.team}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <select
                  value={focusDriver.id}
                  onChange={(e) => onFocusDriver(e.target.value)}
                  aria-label="Focus driver"
                  className="max-w-[11rem] truncate rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {getDrivers().map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code}
                      {d.team ? ` · ${d.team}` : ""}
                    </option>
                  ))}
                </select>
                <select
                  value={focusLap.number}
                  onChange={(e) => onFocusLap(Number(e.target.value))}
                  aria-label="Focus lap"
                  className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {focusLaps.map((l) => (
                    <option key={l.id} value={l.number}>
                      L{l.number}
                    </option>
                  ))}
                </select>
                <span className="rounded-sm bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.58rem] uppercase text-[var(--mist)]">
                  {compoundOf(focusLap)}
                </span>
              </div>
            </div>
              <p className="shrink-0 self-end pb-0.5 font-display text-xl font-bold tabular-nums tracking-tight text-[var(--chalk)] sm:self-center sm:pb-0">
                {formatLapTime(focusLap.timeMs)}
              </p>
            </div>

          {/* VS hub */}
          <div className="flex shrink-0 flex-row items-center justify-center gap-1.5 sm:w-[6.5rem] sm:flex-col sm:gap-0.5">
            {comparing && deltas ? (
              <>
                <button
                  type="button"
                  onClick={onSwap}
                  className="compare-vs-btn relative flex h-10 w-10 items-center justify-center rounded-full font-display text-xs font-black uppercase tracking-wide text-[var(--void)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--signal), #9be03a)",
                    boxShadow: "0 0 24px rgba(198,255,74,0.45)",
                  }}
                  title="Swap Focus and Reference"
                >
                  VS
                </button>
                <button
                  type="button"
                  onClick={onOpenCompare}
                  className="text-center transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  title="Open compare detail"
                >
                  <p
                    className={cn(
                      "font-display text-lg font-bold tabular-nums leading-none",
                      deltas.lapMs > 0
                        ? "text-[var(--trace-amber)]"
                        : "text-[var(--signal)]",
                    )}
                  >
                    Δ {formatDeltaSec(deltas.lapMs)}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.45rem] uppercase tracking-[0.12em] text-[var(--signal)]">
                    Detail ▸
                  </p>
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="font-mono text-[0.55rem] text-[var(--mute)] hover:text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  Clear
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onTeammate}
                className="compare-vs-btn flex h-12 min-w-[5.5rem] items-center justify-center rounded-full px-3 font-display text-sm font-black uppercase tracking-wide text-[var(--void)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--signal), #9be03a)",
                  boxShadow: "0 0 24px rgba(198,255,74,0.45)",
                }}
              >
                VS
              </button>
            )}
          </div>

          {/* REFERENCE */}
          {referenceDriver && referenceLap ? (
            <div
              className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-md border px-2.5 py-1.5"
              style={{
                borderColor: `${refAccent.accent}66`,
                boxShadow: `inset 0 0 0 1px ${refAccent.accent}22, 0 0 20px ${refAccent.accent}14`,
                background: "rgba(5,7,10,0.55)",
              }}
            >
              <span
                className="absolute left-0 top-0 rounded-br-md px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
                style={{ background: refAccent.accent }}
              >
                Reference
              </span>
              <DriverPortrait
                driver={referenceDriver}
                size={52}
                className="mt-1.5"
              />
              <div className="min-w-0 flex-1 pt-2">
                <p className="truncate font-display text-base font-bold leading-tight text-[var(--chalk)]">
                  {referenceDriver.name}
                </p>
                <p className="font-mono text-[0.68rem] text-[var(--mist)]">
                  <span style={{ color: refAccent.accent }}>
                    {referenceDriver.code}
                  </span>
                  {" · "}
                  {referenceDriver.team}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <select
                    value={referenceDriver.id}
                    onChange={(e) => onReferenceDriver(e.target.value)}
                    aria-label="Reference driver"
                    className="max-w-[11rem] truncate rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {getDrivers().map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code}
                        {d.team ? ` · ${d.team}` : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    value={referenceLap.number}
                    onChange={(e) => onReferenceLap(Number(e.target.value))}
                    aria-label="Reference lap"
                    className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {referenceLaps.map((l) => (
                      <option key={l.id} value={l.number}>
                        L{l.number}
                      </option>
                    ))}
                  </select>
                  <span className="rounded-sm bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.58rem] uppercase text-[var(--mist)]">
                    {compoundOf(referenceLap)}
                  </span>
                </div>
              </div>
              <p className="shrink-0 self-end pb-0.5 font-display text-xl font-bold tabular-nums tracking-tight text-[var(--chalk)] sm:self-center sm:pb-0">
                {formatLapTime(referenceLap.timeMs)}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={onTeammate}
              className="flex min-h-[4.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-[var(--signal)]/40 bg-[var(--signal-dim)]/20 px-3 py-1.5 text-center transition hover:bg-[var(--signal-dim)]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--signal)]">
                Reference
              </span>
              <span className="font-display text-base font-semibold text-[var(--chalk)]">
                Pick a car to compare
              </span>
              <span className="font-mono text-[0.62rem] text-[var(--mist)]">
                Teammate · Field best · Other compound
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.35)] px-2.5 py-1">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            Presets
          </span>
          <PresetChip label="Teammate" onClick={onTeammate} hot />
          <PresetChip label="Field best" onClick={onFieldBest} />
          <PresetChip
            label="Other compound"
            onClick={onOtherCompound}
            disabled={!canOtherCompound}
          />
          {deltas && (
            <span className="ml-auto flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[0.62rem]">
              {(["S1", "S2", "S3"] as const).map((label, i) => (
                <span key={label} className="text-[var(--mist)]">
                  {label}{" "}
                  <span
                    className={
                      deltas.sectorsMs[i] > 0
                        ? "font-semibold text-[var(--trace-amber)]"
                        : "font-semibold text-[var(--signal)]"
                    }
                  >
                    {formatDeltaSec(deltas.sectorsMs[i])}
                  </span>
                </span>
              ))}
            </span>
          )}
          {compoundsDiffer && (
            <span className="rounded-sm border border-[var(--trace-amber)]/45 bg-[var(--trace-amber)]/15 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--trace-amber)]">
              Compounds differ
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PresetChip({
  label,
  onClick,
  disabled,
  hot,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hot?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-7 rounded-sm border px-2.5 font-mono text-[0.62rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
        hot
          ? "border-[var(--signal)]/50 bg-[var(--signal-dim)] text-[var(--signal)]"
          : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40 hover:text-[var(--signal)]",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {label}
    </button>
  );
}
