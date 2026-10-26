"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContextRail } from "@/components/session/ContextRail";
import { TelemetryStage } from "@/components/session/TelemetryStage";
import { RagRail } from "@/components/session/RagRail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  getCite,
  getLap,
  getLapById,
  getSessionPack,
  getDriver,
  sectorLabel,
} from "@/lib/session";
import { formatLapTime, formatSector } from "@/lib/utils";
import { animateValue } from "@/lib/motion";
import type { CiteTarget } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SessionShell({
  initialLap,
  initialCiteId,
}: {
  initialLap: number;
  initialCiteId?: string;
}) {
  const pack = getSessionPack();
  const driver = getDriver();
  const router = useRouter();

  const [lapNumber, setLapNumber] = useState(initialLap);
  const [compare, setCompare] = useState(false);
  const [playheadM, setPlayheadM] = useState(1800);
  const [evidence, setEvidence] = useState<{
    startM: number;
    endM: number;
  } | null>(null);
  const [selectedCite, setSelectedCite] = useState<CiteTarget | null>(null);
  const [pulsingCiteId, setPulsingCiteId] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>("S2");
  const [sheetOpen, setSheetOpen] = useState(false);

  const lap = getLap(lapNumber) ?? pack.laps[1];
  const lapId = lap.id;
  const compareLapId = compare
    ? (getLap(11)?.id ?? null)
    : null;

  const sectorForDistance = useCallback(
    (m: number) => {
      const s = pack.sectors.find((sec) => m >= sec.startM && m < sec.endM);
      return s?.label ?? pack.sectors[pack.sectors.length - 1]?.label ?? null;
    },
    [pack.sectors],
  );

  const lockCite = useCallback(
    (cite: CiteTarget, pushUrl = true) => {
      const targetLap = getLapById(cite.lapId);
      if (targetLap && targetLap.number !== lapNumber) {
        setLapNumber(targetLap.number);
      }
      setSelectedCite(cite);
      setEvidence(cite.window);
      setPulsingCiteId(cite.id);
      window.setTimeout(() => setPulsingCiteId(null), 600);

      const mid = (cite.window.startM + cite.window.endM) / 2;
      const peak =
        cite.channelId === "brake_temp" && cite.summary.includes("942")
          ? 3120
          : mid;

      animateValue(playheadM, peak, 550, (v) => {
        setPlayheadM(v);
        setActiveSector(sectorForDistance(v));
      });

      const sec = sectorLabel(cite.sector);
      if (sec) setActiveSector(sec);

      if (pushUrl) {
        const params = new URLSearchParams({
          lap: String(targetLap?.number ?? lapNumber),
          citeId: cite.id,
        });
        router.replace(`/session?${params.toString()}`, { scroll: false });
      }

      setSheetOpen(false);
    },
    [lapNumber, playheadM, router, sectorForDistance],
  );

  useEffect(() => {
    if (!initialCiteId) return;
    const cite = getCite(initialCiteId);
    if (cite) {
      // Deep-link: jump without fighting first paint
      const t = window.setTimeout(() => lockCite(cite, false), 120);
      return () => window.clearTimeout(t);
    }
  }, [initialCiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPlayhead = (m: number) => {
    setPlayheadM(m);
    setActiveSector(sectorForDistance(m));
  };

  const deltaBest = useMemo(() => {
    const best = Math.min(...pack.laps.map((l) => l.timeMs));
    const d = lap.timeMs - best;
    return d === 0 ? "Δ best −0.000" : `Δ best +${(d / 1000).toFixed(3)}`;
  }, [lap.timeMs, pack.laps]);

  const explainSpike = () => {
    const cite = getCite("cite_brake_spike");
    if (cite) lockCite(cite);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--void)]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-[0.72rem]">
        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-tight text-[var(--chalk)] hover:text-[var(--signal)]"
        >
          RAG<span className="text-[var(--signal)]">Atlas</span>
        </Link>
        <span className="text-[var(--mute)]">/</span>
        <span className="text-[var(--chalk)]">
          {pack.meeting.venue.split(" ")[0]} {pack.session.label} · {driver.code}{" "}
          · {pack.session.compound}
        </span>
        <span className="text-[var(--signal)] md:ml-auto">
          {lap.deltaToBaselineMs != null
            ? `Δ L11 +${(lap.deltaToBaselineMs / 1000).toFixed(3)}`
            : deltaBest}
        </span>
        <span className="rounded-sm bg-[var(--signal-dim)] px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider text-[var(--signal)]">
          Synthetic
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--hairline)] bg-[var(--asphalt)] px-3 py-2">
        <span className="font-mono text-[0.65rem] text-[var(--mute)]">Lap</span>
        {pack.laps.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              setLapNumber(l.number);
              setEvidence(null);
              setSelectedCite(null);
              router.replace(`/session?lap=${l.number}`, { scroll: false });
            }}
            className={cn(
              "min-h-8 border border-[var(--hairline)] px-2.5 font-mono text-[0.72rem] text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              l.number === lapNumber &&
                "bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
            )}
          >
            {l.number}
          </button>
        ))}
        <span className="ml-2 font-mono text-[0.65rem] text-[var(--mute)]">
          Sector
        </span>
        {pack.sectors.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActiveSector(s.label);
              setPlayheadM((s.startM + s.endM) / 2);
            }}
            className={cn(
              "min-h-8 border border-[var(--hairline)] px-2.5 font-mono text-[0.72rem] text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              activeSector === s.label &&
                "bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
            )}
          >
            {s.label}
          </button>
        ))}
        <label className="ml-2 flex min-h-8 cursor-pointer items-center gap-2 font-mono text-[0.68rem] text-[var(--mist)]">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="accent-[var(--signal)]"
          />
          Compare L11
        </label>
        <Button
          type="button"
          variant="rail"
          size="sm"
          className="ml-auto"
          onClick={explainSpike}
        >
          Explain spike
        </Button>
        <span className="hidden font-mono text-[0.65rem] text-[var(--mute)] sm:inline">
          {formatLapTime(lap.timeMs)} · S1 {formatSector(lap.sectorsMs[0])} · S2{" "}
          {formatSector(lap.sectorsMs[1])} · S3 {formatSector(lap.sectorsMs[2])}
        </span>
      </div>

      {/* Desktop three-zone */}
      <div className="hidden min-h-0 flex-1 md:grid md:grid-cols-[200px_minmax(0,1fr)_260px]">
        <ContextRail
          lapId={lapId}
          playheadM={playheadM}
          activeSector={activeSector}
          evidence={evidence}
          activeCiteId={selectedCite?.id ?? null}
          onTimelineCite={(id) => {
            const c = getCite(id);
            if (c) lockCite(c);
          }}
          emphasizeBrake
        />
        <main className="flex min-h-0 flex-col bg-[var(--asphalt)] p-3">
          <TelemetryStage
            lapId={lapId}
            compareLapId={compareLapId}
            playheadM={playheadM}
            onPlayhead={onPlayhead}
            evidence={evidence}
            activeCite={selectedCite}
            drawKey={`${lapId}-${compare}`}
          />
        </main>
        <RagRail
          selectedCiteId={selectedCite?.id ?? null}
          pulsingCiteId={pulsingCiteId}
          onCite={(c) => lockCite(c)}
        />
      </div>

      {/* Mobile stack */}
      <div className="flex flex-1 flex-col md:hidden">
        <div className="border-b border-[var(--hairline)] bg-[var(--rail)] p-2">
          <ContextRail
            lapId={lapId}
            playheadM={playheadM}
            activeSector={activeSector}
            evidence={evidence}
            activeCiteId={selectedCite?.id ?? null}
            onTimelineCite={(id) => {
              const c = getCite(id);
              if (c) lockCite(c);
            }}
          />
        </div>
        <main className="min-h-[45vh] flex-1 bg-[var(--asphalt)] p-2">
          <TelemetryStage
            lapId={lapId}
            compareLapId={compareLapId}
            playheadM={playheadM}
            onPlayhead={onPlayhead}
            evidence={evidence}
            activeCite={selectedCite}
            drawKey={`${lapId}-m-${compare}`}
          />
        </main>
        <div className="sticky bottom-0 border-t border-[var(--hairline)] bg-[var(--rail)] p-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="w-full" variant="signal">
                Ask the session
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Ask the session</SheetTitle>
              <div className="mt-3 max-h-[60vh] overflow-auto">
                <RagRail
                  selectedCiteId={selectedCite?.id ?? null}
                  pulsingCiteId={pulsingCiteId}
                  onCite={(c) => lockCite(c)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <footer className="border-t border-[var(--hairline)] px-3 py-1.5 text-[0.6rem] text-[var(--mute)]">
        Independent portfolio prototype · Synthetic data · No live motorsport
        feeds ·{" "}
        <Link href="/about" className="text-[var(--trace-cyan)]">
          Method
        </Link>
      </footer>
    </div>
  );
}
