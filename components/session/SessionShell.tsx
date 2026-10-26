"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ContextRail } from "@/components/session/ContextRail";
import { TelemetryStage } from "@/components/session/TelemetryStage";
import { RagRail } from "@/components/session/RagRail";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  allowedLapNumbers,
  compareTargetLap,
  defaultDriverId,
  defaultLapNumber,
  defaultPlotIds,
  formatLapDelta,
  getCite,
  getDriver,
  getDrivers,
  getLap,
  getLapById,
  getLapsForDriver,
  getSample,
  getSessionPack,
  lapDistanceM,
  sectorLabel,
} from "@/lib/session";
import { formatLapTime, formatSector, cn, peakInWindow } from "@/lib/utils";
import { animateValue } from "@/lib/motion";
import type { CiteTarget } from "@/lib/types";
import { DEMO_ASK, PRODUCT, STUDIO, WEDGE } from "@/lib/brand";

function resolveSessionParams(searchParams: URLSearchParams) {
  const drivers = getDrivers();
  const driverParam = searchParams.get("driver") ?? "";
  const byCode = drivers.find(
    (d) => d.code.toLowerCase() === driverParam.toLowerCase(),
  );
  const byId = drivers.find((d) => d.id === driverParam);
  const driverId = byCode?.id ?? byId?.id ?? defaultDriverId();

  const allowed = allowedLapNumbers(driverId);
  const fallback = defaultLapNumber(driverId);
  const lap = Number(searchParams.get("lap") ?? String(fallback));
  const initialLap =
    Number.isFinite(lap) && allowed.includes(lap) ? lap : fallback;

  return {
    driverId,
    initialLap,
    initialCiteId: searchParams.get("citeId") ?? undefined,
    initialQuery: searchParams.get("q") ?? undefined,
  };
}

export function SessionShell() {
  const pack = getSessionPack();
  const drivers = getDrivers();
  const router = useRouter();
  const searchParams = useSearchParams();

  const boot = useMemo(
    () => resolveSessionParams(searchParams),
    // Boot once from the landing URL; later updates go through pushUrl.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initialCiteId = boot.initialCiteId;
  const initialQuery = boot.initialQuery;

  const [driverId, setDriverId] = useState(boot.driverId);
  const [lapNumber, setLapNumber] = useState(boot.initialLap);
  const [compare, setCompare] = useState(false);
  const [plotChannelIds, setPlotChannelIds] = useState(defaultPlotIds);
  const [playheadM, setPlayheadM] = useState(1800);
  const [evidence, setEvidence] = useState<{
    startM: number;
    endM: number;
  } | null>(null);
  const [selectedCite, setSelectedCite] = useState<CiteTarget | null>(null);
  const [pulsingCiteId, setPulsingCiteId] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>("Lap");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);
  const lengthM = lapDistanceM();

  useEffect(() => {
    try {
      if (window.localStorage.getItem("citetrace-coach-dismissed") === "1") {
        setCoachOpen(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismissCoach = () => {
    setCoachOpen(false);
    try {
      window.localStorage.setItem("citetrace-coach-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  const driver = getDriver(driverId);
  const driverLaps = getLapsForDriver(driverId);
  const lap =
    getLap(lapNumber, driverId) ?? driverLaps[0] ?? pack.laps[0];
  const lapId = lap.id;
  const compareLap = compare ? compareTargetLap(driverId) : undefined;
  const compareLapId =
    compare && compareLap && compareLap.id !== lapId ? compareLap.id : null;

  const compoundTag =
    lap.tags?.find((t) =>
      ["soft", "hard", "medium", "intermediate", "wet"].includes(t),
    ) ?? pack.session.compound.toLowerCase();

  const pushUrl = useCallback(
    (next: { driverId: string; lap: number; citeId?: string | null }) => {
      const params = new URLSearchParams({
        driver: getDriver(next.driverId).code,
        lap: String(next.lap),
      });
      if (next.citeId) params.set("citeId", next.citeId);
      router.replace(`/session?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const sectorForDistance = useCallback(
    (m: number) => {
      const s = pack.sectors.find((sec) => m >= sec.startM && m < sec.endM);
      return s?.label ?? pack.sectors[pack.sectors.length - 1]?.label ?? null;
    },
    [pack.sectors],
  );

  const lockCite = useCallback(
    (cite: CiteTarget, doPush = true) => {
      const targetLap = getLapById(cite.lapId);
      if (targetLap?.driverId && targetLap.driverId !== driverId) {
        setDriverId(targetLap.driverId);
      }
      if (targetLap && targetLap.number !== lapNumber) {
        setLapNumber(targetLap.number);
      }
      setSelectedCite(cite);
      setEvidence(cite.window);
      setPulsingCiteId(cite.id);
      if (cite.channelId) {
        setPlotChannelIds((prev) =>
          prev.includes(cite.channelId!)
            ? prev
            : [...prev, cite.channelId!],
        );
      }
      window.setTimeout(() => setPulsingCiteId(null), 600);

      const mid = (cite.window.startM + cite.window.endM) / 2;
      const spikeSample =
        cite.channelId && cite.lapId
          ? getSample(cite.channelId, cite.lapId)
          : undefined;
      const seriesPeak = spikeSample
        ? peakInWindow(
            spikeSample.series,
            cite.window.startM,
            cite.window.endM,
          )
        : null;
      const stepChannel =
        cite.channelId === "n_gear" ||
        cite.channelId === "drs" ||
        cite.channelId === "brake";
      const peak =
        cite.focusM ??
        spikeSample?.spike?.peakDistanceM ??
        (stepChannel ? mid : seriesPeak?.distanceM) ??
        mid;

      animateValue(playheadM, peak, 550, (v) => {
        setPlayheadM(v);
        setActiveSector(sectorForDistance(v));
      });

      const sec = sectorLabel(cite.sector);
      if (sec) setActiveSector(sec);

      if (doPush) {
        pushUrl({
          driverId: targetLap?.driverId ?? driverId,
          lap: targetLap?.number ?? lapNumber,
          citeId: cite.id,
        });
      }

      setSheetOpen(false);
    },
    [driverId, lapNumber, playheadM, pushUrl, sectorForDistance],
  );

  useEffect(() => {
    if (!initialCiteId) return;
    const cite = getCite(initialCiteId);
    if (cite) {
      const t = window.setTimeout(() => lockCite(cite, false), 120);
      return () => window.clearTimeout(t);
    }
  }, [initialCiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPlayhead = (m: number) => {
    setPlayheadM(m);
    setActiveSector(sectorForDistance(m));
  };

  const deltaBest = useMemo(() => {
    const fieldBest = Math.min(...pack.laps.map((l) => l.timeMs));
    const d = lap.timeMs - fieldBest;
    return d === 0
      ? "Δ field −0.000"
      : `Δ field ${d >= 0 ? "+" : ""}${(d / 1000).toFixed(3)}`;
  }, [lap.timeMs, pack.laps]);

  const explainSpike = () => {
    const cite = getCite("cite_brake_spike");
    if (cite) lockCite(cite);
  };

  const togglePlot = (channelId: string) => {
    setPlotChannelIds((prev) => {
      if (prev.includes(channelId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== channelId);
      }
      return [...prev, channelId];
    });
  };

  const selectDriver = (nextId: string) => {
    const nextLap = defaultLapNumber(nextId);
    setDriverId(nextId);
    setLapNumber(nextLap);
    setEvidence(null);
    setSelectedCite(null);
    setCompare(false);
    pushUrl({ driverId: nextId, lap: nextLap });
  };

  const selectLap = (n: number) => {
    setLapNumber(n);
    setActiveSector("Lap");
    setEvidence({ startM: 0, endM: lengthM });
    setSelectedCite(null);
    pushUrl({ driverId, lap: n });
  };

  const weather = pack.session.weather;
  const compareLabel = compareLap
    ? compareLap.driverId === driverId
      ? `Compare L${compareLap.number}`
      : `Compare ${getDriver(compareLap.driverId).code}`
    : "Compare";

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--void)]">
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[0.7rem]">
        <Link
          href="/"
          className="font-display text-[0.95rem] font-semibold tracking-tight text-[var(--chalk)] hover:text-[var(--signal)]"
        >
          Cite<span className="text-[var(--signal)]">Trace</span>
        </Link>
        <span className="hidden text-[var(--mute)] sm:inline">{STUDIO}</span>
        <span className="text-[var(--mute)]">/</span>
        <span className="text-[var(--chalk)]">
          {pack.meeting.venue.split(" ").slice(0, 3).join(" ")}{" "}
          {pack.session.label}
        </span>
        <label className="flex items-center gap-1.5 text-[var(--mist)]">
          <span className="text-[var(--mute)]">Driver</span>
          <select
            value={driverId}
            onChange={(e) => selectDriver(e.target.value)}
            className="min-h-7 border border-[var(--hairline)] bg-[var(--asphalt)] px-2 text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            aria-label="Select driver"
          >
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code}
                {d.number != null ? ` #${d.number}` : ""}
                {d.team ? ` · ${d.team}` : ""}
              </option>
            ))}
          </select>
        </label>
        <span className="uppercase tracking-wide text-[var(--mist)]">
          {compoundTag}
        </span>
        {weather && (
          <span className="hidden text-[var(--mute)] xl:inline">
            air {weather.airTemperatureC.toFixed(1)}°C · track{" "}
            {weather.trackTemperatureC.toFixed(1)}°C · RH {weather.humidityPct}%
          </span>
        )}
        <span className="text-[var(--signal)] md:ml-auto">
          {formatLapDelta(lap.deltaToBaselineMs) != null
            ? `Δ L7 ${formatLapDelta(lap.deltaToBaselineMs)}`
            : deltaBest}
        </span>
        <span className="rounded-sm bg-[var(--signal-dim)] px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-[var(--signal)]">
          {pack.meta.driverCount ?? drivers.length} cars · OpenF1
        </span>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--hairline)] bg-[var(--asphalt)] px-3 py-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Lap
        </span>
        {driverLaps.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => selectLap(l.number)}
            className={cn(
              "min-h-7 border border-[var(--hairline)] px-2 font-mono text-[0.68rem] text-[var(--mist)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              l.number === lapNumber &&
                "border-[var(--signal)]/40 bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
            )}
            title={l.tags?.join(" · ")}
          >
            {l.number}
          </button>
        ))}
        <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Focus
        </span>
        <button
          type="button"
          onClick={() => {
            setActiveSector("Lap");
            setEvidence({ startM: 0, endM: lengthM });
            setPlayheadM(lengthM / 2);
            setSelectedCite(null);
          }}
          className={cn(
            "min-h-7 border border-[var(--hairline)] px-2 font-mono text-[0.68rem] text-[var(--mist)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
            activeSector === "Lap" &&
              "border-[var(--signal)]/40 bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
          )}
          title="Whole lap — full distance window"
        >
          Lap
        </button>
        {pack.sectors.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActiveSector(s.label);
              setEvidence({ startM: s.startM, endM: s.endM });
              setPlayheadM((s.startM + s.endM) / 2);
              setSelectedCite(null);
            }}
            className={cn(
              "min-h-7 border border-[var(--hairline)] px-2 font-mono text-[0.68rem] text-[var(--mist)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
              activeSector === s.label &&
                "border-[var(--signal)]/40 bg-[var(--signal-dim)] text-[var(--signal)] shadow-[inset_0_-2px_0_var(--signal)]",
            )}
          >
            {s.label}
          </button>
        ))}
        <label className="ml-2 flex min-h-7 cursor-pointer items-center gap-2 font-mono text-[0.65rem] text-[var(--mist)]">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="accent-[var(--signal)]"
          />
          {compareLabel}
        </label>
        <Button
          type="button"
          variant="rail"
          size="sm"
          className="ml-auto h-7"
          onClick={explainSpike}
        >
          Explain spike
        </Button>
        <span className="hidden font-mono text-[0.62rem] text-[var(--mute)] lg:inline">
          {formatLapTime(lap.timeMs)} · S1 {formatSector(lap.sectorsMs[0])} · S2{" "}
          {formatSector(lap.sectorsMs[1])} · S3 {formatSector(lap.sectorsMs[2])}
        </span>
      </div>

      {coachOpen && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--signal)]/25 bg-[var(--signal-dim)] px-3 py-1.5 font-mono text-[0.62rem] text-[var(--chalk)]">
          <span className="text-[var(--signal)]">90s proof</span>
          <span className="text-[var(--mist)]">
            Ask → click Evidence → playhead locks.{" "}
            <span className="text-[var(--trace-amber)]">OVL</span> = synthetic
            overlay · <span className="text-[var(--mute)]">OF1</span> = OpenF1.
          </span>
          <span className="hidden text-[var(--mute)] lg:inline">{WEDGE}</span>
          <button
            type="button"
            onClick={() => {
              dismissCoach();
              explainSpike();
            }}
            className="min-h-6 border border-[var(--signal)]/40 bg-[var(--asphalt)] px-2 text-[var(--signal)] hover:bg-[var(--panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Run money shot
          </button>
          <button
            type="button"
            onClick={dismissCoach}
            className="ml-auto text-[var(--mute)] hover:text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            aria-label="Dismiss coach"
          >
            Dismiss
          </button>
          <span className="sr-only">{DEMO_ASK}</span>
        </div>
      )}

      <div className="hidden min-h-0 flex-1 overflow-hidden md:grid md:grid-cols-[200px_minmax(0,1fr)_228px] xl:grid-cols-[212px_minmax(0,1fr)_248px]">
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
          plotChannelIds={plotChannelIds}
          onTogglePlot={togglePlot}
          emphasizeBrake={driverId === pack.primaryDriverId}
          driverNumber={driver.number}
        />
        <main className="flex min-h-0 flex-col overflow-hidden bg-[var(--asphalt)] p-2.5 xl:p-3">
          <TelemetryStage
            lapId={lapId}
            compareLapId={compareLapId}
            playheadM={playheadM}
            onPlayhead={onPlayhead}
            evidence={evidence}
            activeCite={selectedCite}
            drawKey={`${lapId}-${compare}-${plotChannelIds.join(",")}`}
            plotChannelIds={plotChannelIds}
          />
        </main>
        <RagRail
          selectedCiteId={selectedCite?.id ?? null}
          pulsingCiteId={pulsingCiteId}
          onCite={(c) => lockCite(c)}
          initialQuery={initialQuery}
          autoAsk={Boolean(initialQuery)}
        />
      </div>

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
            plotChannelIds={plotChannelIds}
            onTogglePlot={togglePlot}
            driverNumber={driver.number}
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
            drawKey={`${lapId}-m-${compare}-${plotChannelIds.join(",")}`}
            plotChannelIds={plotChannelIds}
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
                  initialQuery={initialQuery}
                  autoAsk={Boolean(initialQuery)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <footer className="shrink-0 border-t border-[var(--hairline)] px-3 py-1 text-[0.58rem] text-[var(--mute)]">
        {STUDIO} · {PRODUCT} · {pack.meta.driverCount ?? 22} drivers · OpenF1
        subset + overlays · No SECU ·{" "}
        <Link href="/about" className="text-[var(--trace-cyan)]">
          Method
        </Link>
      </footer>
    </div>
  );
}
