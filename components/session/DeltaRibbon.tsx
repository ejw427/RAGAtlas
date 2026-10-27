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
    <div className="shrink-0 border-b border-[var(--hairline)] bg-[rgba(5,7,10,0.55)] px-3 py-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Gap story · Focus − Reference
        </p>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[0.55rem] text-[var(--mute)]">
            Negative = Focus faster · click a sector
          </p>
          {onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--signal)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Full compare ▸
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {cells.map((c) => {
          const ahead = c.ms <= 0;
          const active = activeSector === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "rounded-md border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                ahead
                  ? "border-[var(--signal)]/35 bg-[var(--signal-dim)]/40"
                  : "border-[var(--trace-amber)]/35 bg-[var(--trace-amber)]/10",
                active && "ring-1 ring-[var(--signal)]",
              )}
            >
              <span className="block font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                {c.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-display text-xl font-bold tabular-nums leading-none",
                  ahead ? "text-[var(--signal)]" : "text-[var(--trace-amber)]",
                )}
              >
                {formatDeltaSec(c.ms)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
