"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CarMarker } from "@/components/identity/CarMarker";
import { ElevationStrip } from "@/components/session/ElevationStrip";
import { elevationAt, gradePctAt } from "@/lib/cota-elevation";
import {
  formatChannelValue,
  getChannel,
  getSample,
  getSessionPack,
  getTrackPackage,
} from "@/lib/session";
import { interpolateAt, cn } from "@/lib/utils";

const LANDMARKS = [
  { id: "sf", label: "S/F", m: 0, hint: "Start / finish" },
  { id: "t1", label: "T1", m: 420, hint: "Uphill crest" },
  { id: "esses", label: "Esses", m: 980, hint: "T3-T6 rhythm" },
  { id: "s1", label: "S1", m: 1483, hint: "Sector split" },
  { id: "t11", label: "T11", m: 2600, hint: "Hairpin" },
  { id: "s2", label: "S2", m: 3672, hint: "Into stadium" },
  { id: "stadium", label: "Stadium", m: 4100, hint: "T12-T15" },
  { id: "t19", label: "T19", m: 5100, hint: "Track limits" },
] as const;

const MIN_ZOOM_FRAC = 0.06;
const WHEEL_ZOOM_SENS = 0.0014;

type ViewBox = { x: number; y: number; w: number; h: number };
type DistWindow = { startM: number; endM: number };

function pointAt(
  d: number[],
  x: number[],
  y: number[],
  distanceM: number,
): { cx: number; cy: number; angle: number } {
  if (!d.length) return { cx: 0, cy: 0, angle: 0 };
  let lo = 0;
  for (let i = 0; i < d.length; i++) {
    if (d[i] <= distanceM) lo = i;
  }
  const hi = Math.min(lo + 1, d.length - 1);
  const t = d[hi] === d[lo] ? 0 : (distanceM - d[lo]) / (d[hi] - d[lo] || 1);
  const cx = x[lo] + (x[hi] - x[lo]) * t;
  const cy = y[lo] + (y[hi] - y[lo]) * t;
  const dx = x[hi] - x[Math.max(0, lo - 1)];
  const dy = y[hi] - y[Math.max(0, lo - 1)];
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { cx, cy, angle };
}

function boundsForMetres(
  d: number[],
  x: number[],
  y: number[],
  startM: number,
  endM: number,
  padRatio = 0.12,
): ViewBox | null {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let hit = 0;
  for (let i = 0; i < d.length; i++) {
    if (d[i] < startM || d[i] > endM) continue;
    hit += 1;
    minX = Math.min(minX, x[i]);
    maxX = Math.max(maxX, x[i]);
    minY = Math.min(minY, y[i]);
    maxY = Math.max(maxY, y[i]);
  }
  if (hit < 2) return null;
  const w = Math.max(maxX - minX, 400);
  const h = Math.max(maxY - minY, 400);
  const padX = w * padRatio + 180;
  const padY = h * padRatio + 180;
  return {
    x: minX - padX,
    y: minY - padY,
    w: w + padX * 2,
    h: h + padY * 2,
  };
}

function metresInBox(
  d: number[],
  x: number[],
  y: number[],
  box: ViewBox,
): DistWindow | null {
  let start = Infinity;
  let end = -Infinity;
  for (let i = 0; i < d.length; i++) {
    if (
      x[i] >= box.x &&
      x[i] <= box.x + box.w &&
      y[i] >= box.y &&
      y[i] <= box.y + box.h
    ) {
      start = Math.min(start, d[i]);
      end = Math.max(end, d[i]);
    }
  }
  if (!Number.isFinite(start) || end <= start) return null;
  return { startM: start, endM: end };
}


export function TrackSchematic({
  activeSector,
  playheadM,
  evidence,
  onPlayhead,
  onSector,
  focusAccent = "var(--signal)",
  referenceAccent,
  focusNumber,
  referenceNumber,
  focusCode,
  referenceCode,
  comparing = false,
  traps,
  sectorDeltaMs,
  gainSectorIndex = null,
  lossSectorIndex = null,
  stage = false,
  expanded = false,
  paintMode = "both",
  channelDelta = null,
  speedDelta = null,
  deltaChannelLabel = "Speed",
  deltaAheadLabel = "Focus higher",
  deltaBehindLabel = "Focus lower",
  onOpenCompare,
  onViewWindow,
  viewWindow: externalWindow,
  onExpand,
  onInspectFocus,
  onInspectReference,
  lapId,
  compareLapId,
}: {
  activeSector: string | null;
  playheadM: number;
  evidence?: { startM: number; endM: number } | null;
  onPlayhead?: (m: number) => void;
  onSector?: (label: string) => void;
  focusAccent?: string;
  referenceAccent?: string;
  focusNumber?: number;
  referenceNumber?: number;
  focusCode?: string;
  referenceCode?: string;
  comparing?: boolean;
  traps?: { id: string; m: number; label: string; speed?: number }[];
  sectorDeltaMs?: [number, number, number] | null;
  gainSectorIndex?: number | null;
  lossSectorIndex?: number | null;
  stage?: boolean;
  /** Full-bleed modal map. */
  expanded?: boolean;
  /** Compare paint stack: green/red delta, sector colors, or clean road. */
  paintMode?: "both" | "delta" | "sector" | "clean";
  /** Focus − Reference series for the active compare channel (map ribbon). */
  channelDelta?: { d: number[]; v: number[] } | null;
  /** @deprecated Prefer channelDelta — kept for callers still passing speed. */
  speedDelta?: { d: number[]; v: number[] } | null;
  deltaChannelLabel?: string;
  deltaAheadLabel?: string;
  deltaBehindLabel?: string;
  onOpenCompare?: () => void;
  /** Fired when map zoom window changes - stretch traces to match. */
  onViewWindow?: (window: DistWindow | null) => void;
  /**
   * Controlled distance window from graphs (Ctrl+wheel) / Fit lap.
   * Keeps the circuit viewbox in lockstep with TelemetryStage.
   */
  viewWindow?: DistWindow | null;
  onExpand?: () => void;
  /** Click Focus car on the map → racer card. */
  onInspectFocus?: () => void;
  /** Click Reference car on the map → racer card. */
  onInspectReference?: () => void;
  /** Focus lap - used for area speed / channel readout. */
  lapId?: string;
  /** Reference lap — enables dual live readouts in the area panel. */
  compareLapId?: string | null;
}) {
  const deltaSeries = channelDelta ?? speedDelta;
  const showDeltaPaint =
    comparing &&
    (paintMode === "both" || paintMode === "delta") &&
    Boolean(deltaSeries);
  const showSectorPaint =
    paintMode === "both" || paintMode === "sector";
  const pack = getSessionPack();
  const trackPkg = getTrackPackage();
  const { x, y, d } = pack.trackXY.series;
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId();
  const [stretchMode, setStretchMode] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [dragBox, setDragBox] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [manualView, setManualView] = useState<ViewBox | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const panLast = useRef<{ sx: number; sy: number } | null>(null);
  const viewRef = useRef<ViewBox | null>(null);

  const fullView = useMemo((): ViewBox => {
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    const pad = stage ? 420 : 160;
    return {
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    };
  }, [x, y, stage]);

  const sectorWindow = useMemo((): DistWindow | null => {
    if (!activeSector || activeSector === "Lap") return null;
    const sec = pack.sectors.find((s) => s.label === activeSector);
    if (!sec) return null;
    return { startM: sec.startM, endM: sec.endM };
  }, [activeSector, pack.sectors]);

  const sectorView = useMemo(() => {
    if (!sectorWindow) return null;
    return boundsForMetres(
      d,
      x,
      y,
      sectorWindow.startM,
      sectorWindow.endM,
      0.18,
    );
  }, [sectorWindow, d, x, y]);

  const view = manualView ?? sectorView ?? fullView;
  const zoomed = manualView != null || sectorView != null;
  viewRef.current = view;

  // Scale decorations to current view so the road reads on a huge COTA viewBox.
  const u = view.w / 55;

  const activeWindow = useMemo((): DistWindow | null => {
    if (manualView) return metresInBox(d, x, y, manualView);
    return sectorWindow;
  }, [manualView, sectorWindow, d, x, y]);

  useEffect(() => {
    if (manualView) return;
    onViewWindow?.(sectorWindow);
  }, [sectorWindow, manualView, onViewWindow]);

  // Graph → map: Ctrl+wheel / Fit lap on the stage drives the circuit view.
  useEffect(() => {
    if (externalWindow === undefined) return;
    if (externalWindow == null) {
      if (manualView != null) {
        setManualView(null);
        setPanMode(false);
      }
      return;
    }
    const cur = manualView
      ? metresInBox(d, x, y, manualView)
      : sectorWindow;
    if (
      cur &&
      Math.abs(cur.startM - externalWindow.startM) < 12 &&
      Math.abs(cur.endM - externalWindow.endM) < 12
    ) {
      return;
    }
    const next = boundsForMetres(
      d,
      x,
      y,
      externalWindow.startM,
      externalWindow.endM,
      0.22,
    );
    setManualView(next);
    setPanMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to external window
  }, [externalWindow?.startM, externalWindow?.endM, externalWindow, d, x, y]);

  const pathD = useMemo(() => {
    if (!x.length) return "";
    let s = `M ${x[0]} ${y[0]}`;
    for (let i = 1; i < x.length; i++) s += ` L ${x[i]} ${y[i]}`;
    return s + " Z";
  }, [x, y]);

  const sectorPaths = useMemo(() => {
    return pack.sectors.map((sec) => {
      const pts: string[] = [];
      for (let i = 0; i < d.length; i++) {
        if (d[i] >= sec.startM && d[i] <= sec.endM) {
          pts.push(
            `${i === 0 || d[i - 1] < sec.startM ? "M" : "L"} ${x[i]} ${y[i]}`,
          );
        }
      }
      return { ...sec, path: pts.join(" ") };
    });
  }, [pack.sectors, d, x, y]);

  const focusCar = useMemo(
    () => pointAt(d, x, y, playheadM),
    [d, x, y, playheadM],
  );
  const referenceCar = useMemo(
    () => (comparing ? pointAt(d, x, y, playheadM) : null),
    [comparing, d, x, y, playheadM],
  );

  const evidenceArc = useMemo(() => {
    if (!evidence) return "";
    const pts: string[] = [];
    for (let i = 0; i < d.length; i++) {
      if (d[i] >= evidence.startM && d[i] <= evidence.endM) {
        pts.push(`${pts.length === 0 ? "M" : "L"} ${x[i]} ${y[i]}`);
      }
    }
    return pts.join(" ");
  }, [evidence, d, x, y]);

  const marks = useMemo(
    () => LANDMARKS.map((lm) => ({ ...lm, ...pointAt(d, x, y, lm.m) })),
    [d, x, y],
  );

  const trapMarks = useMemo(
    () => (traps ?? []).map((t) => ({ ...t, ...pointAt(d, x, y, t.m) })),
    [traps, d, x, y],
  );

  const tower = useMemo(() => pointAt(d, x, y, 180), [d, x, y]);

  const deltaRibbon = useMemo(() => {
    if (!showDeltaPaint || !deltaSeries || deltaSeries.d.length < 2) return [];
    const segs: { path: string; gain: boolean }[] = [];
    const step = Math.max(1, Math.floor(deltaSeries.d.length / 90));
    for (let i = 0; i < deltaSeries.d.length - step; i += step) {
      const m0 = deltaSeries.d[i];
      const m1 = deltaSeries.d[Math.min(i + step, deltaSeries.d.length - 1)];
      const vAvg =
        (deltaSeries.v[i] +
          deltaSeries.v[Math.min(i + step, deltaSeries.v.length - 1)]) /
        2;
      const pts: string[] = [];
      for (let j = 0; j < d.length; j++) {
        if (d[j] >= m0 && d[j] <= m1) {
          pts.push(
            `${pts.length === 0 ? "M" : "L"} ${x[j].toFixed(1)} ${y[j].toFixed(1)}`,
          );
        }
      }
      if (pts.length >= 2) segs.push({ path: pts.join(" "), gain: vAvg >= 0 });
    }
    return segs;
  }, [showDeltaPaint, deltaSeries, d, x, y]);

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  };

  const scrubTo = (clientX: number, clientY: number) => {
    if (!onPlayhead || !d.length) return;
    const local = clientToSvg(clientX, clientY);
    if (!local) return;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - local.x;
      const dy = y[i] - local.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    onPlayhead(d[best]);
  };

  const commitView = (next: ViewBox, opts?: { scrubMid?: boolean }) => {
    // Zoomed out near full frame > reset
    if (next.w >= fullView.w * 0.92 && next.h >= fullView.h * 0.92) {
      setManualView(null);
      setPanMode(false);
      onSector?.("Lap");
      onViewWindow?.(null);
      return;
    }
    const clamped: ViewBox = {
      x: next.x,
      y: next.y,
      w: Math.min(Math.max(next.w, fullView.w * MIN_ZOOM_FRAC), fullView.w),
      h: Math.min(Math.max(next.h, fullView.h * MIN_ZOOM_FRAC), fullView.h),
    };
    setManualView(clamped);
    const win = metresInBox(d, x, y, clamped);
    onViewWindow?.(win);
    if (opts?.scrubMid && win) {
      onPlayhead?.((win.startM + win.endM) / 2);
    }
  };

  const fitLap = () => {
    setManualView(null);
    setStretchMode(false);
    setPanMode(false);
    onSector?.("Lap");
    onViewWindow?.(null);
  };

  const applyStretchBox = (x0: number, y0: number, x1: number, y1: number) => {
    const left = Math.min(x0, x1);
    const top = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    if (w < view.w * 0.04 || h < view.h * 0.04) return;
    commitView({ x: left, y: top, w, h }, { scrubMid: true });
    setStretchMode(false);
    setPanMode(false);
  };

  const zoomAtClient = (clientX: number, clientY: number, factor: number) => {
    const local = clientToSvg(clientX, clientY);
    const cur = viewRef.current ?? view;
    if (!local) {
      // Fallback: zoom about view center
      const cx = cur.x + cur.w / 2;
      const cy = cur.y + cur.h / 2;
      commitView({
        x: cx - (cur.w * factor) / 2,
        y: cy - (cur.h * factor) / 2,
        w: cur.w * factor,
        h: cur.h * factor,
      });
      return;
    }
    commitView({
      x: local.x - (local.x - cur.x) * factor,
      y: local.y - (local.y - cur.y) * factor,
      w: cur.w * factor,
      h: cur.h * factor,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fitLap();
        return;
      }
      if (e.key === " " && zoomed) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        setPanMode((v) => !v);
        setStretchMode(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed, sectorWindow]);

  // Non-passive wheel so we can prevent page scroll while zooming the map.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = Math.exp(e.deltaY * WHEEL_ZOOM_SENS);
      zoomAtClient(e.clientX, e.clientY, factor);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullView.w, fullView.h]);

  const areaInsight = useMemo(() => {
    if (!activeWindow) return null;
    const { startM, endM } = activeWindow;
    const span = endM - startM;
    const marksIn = LANDMARKS.filter(
      (lm) => lm.m >= startM - 40 && lm.m <= endM + 40,
    );
    const sectorsHit = pack.sectors.filter(
      (s) => s.endM > startM && s.startM < endM,
    );
    const speedSample = lapId ? getSample("speed", lapId) : undefined;
    const brakeSample = lapId ? getSample("brake", lapId) : undefined;
    const speedCh = getChannel("speed");
    const brakeCh = getChannel("brake");

    let speedMin: number | null = null;
    let speedMax: number | null = null;
    let speedNow: number | null = null;
    if (speedSample) {
      const spd = speedSample.series;
      speedNow = interpolateAt(spd, playheadM);
      for (let i = 0; i < spd.d.length; i++) {
        const m = spd.d[i];
        if (m < startM || m > endM) continue;
        const v = spd.v[i];
        speedMin = speedMin == null ? v : Math.min(speedMin, v);
        speedMax = speedMax == null ? v : Math.max(speedMax, v);
      }
    }
    let brakePeak: number | null = null;
    if (brakeSample) {
      const brk = brakeSample.series;
      for (let i = 0; i < brk.d.length; i++) {
        const m = brk.d[i];
        if (m < startM || m > endM) continue;
        brakePeak =
          brakePeak == null ? brk.v[i] : Math.max(brakePeak, brk.v[i]);
      }
    }

    let deltaAvg: number | null = null;
    if (deltaSeries && deltaSeries.d.length) {
      let sum = 0;
      let n = 0;
      for (let i = 0; i < deltaSeries.d.length; i++) {
        if (deltaSeries.d[i] < startM || deltaSeries.d[i] > endM) continue;
        sum += deltaSeries.v[i];
        n += 1;
      }
      if (n) deltaAvg = sum / n;
    }

    const z0 = elevationAt(startM);
    const z1 = elevationAt(endM);
    const grade = gradePctAt((startM + endM) / 2, Math.min(80, span / 2));

    return {
      startM,
      endM,
      span,
      marksIn,
      sectorsHit,
      speedMin,
      speedMax,
      speedNow,
      speedCh,
      brakePeak,
      brakeCh,
      deltaAvg,
      z0,
      z1,
      grade,
    };
  }, [activeWindow, lapId, playheadM, pack.sectors, deltaSeries]);

  const sectorColor = (index: number, active: boolean) => {
    if (comparing && sectorDeltaMs) {
      const delta = sectorDeltaMs[index];
      // Always paint gain/loss - Lap view and sector focus both read green/red.
      if (delta < -5) return "var(--signal)";
      if (delta > 5) return "var(--fault)";
      if (active || activeSector === "Lap") return "var(--trace-cyan)";
      return "rgba(154,167,184,0.55)";
    }
    if (active || activeSector === "Lap") return focusAccent;
    return "rgba(154,167,184,0.55)";
  };

  // Clear manual zoom when user picks Lap; keep when picking sector (sectorView takes over after clear)
  useEffect(() => {
    if (activeSector && activeSector !== "Lap") {
      setManualView(null);
    }
  }, [activeSector]);

  return (
    <div
      className={cn(
        "circuit-stage relative flex flex-col overflow-hidden rounded-md border border-[var(--hairline-strong)]",
        stage ? "h-full min-h-[280px]" : "p-2",
        expanded && "min-h-0 border-0",
      )}
    >
      <div className="circuit-stage-bg pointer-events-none absolute inset-0" />
      {stage && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: "url(/cota-tower-dusk.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 28%",
            maskImage:
              "radial-gradient(75% 85% at 72% 35%, black 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative z-[2] flex shrink-0 items-center justify-between gap-2 px-2.5 pt-1.5">
        <div className="min-w-0">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--mist)]">
            COTA · Austin
            {zoomed ? " · stretched" : ""}
            {activeWindow
              ? ` · ${Math.round(activeWindow.startM)}-${Math.round(activeWindow.endM)} m`
              : ""}
          </p>
          <p className="truncate font-mono text-[0.5rem] text-[var(--mute)]">
            <span style={{ color: focusAccent }}>
              Focus {focusCode ?? focusNumber ?? "—"}
            </span>
            {comparing && (
              <>
                {" · "}
                <span style={{ color: referenceAccent ?? "var(--mute)" }}>
                  Ref {referenceCode ?? referenceNumber ?? "—"}
                </span>
              </>
            )}
            {" · "}
            {stretchMode
              ? "box stretch"
              : panMode
                ? "pan"
                : "wheel zoom · Shift+drag section · click car"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setStretchMode((v) => !v);
              setPanMode(false);
            }}
            className={cn(
              "rounded-sm border px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              stretchMode
                ? "border-[var(--signal)] bg-[var(--signal)] text-[var(--void)]"
                : "border-[var(--hairline-strong)] text-[var(--mist)] hover:border-[var(--signal)]/50 hover:text-[var(--signal)]",
            )}
          >
            Stretch
          </button>
          <button
            type="button"
            onClick={() => {
              setPanMode((v) => !v);
              setStretchMode(false);
            }}
            disabled={!zoomed}
            className={cn(
              "rounded-sm border px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-35",
              panMode
                ? "border-[var(--trace-cyan)] bg-[rgba(58,215,255,0.2)] text-[var(--trace-cyan)]"
                : "border-[var(--hairline-strong)] text-[var(--mist)] hover:border-[var(--trace-cyan)]/50 hover:text-[var(--trace-cyan)]",
            )}
          >
            Pan
          </button>
          <button
            type="button"
            onClick={fitLap}
            className="rounded-sm border border-[var(--hairline-strong)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[var(--mist)] hover:text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Fit lap
          </button>
          {comparing && onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="rounded-sm border border-[var(--signal)]/50 bg-[var(--signal-dim)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[var(--signal)] hover:bg-[var(--signal)] hover:text-[var(--void)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Compare
            </button>
          )}
          {onExpand && !expanded && (
            <button
              type="button"
              onClick={onExpand}
              className="rounded-sm border border-[var(--trace-cyan)]/50 bg-[rgba(58,215,255,0.12)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[var(--trace-cyan)] hover:bg-[rgba(58,215,255,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              Expand map
            </button>
          )}
        </div>
      </div>

      <div className="relative z-[1] min-h-0 flex-1">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className={cn(
            "absolute inset-0 h-full w-full touch-none",
            stretchMode
              ? "cursor-crosshair"
              : panMode
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-crosshair",
          )}
          role="img"
          aria-label={`Circuit of the Americas. ${zoomed ? "Zoomed view. " : ""}Sector ${activeSector ?? "Lap"}. ${Math.round(playheadM)} metres.`}
          onDoubleClick={(e) => {
            e.preventDefault();
            if (onExpand && !expanded) {
              onExpand();
              return;
            }
            if (zoomed) fitLap();
            else zoomAtClient(e.clientX, e.clientY, 0.45);
          }}
          onPointerDown={(e) => {
            const local = clientToSvg(e.clientX, e.clientY);
            if (!local) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            if (stretchMode || e.shiftKey) {
              dragOrigin.current = local;
              setDragBox({ x0: local.x, y0: local.y, x1: local.x, y1: local.y });
              return;
            }
            if (panMode || e.altKey || e.button === 1) {
              panLast.current = { sx: e.clientX, sy: e.clientY };
              return;
            }
            scrubTo(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (panLast.current && e.buttons === 1) {
              const svg = svgRef.current;
              if (!svg) return;
              const rect = svg.getBoundingClientRect();
              const cur = viewRef.current ?? view;
              const dx = ((e.clientX - panLast.current.sx) / rect.width) * cur.w;
              const dy = ((e.clientY - panLast.current.sy) / rect.height) * cur.h;
              panLast.current = { sx: e.clientX, sy: e.clientY };
              commitView({
                x: cur.x - dx,
                y: cur.y - dy,
                w: cur.w,
                h: cur.h,
              });
              return;
            }
            if (dragOrigin.current && (stretchMode || e.shiftKey) && e.buttons === 1) {
              const local = clientToSvg(e.clientX, e.clientY);
              if (!local) return;
              setDragBox({
                x0: dragOrigin.current.x,
                y0: dragOrigin.current.y,
                x1: local.x,
                y1: local.y,
              });
              return;
            }
            if (!onPlayhead || e.buttons !== 1 || stretchMode || panMode) return;
            scrubTo(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            if (dragBox && dragOrigin.current) {
              applyStretchBox(dragBox.x0, dragBox.y0, dragBox.x1, dragBox.y1);
            }
            dragOrigin.current = null;
            panLast.current = null;
            setDragBox(null);
          }}
          onPointerCancel={() => {
            dragOrigin.current = null;
            panLast.current = null;
            setDragBox(null);
          }}
        >
          <defs>
            <filter id={`${uid}-bloom`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation={u * 0.35} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`${uid}-road`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a5668" />
              <stop offset="50%" stopColor="#2c3544" />
              <stop offset="100%" stopColor="#3d4a5c" />
            </linearGradient>
          </defs>

          {/* grass / runoff plate */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(28, 48, 32, 0.55)"
            strokeWidth={u * 4.2}
            strokeLinejoin="round"
          />
          <path
            d={pathD}
            fill="none"
            stroke="rgba(8,12,18,0.95)"
            strokeWidth={u * 3.4}
            strokeLinejoin="round"
          />
          {/* kerbs */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(255,77,94,0.75)"
            strokeWidth={u * 2.55}
            strokeLinejoin="round"
            strokeDasharray={`${u * 0.55} ${u * 0.7}`}
          />
          <path
            d={pathD}
            fill="none"
            stroke="rgba(232,238,245,0.7)"
            strokeWidth={u * 2.55}
            strokeLinejoin="round"
            strokeDasharray={`${u * 0.55} ${u * 0.7}`}
            strokeDashoffset={u * 0.62}
          />
          {/* asphalt */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#${uid}-road)`}
            strokeWidth={u * 1.85}
            strokeLinejoin="round"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#5a687c"
            strokeWidth={u * 1.15}
            strokeLinejoin="round"
          />

          {showDeltaPaint &&
            deltaRibbon.map((seg, i) => (
              <path
                key={`dlt-${i}`}
                d={seg.path}
                fill="none"
                stroke={seg.gain ? "var(--signal)" : "var(--fault)"}
                strokeWidth={u * (expanded ? 1.55 : 1.35)}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.92}
                filter={`url(#${uid}-bloom)`}
              />
            ))}

          <path
            d={pathD}
            fill="none"
            stroke="rgba(232,238,245,0.85)"
            strokeWidth={u * 0.12}
            strokeLinejoin="round"
            strokeDasharray={`${u * 0.55} ${u * 0.7}`}
            className="circuit-dash"
          />

          {showSectorPaint &&
            sectorPaths.map((sec, index) => {
              const wholeLap = activeSector === "Lap" || !activeSector;
              const active = wholeLap || activeSector === sec.label;
              const comparingPaint = comparing && sectorDeltaMs;
              return (
                <path
                  key={sec.id}
                  d={sec.path}
                  fill="none"
                  strokeWidth={
                    comparingPaint
                      ? active && !wholeLap
                        ? u * (expanded ? 1.05 : 0.95)
                        : u * (expanded ? 0.82 : 0.7)
                      : active && !wholeLap
                        ? u * 0.72
                        : u * 0.38
                  }
                  strokeLinejoin="round"
                  stroke={sectorColor(index, active)}
                  opacity={
                    comparingPaint
                      ? active || wholeLap
                        ? 1
                        : 0.55
                      : wholeLap
                        ? 0.9
                        : active
                          ? 1
                          : 0.28
                  }
                  filter={
                    comparingPaint || (active && !wholeLap)
                      ? `url(#${uid}-bloom)`
                      : undefined
                  }
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setManualView(null);
                    onSector?.(sec.label);
                  }}
                />
              );
            })}

          {evidenceArc && (
            <path
              d={evidenceArc}
              fill="none"
              stroke="var(--trace-cyan)"
              strokeWidth={u * 0.55}
              strokeOpacity="0.95"
              filter={`url(#${uid}-bloom)`}
            />
          )}

          {stage && !zoomed && (
            <g
              transform={`translate(${tower.cx - u * 0.35}, ${tower.cy - u * 2.2})`}
              opacity="0.85"
            >
              <path
                d={`M ${-0.18 * u} ${0.55 * u} L 0 ${-1.4 * u} L ${0.18 * u} ${0.55 * u} Z`}
                fill="rgba(255,77,94,0.85)"
                stroke="rgba(232,238,245,0.65)"
                strokeWidth={u * 0.06}
              />
              <path
                d={`M 0 ${-0.55 * u} Q ${0.95 * u} ${0.15 * u} ${1.2 * u} ${1 * u}`}
                fill="none"
                stroke="rgba(255,77,94,0.7)"
                strokeWidth={u * 0.08}
                strokeLinecap="round"
              />
            </g>
          )}

          {marks.map((m) => {
            if (activeWindow) {
              if (
                m.m < activeWindow.startM - 80 ||
                m.m > activeWindow.endM + 80
              )
                return null;
            }
            return (
              <g key={m.id}>
                <circle
                  cx={m.cx}
                  cy={m.cy}
                  r={u * 0.42}
                  fill="rgba(5,7,10,0.88)"
                  stroke="rgba(198,255,74,0.65)"
                  strokeWidth={u * 0.06}
                />
                <text
                  x={m.cx}
                  y={m.cy + u * 0.12}
                  textAnchor="middle"
                  fill="var(--chalk)"
                  fontSize={u * 0.32}
                  fontFamily="var(--font-mono), monospace"
                  fontWeight="700"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {trapMarks.map((t) => {
            if (
              activeWindow &&
              (t.m < activeWindow.startM - 60 || t.m > activeWindow.endM + 60)
            )
              return null;
            return (
              <g key={t.id}>
                <rect
                  x={t.cx - u * 0.85}
                  y={t.cy - u * 1.05}
                  width={u * 1.7}
                  height={u * 0.55}
                  rx={u * 0.08}
                  fill="rgba(5,7,10,0.9)"
                  stroke="rgba(58,215,255,0.7)"
                  strokeWidth={u * 0.05}
                />
                <text
                  x={t.cx}
                  y={t.cy - u * 0.65}
                  textAnchor="middle"
                  fill="var(--trace-cyan)"
                  fontSize={u * 0.32}
                  fontFamily="var(--font-mono), monospace"
                  fontWeight="700"
                >
                  {t.label}
                  {t.speed != null ? ` ${t.speed}` : ""}
                </text>
              </g>
            );
          })}

          {referenceCar && referenceAccent && (
            <CarMarker
              cx={referenceCar.cx}
              cy={referenceCar.cy}
              angle={referenceCar.angle}
              fill={referenceAccent}
              second="rgba(232,238,245,0.75)"
              number={referenceNumber}
              code={referenceCode}
              offset={1.35}
              scale={u * 0.14}
              glow
              pulseKey={`ref-${referenceCode ?? ""}-${referenceNumber ?? ""}-${lapId ?? ""}`}
              onSelect={onInspectReference}
              track={trackPkg}
            />
          )}
          <CarMarker
            cx={focusCar.cx}
            cy={focusCar.cy}
            angle={focusCar.angle}
            fill={focusAccent ?? "var(--signal)"}
            second="rgba(232,238,245,0.7)"
            number={focusNumber}
            code={focusCode}
            offset={comparing ? -1.25 : 0}
            scale={u * 0.15}
            glow
            pulseKey={`foc-${focusCode ?? ""}-${focusNumber ?? ""}-${lapId ?? ""}`}
            onSelect={onInspectFocus}
            track={trackPkg}
          />

          {dragBox && (
            <rect
              x={Math.min(dragBox.x0, dragBox.x1)}
              y={Math.min(dragBox.y0, dragBox.y1)}
              width={Math.abs(dragBox.x1 - dragBox.x0)}
              height={Math.abs(dragBox.y1 - dragBox.y0)}
              fill="rgba(198,255,74,0.12)"
              stroke="var(--signal)"
              strokeWidth={u * 0.08}
              strokeDasharray={`${u * 0.25} ${u * 0.2}`}
            />
          )}
        </svg>

        {/* Area insight - specific stats for the stretched window */}
        {areaInsight && stage && (
          <div className="pointer-events-none absolute left-2 top-2 z-[3] max-w-[min(100%,18rem)] rounded border border-[var(--hairline-strong)] bg-[rgba(5,7,10,0.88)] px-2.5 py-2 shadow-lg backdrop-blur-sm">
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-[var(--signal)]">
              Area · {Math.round(areaInsight.startM)}-{Math.round(areaInsight.endM)} m
              <span className="text-[var(--mute)]">
                {" "}
                · {Math.round(areaInsight.span)} m span
              </span>
            </p>
            {areaInsight.marksIn.length > 0 && (
              <p className="mt-1 font-mono text-[0.58rem] text-[var(--chalk)]">
                {areaInsight.marksIn.map((m) => m.label).join(" · ")}
                <span className="text-[var(--mute)]">
                  {" "}
                  - {areaInsight.marksIn[0]?.hint}
                </span>
              </p>
            )}
            {areaInsight.sectorsHit.length > 0 && (
              <p className="mt-0.5 font-mono text-[0.52rem] text-[var(--mist)]">
                {areaInsight.sectorsHit.map((s) => s.label).join(" / ")}
                {sectorDeltaMs &&
                  comparing &&
                  areaInsight.sectorsHit.map((s) => {
                    const idx = pack.sectors.findIndex((p) => p.id === s.id);
                    if (idx < 0) return null;
                    const ms = sectorDeltaMs[idx];
                    return (
                      <span
                        key={s.id}
                        className={
                          ms <= 0 ? " text-[var(--signal)]" : " text-[var(--fault)]"
                        }
                      >
                        {" "}
                        {s.label} {ms > 0 ? "+" : "-"}
                        {Math.abs(ms / 1000).toFixed(3)}
                      </span>
                    );
                  })}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[0.58rem] tabular-nums text-[var(--mist)]">
              {areaInsight.speedCh && areaInsight.speedNow != null && (
                <span>
                  <span className="text-[var(--mute)]">spd </span>
                  <span className="text-[var(--chalk)]">
                    {formatChannelValue(areaInsight.speedCh, areaInsight.speedNow)}
                  </span>
                  {areaInsight.speedMin != null && areaInsight.speedMax != null && (
                    <span className="text-[var(--mute)]">
                      {" "}
                      · {Math.round(areaInsight.speedMin)}-
                      {Math.round(areaInsight.speedMax)}
                    </span>
                  )}
                </span>
              )}
              {areaInsight.brakeCh && areaInsight.brakePeak != null && (
                <span>
                  <span className="text-[var(--mute)]">brk pk </span>
                  <span className="text-[var(--trace-brake)]">
                    {formatChannelValue(
                      areaInsight.brakeCh,
                      areaInsight.brakePeak,
                    )}
                  </span>
                </span>
              )}
              <span>
                <span className="text-[var(--mute)]">elev </span>
                <span className="text-[var(--chalk)]">
                  {areaInsight.z0.toFixed(0)}
                  {">"}
                  {areaInsight.z1.toFixed(0)} m
                </span>
                <span className="text-[var(--mute)]">
                  {" "}
                  · {areaInsight.grade >= 0 ? "+" : ""}
                  {areaInsight.grade.toFixed(1)}%
                </span>
              </span>
              {areaInsight.deltaAvg != null && (
                <span
                  className={
                    areaInsight.deltaAvg >= 0
                      ? "text-[var(--signal)]"
                      : "text-[var(--fault)]"
                  }
                >
                  Δ{deltaChannelLabel}{" "}
                  {areaInsight.deltaAvg >= 0 ? "+" : ""}
                  {Math.abs(areaInsight.deltaAvg) >= 10
                    ? areaInsight.deltaAvg.toFixed(0)
                    : areaInsight.deltaAvg.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mini overview when stretched */}
        {zoomed && stage && (
          <button
            type="button"
            onClick={fitLap}
            className="absolute bottom-14 right-2 z-[3] h-16 w-24 overflow-hidden rounded border border-[var(--hairline-strong)] bg-[rgba(5,7,10,0.85)] p-0.5 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            title="Fit full lap"
          >
            <svg
              viewBox={`${fullView.x} ${fullView.y} ${fullView.w} ${fullView.h}`}
              className="h-full w-full"
              aria-hidden
            >
              <path
                d={pathD}
                fill="none"
                stroke="rgba(232,238,245,0.35)"
                strokeWidth={fullView.w / 40}
              />
              <rect
                x={view.x}
                y={view.y}
                width={view.w}
                height={view.h}
                fill="rgba(198,255,74,0.15)"
                stroke="var(--signal)"
                strokeWidth={fullView.w / 120}
              />
            </svg>
          </button>
        )}

        {stage && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-[rgba(5,7,10,0.92)] via-[rgba(5,7,10,0.55)] to-transparent pt-6">
            <div className="pointer-events-auto">
              <ElevationStrip
                playheadM={playheadM}
                viewWindow={activeWindow}
                className="border-0 bg-transparent"
              />
            </div>
          </div>
        )}
      </div>

      <div className="relative z-[2] flex shrink-0 flex-wrap items-center gap-1.5 border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.72)] px-2.5 py-1 font-mono text-[0.6rem]">
        <button
          type="button"
          onClick={fitLap}
          className={cn(
            "rounded-sm px-1.5 py-0.5",
            !activeSector || activeSector === "Lap"
              ? "bg-[var(--signal-dim)] text-[var(--signal)]"
              : "text-[var(--mute)] hover:text-[var(--chalk)]",
          )}
        >
          Lap
        </button>
        {pack.sectors.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setManualView(null);
              onSector?.(s.label);
            }}
            className={cn(
              "rounded-sm px-1.5 py-0.5",
              activeSector === s.label
                ? "bg-[var(--signal-dim)] text-[var(--signal)]"
                : "text-[var(--mute)] hover:text-[var(--chalk)]",
            )}
          >
            {s.label}
            {sectorDeltaMs && comparing && (
              <span
                className={cn(
                  "ml-1 font-semibold",
                  sectorDeltaMs[i] > 0
                    ? "text-[var(--fault)]"
                    : "text-[var(--signal)]",
                )}
              >
                {sectorDeltaMs[i] > 0 ? "+" : "-"}
                {Math.abs(sectorDeltaMs[i] / 1000).toFixed(3)}
              </span>
            )}
          </button>
        ))}
        {comparing && showDeltaPaint && (
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[var(--mute)]">
              Δ{deltaChannelLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--signal)]">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-[var(--signal)]" />
              {deltaAheadLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--fault)]">
              <span className="inline-block h-1.5 w-3 rounded-sm bg-[var(--fault)]" />
              {deltaBehindLabel}
            </span>
          </span>
        )}
        <span className="ml-auto tabular-nums text-[var(--mist)]">
          {Math.round(playheadM)} m
        </span>
      </div>
    </div>
  );
}
