"use client";

import { useId, useMemo, useRef } from "react";
import { getSessionPack } from "@/lib/session";
import { cn } from "@/lib/utils";

const LANDMARKS = [
  { id: "sf", label: "S/F", m: 0 },
  { id: "t1", label: "T1", m: 420 },
  { id: "esses", label: "Esses", m: 980 },
  { id: "stadium", label: "Stadium", m: 4100 },
  { id: "t19", label: "T19", m: 5100 },
] as const;

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

function CarWedge({
  cx,
  cy,
  angle,
  fill,
  number,
  offset = 0,
  glow,
}: {
  cx: number;
  cy: number;
  angle: number;
  fill: string;
  number?: number;
  offset?: number;
  glow?: boolean;
}) {
  const rad = ((angle + 90) * Math.PI) / 180;
  const ox = Math.cos(rad) * offset;
  const oy = Math.sin(rad) * offset;
  return (
    <g transform={`translate(${cx + ox}, ${cy + oy}) rotate(${angle})`}>
      {glow && (
        <polygon
          points="18,0 -12,-10 -12,10"
          fill={fill}
          opacity="0.35"
          filter="blur(4px)"
        />
      )}
      <polygon
        points="16,0 -11,-9 -11,9"
        fill={fill}
        stroke="rgba(5,7,10,0.85)"
        strokeWidth="2.5"
      />
      <polygon points="8,0 -4,-3.5 -4,3.5" fill="rgba(255,255,255,0.35)" />
      {number != null && (
        <text
          x="0"
          y="-18"
          textAnchor="middle"
          fill={fill}
          fontSize="15"
          fontFamily="var(--font-mono), monospace"
          fontWeight="800"
          transform={`rotate(${-angle})`}
          style={{ paintOrder: "stroke", stroke: "rgba(5,7,10,0.75)", strokeWidth: 3 }}
        >
          {number}
        </text>
      )}
    </g>
  );
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
  comparing = false,
  traps,
  sectorDeltaMs,
  gainSectorIndex = null,
  lossSectorIndex = null,
  stage = false,
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
  comparing?: boolean;
  traps?: { id: string; m: number; label: string; speed?: number }[];
  sectorDeltaMs?: [number, number, number] | null;
  /** Index 0–2 of biggest Focus gain (painted signal on Lap view). */
  gainSectorIndex?: number | null;
  /** Index 0–2 of biggest Focus loss (painted amber on Lap view). */
  lossSectorIndex?: number | null;
  stage?: boolean;
}) {
  const pack = getSessionPack();
  const { x, y, d } = pack.trackXY.series;
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId();

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

  const marks = useMemo(() => {
    return LANDMARKS.map((lm) => ({
      ...lm,
      ...pointAt(d, x, y, lm.m),
    }));
  }, [d, x, y]);

  const trapMarks = useMemo(() => {
    return (traps ?? []).map((t) => ({
      ...t,
      ...pointAt(d, x, y, t.m),
    }));
  }, [traps, d, x, y]);

  const tower = useMemo(() => pointAt(d, x, y, 180), [d, x, y]);

  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);
  const pad = stage ? 80 : 55;

  const scrubTo = (clientX: number, clientY: number) => {
    if (!onPlayhead || !svgRef.current || !d.length) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
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

  const sectorColor = (index: number, active: boolean) => {
    if (comparing && sectorDeltaMs) {
      if (activeSector === "Lap") {
        if (gainSectorIndex === index) return "var(--signal)";
        if (lossSectorIndex === index) return "var(--trace-amber)";
        return focusAccent;
      }
      if (active && activeSector != null) {
        const delta = sectorDeltaMs[index];
        if (delta < 0) return "var(--signal)";
        if (delta > 0) return "var(--trace-amber)";
        return "var(--mist)";
      }
    }
    if (active || activeSector === "Lap") return focusAccent;
    return "rgba(154,167,184,0.45)";
  };

  return (
    <div
      className={cn(
        "circuit-stage relative flex flex-col overflow-hidden rounded-md border border-[var(--hairline-strong)]",
        stage ? "h-full min-h-[220px]" : "p-2",
      )}
    >
      <div className="circuit-stage-bg pointer-events-none absolute inset-0" />
      <div className="relative z-[1] mb-1 flex shrink-0 items-baseline justify-between gap-2 px-2.5 pt-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--mist)]">
          Circuit of the Americas
        </p>
        <p className="font-mono text-[0.55rem] text-[var(--mute)]">
          {comparing
            ? "Distance domain · same metre"
            : "5.513 km · 20 turns"}
        </p>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`}
        className={cn(
          "relative z-[1] w-full",
          stage ? "min-h-0 flex-1 cursor-crosshair px-1" : "h-40",
        )}
        role="img"
        aria-label={`Circuit of the Americas schematic, active sector ${activeSector ?? "none"}, distance ${Math.round(playheadM)} meters`}
        onPointerDown={(e) => {
          if (!onPlayhead) return;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          scrubTo(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!onPlayhead || e.buttons !== 1) return;
          scrubTo(e.clientX, e.clientY);
        }}
      >
        <defs>
          <linearGradient id={`${uid}-asphalt`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a2230" />
            <stop offset="50%" stopColor="#0d1219" />
            <stop offset="100%" stopColor="#151c28" />
          </linearGradient>
          <filter id={`${uid}-bloom`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${uid}-soft`}>
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* runoff plate */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(8,12,18,0.9)"
          strokeWidth={stage ? 58 : 38}
          strokeLinejoin="round"
        />
        {/* kerb suggestion */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,77,94,0.45)"
          strokeWidth={stage ? 42 : 28}
          strokeLinejoin="round"
          strokeDasharray="12 16"
        />
        <path
          d={pathD}
          fill="none"
          stroke="rgba(232,238,245,0.4)"
          strokeWidth={stage ? 42 : 28}
          strokeLinejoin="round"
          strokeDasharray="12 16"
          strokeDashoffset="14"
        />
        {/* asphalt ribbon — light enough to read as a road */}
        <path
          d={pathD}
          fill="none"
          stroke="#2a3444"
          strokeWidth={stage ? 30 : 20}
          strokeLinejoin="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#3d4a5c"
          strokeWidth={stage ? 22 : 14}
          strokeLinejoin="round"
        />
        {/* center line glow */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(232,238,245,0.75)"
          strokeWidth={stage ? 2.5 : 2}
          strokeLinejoin="round"
          strokeDasharray="16 20"
          opacity="0.7"
          className="circuit-dash"
        />

        {sectorPaths.map((sec, index) => {
          const wholeLap = activeSector === "Lap";
          const active = wholeLap || activeSector === sec.label;
          return (
            <path
              key={sec.id}
              d={sec.path}
              fill="none"
              strokeWidth={
                wholeLap
                  ? stage
                    ? 8
                    : 6
                  : active
                    ? stage
                      ? 14
                      : 11
                    : stage
                      ? 6
                      : 4
              }
              strokeLinejoin="round"
              stroke={sectorColor(index, active)}
              opacity={wholeLap ? 0.85 : active ? 0.95 : 0.35}
              filter={active && !wholeLap ? `url(#${uid}-bloom)` : undefined}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
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
            strokeWidth={stage ? 10 : 7}
            strokeOpacity="0.9"
            filter={`url(#${uid}-bloom)`}
          />
        )}

        {stage && (
          <g
            transform={`translate(${tower.cx - 14}, ${tower.cy - 78})`}
            opacity="0.7"
          >
            <path
              d="M -5 20 L 0 -48 L 5 20 Z"
              fill="rgba(255,77,94,0.7)"
              stroke="rgba(232,238,245,0.55)"
              strokeWidth="2"
            />
            <path
              d="M 0 -18 Q 32 6 40 34"
              fill="none"
              stroke="rgba(255,77,94,0.55)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {marks.map((m) => (
          <g key={m.id}>
            <circle
              cx={m.cx}
              cy={m.cy}
              r={stage ? 16 : 11}
              fill="rgba(5,7,10,0.82)"
              stroke="rgba(198,255,74,0.45)"
              strokeWidth="1.5"
            />
            <text
              x={m.cx}
              y={m.cy + 4}
              textAnchor="middle"
              fill="var(--chalk)"
              fontSize={stage ? 10 : 8}
              fontFamily="var(--font-mono), monospace"
              fontWeight="600"
            >
              {m.label}
            </text>
          </g>
        ))}

        {trapMarks.map((t) => (
          <g key={t.id}>
            <rect
              x={t.cx - 28}
              y={t.cy - 34}
              width="56"
              height="18"
              rx="3"
              fill="rgba(5,7,10,0.88)"
              stroke="rgba(58,215,255,0.55)"
              strokeWidth="1.25"
            />
            <text
              x={t.cx}
              y={t.cy - 21}
              textAnchor="middle"
              fill="var(--trace-cyan)"
              fontSize="11"
              fontFamily="var(--font-mono), monospace"
              fontWeight="700"
            >
              {t.label}
              {t.speed != null ? ` ${t.speed}` : ""}
            </text>
          </g>
        ))}

        {referenceCar && referenceAccent && (
          <CarWedge
            cx={referenceCar.cx}
            cy={referenceCar.cy}
            angle={referenceCar.angle}
            fill={referenceAccent}
            number={referenceNumber}
            offset={20}
            glow
          />
        )}
        <CarWedge
          cx={focusCar.cx}
          cy={focusCar.cy}
          angle={focusCar.angle}
          fill={focusAccent}
          number={focusNumber}
          offset={comparing ? -12 : 0}
          glow
        />
      </svg>

      <div className="relative z-[1] mt-auto flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--hairline)] bg-[rgba(5,7,10,0.45)] px-2.5 py-1.5 font-mono text-[0.62rem]">
        <button
          type="button"
          onClick={() => onSector?.("Lap")}
          className={cn(
            "rounded-sm px-1.5 py-0.5",
            activeSector === "Lap"
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
            onClick={() => onSector?.(s.label)}
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
                    ? "text-[var(--trace-amber)]"
                    : "text-[var(--signal)]",
                )}
              >
                {sectorDeltaMs[i] > 0 ? "+" : "−"}
                {Math.abs(sectorDeltaMs[i] / 1000).toFixed(3)}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto tabular-nums text-[var(--mist)]">
          {Math.round(playheadM)} m
        </span>
      </div>
    </div>
  );
}
