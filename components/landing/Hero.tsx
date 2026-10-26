import Link from "next/link";
import { Button } from "@/components/ui/button";

function NightTrackBleed() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-90"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="asphaltGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a121c" />
          <stop offset="55%" stopColor="#070b10" />
          <stop offset="100%" stopColor="#05070a" />
        </linearGradient>
        <radialGradient id="apexGlow" cx="70%" cy="42%" r="35%">
          <stop offset="0%" stopColor="rgba(58,215,255,0.18)" />
          <stop offset="100%" stopColor="rgba(58,215,255,0)" />
        </radialGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill="url(#asphaltGrad)" />
      <ellipse cx="1120" cy="380" rx="520" ry="280" fill="url(#apexGlow)" />
      {/* Distant grandstand silhouette */}
      <path
        d="M40 520 L180 480 L220 500 L360 455 L420 490 L580 440 L640 470 L820 420 L900 455 L1100 400 L1180 440 L1400 390 L1560 430 L1600 520 L1600 900 L0 900 Z"
        fill="#080c12"
        opacity="0.85"
      />
      <g opacity="0.55" stroke="#1a2433" strokeWidth="40" fill="none">
        <path d="M180 620 C420 520, 620 700, 860 560 S1280 480, 1480 620" />
      </g>
      <g
        fill="none"
        stroke="rgba(232,238,245,0.14)"
        strokeWidth="10"
        strokeLinecap="round"
        filter="url(#softBlur)"
      >
        <path d="M200 610 C430 520, 630 680, 860 560 S1260 490, 1460 610" />
      </g>
      <g fill="none" stroke="rgba(198,255,74,0.35)" strokeWidth="2" strokeDasharray="18 28">
        <path d="M210 608 C440 522, 640 672, 860 558 S1250 492, 1450 608" />
      </g>
      {/* Sector paint ghosts */}
      <circle cx="520" cy="590" r="6" fill="rgba(198,255,74,0.5)" />
      <circle cx="860" cy="555" r="6" fill="rgba(58,215,255,0.55)" />
      <circle cx="1180" cy="520" r="6" fill="rgba(255,77,94,0.55)" />
      <text
        x="500"
        y="575"
        fill="rgba(154,167,184,0.45)"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="14"
      >
        S1
      </text>
      <text
        x="840"
        y="540"
        fill="rgba(154,167,184,0.45)"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="14"
      >
        S2
      </text>
      <text
        x="1160"
        y="505"
        fill="rgba(154,167,184,0.45)"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="14"
      >
        S3
      </text>
      {/* Faint sparkline texture */}
      <path
        d="M80 780 L160 760 L240 770 L320 730 L400 745 L480 700 L560 720 L640 680 L720 705 L800 650 L880 690 L960 640 L1040 670 L1120 620 L1200 655 L1280 610 L1360 640 L1440 600 L1520 630"
        fill="none"
        stroke="rgba(58,215,255,0.08)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh items-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <NightTrackBleed />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(232,238,245,0.015) 3px, rgba(232,238,245,0.015) 4px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.45) 42%, rgba(5,7,10,0.2) 70%, rgba(5,7,10,0.75) 100%), linear-gradient(0deg, rgba(5,7,10,0.95) 0%, transparent 38%, rgba(5,7,10,0.35) 100%)",
        }}
      />

      <div className="relative z-[3] mx-auto w-full max-w-[1120px] px-6 pb-16 pt-28 sm:pb-20">
        <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--signal)]">
          Synthetic session · Portfolio prototype
        </p>
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          RAG<span className="text-[var(--signal)]">Atlas</span>
        </h1>
        <p className="mt-3 font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold tracking-[-0.02em]">
          Ask the lap. Trust the trace.
        </p>
        <p className="mt-3 max-w-xl text-base text-[var(--mist)]">
          Session RAG grounded in sectors, channels, and engineer notes — a
          knowledge layer beside ATLAS-shaped telemetry for Performance
          Technology and race-engineering tooling demos.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild>
            <Link href="/session?lap=12">Open session</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/about">How it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
