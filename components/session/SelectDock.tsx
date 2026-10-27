"use client";

import { useState } from "react";
import {
  formatChannelValue,
  getChannelsByApp,
  getEvents,
  getFailureModes,
  getNotes,
  getSample,
  getSessionPack,
  isOverlayChannel,
  sourceBadge,
} from "@/lib/session";
import { channelPresets } from "@/lib/identity";
import { interpolateAt, formatLapTime, cn } from "@/lib/utils";
import { Timeline } from "@/components/session/Timeline";
import { ProvenanceStrip } from "@/components/session/ProvenanceStrip";
import { Button } from "@/components/ui/button";
import type { Channel, Lap } from "@/lib/types";

const COLOR: Record<string, string> = {
  "trace-brake": "var(--trace-brake)",
  "trace-throttle": "var(--trace-throttle)",
  "trace-cyan": "var(--trace-cyan)",
  "trace-amber": "var(--trace-amber)",
  "trace-violet": "var(--trace-violet)",
  "trace-mist": "var(--trace-mist)",
  "trace-front": "var(--trace-front)",
  "trace-pressure": "var(--trace-pressure)",
  "trace-tyre": "var(--trace-tyre)",
  "trace-steer": "var(--trace-steer)",
  "trace-glong": "var(--trace-glong)",
  "trace-fuel": "var(--trace-fuel)",
};

type Tab = "channels" | "laps" | "notes";

export function SelectDock({
  lapId,
  playheadM,
  activeCiteId,
  onTimelineCite,
  plotChannelIds,
  onTogglePlot,
  onSetPlots,
  emphasizeBrake,
  driverLaps,
  lapNumber,
  onSelectLap,
  onAsk,
}: {
  lapId: string;
  playheadM: number;
  activeCiteId: string | null;
  onTimelineCite: (citeId: string) => void;
  plotChannelIds: string[];
  onTogglePlot: (channelId: string) => void;
  onSetPlots: (ids: string[]) => void;
  emphasizeBrake?: boolean;
  driverLaps: Lap[];
  lapNumber: number;
  onSelectLap: (n: number) => void;
  onAsk: () => void;
}) {
  const [tab, setTab] = useState<Tab>("channels");
  const byApp = getChannelsByApp();
  const apps = Object.keys(byApp).sort();
  const notes = getNotes();
  const events = getEvents().filter((e) => !e.lapId || e.lapId === lapId);
  const failure = getFailureModes()[0];
  const pack = getSessionPack();
  const presets = channelPresets();

  const liveValue = (ch: Channel) => {
    const sample = getSample(ch.id, lapId);
    if (!sample) return null;
    return interpolateAt(sample.series, playheadM);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col border-[var(--hairline)] bg-[var(--rail)] md:border-l">
      <div className="flex shrink-0 border-b border-[var(--hairline)]">
        {(["channels", "laps", "notes"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-2 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--mute)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              tab === t &&
                "bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2.5">
        {tab === "channels" && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1">
              {Object.entries(presets).map(([name, ids]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSetPlots(ids)}
                  className="min-h-6 border border-[var(--hairline)] px-1.5 font-mono text-[0.55rem] text-[var(--mist)] hover:border-[var(--signal)]/40 hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="font-mono text-[0.55rem] text-[var(--mute)]">
              {plotChannelIds.length}/
              {Object.values(byApp).flat().length} on stage
            </p>
            {apps.map((app) => (
              <div key={app}>
                <p className="mb-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--signal)]">
                  {app}
                </p>
                <ul className="space-y-px">
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
                            "flex w-full items-center gap-1.5 rounded-sm px-0.5 py-px text-left font-mono text-[0.62rem] text-[var(--mist)] hover:bg-[var(--signal-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                            active && "text-[var(--chalk)]",
                            plotted && "bg-[var(--signal-dim)]/35",
                          )}
                        >
                          <span
                            className="inline-block h-[3px] w-2 shrink-0 rounded-sm"
                            style={{
                              background: COLOR[ch.colorToken] ?? "var(--mist)",
                            }}
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {ch.shortName ?? ch.displayName ?? ch.name}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 font-mono text-[0.5rem] uppercase tracking-wider",
                              isOverlayChannel(ch)
                                ? "text-[var(--trace-amber)]"
                                : "text-[var(--mute)]",
                            )}
                          >
                            {sourceBadge(ch)}
                          </span>
                          <span className="w-[3.6rem] shrink-0 text-right tabular-nums text-[var(--chalk)]">
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
        )}

        {tab === "laps" && (
          <ul className="space-y-1">
            {driverLaps.map((l) => {
              const compound =
                l.tags?.find((t) =>
                  ["soft", "hard", "medium", "intermediate", "wet"].includes(t),
                ) ?? "—";
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLap(l.number)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 border border-[var(--hairline)] px-2 py-1.5 text-left font-mono text-[0.68rem] text-[var(--mist)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
                      l.number === lapNumber &&
                        "border-[var(--signal)]/40 bg-[var(--signal-dim)] text-[var(--signal)]",
                    )}
                  >
                    <span>
                      L{l.number}{" "}
                      <span className="uppercase text-[var(--mute)]">
                        {compound}
                      </span>
                    </span>
                    <span className="tabular-nums text-[var(--chalk)]">
                      {formatLapTime(l.timeMs)}
                    </span>
                  </button>
                  {l.tags && l.tags.length > 0 && (
                    <p className="mt-0.5 px-1 font-mono text-[0.5rem] text-[var(--mute)]">
                      {l.tags.join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {tab === "notes" && (
          <div className="space-y-3">
            <ProvenanceStrip />
            {failure && (
              <div className="border border-[var(--warn)]/35 bg-[var(--panel)] p-2">
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--warn)]">
                  Failure mode · teach
                </p>
                <p className="mt-0.5 text-[0.72rem] font-medium text-[var(--chalk)]">
                  {failure.title}
                </p>
                <p className="mt-1 text-[0.6rem] leading-snug text-[var(--mist)]">
                  {failure.symptoms[0]}
                </p>
              </div>
            )}
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
                    className="font-mono text-[0.65rem] text-[var(--mist)]"
                  >
                    {Math.round(e.distanceM)}m · {e.text}
                  </li>
                ))}
              </ul>
            </div>
            <Timeline activeCiteId={activeCiteId} onSelect={onTimelineCite} />
            <p className="font-mono text-[0.58rem] text-[var(--mute)]">
              {pack.meta.openf1Subset ? "OPENF1 SUBSET" : "SESSION"} · no SECU
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--hairline)] p-2.5">
        <Button type="button" variant="signal" className="w-full" onClick={onAsk}>
          Ask the lap
        </Button>
      </div>
    </aside>
  );
}
