"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { CarLivery } from "@/components/identity/CarLivery";
import { CarStage } from "@/components/identity/CarStage";
import {
  CANDIDATE_LINE,
  PRODUCT,
  STUDIO,
  TAGLINE,
  WEDGE,
} from "@/lib/brand";
import { TEAM_ACCENTS } from "@/lib/identity";
import { prefersReducedMotion } from "@/lib/motion";
import track from "@/data/mock/cota-track.json";

const HERO_MARKS = [
  { label: "T1", hint: "Climb", m: 420 },
  { label: "Esses", hint: "Rhythm", m: 980 },
  { label: "Stadium", hint: "Brakes", m: 4100 },
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

function CotaTrackOverlay() {
  const uid = useId();
  const [drawn, setDrawn] = useState(false);

  const { path, view, length, marks, tower } = useMemo(() => {
    const xs = track.x as number[];
    const ys = track.y as number[];
    const ds = track.d as number[];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 120;
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) d += ` L ${xs[i]} ${ys[i]}`;
    d += " Z";
    return {
      path: d,
      view: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
      length: 4200,
      marks: HERO_MARKS.map((m) => ({ ...m, ...pointAt(ds, xs, ys, m.m) })),
      tower: pointAt(ds, xs, ys, 180),
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(
      () => setDrawn(true),
      prefersReducedMotion() ? 0 : 80,
    );
    return () => window.clearTimeout(t);
  }, []);

  return (
    <svg
      className="absolute inset-0 z-[2] h-full w-full"
      viewBox={view}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-glow`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(198,255,74,0.0)" />
          <stop offset="40%" stopColor="rgba(58,215,255,0.55)" />
          <stop offset="100%" stopColor="rgba(198,255,74,0.35)" />
        </linearGradient>
        <filter id={`${uid}-bloom`}>
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="rgba(5,7,10,0.55)"
        strokeWidth="120"
        strokeLinejoin="round"
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${uid}-glow)`}
        strokeWidth="28"
        strokeLinejoin="round"
        filter={`url(#${uid}-bloom)`}
        opacity="0.85"
        pathLength={length}
        className={drawn ? undefined : "hero-track-draw"}
      />
      <path
        d={path}
        fill="none"
        stroke="rgba(232,238,245,0.92)"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeDasharray="22 34"
        opacity="0.55"
        className="hero-dash"
      />
      <g transform={`translate(${tower.x - 40}, ${tower.y - 220})`}>
        <path
          d="M -10 40 L 0 -110 L 10 40 Z"
          fill="rgba(255,77,94,0.45)"
          stroke="rgba(232,238,245,0.65)"
          strokeWidth="4"
        />
        <path
          d="M 0 -40 Q 70 10 90 70"
          fill="none"
          stroke="rgba(255,77,94,0.65)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      {marks.map((m) => (
        <g key={m.label}>
          <rect
            x={m.x - 58}
            y={m.y - 36}
            width="116"
            height="72"
            rx="36"
            fill="rgba(5,7,10,0.72)"
            stroke="rgba(198,255,74,0.8)"
            strokeWidth="4"
          />
          <text
            x={m.x}
            y={m.y - 2}
            textAnchor="middle"
            fill="var(--signal)"
            fontSize="26"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
          >
            {m.label}
          </text>
          <text
            x={m.x}
            y={m.y + 24}
            textAnchor="middle"
            fill="rgba(232,238,245,0.78)"
            fontSize="18"
            fontFamily="var(--font-mono), monospace"
            fontWeight="500"
            letterSpacing="0.06em"
          >
            {m.hint}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/cota-hero-night.jpg"
          alt="Circuit of the Americas Turn 1 climb at night with observation tower - United States Grand Prix atmosphere"
          fill
          priority
          className="object-cover object-[center_42%] hero-kenburns"
          sizes="100vw"
        />
      </div>
      <CotaTrackOverlay />
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.55) 38%, rgba(5,7,10,0.15) 62%, rgba(5,7,10,0.7) 100%), linear-gradient(0deg, rgba(5,7,10,0.96) 0%, rgba(5,7,10,0.35) 42%, rgba(5,7,10,0.25) 100%)",
        }}
      />
      <div className="cota-kerb pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-1.5" />

      <div className="relative z-[5] mx-auto w-full max-w-[1120px] px-6 pb-16 pt-28 sm:pb-20">
        <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--signal)]">
          {STUDIO} · Austin · COTA
        </p>
        <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[0.92] tracking-[-0.03em]">
          Cite<span className="text-[var(--signal)]">Trace</span>
        </h1>
        <p className="mt-3 font-display text-[clamp(1.15rem,2.2vw,1.55rem)] font-semibold tracking-[-0.02em] text-[var(--chalk)]">
          {WEDGE}
        </p>
        <p className="mt-2 text-[0.95rem] text-[var(--mist)]">{TAGLINE}</p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--mist)]">
          Evidence-bound session RAG on real 2026 Circuit of the Americas FP2
          telemetry - cite a note or channel, lock the playhead on the T1 climb
          or the stadium stop, trust the trace. Built to demo performance
          engineering craft to race teams.
        </p>
        <div className="mt-8 flex flex-wrap items-stretch gap-3">
          <Link
            href="/session?demo=1&house=ferrari"
            className="group flex min-w-[11rem] flex-col justify-center rounded-sm bg-[var(--signal)] px-4 py-3 text-[var(--asphalt)] shadow-[var(--glow-signal)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span className="font-semibold leading-tight">Open COTA session</span>
            <span className="mt-0.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] opacity-75">
              Live telemetry desk · Ferrari house
            </span>
          </Link>
          <Link
            href="/session?demo=1&house=ferrari&q=Why%20did%20brake%20temp%20spike%20in%20S3%20on%20lap%2010%3F"
            className="group flex min-w-[11rem] flex-col justify-center rounded-sm border border-[var(--hairline-strong)] bg-[var(--panel)]/80 px-4 py-3 text-[var(--chalk)] backdrop-blur-sm transition hover:border-[var(--signal)]/45 hover:bg-[var(--rail)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span className="font-semibold leading-tight">Try a grounded ask</span>
            <span className="mt-0.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] text-[var(--mute)]">
              Brake spike · cite locks playhead
            </span>
          </Link>
          <Link
            href="#how-it-works"
            className="group flex min-w-[11rem] flex-col justify-center rounded-sm border border-transparent px-4 py-3 text-[var(--mist)] transition hover:border-[var(--hairline)] hover:text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span className="font-semibold leading-tight">See the method</span>
            <span className="mt-0.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] text-[var(--mute)]">
              Ask → cite → lock on map
            </span>
          </Link>
        </div>
        <div className="mt-6 max-w-lg">
          <CarStage track="cota" showNote={false}>
            <div className="flex w-full items-end justify-between gap-3 px-1">
              <CarLivery
                accent={TEAM_ACCENTS.Ferrari}
                number={16}
                compoundLetter="S"
                width={260}
                track="cota"
              />
              <CarLivery
                accent={TEAM_ACCENTS.Ferrari}
                number={44}
                compoundLetter="S"
                width={210}
                track="cota"
              />
            </div>
          </CarStage>
        </div>
        <p className="mt-4 text-[0.85rem] text-[var(--mist)]">{CANDIDATE_LINE}</p>
        <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Circuit of the Americas · 5.513 km · 22 cars · OpenF1 + ATLAS overlays ·{" "}
          {PRODUCT}
        </p>
      </div>
    </section>
  );
}
