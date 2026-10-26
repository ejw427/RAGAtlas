"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatChannelValue,
  getChannel,
  getSample,
  lapDistanceM,
  stageChannels,
} from "@/lib/session";
import { interpolateAt, peakInWindow } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";
import type { CiteTarget } from "@/lib/types";

const COLOR: Record<string, string> = {
  "trace-brake": "var(--trace-brake)",
  "trace-throttle": "var(--trace-throttle)",
  "trace-cyan": "var(--trace-cyan)",
  "trace-amber": "var(--trace-amber)",
  "trace-violet": "var(--trace-violet)",
  "trace-mist": "var(--trace-mist)",
};

export function TelemetryStage({
  lapId,
  compareLapId,
  playheadM,
  onPlayhead,
  evidence,
  activeCite,
  drawKey,
  plotChannelIds,
}: {
  lapId: string;
  compareLapId: string | null;
  playheadM: number;
  onPlayhead: (m: number) => void;
  evidence: { startM: number; endM: number } | null;
  activeCite: CiteTarget | null;
  drawKey: string;
  plotChannelIds: string[];
}) {
  const channels = stageChannels(plotChannelIds);
  const uid = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const lengthM = lapDistanceM();

  useEffect(() => {
    setDrawn(false);
    const t = window.setTimeout(
      () => setDrawn(true),
      prefersReducedMotion() ? 0 : 50,
    );
    return () => window.clearTimeout(t);
  }, [drawKey, plotChannelIds.join("|")]);

  const plots = useMemo(() => {
    return channels.map((ch, idx) => {
      const sample = getSample(ch.id, lapId);
      const compare = compareLapId
        ? getSample(ch.id, compareLapId)
        : undefined;
      return { ch, sample, compare, row: idx };
    });
  }, [channels, lapId, compareLapId]);

  const W = 640;
  const rowH = plots.length > 4 ? 56 : 72;
  const H = rowH * Math.max(plots.length, 1) + 28;
  const padL = 44;
  const padR = 12;
  const plotW = W - padL - padR;

  const xOf = (m: number) => padL + (m / lengthM) * plotW;

  const pathFor = (
    series: { d: number[]; v: number[] },
    y0: number,
    y1: number,
  ) => {
    const vmin = Math.min(...series.v);
    const vmax = Math.max(...series.v);
    const span = vmax - vmin || 1;
    return series.d
      .map((d, i) => {
        const x = xOf(d);
        const y = y1 - ((series.v[i] - vmin) / span) * (y1 - y0 - 8) - 4;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const onPointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const m = Math.max(
      0,
      Math.min(lengthM, ((px - padL) / plotW) * lengthM),
    );
    onPlayhead(m);
  };

  const peakChannelId =
    activeCite?.channelId && getSample(activeCite.channelId, lapId)
      ? activeCite.channelId
      : "brake_temp";
  const peakSample = getSample(peakChannelId, lapId);
  const peak =
    evidence && peakSample
      ? peakInWindow(peakSample.series, evidence.startM, evidence.endM)
      : null;

  const readoutChannel =
    activeCite?.channelId && getSample(activeCite.channelId, lapId)
      ? activeCite.channelId
      : (channels[0]?.id ?? "brake_temp");
  const readoutSample = getSample(readoutChannel, lapId);
  const readoutCh = getChannel(readoutChannel);
  const readoutVal = readoutSample
    ? interpolateAt(readoutSample.series, playheadM)
    : null;

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.68rem] text-[var(--mist)]">
        {channels.map((ch) => (
          <span key={ch.id} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-[3px] w-2.5 rounded-sm"
              style={{ background: COLOR[ch.colorToken] ?? "var(--chalk)" }}
            />
            {ch.displayName ?? ch.name}
            <span className="text-[var(--mute)]">{ch.rateHz}Hz</span>
          </span>
        ))}
        {compareLapId && (
          <span className="text-[var(--mute)]">· compare overlay</span>
        )}
        <span className="ml-auto text-[var(--trace-cyan)]">
          {readoutVal != null && readoutCh
            ? `${formatChannelValue(readoutCh, readoutVal)} @ ${Math.round(playheadM)}m`
            : "—"}
          {peak && evidence && peakChannelId === "brake_temp" && (
            <span className="ml-2 text-[var(--fault)]">
              peak {peak.value.toFixed(0)}°C
            </span>
          )}
        </span>
      </div>

      <div className="relative min-h-[220px] flex-1 border border-[var(--hairline)] bg-[linear-gradient(180deg,rgba(18,24,32,0.6),rgba(11,15,20,0.9))]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full min-h-[220px] w-full cursor-crosshair"
          role="img"
          aria-label={
            activeCite
              ? `Telemetry stage. ${activeCite.label}. ${activeCite.summary}`
              : `Telemetry stage. Playhead at ${Math.round(playheadM)} meters.`
          }
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            onPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) onPointer(e.clientX);
          }}
        >
          {evidence && (
            <rect
              x={xOf(evidence.startM)}
              y={0}
              width={Math.max(2, xOf(evidence.endM) - xOf(evidence.startM))}
              height={H}
              className="fill-[rgba(58,215,255,0.12)] stroke-[var(--scrub)]"
              strokeWidth={1}
            />
          )}

          {plots.map(({ ch, sample, compare }, idx) => {
            const y0 = 8 + idx * rowH;
            const y1 = y0 + rowH - 6;
            if (!sample) return null;
            const stroke = COLOR[ch.colorToken] ?? "var(--chalk)";
            const dash = ch.id === "throttle" ? "6 4" : undefined;
            return (
              <g key={ch.id}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y1}
                  y2={y1}
                  stroke="var(--hairline)"
                />
                <text
                  x={4}
                  y={y0 + 12}
                  fill="var(--mute)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {ch.displayName ?? ch.name}
                </text>
                {compare && (
                  <path
                    d={pathFor(compare.series, y0, y1)}
                    fill="none"
                    stroke="var(--mute)"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.7"
                  />
                )}
                <path
                  key={`${uid}-${drawKey}-${ch.id}`}
                  d={pathFor(sample.series, y0, y1)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={ch.id === "brake_temp" ? 2 : 1.5}
                  strokeDasharray={drawn ? dash : undefined}
                  className={!drawn ? "trace-draw" : undefined}
                />
              </g>
            );
          })}

          <line
            x1={xOf(playheadM)}
            x2={xOf(playheadM)}
            y1={0}
            y2={H}
            className="playhead-ease stroke-[var(--signal)]"
            strokeWidth={1.5}
            style={{ transition: "x 0.55s var(--ease)" }}
          />
          <text
            x={xOf(playheadM) + 4}
            y={12}
            fill="var(--signal)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {Math.round(playheadM)} m
          </text>
        </svg>
      </div>
    </div>
  );
}
