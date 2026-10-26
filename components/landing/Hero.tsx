"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCT, STUDIO, TAGLINE, WEDGE } from "@/lib/brand";
import { prefersReducedMotion } from "@/lib/motion";
import track from "@/data/mock/cota-track.json";

function CotaTrackOverlay() {
  const uid = useId();
  const [drawn, setDrawn] = useState(false);

  const { path, view, length } = useMemo(() => {
    const xs = track.x as number[];
    const ys = track.y as number[];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 80;
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) d += ` L ${xs[i]} ${ys[i]}`;
    d += " Z";
    return {
      path: d,
      view: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
      length: 4200,
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
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/cota-hero-night.jpg"
          alt="Circuit of the Americas at night — 2026 United States Grand Prix atmosphere"
          fill
          priority
          className="object-cover object-[center_40%]"
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

      <div className="relative z-[4] mx-auto w-full max-w-[1120px] px-6 pb-16 pt-28 sm:pb-20">
        <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--signal)]">
          {STUDIO}
        </p>
        <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[0.92] tracking-[-0.03em]">
          Cite<span className="text-[var(--signal)]">Trace</span>
        </h1>
        <p className="mt-3 font-display text-[clamp(1.15rem,2.2vw,1.55rem)] font-semibold tracking-[-0.02em] text-[var(--chalk)]">
          {WEDGE}
        </p>
        <p className="mt-2 text-[0.95rem] text-[var(--mist)]">{TAGLINE}</p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--mist)]">
          Evidence-bound session RAG on real 2026 COTA FP2 telemetry — cite a
          note or channel, lock the playhead, trust the trace. A {STUDIO}{" "}
          portfolio piece for motorsport software and performance-engineering
          tooling demos.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild>
            <Link href="/session?driver=LEC&lap=10">Open COTA session</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="#how-it-works">How it works</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/about">Method</Link>
          </Button>
        </div>
        <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Austin · 22 cars · OpenF1 subset + ATLAS overlays · {PRODUCT}
        </p>
      </div>
    </section>
  );
}
