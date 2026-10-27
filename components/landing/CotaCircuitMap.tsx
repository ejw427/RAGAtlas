"use client";

import { useEffect, useId, useMemo, useState } from "react";
import track from "@/data/mock/cota-track.json";
import { prefersReducedMotion } from "@/lib/motion";

const LANDMARKS = [
  { id: "sf", label: "S/F", m: 0, hint: "Start / finish" },
  { id: "t1", label: "T1", m: 420, hint: "Uphill crest" },
  { id: "esses", label: "Esses", m: 980, hint: "T3–T6 rhythm" },
  { id: "s1", label: "S1→", m: 1483, hint: "Sector split" },
  { id: "t11", label: "T11", m: 2600, hint: "Hairpin" },
  { id: "s2", label: "S2→", m: 3672, hint: "Into stadium" },
  { id: "stadium", label: "Stadium", m: 4100, hint: "T12–T15" },
  { id: "t19", label: "T19", m: 5100, hint: "Track limits" },
] as const;

const SECTORS = [
  { id: "s1", label: "S1", startM: 0, endM: 1483, color: "var(--trace-cyan)" },
  { id: "s2", label: "S2", startM: 1483, endM: 3672, color: "var(--signal)" },
  {
    id: "s3",
    label: "S3",
    startM: 3672,
    endM: 5513,
    color: "var(--trace-amber)",
  },
] as const;

function pointAt(
  d: number[],
  x: number[],
  y: number[],
  m: number,
): { x: number; y: number } {
  let lo = 0;
  for (let i = 0; i < d.length; i++) if (d[i] <= m) lo = i;
  const hi = Math.min(lo + 1, d.length - 1);
  const u = d[hi] === d[lo] ? 0 : (m - d[lo]) / (d[hi] - d[lo]);
  return {
    x: x[lo] + (x[hi] - x[lo]) * u,
    y: y[lo] + (y[hi] - y[lo]) * u,
  };
}

function TowerGlyph({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  const s = 90 * scale;
  return (
    <g transform={`translate(${x}, ${y})`} aria-hidden>
      <path
        d={`M ${-8 * scale} ${s * 0.15} L 0 ${-s} L ${8 * scale} ${s * 0.15} Z`}
        fill="rgba(255,77,94,0.55)"
        stroke="rgba(232,238,245,0.75)"
        strokeWidth={3}
      />
      <path
        d={`M 0 ${-s * 0.35} Q ${55 * scale} ${-s * 0.05} ${70 * scale} ${40 * scale}`}
        fill="none"
        stroke="rgba(255,77,94,0.7)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <text
        x={0}
        y={s * 0.42}
        textAnchor="middle"
        fill="rgba(232,238,245,0.7)"
        fontSize={28 * scale}
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.08em"
      >
        TOWER
      </text>
    </g>
  );
}

export function CotaCircuitMap() {
  const uid = useId();
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<string | null>("t1");

  const model = useMemo(() => {
    const xs = track.x as number[];
    const ys = track.y as number[];
    const ds = track.d as number[];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 520;

    let path = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) path += ` L ${xs[i]} ${ys[i]}`;
    path += " Z";

    const sectorPaths = SECTORS.map((sec) => {
      const pts: string[] = [];
      for (let i = 0; i < ds.length; i++) {
        if (ds[i] >= sec.startM && ds[i] <= sec.endM) {
          pts.push(
            `${pts.length === 0 || ds[i - 1] < sec.startM ? "M" : "L"} ${xs[i]} ${ys[i]}`,
          );
        }
      }
      return { ...sec, path: pts.join(" ") };
    });

    const marks = LANDMARKS.map((lm) => ({
      ...lm,
      ...pointAt(ds, xs, ys, lm.m),
    }));

    const tower = pointAt(ds, xs, ys, 180);

    return {
      path,
      sectorPaths,
      marks,
      tower,
      view: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
      length: 4200,
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(
      () => setDrawn(true),
      prefersReducedMotion() ? 0 : 120,
    );
    return () => window.clearTimeout(t);
  }, []);

  const activeMark = model.marks.find((m) => m.id === active) ?? model.marks[1];

  return (
    <div className="relative overflow-hidden border border-[var(--hairline)] bg-[var(--asphalt)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(70% 60% at 30% 40%, rgba(58,215,255,0.08), transparent 55%), radial-gradient(50% 50% at 75% 70%, rgba(198,255,74,0.06), transparent 60%)",
        }}
      />
      <div className="relative grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <svg
          viewBox={model.view}
          className="h-[min(58vw,420px)] w-full lg:h-[460px]"
          role="img"
          aria-label="Circuit of the Americas schematic with sector and landmark callouts"
        >
          <defs>
            <linearGradient id={`${uid}-glow`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(58,215,255,0.5)" />
              <stop offset="55%" stopColor="rgba(198,255,74,0.45)" />
              <stop offset="100%" stopColor="rgba(255,176,32,0.4)" />
            </linearGradient>
            <filter id={`${uid}-bloom`}>
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={model.path}
            fill="none"
            stroke="rgba(232,238,245,0.06)"
            strokeWidth="140"
            strokeLinejoin="round"
          />
          <path
            d={model.path}
            fill="none"
            stroke={`url(#${uid}-glow)`}
            strokeWidth="22"
            strokeLinejoin="round"
            filter={`url(#${uid}-bloom)`}
            opacity={0.55}
            pathLength={model.length}
            className={drawn ? undefined : "hero-track-draw"}
          />

          {model.sectorPaths.map((sec) => (
            <path
              key={sec.id}
              d={sec.path}
              fill="none"
              stroke={sec.color}
              strokeWidth="12"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ))}

          <path
            d={model.path}
            fill="none"
            stroke="rgba(232,238,245,0.55)"
            strokeWidth="3"
            strokeDasharray="28 36"
            strokeLinejoin="round"
            className="hero-dash"
            opacity={0.45}
          />

          <TowerGlyph x={model.tower.x - 120} y={model.tower.y - 180} scale={1.15} />

          {model.marks.map((m) => {
            const on = m.id === active;
            return (
              <g key={m.id}>
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={on ? 48 : 32}
                  fill={on ? "rgba(198,255,74,0.18)" : "rgba(5,7,10,0.55)"}
                  stroke={on ? "var(--signal)" : "rgba(232,238,245,0.35)"}
                  strokeWidth={on ? 5 : 3}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(m.id)}
                  onFocus={() => setActive(m.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${m.label}: ${m.hint}`}
                />
                <text
                  x={m.x}
                  y={m.y + 8}
                  textAnchor="middle"
                  fill={on ? "var(--signal)" : "var(--chalk)"}
                  fontSize={on ? 34 : 28}
                  fontFamily="var(--font-mono), monospace"
                  fontWeight={600}
                  className="pointer-events-none"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>

        <aside className="flex flex-col justify-between border-t border-[var(--hairline)] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--signal)]">
              Circuit of the Americas
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-[var(--chalk)]">
              Austin. 5.513 km. 20 turns.
            </h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--mist)]">
              The demo pack is the 2026 United States GP FP2 session — same
              asphalt your engineers argue about: T1 climb, esses rhythm,
              stadium stop, T19 limits.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {LANDMARKS.map((lm) => {
              const on = lm.id === active;
              return (
                <button
                  key={lm.id}
                  type="button"
                  onMouseEnter={() => setActive(lm.id)}
                  onFocus={() => setActive(lm.id)}
                  className={`flex w-full items-baseline justify-between gap-3 border px-3 py-2 text-left transition-colors ${
                    on
                      ? "border-[var(--signal)] bg-[var(--signal-dim)]"
                      : "border-[var(--hairline)] bg-[var(--panel)] hover:border-[var(--hairline-strong)]"
                  }`}
                >
                  <span
                    className={`font-mono text-[0.72rem] ${on ? "text-[var(--signal)]" : "text-[var(--chalk)]"}`}
                  >
                    {lm.label}
                  </span>
                  <span className="font-mono text-[0.6rem] text-[var(--mute)]">
                    {lm.hint} · {lm.m} m
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--mute)]">
            Active · {activeMark.label} · {activeMark.hint}
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-[var(--hairline)] px-5 py-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        {SECTORS.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-4 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label} {s.startM}–{s.endM} m
          </span>
        ))}
      </div>
    </div>
  );
}
