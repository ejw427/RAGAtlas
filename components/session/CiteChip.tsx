"use client";

import { cn } from "@/lib/utils";
import type { CiteTarget } from "@/lib/types";

export function CiteChip({
  cite,
  selected,
  pulsing,
  onSelect,
}: {
  cite: CiteTarget;
  selected?: boolean;
  pulsing?: boolean;
  onSelect: (cite: CiteTarget) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(cite)}
      aria-pressed={selected}
      aria-label={`Citation ${cite.label}. ${cite.summary}`}
      className={cn(
        "w-full border border-[var(--hairline)] bg-transparent px-2.5 py-2 text-left font-mono text-[0.68rem] text-[var(--mist)] transition hover:border-[var(--hairline-strong)] hover:text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        selected &&
          "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]",
        pulsing && "cite-pulse",
      )}
    >
      <span className="block">{cite.label}</span>
      <span className="mt-0.5 block text-[0.62rem] text-[var(--mute)]">
        {cite.summary}
      </span>
    </button>
  );
}
