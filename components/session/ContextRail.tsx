"use client";

import {
  formatChannelValue,
  getChannelsByApp,
  getEvents,
  getFailureModes,
  getNotes,
  getSample,
  getSessionPack,
} from "@/lib/session";
import { interpolateAt, cn } from "@/lib/utils";
import { TrackSchematic } from "@/components/session/TrackSchematic";
import { Timeline } from "@/components/session/Timeline";
import type { Channel } from "@/lib/types";

const COLOR: Record<string, string> = {
  "trace-brake": "var(--trace-brake)",
  "trace-throttle": "var(--trace-throttle)",
  "trace-cyan": "var(--trace-cyan)",
  "trace-amber": "var(--trace-amber)",
  "trace-violet": "var(--trace-violet)",
  "trace-mist": "var(--trace-mist)",
};

export function ContextRail({
  lapId,
  playheadM,
  activeSector,
  evidence,
  activeCiteId,
  onTimelineCite,
  plotChannelIds,
  onTogglePlot,
  emphasizeBrake,
}: {
  lapId: string;
  playheadM: number;
  activeSector: string | null;
  evidence: { startM: number; endM: number } | null;
  activeCiteId: string | null;
  onTimelineCite: (citeId: string) => void;
  plotChannelIds: string[];
  onTogglePlot: (channelId: string) => void;
  emphasizeBrake?: boolean;
}) {
  const byApp = getChannelsByApp();
  const apps = Object.keys(byApp).sort();
  const notes = getNotes();
  const events = getEvents().filter(
    (e) => !e.lapId || e.lapId === lapId,
  );
  const failure = getFailureModes()[0];
  const pack = getSessionPack();
  const rates = pack.meta.ratesHz;

  const liveValue = (ch: Channel) => {
    const sample = getSample(ch.id, lapId);
    if (!sample) return null;
    return interpolateAt(sample.series, playheadM);
  };

  return (
    <aside className="flex flex-col gap-3 overflow-auto border-[var(--hairline)] bg-[var(--rail)] p-3 md:border-r">
      <TrackSchematic
        activeSector={activeSector}
        playheadM={playheadM}
        evidence={evidence}
      />

      <div>
        <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Apps · parameters
        </p>
        <p className="mb-2 text-[0.62rem] leading-snug text-[var(--mute)]">
          Multi-rate corpus
          {rates
            ? ` · ${rates.high ?? "—"}/${rates.mid ?? "—"}/${rates.low ?? "—"} Hz`
            : null}
          . Toggle traces for the stage.
        </p>
        <div className="space-y-2.5">
          {apps.map((app) => (
            <div key={app}>
              <p className="mb-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--signal)]">
                {app}
              </p>
              <ul className="space-y-0.5">
                {byApp[app].map((ch) => {
                  const val = liveValue(ch);
                  const plotted = plotChannelIds.includes(ch.id);
                  const active =
                    emphasizeBrake && ch.id === "brake_temp"
                      ? true
                      : plotted;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => onTogglePlot(ch.id)}
                        title={ch.description}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-0.5 py-0.5 text-left font-mono text-[0.68rem] text-[var(--mist)] hover:bg-[var(--signal-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                          active && "text-[var(--chalk)]",
                          plotted && "bg-[var(--signal-dim)]/40",
                        )}
                      >
                        <span
                          className="inline-block h-[3px] w-2.5 shrink-0 rounded-sm"
                          style={{
                            background: COLOR[ch.colorToken] ?? "var(--mist)",
                          }}
                        />
                        <span className="min-w-0 truncate">
                          {ch.displayName ?? ch.name}
                        </span>
                        <span className="ml-auto shrink-0 text-[var(--mute)]">
                          {ch.rateHz}Hz
                        </span>
                        <span className="w-[4.2rem] shrink-0 text-right text-[var(--chalk)]">
                          {val != null ? formatChannelValue(ch, val) : "—"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Notes
        </p>
        <ul className="space-y-1.5">
          {notes.map((n) => (
            <li
              key={n.id}
              className="border-l border-[var(--hairline-strong)] pl-2 text-[0.65rem] leading-snug text-[var(--mist)]"
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-wider text-[var(--mute)]">
                {n.authorRole.replaceAll("_", " ")}
                {n.tags.length ? ` · ${n.tags.join(", ")}` : ""}
              </span>
              <p className="text-[var(--chalk)]">{n.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Events · this lap
        </p>
        <ul className="space-y-1">
          {events.length === 0 && (
            <li className="text-[0.65rem] text-[var(--mute)]">No events</li>
          )}
          {events.map((e) => (
            <li
              key={e.id}
              className="flex gap-2 font-mono text-[0.65rem] text-[var(--mist)]"
            >
              <span
                className={cn(
                  "shrink-0 uppercase",
                  e.priority === "warn" || e.priority === "warning"
                    ? "text-[var(--warn)]"
                    : e.priority === "fault"
                      ? "text-[var(--fault)]"
                      : "text-[var(--mute)]",
                )}
              >
                {e.priority}
              </span>
              <span>
                {Math.round(e.distanceM)}m · {e.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {failure && (
        <div className="border border-[var(--hairline)] bg-[var(--panel)] p-2">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--warn)]">
            Failure mode
          </p>
          <p className="mt-0.5 text-[0.72rem] text-[var(--chalk)]">
            {failure.title}
          </p>
          <p className="mt-1 text-[0.62rem] leading-snug text-[var(--mute)]">
            Hints: {failure.channelHints.join(", ")}
          </p>
        </div>
      )}

      <Timeline activeCiteId={activeCiteId} onSelect={onTimelineCite} />

      <p className="mt-auto pt-2 font-mono text-[0.58rem] text-[var(--mute)]">
        {pack.meta.openf1Subset
          ? "OPENF1 SUBSET"
          : pack.meta.synthetic
            ? "SYNTHETIC DATA"
            : "LIVE"}{" "}
        · {pack.meta.channelCount ?? Object.values(byApp).flat().length} params
        {pack.meta.syntheticOverlayChannels?.length
          ? ` · ${pack.meta.syntheticOverlayChannels.length} overlays`
          : ""}{" "}
        · no SECU
      </p>
    </aside>
  );
}
