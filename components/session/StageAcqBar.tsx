"use client";

import { resolvePreset } from "@/lib/identity";
import { defaultPlotIds } from "@/lib/session";
import { cn } from "@/lib/utils";

const PRESET_ORDER = [
  "Race",
  "All",
  "Lap",
  "Pedals",
  "Brakes",
  "Thermal",
  "Power",
] as const;

export function StageAcqBar({
  plotChannelIds,
  comparing,
  onSetPlots,
  onSolo,
  totalChannels,
  viewWindow = null,
  onClearWindow,
  compact = false,
}: {
  plotChannelIds: string[];
  comparing: boolean;
  onSetPlots: (ids: string[]) => void;
  onSolo?: () => void;
  totalChannels: number;
  viewWindow?: { startM: number; endM: number } | null;
  onClearWindow?: () => void;
  /** Phone / narrow column — single scrolling row, less chrome. */
  compact?: boolean;
}) {
  const allIds = defaultPlotIds();

  const activePreset = PRESET_ORDER.find((name) => {
    const ids = resolvePreset(name, allIds);
    if (ids.length !== plotChannelIds.length) return false;
    return ids.every((id, i) => id === plotChannelIds[i]);
  });

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 border border-[var(--hairline)] bg-[var(--panel)]",
        compact
          ? "overflow-x-auto overscroll-x-contain px-2 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex-wrap px-2.5 py-1.5",
      )}
    >
      {!compact && (
        <p className="mr-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Acq · stage
        </p>
      )}
      {PRESET_ORDER.map((name) => {
        const hot = activePreset === name;
        const count = resolvePreset(name, allIds).length;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSetPlots(resolvePreset(name, allIds))}
            title={`${count} channels`}
            className={cn(
              "shrink-0 rounded-sm border font-mono uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              compact
                ? "min-h-7 px-1.5 text-[0.52rem]"
                : "min-h-7 px-2 text-[0.58rem]",
              hot
                ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/45 hover:text-[var(--signal)]",
            )}
          >
            {name}
            <span className="ml-1 tabular-nums opacity-70">{count}</span>
          </button>
        );
      })}
      {!compact && (
        <span className="font-mono text-[0.58rem] tabular-nums text-[var(--mute)]">
          {plotChannelIds.length}/{totalChannels} plotted
        </span>
      )}
      {viewWindow && onClearWindow && (
        <button
          type="button"
          onClick={onClearWindow}
          className={cn(
            "shrink-0 rounded-sm border border-[var(--signal)] bg-[var(--signal-dim)] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--signal)] shadow-[0_0_0_1px_rgba(198,255,74,0.3)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
            compact ? "px-2 py-0.5 text-[0.52rem]" : "px-2.5 py-1 text-[0.58rem]",
          )}
          title="Reset map + graphs to the full lap"
        >
          {compact ? "Full lap" : "Reset zoom · full lap"}
          {!compact && (
            <span className="ml-1.5 font-normal tabular-nums opacity-75">
              {Math.round(viewWindow.startM)}–{Math.round(viewWindow.endM)} m
            </span>
          )}
        </button>
      )}
      {comparing && onSolo && (
        <button
          type="button"
          onClick={onSolo}
          className={cn(
            "shrink-0 rounded-sm border border-[var(--trace-cyan)]/45 bg-[rgba(58,215,255,0.1)] font-mono uppercase tracking-[0.08em] text-[var(--trace-cyan)] transition hover:bg-[rgba(58,215,255,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
            compact
              ? "ml-auto min-h-7 px-2 text-[0.52rem]"
              : "ml-auto min-h-7 px-2.5 text-[0.58rem]",
          )}
          title="Clear Reference and focus one car"
        >
          {compact ? "Solo" : "Solo · 1 car"}
        </button>
      )}
      {!comparing && !compact && (
        <span className="ml-auto font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--signal)]">
          Solo · pick Reference to overlay
        </span>
      )}
      {comparing && !onSolo && !compact && (
        <span className="ml-auto font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--trace-cyan)]">
          Dual draw · Focus solid · Ref dashed
        </span>
      )}
    </div>
  );
}
