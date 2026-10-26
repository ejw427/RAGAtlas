"use client";

import { getSessionPack } from "@/lib/session";
import { cn } from "@/lib/utils";

export function Timeline({
  activeCiteId,
  onSelect,
}: {
  activeCiteId: string | null;
  onSelect: (citeId: string) => void;
}) {
  const markers = getSessionPack().timeline;

  return (
    <div className="mt-3">
      <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        Debrief timeline
      </p>
      <ol className="space-y-2 border-l border-[var(--hairline-strong)] pl-3">
        {markers.map((m) => {
          const active = activeCiteId === m.citeId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.citeId)}
                className={cn(
                  "w-full text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                  active ? "text-[var(--signal)]" : "text-[var(--mist)]",
                )}
              >
                <span
                  className={cn(
                    "mb-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em]",
                    active ? "text-[var(--signal)]" : "text-[var(--mute)]",
                  )}
                >
                  {m.label}
                </span>
                <span className="block text-[0.72rem] leading-snug">
                  {m.copy}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
