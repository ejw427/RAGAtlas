"use client";

import { useMemo, useState } from "react";
import { TrackSchematic } from "@/components/session/TrackSchematic";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { deltaChannelLegend } from "@/lib/compare-series";
import {
  formatChannelValue,
  getChannel,
  getSample,
  getSessionPack,
} from "@/lib/session";
import { interpolateAt, cn } from "@/lib/utils";

export type MapPaintMode = "both" | "delta" | "sector" | "clean";

const DETAIL_CHANNELS = [
  "speed",
  "throttle",
  "brake",
  "n_gear",
  "steering",
  "rpm",
  "drs",
  "brake_pressure",
  "g_long",
] as const;

export function CircuitMapModal({
  open,
  onOpenChange,
  activeSector,
  playheadM,
  evidence,
  onPlayhead,
  onSector,
  focusAccent,
  referenceAccent,
  focusNumber,
  referenceNumber,
  focusCode,
  referenceCode,
  comparing,
  traps,
  sectorDeltaMs,
  gainSectorIndex,
  lossSectorIndex,
  channelDelta,
  speedDelta,
  deltaChannelId = "speed",
  deltaChannelLabel,
  deltaAheadLabel,
  deltaBehindLabel,
  onDeltaChannel,
  onOpenCompare,
  onViewWindow,
  viewWindow = null,
  onInspectFocus,
  onInspectReference,
  lapId,
  compareLapId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSector: string | null;
  playheadM: number;
  evidence?: { startM: number; endM: number } | null;
  onPlayhead?: (m: number) => void;
  onSector?: (label: string) => void;
  focusAccent?: string;
  referenceAccent?: string;
  focusNumber?: number;
  referenceNumber?: number;
  focusCode?: string;
  referenceCode?: string;
  comparing?: boolean;
  traps?: { id: string; m: number; label: string; speed?: number }[];
  sectorDeltaMs?: [number, number, number] | null;
  gainSectorIndex?: number | null;
  lossSectorIndex?: number | null;
  channelDelta?: { d: number[]; v: number[] } | null;
  /** @deprecated Prefer channelDelta */
  speedDelta?: { d: number[]; v: number[] } | null;
  deltaChannelId?: string;
  deltaChannelLabel?: string;
  deltaAheadLabel?: string;
  deltaBehindLabel?: string;
  onDeltaChannel?: (channelId: string) => void;
  onOpenCompare?: () => void;
  onViewWindow?: (window: { startM: number; endM: number } | null) => void;
  viewWindow?: { startM: number; endM: number } | null;
  onInspectFocus?: () => void;
  onInspectReference?: () => void;
  lapId?: string;
  compareLapId?: string | null;
}) {
  const pack = getSessionPack();
  const [paintMode, setPaintMode] = useState<MapPaintMode>(
    comparing ? "both" : "sector",
  );
  const deltaSeries = channelDelta ?? speedDelta;
  const legend = deltaChannelLegend(deltaChannelId);
  const aheadLabel = deltaAheadLabel ?? legend.ahead;
  const behindLabel = deltaBehindLabel ?? legend.behind;
  const channelLabel = deltaChannelLabel ?? legend.label;

  const modes: { id: MapPaintMode; label: string; hint: string }[] = [
    {
      id: "both",
      label: "RGB stack",
      hint: `Green/red Δ${channelLabel} ribbon + sector paint + cyan playhead`,
    },
    {
      id: "delta",
      label: "Delta only",
      hint: `Where Focus is ahead (green) or behind (red) on ${channelLabel}`,
    },
    {
      id: "sector",
      label: "Sectors",
      hint: "S1/S2/S3 gain-loss paint",
    },
    {
      id: "clean",
      label: "Clean asphalt",
      hint: "Road only - scrub and stretch without overlays",
    },
  ];

  const live = useMemo(() => {
    if (!lapId) return [];
    return DETAIL_CHANNELS.map((id) => {
      const ch = getChannel(id);
      const sample = getSample(id, lapId);
      const refSample =
        comparing && compareLapId ? getSample(id, compareLapId) : undefined;
      const v = sample ? interpolateAt(sample.series, playheadM) : null;
      const rv = refSample
        ? interpolateAt(refSample.series, playheadM)
        : null;
      const dlt = v != null && rv != null ? v - rv : null;
      return { id, ch, v, rv, dlt };
    }).filter((row) => row.ch && row.v != null);
  }, [lapId, compareLapId, comparing, playheadM]);

  const deltaAtPlayhead = useMemo(() => {
    if (!deltaSeries || deltaSeries.d.length < 2) return null;
    return interpolateAt(deltaSeries, playheadM);
  }, [deltaSeries, playheadM]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="inset-1 top-1 bottom-1 left-1 right-1 z-50 flex max-h-none w-auto flex-col overflow-hidden rounded-lg border border-[var(--hairline-strong)] bg-[var(--void)] p-2 shadow-2xl sm:inset-2 sm:p-3 md:inset-3">
        <div className="mb-2 flex shrink-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="text-[var(--signal)]">
              Circuit of the Americas - expanded map
            </SheetTitle>
            <p className="mt-1 max-w-3xl font-mono text-[0.62rem] leading-relaxed text-[var(--mist)]">
              Stretch a box, pan when zoomed, scrub the playhead. Click a live
              channel to paint the ribbon green/red for that signal. Cyan =
              playhead / evidence. Desk traces follow this window.
              {comparing && focusCode && referenceCode
                ? ` Comparing ${focusCode} vs ${referenceCode} · Δ${channelLabel}.`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-sm border border-[var(--hairline-strong)] px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--mist)] hover:border-[var(--signal)]/50 hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Close
          </button>
        </div>

        <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            Paint
          </span>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              title={m.hint}
              disabled={m.id === "delta" && !comparing}
              onClick={() => setPaintMode(m.id)}
              className={cn(
                "rounded-sm border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-35",
                paintMode === m.id
                  ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                  : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40",
              )}
            >
              {m.label}
            </button>
          ))}
          <span className="ml-auto inline-flex flex-wrap items-center gap-3 font-mono text-[0.55rem]">
            <span className="text-[var(--mute)]">Δ{channelLabel}</span>
            <span className="inline-flex items-center gap-1 text-[var(--signal)]">
              <span className="h-2 w-2 rounded-sm bg-[var(--signal)] shadow-[0_0_8px_rgba(198,255,74,0.8)]" />
              {aheadLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--fault)]">
              <span className="h-2 w-2 rounded-sm bg-[var(--fault)] shadow-[0_0_8px_rgba(255,77,94,0.7)]" />
              {behindLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--trace-cyan)]">
              <span className="h-2 w-2 rounded-sm bg-[var(--trace-cyan)]" />
              cyan lock
            </span>
          </span>
        </div>

        <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-h-[55vh] overflow-hidden rounded-md border border-[var(--hairline-strong)] lg:min-h-0">
            <TrackSchematic
              stage
              expanded
              paintMode={paintMode}
              activeSector={activeSector}
              playheadM={playheadM}
              evidence={evidence}
              onPlayhead={onPlayhead}
              onSector={onSector}
              focusAccent={focusAccent}
              referenceAccent={referenceAccent}
              focusNumber={focusNumber}
              referenceNumber={referenceNumber}
              focusCode={focusCode}
              referenceCode={referenceCode}
              comparing={comparing}
              traps={traps}
              sectorDeltaMs={sectorDeltaMs}
              gainSectorIndex={gainSectorIndex}
              lossSectorIndex={lossSectorIndex}
              channelDelta={deltaSeries}
              deltaChannelLabel={channelLabel}
              deltaAheadLabel={aheadLabel}
              deltaBehindLabel={behindLabel}
              onOpenCompare={onOpenCompare}
              onViewWindow={onViewWindow}
              viewWindow={viewWindow}
              onInspectFocus={onInspectFocus}
              onInspectReference={onInspectReference}
              lapId={lapId}
              compareLapId={compareLapId}
            />
          </div>

          <aside className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto overscroll-contain lg:max-h-none">
            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Playhead
              </p>
              <p className="font-display text-2xl font-bold tabular-nums text-[var(--chalk)]">
                {Math.round(playheadM)} m
              </p>
              <p className="font-mono text-[0.58rem] text-[var(--mist)]">
                Sector {activeSector ?? "Lap"}
                {evidence
                  ? ` · evidence ${Math.round(evidence.startM)}-${Math.round(evidence.endM)} m`
                  : ""}
              </p>
              {deltaAtPlayhead != null && (
                <p
                  className={cn(
                    "mt-1 font-mono text-[0.72rem] font-bold tabular-nums",
                    deltaAtPlayhead >= 0
                      ? "text-[var(--signal)]"
                      : "text-[var(--fault)]",
                  )}
                >
                  Δ{channelLabel} {deltaAtPlayhead >= 0 ? "+" : ""}
                  {Math.abs(deltaAtPlayhead) >= 10
                    ? deltaAtPlayhead.toFixed(0)
                    : deltaAtPlayhead.toFixed(1)}
                  {legend.unit ? ` ${legend.unit}` : ""}
                </p>
              )}
            </div>

            {sectorDeltaMs && comparing && (
              <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
                <p className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                  Sector Delta
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {(["S1", "S2", "S3"] as const).map((label, i) => {
                    const ms = sectorDeltaMs[i];
                    const hot =
                      gainSectorIndex === i || lossSectorIndex === i;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onSector?.(label)}
                        className={cn(
                          "rounded-sm border px-1.5 py-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                          ms <= 0
                            ? "border-[var(--signal)]/40 bg-[var(--signal-dim)]/35"
                            : "border-[var(--fault)]/40 bg-[rgba(255,77,94,0.12)]",
                          hot && "ring-1 ring-[var(--trace-cyan)]",
                        )}
                      >
                        <p className="font-mono text-[0.45rem] uppercase text-[var(--mute)]">
                          {label}
                        </p>
                        <p
                          className={cn(
                            "font-mono text-[0.7rem] font-bold tabular-nums",
                            ms <= 0
                              ? "text-[var(--signal)]"
                              : "text-[var(--fault)]",
                          )}
                        >
                          {ms > 0 ? "+" : ""}
                          {(ms / 1000).toFixed(3)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
              <p className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                {comparing
                  ? "Live channels · tap to paint map"
                  : "Live channels"}
              </p>
              <ul className="space-y-1">
                {live.map(({ id, ch, v, rv, dlt }) => {
                  const active = comparing && deltaChannelId === id;
                  const ahead = dlt != null && dlt >= 0;
                  const behind = dlt != null && dlt < 0;
                  const row = (
                    <>
                      <span className="min-w-0 truncate text-[var(--mist)]">
                        {ch!.displayName ?? ch!.name}
                        {active ? " · MAP" : ""}
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="tabular-nums text-[var(--chalk)]">
                          {formatChannelValue(ch!, v!)}
                        </span>
                        {rv != null && (
                          <span
                            className="tabular-nums text-[0.55rem]"
                            style={{ color: referenceAccent ?? "var(--mute)" }}
                          >
                            {formatChannelValue(ch!, rv)}
                          </span>
                        )}
                        {dlt != null && (
                          <span
                            className={cn(
                              "tabular-nums text-[0.55rem] font-bold",
                              ahead
                                ? "text-[var(--signal)]"
                                : "text-[var(--fault)]",
                            )}
                          >
                            {dlt >= 0 ? "+" : ""}
                            {Math.abs(dlt) >= 10
                              ? dlt.toFixed(0)
                              : dlt.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </>
                  );
                  if (comparing && onDeltaChannel) {
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => {
                            onDeltaChannel(id);
                            if (paintMode === "clean" || paintMode === "sector") {
                              setPaintMode("both");
                            }
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-sm border px-1.5 py-1 text-left font-mono text-[0.62rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                            active
                              ? ahead
                                ? "border-[var(--signal)]/55 bg-[var(--signal-dim)]/50"
                                : behind
                                  ? "border-[var(--fault)]/55 bg-[rgba(255,77,94,0.14)]"
                                  : "border-[var(--signal)]/40 bg-[var(--signal-dim)]/40"
                              : "border-transparent hover:border-[var(--hairline)] hover:bg-[rgba(255,255,255,0.03)]",
                          )}
                        >
                          {row}
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-2 font-mono text-[0.62rem]"
                    >
                      {row}
                    </li>
                  );
                })}
                {live.length === 0 && (
                  <li className="font-mono text-[0.58rem] text-[var(--mute)]">
                    No samples at playhead
                  </li>
                )}
              </ul>
            </div>

            {traps && traps.length > 0 && (
              <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
                <p className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                  Speed traps
                </p>
                <ul className="space-y-1">
                  {traps.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => onPlayhead?.(t.m)}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-1 py-0.5 text-left font-mono text-[0.62rem] text-[var(--mist)] hover:bg-[var(--signal-dim)]/40 hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                      >
                        <span>
                          {t.label} · {Math.round(t.m)} m
                        </span>
                        {t.speed != null && (
                          <span className="tabular-nums text-[var(--chalk)]">
                            {t.speed} km/h
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
              <p className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                Landmark jumps
              </p>
              <div className="flex flex-wrap gap-1">
                {pack.sectors.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSector?.(s.label)}
                    className={cn(
                      "rounded-sm border px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                      activeSector === s.label
                        ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                        : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onSector?.("Lap")}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                    !activeSector || activeSector === "Lap"
                      ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                      : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40",
                  )}
                >
                  Full lap
                </button>
              </div>
            </div>
          </aside>
        </div>
      </SheetContent>
    </Sheet>
  );
}
