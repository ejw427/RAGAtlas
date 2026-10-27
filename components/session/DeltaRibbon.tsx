"use client";

import { formatDeltaSec } from "@/lib/identity";
import { cn } from "@/lib/utils";

export function DeltaRibbon({
  lapMs,
  sectorsMs,
  activeSector,
  onSelect,
  onOpenCompare,
}: {
  lapMs: number;
  sectorsMs: [number, number, number];
  activeSector: string | null;
  onSelect: (sector: string) => void;
  onOpenCompare?: () => void;
}) {
  const cells: { id: string; label: string; ms: number }[] = [
    { id: "Lap", label: "Lap", ms: lapMs },
    { id: "S1", label: "S1", ms: sectorsMs[0] },
    { id: "S2", label: "S2", ms: sectorsMs[1] },
    { id: "S3", label: "S3", ms: sectorsMs[2] },
  ];

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--hairline)] bg-[rgba(5,7,10,0.65)] px-3 py-1">
      <p className="mr-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
        Gap
      </p>
      {cells.map((c) => {
        const ahead = c.ms <= 0;
        const active = activeSector === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              ahead
                ? "border-[var(--signal)]/40 bg-[var(--signal-dim)]/45"
                : "border-[var(--trace-amber)]/40 bg-[var(--trace-amber)]/10",
              active && "ring-1 ring-[var(--signal)]",
            )}
          >
            <span className="text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]">
              {c.label}
            </span>
            <span
              className={cn(
                "text-[0.78rem] font-bold tabular-nums leading-none",
                ahead ? "text-[var(--signal)]" : "text-[var(--trace-amber)]",
              )}
            >
              {formatDeltaSec(c.ms)}
            </span>
          </button>
        );
      })}
      <p className="hidden font-mono text-[0.48rem] text-[var(--mute)] sm:inline">
        − = Focus faster · click to stretch map + traces
      </p>
      {onOpenCompare && (
        <button
          type="button"
          onClick={onOpenCompare}
          className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--signal)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Full compare ▸
        </button>
      )}
    </div>
  );
}
