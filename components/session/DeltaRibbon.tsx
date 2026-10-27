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
    <div className="compare-gap-bar flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--hairline)] px-3 py-1.5">
      <p className="mr-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--trace-cyan)]">
        Gap · green = Focus faster
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
              "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              ahead
                ? "border-[var(--signal)] bg-[var(--signal-dim)] shadow-[0_0_16px_rgba(198,255,74,0.35)]"
                : "border-[var(--fault)]/60 bg-[rgba(255,77,94,0.16)] shadow-[0_0_16px_rgba(255,77,94,0.28)]",
              active && "ring-2 ring-[var(--trace-cyan)]",
            )}
          >
            <span className="text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mist)]">
              {c.label}
            </span>
            <span
              className={cn(
                "text-[0.85rem] font-black tabular-nums leading-none",
                ahead ? "text-[var(--signal)]" : "text-[var(--fault)]",
              )}
            >
              {formatDeltaSec(c.ms)}
            </span>
          </button>
        );
      })}
      <p className="hidden font-mono text-[0.48rem] text-[var(--mute)] sm:inline">
        {"click sector > stretch map + traces"}
      </p>
      {onOpenCompare && (
        <button
          type="button"
          onClick={onOpenCompare}
          className="ml-auto rounded-sm border border-[var(--trace-cyan)]/50 bg-[rgba(58,215,255,0.12)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--trace-cyan)] hover:bg-[rgba(58,215,255,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          {"Full compare >"}
        </button>
      )}
    </div>
  );
}
