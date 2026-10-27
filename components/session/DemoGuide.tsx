"use client";

import { DEMO_ASK, DEMO_NO_HIT, WEDGE } from "@/lib/brand";
import { cn } from "@/lib/utils";

export type DemoStep = 0 | 1 | 2 | 3 | 4;

const STEPS: { id: DemoStep; label: string; hint: string }[] = [
  {
    id: 0,
    label: "1 · Compare",
    hint: "Two named cars. Read the lap delta.",
  },
  {
    id: 1,
    label: "2 · Sector",
    hint: "Open the sector that owns the gap.",
  },
  {
    id: 2,
    label: "3 · Ask",
    hint: DEMO_ASK,
  },
  {
    id: 3,
    label: "4 · Cite",
    hint: "Click Evidence — playhead locks.",
  },
  {
    id: 4,
    label: "5 · Honesty",
    hint: "OF1 vs OVL · fail closed on no-hit.",
  },
];

export function DemoGuide({
  step,
  gainLabel,
  onStep,
  onDismiss,
}: {
  step: DemoStep;
  gainLabel: string;
  onStep: (step: DemoStep) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="shrink-0 border-b border-[var(--signal)]/30 bg-[var(--signal-dim)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--signal)]">
          90s interview
        </span>
        <span className="hidden font-mono text-[0.58rem] text-[var(--mute)] lg:inline">
          {WEDGE}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto font-mono text-[0.55rem] text-[var(--mute)] hover:text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Dismiss
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStep(s.id)}
            className={cn(
              "min-h-8 rounded-sm border px-2.5 font-mono text-[0.62rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              step === s.id
                ? "border-[var(--signal)] bg-[var(--asphalt)] text-[var(--signal)]"
                : "border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--signal)]/40 hover:text-[var(--signal)]",
            )}
          >
            {s.id === 1 ? `2 · ${gainLabel}` : s.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[0.62rem] text-[var(--chalk)]">
        {step === 1
          ? `Open ${gainLabel} — where the gap lives.`
          : step === 4
            ? `Provenance: OF1 = OpenF1 · OVL = synthetic overlay. Probe: “${DEMO_NO_HIT}”`
            : STEPS[step].hint}
      </p>
    </div>
  );
}
