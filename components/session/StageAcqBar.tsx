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
}: {
  plotChannelIds: string[];
  comparing: boolean;
  onSetPlots: (ids: string[]) => void;
  onSolo?: () => void;
  totalChannels: number;
}) {
  const allIds = defaultPlotIds();

  const activePreset = PRESET_ORDER.find((name) => {
    const ids = resolvePreset(name, allIds);
    if (ids.length !== plotChannelIds.length) return false;
    return ids.every((id, i) => id === plotChannelIds[i]);
  });

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-1.5">
      <p className="mr-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
        Acq · stage
      </p>
      {PRESET_ORDER.map((name) => {
        const hot = activePreset === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSetPlots(resolvePreset(name, allIds))}
            className={cn(
              "min-h-7 rounded-sm border px-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              hot
                ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/45 hover:text-[var(--signal)]",
            )}
          >
            {name}
          </button>
        );
      })}
      <span className="font-mono text-[0.58rem] tabular-nums text-[var(--mute)]">
        {plotChannelIds.length}/{totalChannels} plotted
      </span>
      {comparing && onSolo && (
        <button
          type="button"
          onClick={onSolo}
          className="ml-auto min-h-7 rounded-sm border border-[var(--trace-cyan)]/45 bg-[rgba(58,215,255,0.1)] px-2.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[var(--trace-cyan)] transition hover:bg-[rgba(58,215,255,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          title="Clear Reference and focus one car"
        >
          Solo · 1 car
        </button>
      )}
      {!comparing && (
        <span className="ml-auto font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--signal)]">
          Solo focus · one flyer
        </span>
      )}
    </div>
  );
}
