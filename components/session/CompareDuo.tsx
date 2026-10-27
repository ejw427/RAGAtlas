"use client";

import { CarSilhouette } from "@/components/identity/CarSilhouette";
import { DriverPortrait } from "@/components/identity/DriverPortrait";
import {
  HouseMark,
  houseLabelShort,
} from "@/components/identity/HouseMark";
import {
  accentFor,
  compoundOf,
  formatDeltaSec,
  sectorDeltas,
  type TeamAccent,
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
  onInspectFocus,
  onInspectReference,
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
  onInspectFocus?: () => void;
  onInspectReference?: () => void;
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
        className="compare-duo relative overflow-hidden"
        style={{
          background: comparing
            ? `linear-gradient(90deg, ${focusAccent.accent}28 0%, ${focusAccent.accent}0a 38%, transparent 50%, ${refAccent.accent}0a 62%, ${refAccent.accent}28 100%), var(--asphalt)`
            : `linear-gradient(90deg, ${focusAccent.accent}22 0%, var(--asphalt) 58%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-40"
          style={{
            background: `radial-gradient(ellipse 70% 120% at 8% 50%, ${focusAccent.accent}33, transparent 70%)`,
          }}
          aria-hidden
        />
        {comparing && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40"
            style={{
              background: `radial-gradient(ellipse 70% 120% at 92% 50%, ${refAccent.accent}33, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        <div className="relative flex flex-col gap-2 px-2.5 py-2 sm:flex-row sm:items-stretch sm:gap-2.5">
          <RacerCard
            role="Focus"
            driver={focusDriver}
            lap={focusLap}
            laps={focusLaps}
            accent={focusAccent}
            mirror={false}
            onDriver={onFocusDriver}
            onLap={onFocusLap}
            onInspect={onInspectFocus}
          />

          <div className="flex shrink-0 flex-row items-center justify-center gap-2 sm:w-[7rem] sm:flex-col sm:gap-1">
            {comparing && deltas ? (
              <>
                <button
                  type="button"
                  onClick={onSwap}
                  className="compare-vs-btn relative flex h-11 w-11 items-center justify-center rounded-full font-display text-xs font-black uppercase tracking-wide text-[var(--void)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--signal), #9be03a)",
                    boxShadow: "0 0 28px rgba(198,255,74,0.5)",
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
                      "font-display text-xl font-bold tabular-nums leading-none",
                      deltas.lapMs > 0
                        ? "text-[var(--trace-amber)]"
                        : "text-[var(--signal)]",
                    )}
                  >
                    Delta {formatDeltaSec(deltas.lapMs)}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.45rem] uppercase tracking-[0.14em] text-[var(--signal)]">
                    {"Detail >"}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--trace-cyan)] hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  title="Drop Reference and load the full solo channel pack"
                >
                  Solo · 1 car
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

          {referenceDriver && referenceLap ? (
            <RacerCard
              role="Reference"
              driver={referenceDriver}
              lap={referenceLap}
              laps={referenceLaps}
              accent={refAccent}
              mirror
              onDriver={onReferenceDriver}
              onLap={onReferenceLap}
              onInspect={onInspectReference}
            />
          ) : (
            <button
              type="button"
              onClick={onTeammate}
              className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-[var(--signal)]/40 bg-[var(--signal-dim)]/20 px-3 py-2 text-center transition hover:bg-[var(--signal-dim)]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
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

        <div className="relative flex flex-wrap items-center gap-1 border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.4)] px-2.5 py-1">
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

function splitName(name: string): { given: string; family: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { given: "", family: parts[0] ?? name };
  return {
    given: parts.slice(0, -1).join(" "),
    family: parts[parts.length - 1] ?? name,
  };
}

function RacerCard({
  role,
  driver,
  lap,
  laps,
  accent,
  mirror,
  onDriver,
  onLap,
  onInspect,
}: {
  role: "Focus" | "Reference";
  driver: Driver;
  lap: Lap;
  laps: Lap[];
  accent: TeamAccent;
  mirror: boolean;
  onDriver: (id: string) => void;
  onLap: (n: number) => void;
  onInspect?: () => void;
}) {
  const { given, family } = splitName(driver.name);
  const compound = compoundOf(lap);
  const house = houseLabelShort(accent);

  return (
    <div
      className={cn(
        "compare-racer relative flex min-w-0 flex-1 overflow-hidden rounded-md border",
        mirror && "sm:flex-row-reverse",
      )}
      style={{
        borderColor: `${accent.accent}70`,
        boxShadow: `inset 0 0 0 1px ${accent.accent}28, 0 0 28px ${accent.accent}18`,
        background: "rgba(5,7,10,0.62)",
      }}
    >
      {/* Manufacturer rail */}
      <div
        className={cn(
          "compare-house-rail relative flex w-[2.35rem] shrink-0 flex-col items-center justify-between py-2",
          mirror ? "border-l" : "border-r",
        )}
        style={{
          borderColor: `${accent.accent}40`,
          background: `linear-gradient(180deg, ${accent.accent}55 0%, ${accent.accent}18 45%, rgba(5,7,10,0.5) 100%)`,
        }}
        title="Session accent. Not a team asset."
      >
        <HouseMark
          house={accent.house}
          accent={accent.second}
          second={accent.accent}
          size={22}
          className="drop-shadow-[0_0_8px_rgba(0,0,0,0.45)]"
        />
        <span
          className="compare-house-vert font-mono text-[0.52rem] font-bold uppercase tracking-[0.22em] text-[var(--chalk)]"
          style={{
            writingMode: mirror ? "vertical-lr" : "vertical-rl",
            textOrientation: "mixed",
            textShadow: "0 1px 2px rgba(0,0,0,0.65)",
          }}
        >
          {house}
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent.second, boxShadow: `0 0 8px ${accent.accent}` }}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "relative flex min-w-0 flex-1 items-center gap-3 px-3 py-2",
          mirror && "sm:flex-row-reverse sm:text-right",
        )}
      >
        <button
          type="button"
          onClick={onInspect}
          disabled={!onInspect}
          title="Open racer detail"
          className="relative shrink-0 rounded-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-default"
        >
          <DriverPortrait driver={driver} size={68} />
          <span
            className={cn(
              "absolute -top-1 font-mono text-[0.45rem] font-bold uppercase tracking-[0.16em] text-[var(--void)]",
              mirror ? "-left-1" : "-right-1",
            )}
            style={{
              background: accent.accent,
              padding: "1px 5px",
              borderRadius: 2,
            }}
          >
            {role === "Focus" ? "FOC" : "REF"}
          </span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[rgba(5,7,10,0.85)] px-1 font-mono text-[0.4rem] uppercase tracking-[0.12em] text-[var(--trace-cyan)]">
            Card
          </span>
        </button>

        <div className={cn("min-w-0 flex-1", mirror && "sm:items-end")}>
          <div
            className={cn(
              "flex items-baseline gap-2",
              mirror && "sm:flex-row-reverse",
            )}
          >
            <p
              className="font-display text-[1.85rem] font-bold leading-none tabular-nums tracking-tight"
              style={{
                color: accent.accent,
                textShadow: `0 0 28px ${accent.accent}66`,
              }}
            >
              {driver.number ?? "-"}
            </p>
            <div className={cn("min-w-0", mirror && "sm:text-right")}>
              {given ? (
                <p className="truncate font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--mist)]">
                  {given}
                </p>
              ) : null}
              <p className="truncate font-display text-lg font-bold leading-[1.05] text-[var(--chalk)]">
                {family}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5",
              mirror && "sm:justify-end",
            )}
          >
            <span
              className="font-mono text-[0.78rem] font-bold tracking-wide"
              style={{ color: accent.accent }}
            >
              {driver.code}
            </span>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.1em]"
              style={{ color: accent.second }}
            >
              <HouseMark
                house={accent.house}
                accent={accent.accent}
                second={accent.second}
                size={12}
              />
              {driver.team ?? "Independent"}
            </span>
          </div>

          <div
            className={cn(
              "mt-1.5 flex flex-wrap items-center gap-1.5",
              mirror && "sm:justify-end",
            )}
          >
            <select
              value={driver.id}
              onChange={(e) => onDriver(e.target.value)}
              aria-label={`${role} driver`}
              className="max-w-[10.5rem] truncate rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {getDrivers().map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                  {d.team ? ` · ${d.team}` : ""}
                </option>
              ))}
            </select>
            <select
              value={lap.number}
              onChange={(e) => onLap(Number(e.target.value))}
              aria-label={`${role} lap`}
              className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-1 font-mono text-[0.62rem] text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {laps.map((l) => (
                <option key={l.id} value={l.number}>
                  L{l.number}
                </option>
              ))}
            </select>
            <span
              className="rounded-sm px-1.5 py-1 font-mono text-[0.58rem] font-bold uppercase tracking-wider"
              style={{
                background: `${accent.accent}22`,
                color: accent.accent,
                border: `1px solid ${accent.accent}44`,
              }}
            >
              {compound}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "hidden shrink-0 flex-col items-end gap-1 sm:flex",
            mirror && "sm:items-start",
          )}
        >
          <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-[var(--chalk)]">
            {formatLapTime(lap.timeMs)}
          </p>
          <button
            type="button"
            onClick={onInspect}
            disabled={!onInspect}
            title="Open racer detail"
            className="opacity-90 transition hover:opacity-100 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-default"
          >
            <CarSilhouette
              accent={accent.accent}
              second={accent.second}
              number={driver.number}
              compoundLetter={compound[0]?.toUpperCase()}
              width={168}
            />
            <span className="mt-0.5 block text-center font-mono text-[0.4rem] uppercase tracking-[0.12em] text-[var(--trace-cyan)]">
              Inspect car
            </span>
          </button>
        </div>

        {/* Mobile lap time */}
        <p className="shrink-0 self-end pb-0.5 font-display text-xl font-bold tabular-nums tracking-tight text-[var(--chalk)] sm:hidden">
          {formatLapTime(lap.timeMs)}
        </p>
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
