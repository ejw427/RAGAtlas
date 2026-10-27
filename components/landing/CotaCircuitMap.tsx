"use client";

import { useEffect, useId, useMemo, useState } from "react";
import track from "@/data/mock/cota-track.json";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CarLivery } from "@/components/identity/CarLivery";
import { CarStage } from "@/components/identity/CarStage";
import { HelmetMark } from "@/components/identity/HelmetMark";
import { TEAM_ACCENTS } from "@/lib/identity";
import { prefersReducedMotion } from "@/lib/motion";

const LANDMARKS = [
  {
    id: "sf",
    label: "S/F",
    m: 0,
    hint: "Start / finish",
    body: "Timing line for the lap. Sector 1 begins here — every flyer and cite distance is measured from this metre.",
  },
  {
    id: "t1",
    label: "T1",
    m: 420,
    hint: "Uphill crest",
    body: "The climb that defines COTA. Commitment on throttle, crest speed, then the first heavy brake of the lap — the garage argues this corner all weekend.",
  },
  {
    id: "esses",
    label: "Esses",
    m: 980,
    hint: "T3–T6 rhythm",
    body: "Linked left-rights where car balance and kerb use show up in steering and lateral load. Rhythm section — not a single apex.",
  },
  {
    id: "s1",
    label: "S1",
    m: 1483,
    hint: "Sector split",
    body: "End of sector 1. Compare Focus vs Reference sector times here to see who owned the opening third of the lap.",
  },
  {
    id: "t11",
    label: "T11",
    m: 2600,
    hint: "Hairpin",
    body: "Slow hairpin at the back of the circuit. Brake pressure and traction on exit matter for the long run into sector 2.",
  },
  {
    id: "s2",
    label: "S2",
    m: 3672,
    hint: "Into stadium",
    body: "Sector 2 split — the bridge into the amphitheater. Pace through here sets up the money-shot stadium stop.",
  },
  {
    id: "stadium",
    label: "Stadium",
    m: 4100,
    hint: "T12–T15 brakes",
    body: "Heavy stop into the amphitheater. Peak brake temp and pressure shape live here — the cite most hiring managers will remember.",
  },
  {
    id: "t19",
    label: "T19",
    m: 5100,
    hint: "Track limits",
    body: "Final corner complex before the line. Track-limits risk and exit speed onto the start/finish straight.",
  },
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
  const [active, setActive] = useState<string | null>(null);
  const [popupId, setPopupId] = useState<string | null>(null);

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

  const highlightId = popupId ?? active ?? "t1";
  const popupMark = LANDMARKS.find((m) => m.id === popupId) ?? null;

  const openLandmark = (id: string) => {
    setActive(id);
    setPopupId(id);
  };

  return (
    <div className="relative overflow-hidden border border-[var(--hairline)] bg-[var(--asphalt)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(70% 60% at 30% 40%, rgba(58,215,255,0.08), transparent 55%), radial-gradient(50% 50% at 75% 70%, rgba(198,255,74,0.06), transparent 60%)",
        }}
      />

      <div className="relative border-b border-[var(--hairline)] px-5 py-4 sm:px-6">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--signal)]">
          Circuit of the Americas
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-[var(--chalk)]">
          Austin. 5.513 km. 20 turns.
        </h3>
        <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-[var(--mist)]">
          Tap a corner mark for a popup — T1 climb, esses rhythm, stadium stop,
          T19 limits. Same asphalt as the 2026 United States GP FP2 pack.
        </p>
      </div>

      <svg
        viewBox={model.view}
        className="h-[min(62vw,460px)] w-full lg:h-[480px]"
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
          const on = m.id === highlightId;
          return (
            <g key={m.id}>
              <circle
                cx={m.x}
                cy={m.y}
                r={on ? 52 : 34}
                fill={on ? "rgba(198,255,74,0.2)" : "rgba(5,7,10,0.55)"}
                stroke={on ? "var(--signal)" : "rgba(232,238,245,0.35)"}
                strokeWidth={on ? 5 : 3}
                className="cursor-pointer"
                onMouseEnter={() => setActive(m.id)}
                onFocus={() => setActive(m.id)}
                onClick={() => openLandmark(m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLandmark(m.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${m.label}: ${m.hint}. Open details.`}
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

      <div className="flex flex-wrap gap-2 border-t border-[var(--hairline)] px-4 py-3 sm:px-5">
        {LANDMARKS.map((lm) => {
          const on = lm.id === highlightId;
          return (
            <button
              key={lm.id}
              type="button"
              onClick={() => openLandmark(lm.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                on
                  ? "border-[var(--signal)] bg-[var(--signal-dim)] text-[var(--signal)]"
                  : "border-[var(--hairline)] bg-[var(--panel)] text-[var(--mist)] hover:border-[var(--hairline-strong)] hover:text-[var(--chalk)]"
              }`}
            >
              <span className="font-semibold">{lm.label}</span>
              <span className="ml-1.5 opacity-70">{lm.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-[var(--hairline)] px-5 py-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        {SECTORS.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-4 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label} {s.startM}-{s.endM} m
          </span>
        ))}
      </div>

      <Sheet
        open={popupId != null}
        onOpenChange={(o) => {
          if (!o) setPopupId(null);
        }}
      >
        <SheetContent variant="popup" className="w-[min(100vw-1.25rem,480px)]">
          {popupMark && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-[var(--signal)]">
                    {popupMark.label} · {popupMark.hint}
                  </SheetTitle>
                  <p className="mt-1 font-mono text-[0.62rem] text-[var(--mute)]">
                    Circuit of the Americas · {popupMark.m} m from S/F
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPopupId(null)}
                  className="shrink-0 rounded-sm border border-[var(--hairline-strong)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--mist)] hover:border-[var(--signal)]/50 hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  Close
                </button>
              </div>

              <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--mist)]">
                {popupMark.body}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
                <HelmetMark
                  code="lec"
                  number={16}
                  accent={TEAM_ACCENTS.Ferrari.accent}
                  second={TEAM_ACCENTS.Ferrari.second}
                  size={88}
                  track="cota"
                />
                <CarStage track="cota">
                  <CarLivery
                    accent={TEAM_ACCENTS.Ferrari}
                    number={16}
                    compoundLetter="S"
                    width={300}
                    track="cota"
                  />
                </CarStage>
              </div>
              <p className="mt-2 font-mono text-[0.55rem] leading-relaxed text-[var(--mute)]">
                2026 Ferrari side render + Leclerc kit on the COTA weekend
                frame.
              </p>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
