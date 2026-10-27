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
import { speedDeltaSeries } from "@/lib/compare-series";
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
  focusAccent,
  referenceAccent,
  focusLabel,
  referenceLabel,
  onOpenCompare,
  viewWindow = null,
  onViewWindow,
  sectorDeltaMs = null,
}: {
  lapId: string;
  compareLapId: string | null;
  playheadM: number;
  onPlayhead: (m: number) => void;
  evidence: { startM: number; endM: number } | null;
  activeCite: CiteTarget | null;
  drawKey: string;
  plotChannelIds: string[];
  focusAccent?: string;
  referenceAccent?: string;
  focusLabel?: string;
  referenceLabel?: string;
  onOpenCompare?: () => void;
  /** Stretch x-domain to match map zoom / sector. */
  viewWindow?: { startM: number; endM: number } | null;
  /** Bidirectional: Ctrl+wheel on graphs zooms the distance window (and map). */
  onViewWindow?: (window: { startM: number; endM: number } | null) => void;
  /** Focus - Reference sector gaps (ms). Colors the stage green/amber. */
  sectorDeltaMs?: [number, number, number] | null;
}) {
  const channels = stageChannels(plotChannelIds);
  const uid = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shellH, setShellH] = useState(0);
  const lengthM = lapDistanceM();
  const pack = getSessionPack();
  const lap = getLapById(lapId);
  const sectors = pack.sectors;
  const domainStart = viewWindow?.startM ?? 0;
  const domainEnd = viewWindow?.endM ?? lengthM;
  const domainSpan = Math.max(domainEnd - domainStart, 1);

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

  // Ctrl/Meta + wheel on the stage zooms the distance window (keeps map in sync).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !onViewWindow) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      e.stopPropagation();
      const factor = Math.exp(e.deltaY * 0.0016);
      const curStart = viewWindow?.startM ?? 0;
      const curEnd = viewWindow?.endM ?? lengthM;
      const span = Math.max(curEnd - curStart, 80);
      const nextSpan = Math.min(
        lengthM,
        Math.max(lengthM * 0.06, span * factor),
      );
      let start = playheadM - nextSpan / 2;
      let end = playheadM + nextSpan / 2;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > lengthM) {
        start -= end - lengthM;
        end = lengthM;
      }
      start = Math.max(0, start);
      if (nextSpan >= lengthM * 0.92) {
        onViewWindow(null);
        return;
      }
      onViewWindow({ startM: start, endM: end });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [onViewWindow, viewWindow, playheadM, lengthM]);

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

  const speedDelta = useMemo(
    () =>
      compareLapId
        ? speedDeltaSeries(lapId, compareLapId, lengthM, 240)
        : null,
    [compareLapId, lapId, lengthM],
  );

  const speedBand = useMemo(() => {
    if (!compareLapId) return null;
    const a = getSample("speed", lapId);
    const b = getSample("speed", compareLapId);
    if (!a || !b) return null;
    return { focus: a.series, reference: b.series };
  }, [compareLapId, lapId]);

  const showDelta = Boolean(speedDelta);
  const n = Math.max(plots.length + (showDelta ? 1 : 0), 1);
  const axisH = 28;
  // Readable rows; expanded channel gets a hero band so you can scrub detail.
  const baseMin = n >= 12 ? 52 : n >= 8 ? 58 : 68;
  const fitted =
    shellH > 0 ? Math.floor((shellH - axisH - 4) / n) : baseMin;
  const normalRow = Math.max(baseMin, Math.min(fitted, 100));
  const expandRow = Math.max(240, Math.round(normalRow * 2.85));
  const rowHeights = plots.map(({ ch }) =>
    expandedId === ch.id ? expandRow : normalRow,
  );
  const deltaRowH = showDelta ? (expandedId === "__delta" ? expandRow : normalRow) : 0;
  const rowsH =
    rowHeights.reduce((a, b) => a + b, 0) + deltaRowH;
  const W = 960;
  const H = axisH + rowsH + 4;
  const padL = compareLapId ? 124 : 108;
  const padR = compareLapId ? 96 : 78;
  const plotW = W - padL - padR;
  const plotTop = axisH;
  const fillsShell = false; // prefer scroll so 12+ channels stay readable

  const rowTop = (idx: number) =>
    plotTop + rowHeights.slice(0, idx).reduce((a, b) => a + b, 0);

  const xOf = (m: number) =>
    padL + ((m - domainStart) / domainSpan) * plotW;

  const clipSeries = (series: { d: number[]; v: number[] }) => {
    if (!viewWindow) return series;
    const dOut: number[] = [];
    const vOut: number[] = [];
    for (let i = 0; i < series.d.length; i++) {
      if (series.d[i] < domainStart - 1 || series.d[i] > domainEnd + 1) continue;
      dOut.push(series.d[i]);
      vOut.push(series.v[i]);
    }
    if (dOut.length < 2) return series;
    return { d: dOut, v: vOut };
  };

  const pathFor = (
    series: { d: number[]; v: number[] },
    y0: number,
    y1: number,
    range?: { vmin: number; vmax: number },
  ) => {
    const vmin = range?.vmin ?? Math.min(...series.v);
    const vmax = range?.vmax ?? Math.max(...series.v);
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

  /** Gain/loss fill between Focus and Reference on a shared scale. */
  const compareFillPaths = (
    focus: { d: number[]; v: number[] },
    reference: { d: number[]; v: number[] },
    y0: number,
    y1: number,
  ) => {
    const vmin = Math.min(...focus.v, ...reference.v);
    const vmax = Math.max(...focus.v, ...reference.v);
    const span = vmax - vmin || 1;
    const padY = 5;
    const yAt = (v: number) =>
      y1 - padY - ((v - vmin) / span) * (y1 - y0 - padY * 2);
    const n = Math.min(120, focus.d.length, reference.d.length);
    const gain: string[] = [];
    const loss: string[] = [];
    for (let i = 0; i < n - 1; i++) {
      const t0 = i / Math.max(n - 1, 1);
      const t1 = (i + 1) / Math.max(n - 1, 1);
      const m0 = domainStart + t0 * domainSpan;
      const m1 = domainStart + t1 * domainSpan;
      const fa = interpolateAt(focus, m0);
      const fb = interpolateAt(focus, m1);
      const ra = interpolateAt(reference, m0);
      const rb = interpolateAt(reference, m1);
      if (fa == null || fb == null || ra == null || rb == null) continue;
      const poly = `M${xOf(m0).toFixed(1)},${yAt(fa).toFixed(1)} L${xOf(m1).toFixed(1)},${yAt(fb).toFixed(1)} L${xOf(m1).toFixed(1)},${yAt(rb).toFixed(1)} L${xOf(m0).toFixed(1)},${yAt(ra).toFixed(1)} Z`;
      const avg = (fa + fb) / 2 - (ra + rb) / 2;
      if (avg >= 0) gain.push(poly);
      else loss.push(poly);
    }
    return {
      gain,
      loss,
      range: { vmin, vmax },
    };
  };

  /** Area fill for d series above/below zero. */
  const deltaAreaPaths = (
    series: { d: number[]; v: number[] },
    y0: number,
    y1: number,
  ) => {
    const vmin = Math.min(...series.v, 0);
    const vmax = Math.max(...series.v, 0);
    const span = vmax - vmin || 1;
    const padY = 5;
    const yAt = (v: number) =>
      y1 - padY - ((v - vmin) / span) * (y1 - y0 - padY * 2);
    const zeroY = yAt(0);
    const pos: string[] = [];
    const neg: string[] = [];
    const clipped = clipSeries(series);
    for (let i = 0; i < clipped.d.length - 1; i++) {
      const m0 = clipped.d[i];
      const m1 = clipped.d[i + 1];
      const v0 = clipped.v[i];
      const v1 = clipped.v[i + 1];
      const poly = `M${xOf(m0).toFixed(1)},${zeroY.toFixed(1)} L${xOf(m0).toFixed(1)},${yAt(v0).toFixed(1)} L${xOf(m1).toFixed(1)},${yAt(v1).toFixed(1)} L${xOf(m1).toFixed(1)},${zeroY.toFixed(1)} Z`;
      if ((v0 + v1) / 2 >= 0) pos.push(poly);
      else neg.push(poly);
    }
    return { pos, neg, zeroY, range: { vmin, vmax } };
  };

  const onPointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const m = Math.max(
      domainStart,
      Math.min(
        domainEnd,
        domainStart + ((px - padL) / plotW) * domainSpan,
      ),
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

  const tickMs = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    Math.round(domainStart + t * domainSpan),
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
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
            {compareLapId ? " · dual draw" : ""}
            {viewWindow
              ? ` · window ${Math.round(domainStart)}-${Math.round(domainEnd)} m`
              : ""}
            {" · "}
            <span className="text-[var(--mute)]">OF1</span>
            {" / "}
            <span className="text-[var(--trace-amber)]">OVL</span>
            {" · "}
            <span className="text-[var(--mist)]">
              click name to enlarge · Ctrl+wheel zoom
            </span>
          </p>
          {focusLabel && (
            <span className="inline-flex flex-wrap items-center gap-2 font-mono text-[0.62rem] text-[var(--mist)]">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--hairline)] bg-[rgba(5,7,10,0.55)] px-1.5 py-0.5">
                <span
                  className="inline-block h-1 w-5 rounded-full"
                  style={{ background: focusAccent ?? "var(--signal)" }}
                />
                <span
                  className="font-semibold"
                  style={{ color: focusAccent ?? "var(--signal)" }}
                >
                  {focusLabel}
                </span>
              </span>
              {referenceLabel && compareLapId && (
                <>
                  <span className="font-display text-[0.7rem] font-black text-[var(--trace-cyan)]">
                    VS
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--hairline)] bg-[rgba(5,7,10,0.55)] px-1.5 py-0.5">
                    <span
                      className="inline-block h-1 w-5 rounded-full"
                      style={{
                        background: `repeating-linear-gradient(90deg, ${referenceAccent ?? "#6b7788"} 0 3px, transparent 3px 6px)`,
                      }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: referenceAccent ?? "var(--mute)" }}
                    >
                      {referenceLabel}
                    </span>
                  </span>
                </>
              )}
              {compareLapId && (
                <span className="inline-flex items-center gap-2 rounded-sm border border-[var(--hairline)] px-1.5 py-0.5">
                  <span className="inline-flex items-center gap-1 text-[var(--signal)]">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[var(--signal)] shadow-[0_0_8px_rgba(198,255,74,0.8)]" />
                    Focus ahead
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--fault)]">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[var(--fault)] shadow-[0_0_8px_rgba(255,77,94,0.7)]" />
                    behind
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--trace-cyan)]">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[var(--trace-cyan)]" />
                    cyan = playhead
                  </span>
                </span>
              )}
            </span>
          )}
          {activeCite && (
            <span className="font-mono text-[0.68rem] text-[var(--signal)]">
              {activeCite.label}
            </span>
          )}
          {compareLapId && onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="rounded-sm border border-[var(--trace-cyan)]/50 bg-[rgba(58,215,255,0.12)] px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--trace-cyan)] transition hover:bg-[rgba(58,215,255,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Racer detail
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.6rem] text-[var(--mist)]">
          {sectors.map((s, i) => {
            const delta = sectorDeltaMs?.[i];
            const ahead = delta != null && delta <= 0;
            const behind = delta != null && delta > 0;
            return (
              <span
                key={s.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5",
                  ahead && "bg-[var(--signal-dim)] text-[var(--signal)]",
                  behind && "bg-[rgba(255,77,94,0.16)] text-[var(--fault)]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    ahead
                      ? "bg-[var(--signal)]"
                      : behind
                        ? "bg-[var(--fault)]"
                        : "bg-[var(--trace-cyan)]/80",
                  )}
                />
                {s.label}
                {delta != null ? (
                  <span className="font-bold tabular-nums">
                    {delta > 0 ? "+" : "-"}
                    {Math.abs(delta / 1000).toFixed(3)}
                  </span>
                ) : (
                  <span className="text-[var(--mute)]">
                    {Math.round(s.startM)}-{Math.round(s.endM)}
                  </span>
                )}
              </span>
            );
          })}
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
        className={cn(
          "stage-shell panel-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
          compareLapId && "compare-stage-glow",
        )}
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
              <stop offset="0%" stopColor="rgba(58,215,255,0.28)" />
              <stop offset="100%" stopColor="rgba(58,215,255,0.06)" />
            </linearGradient>
            <linearGradient id={`${uid}-play`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(58,215,255,0.7)" />
              <stop offset="100%" stopColor="rgba(198,255,74,0.08)" />
            </linearGradient>
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Axis */}
          <rect
            x={0}
            y={0}
            width={W}
            height={axisH}
            fill="rgba(11,15,20,0.9)"
          />
          {sectors.map((s, i) => {
            const delta = sectorDeltaMs?.[i];
            const ahead = delta != null && delta <= 0;
            const behind = delta != null && delta > 0;
            const fill = compareLapId
              ? ahead
                ? "rgba(198,255,74,0.12)"
                : behind
                  ? "rgba(255,77,94,0.1)"
                  : i % 2 === 0
                    ? "rgba(58,215,255,0.05)"
                    : "rgba(58,215,255,0.03)"
              : i % 2 === 0
                ? "rgba(198,255,74,0.03)"
                : "rgba(58,215,255,0.025)";
            return (
              <g key={s.id}>
                <rect
                  x={xOf(s.startM)}
                  y={plotTop}
                  width={Math.max(1, xOf(s.endM) - xOf(s.startM))}
                  height={H - plotTop}
                  fill={fill}
                />
                <text
                  x={(xOf(s.startM) + xOf(s.endM)) / 2}
                  y={18}
                  textAnchor="middle"
                  fill={
                    ahead
                      ? "var(--signal)"
                      : behind
                        ? "var(--fault)"
                        : "var(--mute)"
                  }
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight={delta != null ? 700 : 400}
                  letterSpacing="0.08em"
                >
                  {s.label}
                  {delta != null
                    ? ` ${delta > 0 ? "+" : "-"}${Math.abs(delta / 1000).toFixed(3)}`
                    : ""}
                </text>
              </g>
            );
          })}
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
            const rowH = rowHeights[idx] ?? normalRow;
            const y0 = rowTop(idx);
            const y1 = y0 + rowH;
            if (!sample) return null;
            const baseStroke = strokeFor(ch);
            const stroke =
              ch.id === "speed" && focusAccent ? focusAccent : baseStroke;
            const compareStroke =
              referenceAccent &&
              referenceAccent.toLowerCase() !== stroke.toLowerCase()
                ? referenceAccent
                : "#F4B942";
            const focused = focusChannelId === ch.id || expandedId === ch.id;
            const dimmed =
              Boolean(focusChannelId || expandedId) &&
              focusChannelId !== ch.id &&
              expandedId !== ch.id;
            const dash = ch.id === "throttle" || ch.id === "drs" ? "5 4" : undefined;
            const isExpanded = expandedId === ch.id;
            const liveRef =
              compare != null ? interpolateAt(compare.series, playheadM) : null;
            const fillBundle =
              compare != null
                ? compareFillPaths(
                    clipSeries(sample.series),
                    clipSeries(compare.series),
                    y0,
                    y1,
                  )
                : null;
            const sharedRange = fillBundle?.range;
            const liveDelta =
              live != null && liveRef != null ? live - liveRef : null;
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
                      ? "rgba(198,255,74,0.08)"
                      : liveDelta != null && liveDelta > 0
                        ? "rgba(198,255,74,0.05)"
                        : liveDelta != null && liveDelta < 0
                          ? "rgba(255,77,94,0.05)"
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
                  y={y0 + rowH / 2 - (compare ? 2 : 0)}
                  fill={focused ? "var(--chalk)" : "var(--mist)"}
                  fontSize={isExpanded ? 12 : 10}
                  fontFamily="var(--font-mono)"
                  fontWeight={focused ? 700 : 600}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId((cur) => (cur === ch.id ? null : ch.id));
                  }}
                >
                  {ch.displayName ?? ch.name}
                  {isExpanded ? " · shrink" : " · enlarge"}
                </text>
                <text
                  x={10}
                  y={y0 + rowH / 2 + 11}
                  fill={
                    isOverlayChannel(ch) ? "var(--trace-amber)" : "var(--mute)"
                  }
                  fontSize="7"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.06em"
                >
                  {sourceBadge(ch)}
                  {ch.unit ? ` · ${ch.unit}` : ""}
                  {compare ? " · dual" : ""}
                </text>
                {fillBundle &&
                  fillBundle.gain.map((p, gi) => (
                    <path
                      key={`g-${gi}`}
                      d={p}
                      fill="rgba(198,255,74,0.52)"
                      stroke="none"
                    />
                  ))}
                {fillBundle &&
                  fillBundle.loss.map((p, li) => (
                    <path
                      key={`l-${li}`}
                      d={p}
                      fill="rgba(255,77,94,0.46)"
                      stroke="none"
                    />
                  ))}
                {compare && (
                  <path
                    d={pathFor(clipSeries(compare.series), y0, y1, sharedRange)}
                    fill="none"
                    stroke={compareStroke}
                    strokeWidth={isExpanded ? 3.2 : 2.6}
                    strokeDasharray="7 4"
                    opacity="0.98"
                    filter={`url(#${uid}-glow)`}
                  />
                )}
                <path
                  key={`${uid}-${drawKey}-${ch.id}-${domainStart}-${domainEnd}`}
                  d={pathFor(clipSeries(sample.series), y0, y1, sharedRange)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={
                    isExpanded ? 3.4 : focused || compare ? 2.8 : rowH >= 54 ? 2.5 : 2.2
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={drawn ? dash : undefined}
                  opacity={dimmed ? 0.9 : 1}
                  filter={compare ? `url(#${uid}-glow)` : undefined}
                  className={!drawn ? "trace-draw" : undefined}
                  style={
                    !drawn
                      ? { animationDelay: `${Math.min(idx, 12) * 28}ms` }
                      : undefined
                  }
                />
                {compare && liveRef != null ? (
                  <g>
                    <text
                      x={W - 10}
                      y={y0 + rowH / 2 - 8}
                      textAnchor="end"
                      fill={stroke}
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                    >
                      {live != null ? formatChannelValue(ch, live) : "-"}
                    </text>
                    <text
                      x={W - 10}
                      y={y0 + rowH / 2 + 3}
                      textAnchor="end"
                      fill={compareStroke}
                      fontSize="8"
                      fontFamily="var(--font-mono)"
                      fontWeight={600}
                    >
                      {formatChannelValue(ch, liveRef)}
                    </text>
                    {liveDelta != null && (
                      <text
                        x={W - 10}
                        y={y0 + rowH / 2 + 14}
                        textAnchor="end"
                        fill={
                          liveDelta >= 0 ? "var(--signal)" : "var(--fault)"
                        }
                        fontSize="8"
                        fontFamily="var(--font-mono)"
                        fontWeight={700}
                      >
                        d{liveDelta >= 0 ? "+" : ""}
                        {Math.abs(liveDelta) >= 10
                          ? liveDelta.toFixed(0)
                          : liveDelta.toFixed(1)}
                      </text>
                    )}
                  </g>
                ) : (
                  <text
                    x={W - 10}
                    y={y0 + rowH / 2 + 3}
                    textAnchor="end"
                    fill={focused ? stroke : "var(--chalk)"}
                    fontSize={rowH >= 44 ? 10 : 9}
                    fontFamily="var(--font-mono)"
                    fontWeight={600}
                  >
                    {live != null ? formatChannelValue(ch, live) : "-"}
                  </text>
                )}
              </g>
            );
          })}

          {speedDelta &&
            (() => {
              const rowH = deltaRowH || normalRow;
              const y0 = rowTop(plots.length);
              const y1 = y0 + rowH;
              const live = interpolateAt(speedDelta, playheadM);
              const areas = deltaAreaPaths(speedDelta, y0, y1);
              return (
                <g
                  key="delta-speed"
                  onClick={() =>
                    setExpandedId((cur) =>
                      cur === "__delta" ? null : "__delta",
                    )
                  }
                  className="cursor-pointer"
                >
                  <rect
                    x={0}
                    y={y0}
                    width={W}
                    height={rowH}
                    fill="rgba(58,215,255,0.08)"
                  />
                  <line
                    x1={padL}
                    x2={W - padR}
                    y1={y1 - 0.5}
                    y2={y1 - 0.5}
                    stroke="var(--hairline)"
                  />
                  {areas.pos.map((p, i) => (
                    <path
                      key={`dp-${i}`}
                      d={p}
                      fill="rgba(198,255,74,0.45)"
                      stroke="none"
                    />
                  ))}
                  {areas.neg.map((p, i) => (
                    <path
                      key={`dn-${i}`}
                      d={p}
                      fill="rgba(255,77,94,0.4)"
                      stroke="none"
                    />
                  ))}
                  <line
                    x1={padL}
                    x2={W - padR}
                    y1={areas.zeroY}
                    y2={areas.zeroY}
                    stroke="rgba(232,238,245,0.35)"
                    strokeWidth="1.25"
                  />
                  <text
                    x={10}
                    y={y0 + rowH / 2 + 3}
                    fill="var(--trace-cyan)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                  >
                    DeltaSpd
                    {expandedId === "__delta" ? " · shrink" : " · enlarge"}
                  </text>
                  <text
                    x={padL - 6}
                    y={y0 + rowH / 2 + 3}
                    textAnchor="end"
                    fill="var(--mute)"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                  >
                    CMP
                  </text>
                  <path
                    d={pathFor(clipSeries(speedDelta), y0, y1, areas.range)}
                    fill="none"
                    stroke="var(--chalk)"
                    strokeWidth={expandedId === "__delta" ? 3.2 : 2.4}
                    strokeLinecap="round"
                    filter={`url(#${uid}-glow)`}
                  />
                  <text
                    x={W - 10}
                    y={y0 + rowH / 2 + 3}
                    textAnchor="end"
                    fill={
                      live != null && live < 0
                        ? "var(--fault)"
                        : "var(--signal)"
                    }
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight={800}
                  >
                    {live != null
                      ? `${live >= 0 ? "+" : ""}${live.toFixed(1)} km/h`
                      : "-"}
                  </text>
                </g>
              );
            })()}

          {/* Playhead */}
          <rect
            x={xOf(playheadM) - (compareLapId ? 4 : 0.75)}
            y={plotTop}
            width={compareLapId ? 8 : 1.5}
            height={H - plotTop}
            fill={`url(#${uid}-play)`}
            opacity={compareLapId ? 0.55 : 1}
            className="playhead-ease"
          />
          <line
            x1={xOf(playheadM)}
            x2={xOf(playheadM)}
            y1={plotTop}
            y2={H}
            className="playhead-ease"
            stroke={compareLapId ? "var(--trace-cyan)" : "var(--signal)"}
            strokeWidth={compareLapId ? 2.25 : 1.25}
            filter={compareLapId ? `url(#${uid}-glow)` : undefined}
          />
          <polygon
            points={`${xOf(playheadM)},${plotTop - 1} ${xOf(playheadM) - 6},${plotTop - 9} ${xOf(playheadM) + 6},${plotTop - 9}`}
            fill={compareLapId ? "var(--trace-cyan)" : "var(--signal)"}
            className="playhead-ease"
          />
        </svg>
      </div>
    </div>
  );
}
