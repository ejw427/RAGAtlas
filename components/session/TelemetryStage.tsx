"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatChannelValue,
  getChannel,
  getLapById,
  getSample,
  getSessionPack,
  isOverlayChannel,
  lapDistanceM,
  sourceBadge,
  stageChannels,
} from "@/lib/session";
import { interpolateAt, peakInWindow, cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";
import type { Channel, CiteTarget } from "@/lib/types";

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

function strokeFor(ch: Channel) {
  return COLOR[ch.colorToken] ?? "var(--chalk)";
}

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
  const shellRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [shellH, setShellH] = useState(0);
  const lengthM = lapDistanceM();
  const pack = getSessionPack();
  const lap = getLapById(lapId);
  const sectors = pack.sectors;

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      setShellH(h);
    });
    ro.observe(el);
    setShellH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const traps = useMemo(() => {
    const open = lap?.openf1;
    if (!open) return [];
    const s1 = sectors.find((s) => s.label === "S1");
    const s2 = sectors.find((s) => s.label === "S2");
    const out: { id: string; m: number; label: string; speed?: number }[] = [];
    if (open.i1_speed != null && s1) {
      out.push({
        id: "i1",
        m: Math.max(0, s1.endM - 40),
        label: "I1",
        speed: open.i1_speed,
      });
    }
    if (open.i2_speed != null && s2) {
      out.push({
        id: "i2",
        m: Math.max(0, s2.endM - 40),
        label: "I2",
        speed: open.i2_speed,
      });
    }
    if (open.st_speed != null) {
      const speed = getSample("speed", lapId);
      let stM = Math.round(lengthM * 0.59);
      if (speed) {
        let best = 0;
        for (let i = 1; i < speed.series.v.length; i++) {
          if (speed.series.v[i] > speed.series.v[best]) best = i;
        }
        stM = Math.round(speed.series.d[best]);
      }
      out.push({ id: "st", m: stM, label: "ST", speed: open.st_speed });
    }
    return out;
  }, [lap?.openf1, lapId, lengthM, sectors]);

  useEffect(() => {
    setDrawn(false);
    const t = window.setTimeout(
      () => setDrawn(true),
      prefersReducedMotion() ? 0 : 40,
    );
    return () => window.clearTimeout(t);
  }, [drawKey, plotChannelIds.join("|")]);

  const plots = useMemo(() => {
    return channels.map((ch, idx) => {
      const sample = getSample(ch.id, lapId);
      const compare = compareLapId
        ? getSample(ch.id, compareLapId)
        : undefined;
      const live = sample ? interpolateAt(sample.series, playheadM) : null;
      return { ch, sample, compare, row: idx, live };
    });
  }, [channels, lapId, compareLapId, playheadM]);

  const n = Math.max(plots.length, 1);
  const axisH = 28;
  const minRow = n >= 12 ? 38 : n >= 8 ? 44 : 52;
  const fitted = shellH > 0 ? Math.floor((shellH - axisH - 4) / n) : minRow;
  const rowH = Math.max(minRow, fitted);
  const W = 960;
  const H = axisH + rowH * n + 4;
  const padL = 68;
  const padR = 78;
  const plotW = W - padL - padR;
  const plotTop = axisH;
  const fillsShell = shellH > 0 && H <= shellH + 1;

  const xOf = (m: number) => padL + (m / lengthM) * plotW;

  const pathFor = (
    series: { d: number[]; v: number[] },
    y0: number,
    y1: number,
  ) => {
    const vmin = Math.min(...series.v);
    const vmax = Math.max(...series.v);
    const span = vmax - vmin || 1;
    const padY = 5;
    return series.d
      .map((d, i) => {
        const x = xOf(d);
        const y =
          y1 - padY - ((series.v[i] - vmin) / span) * (y1 - y0 - padY * 2);
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

  const focusChannelId =
    activeCite?.channelId && getSample(activeCite.channelId, lapId)
      ? activeCite.channelId
      : hoverId;
  const peakChannelId =
    activeCite?.channelId && getSample(activeCite.channelId, lapId)
      ? activeCite.channelId
      : "brake_temp";
  const peakSample = getSample(peakChannelId, lapId);
  const peak =
    evidence && peakSample
      ? peakInWindow(peakSample.series, evidence.startM, evidence.endM)
      : null;
  const peakCh = getChannel(peakChannelId);

  const tickMs = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * lengthM));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-2 px-0.5">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-xl font-semibold tracking-tight text-[var(--chalk)] tabular-nums">
            {Math.round(playheadM)}
            <span className="ml-1 font-mono text-xs font-normal text-[var(--mute)]">
              m
            </span>
          </p>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            {channels.length} channels · distance
            {compareLapId ? " · compare" : ""}
            {" · "}
            <span className="text-[var(--mute)]">OF1</span>
            {" / "}
            <span className="text-[var(--trace-amber)]">OVL</span>
          </p>
          {activeCite && (
            <span className="font-mono text-[0.68rem] text-[var(--signal)]">
              {activeCite.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.6rem] text-[var(--mist)]">
          {sectors.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-[var(--signal)]/80" />
              {s.label}
              <span className="text-[var(--mute)]">
                {Math.round(s.startM)}–{Math.round(s.endM)}
              </span>
            </span>
          ))}
          {peak && evidence && activeCite?.channelId === peakChannelId && peakCh && (
            <span
              className={cn(
                "rounded-sm px-1.5 py-0.5",
                peakChannelId === "brake_temp"
                  ? "bg-[var(--fault)]/15 text-[var(--fault)]"
                  : "bg-[var(--signal-dim)] text-[var(--signal)]",
              )}
            >
              peak {formatChannelValue(peakCh, peak.value)}
            </span>
          )}
        </div>
      </div>

      <div
        ref={shellRef}
        className="stage-shell relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="stage-grid pointer-events-none absolute inset-0 opacity-50" />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio={fillsShell ? "none" : "xMidYMin meet"}
          className="relative z-[1] block w-full cursor-crosshair"
          style={
            fillsShell
              ? { height: "100%", minHeight: H }
              : { height: H, minHeight: H }
          }
          role="img"
          aria-label={
            activeCite
              ? `Telemetry stage. ${activeCite.label}. ${activeCite.summary}`
              : `Telemetry stage. Playhead at ${Math.round(playheadM)} meters. ${channels.length} channels.`
          }
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            onPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) onPointer(e.clientX);
          }}
          onPointerLeave={() => setHoverId(null)}
        >
          <defs>
            <linearGradient id={`${uid}-band`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(58,215,255,0.18)" />
              <stop offset="100%" stopColor="rgba(58,215,255,0.05)" />
            </linearGradient>
            <linearGradient id={`${uid}-play`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(198,255,74,0.55)" />
              <stop offset="100%" stopColor="rgba(198,255,74,0.05)" />
            </linearGradient>
          </defs>

          {/* Axis */}
          <rect
            x={0}
            y={0}
            width={W}
            height={axisH}
            fill="rgba(11,15,20,0.85)"
          />
          {sectors.map((s, i) => (
            <g key={s.id}>
              <rect
                x={xOf(s.startM)}
                y={plotTop}
                width={Math.max(1, xOf(s.endM) - xOf(s.startM))}
                height={H - plotTop}
                fill={
                  i % 2 === 0
                    ? "rgba(198,255,74,0.03)"
                    : "rgba(58,215,255,0.025)"
                }
              />
              <text
                x={(xOf(s.startM) + xOf(s.endM)) / 2}
                y={18}
                textAnchor="middle"
                fill="var(--mute)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
              >
                {s.label}
              </text>
            </g>
          ))}
          {tickMs.map((m) => (
            <g key={m}>
              <line
                x1={xOf(m)}
                x2={xOf(m)}
                y1={axisH - 5}
                y2={axisH}
                stroke="var(--hairline-strong)"
              />
              <text
                x={xOf(m)}
                y={12}
                textAnchor={m === 0 ? "start" : m === lengthM ? "end" : "middle"}
                fill="var(--mute)"
                fontSize="8"
                fontFamily="var(--font-mono)"
              >
                {m}
              </text>
            </g>
          ))}

          {evidence && (
            <rect
              x={xOf(evidence.startM)}
              y={plotTop}
              width={Math.max(2, xOf(evidence.endM) - xOf(evidence.startM))}
              height={H - plotTop}
              fill={`url(#${uid}-band)`}
              stroke="var(--scrub)"
              strokeWidth={1}
            />
          )}

          {traps.map((t) => (
            <g key={t.id}>
              <line
                x1={xOf(t.m)}
                x2={xOf(t.m)}
                y1={plotTop}
                y2={H}
                stroke="rgba(232,238,245,0.14)"
                strokeDasharray="3 4"
              />
              <rect
                x={xOf(t.m) + 2}
                y={H - 16}
                width={36}
                height={12}
                rx={2}
                fill="rgba(11,15,20,0.85)"
              />
              <text
                x={xOf(t.m) + 5}
                y={H - 7}
                fill="var(--mist)"
                fontSize="8"
                fontFamily="var(--font-mono)"
              >
                {t.label}
                {t.speed != null ? ` ${t.speed}` : ""}
              </text>
            </g>
          ))}

          {plots.map(({ ch, sample, compare, live }, idx) => {
            const y0 = plotTop + idx * rowH;
            const y1 = y0 + rowH;
            if (!sample) return null;
            const stroke = strokeFor(ch);
            const focused = focusChannelId === ch.id;
            const dimmed = Boolean(focusChannelId) && !focused;
            const dash = ch.id === "throttle" || ch.id === "drs" ? "5 4" : undefined;
            return (
              <g
                key={ch.id}
                onPointerEnter={() => setHoverId(ch.id)}
                opacity={dimmed ? 0.28 : 1}
                style={{ transition: "opacity 120ms var(--ease)" }}
              >
                <rect
                  x={0}
                  y={y0}
                  width={W}
                  height={rowH}
                  fill={
                    focused
                      ? "rgba(198,255,74,0.06)"
                      : idx % 2 === 0
                        ? "rgba(255,255,255,0.015)"
                        : "transparent"
                  }
                />
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y1 - 0.5}
                  y2={y1 - 0.5}
                  stroke="var(--hairline)"
                />
                <rect
                  x={0}
                  y={y0 + 8}
                  width={3}
                  height={rowH - 16}
                  rx={1}
                  fill={stroke}
                  opacity={focused ? 1 : 0.85}
                  strokeDasharray={isOverlayChannel(ch) ? "2 2" : undefined}
                  stroke={isOverlayChannel(ch) ? stroke : undefined}
                  strokeWidth={isOverlayChannel(ch) ? 1 : 0}
                />
                <text
                  x={10}
                  y={y0 + rowH / 2 + 3}
                  fill={focused ? "var(--chalk)" : "var(--mist)"}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight={focused ? 600 : 400}
                >
                  {ch.shortName ?? ch.name}
                </text>
                <text
                  x={padL - 6}
                  y={y0 + rowH / 2 + 3}
                  textAnchor="end"
                  fill={
                    isOverlayChannel(ch) ? "var(--trace-amber)" : "var(--mute)"
                  }
                  fontSize="7"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.04em"
                >
                  {sourceBadge(ch)}
                </text>
                {compare && (
                  <path
                    d={pathFor(compare.series, y0, y1)}
                    fill="none"
                    stroke="var(--mute)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.55"
                  />
                )}
                <path
                  key={`${uid}-${drawKey}-${ch.id}`}
                  d={pathFor(sample.series, y0, y1)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={focused ? 2.4 : rowH >= 44 ? 1.7 : 1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={drawn ? dash : undefined}
                  opacity={dimmed ? 0.9 : 1}
                  className={!drawn ? "trace-draw" : undefined}
                  style={
                    !drawn
                      ? { animationDelay: `${Math.min(idx, 12) * 28}ms` }
                      : undefined
                  }
                />
                <text
                  x={W - 10}
                  y={y0 + rowH / 2 + 3}
                  textAnchor="end"
                  fill={focused ? stroke : "var(--chalk)"}
                  fontSize={rowH >= 44 ? 10 : 9}
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                >
                  {live != null ? formatChannelValue(ch, live) : "—"}
                </text>
              </g>
            );
          })}

          {/* Playhead */}
          <rect
            x={xOf(playheadM) - 0.75}
            y={plotTop}
            width={1.5}
            height={H - plotTop}
            fill={`url(#${uid}-play)`}
            className="playhead-ease"
          />
          <line
            x1={xOf(playheadM)}
            x2={xOf(playheadM)}
            y1={plotTop}
            y2={H}
            className="playhead-ease"
            stroke="var(--signal)"
            strokeWidth={1.25}
          />
          <polygon
            points={`${xOf(playheadM)},${plotTop - 1} ${xOf(playheadM) - 5},${plotTop - 8} ${xOf(playheadM) + 5},${plotTop - 8}`}
            fill="var(--signal)"
            className="playhead-ease"
          />
        </svg>
      </div>
    </div>
  );
}
