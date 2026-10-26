"use client";

import { getChannels, getSessionPack, stageChannels } from "@/lib/session";
import { interpolateAt } from "@/lib/utils";
import { getSample } from "@/lib/session";
import { cn } from "@/lib/utils";
import { TrackSchematic } from "@/components/session/TrackSchematic";
import { Timeline } from "@/components/session/Timeline";

const COLOR: Record<string, string> = {
  "trace-brake": "var(--trace-brake)",
  "trace-throttle": "var(--trace-throttle)",
  "trace-cyan": "var(--trace-cyan)",
  "trace-amber": "var(--trace-amber)",
};

export function ContextRail({
  lapId,
  playheadM,
  activeSector,
  evidence,
  activeCiteId,
  onTimelineCite,
  emphasizeBrake,
}: {
  lapId: string;
  playheadM: number;
  activeSector: string | null;
  evidence: { startM: number; endM: number } | null;
  activeCiteId: string | null;
  onTimelineCite: (citeId: string) => void;
  emphasizeBrake?: boolean;
}) {
  const channels = stageChannels();
  const all = getChannels();

  return (
    <aside className="flex flex-col gap-3 overflow-auto border-[var(--hairline)] bg-[var(--rail)] p-3 md:border-r">
      <TrackSchematic
        activeSector={activeSector}
        playheadM={playheadM}
        evidence={evidence}
      />

      <div>
        <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Channels
        </p>
        <ul className="space-y-0.5">
          {channels.map((ch) => {
            const sample = getSample(ch.id, lapId);
            const val = sample
              ? interpolateAt(sample.series, playheadM)
              : null;
            const active = emphasizeBrake
              ? ch.id === "brake_temp"
              : ch.id === "brake_temp";
            return (
              <li
                key={ch.id}
                className={cn(
                  "flex items-center gap-2 font-mono text-[0.7rem] text-[var(--mist)]",
                  active && "text-[var(--chalk)]",
                )}
              >
                <span
                  className="inline-block h-[3px] w-2.5 rounded-sm"
                  style={{
                    background: COLOR[ch.colorToken] ?? "var(--mist)",
                  }}
                />
                <span>{ch.displayName ?? ch.name}</span>
                <span className="ml-auto text-[var(--chalk)]">
                  {val != null
                    ? `${val.toFixed(ch.id === "brake_temp" ? 0 : 1)}${ch.unit ? ch.unit : ""}`
                    : "—"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[0.65rem] leading-snug text-[var(--mute)]">
          Plot trio:{" "}
          <span className="text-[var(--mist)]">brake_temp</span> (ATLAS-like) +
          OpenF1-shaped <span className="text-[var(--mist)]">throttle</span> /{" "}
          <span className="text-[var(--mist)]">speed</span>. {all.length} channel
          docs in corpus.
        </p>
      </div>

      <Timeline activeCiteId={activeCiteId} onSelect={onTimelineCite} />

      <p className="mt-auto pt-2 font-mono text-[0.58rem] text-[var(--mute)]">
        {getSessionPack().meta.synthetic ? "SYNTHETIC DATA" : "LIVE"} · no feed
      </p>
    </aside>
  );
}
