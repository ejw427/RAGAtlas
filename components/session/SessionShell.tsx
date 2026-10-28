"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plate } from "@/components/identity/Plate";
import { CircuitMapModal } from "@/components/session/CircuitMapModal";
import { CompareDetailSheet } from "@/components/session/CompareDetailSheet";
import { CompareDuo } from "@/components/session/CompareDuo";
import { DeltaRibbon } from "@/components/session/DeltaRibbon";
import { DemoGuide, type DemoStep } from "@/components/session/DemoGuide";
import { HouseSwitcher } from "@/components/session/HouseSwitcher";
import { RacerDetailSheet } from "@/components/session/RacerDetailSheet";
import { SelectDock } from "@/components/session/SelectDock";
import { TelemetryStage } from "@/components/session/TelemetryStage";
import { TrackSchematic } from "@/components/session/TrackSchematic";
import { RagRail } from "@/components/session/RagRail";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  channelDeltaSeries,
  deltaChannelLegend,
} from "@/lib/compare-series";
import {
  accentFor,
  bestFlyerFor,
  biggestGainSector,
  biggestLossSector,
  fieldBestLap,
  getLapSafe,
  otherCompoundLap,
  RACE_PLOT_IDS,
  resolveDriverParam,
  fieldTopTwoCompare,
  resolveHouse,
  resolveLapNumber,
  sectorDeltas,
  teammateId,
} from "@/lib/identity";
import { StageAcqBar } from "@/components/session/StageAcqBar";
import {
  defaultDriverId,
  defaultLapNumber,
  defaultPlotIds,
  getCite,
  getDriver,
  getLapById,
  getLapsForDriver,
  getSample,
  getSessionPack,
  lapDistanceM,
  sectorLabel,
} from "@/lib/session";
import { peakInWindow } from "@/lib/utils";
import { animateValue } from "@/lib/motion";
import type { CiteTarget } from "@/lib/types";
import {
  AUTHOR,
  DEMO_ASK,
  DEMO_NO_HIT,
  LIVE_URL,
  PORTFOLIO_URL,
  PRODUCT,
  STUDIO,
} from "@/lib/brand";

function resolveSessionParams(searchParams: URLSearchParams) {
  const demoForced = searchParams.get("demo") === "1";
  const houseKey = searchParams.get("house");
  const house = resolveHouse(houseKey);
  if (house) {
    return {
      driverId: house.focusDriverId,
      initialLap: house.focusLap,
      referenceDriverId: house.referenceDriverId as string | null,
      referenceLap: house.referenceLap as number | null,
      initialCiteId: searchParams.get("citeId") ?? undefined,
      initialQuery: searchParams.get("q") ?? undefined,
      initialSector: searchParams.get("sector") ?? "Lap",
      initialChannels: searchParams.get("ch"),
      demoForced,
      houseId: house.toolsDemo
        ? "tools"
        : (houseKey?.toLowerCase() ?? null),
      toolsDemo: Boolean(house.toolsDemo),
    };
  }

  const hasExplicitPair =
    Boolean(searchParams.get("a") || searchParams.get("driver")) ||
    Boolean(searchParams.get("b"));
  const fieldLead = !hasExplicitPair ? fieldTopTwoCompare() : null;

  const focusId =
    resolveDriverParam(searchParams.get("a")) ??
    resolveDriverParam(searchParams.get("driver")) ??
    fieldLead?.focusDriverId ??
    defaultDriverId();
  const focusLap = resolveLapNumber(
    focusId,
    searchParams.get("lapA") ?? searchParams.get("lap"),
    fieldLead?.focusLap ?? defaultLapNumber(focusId),
  );
  const refId =
    resolveDriverParam(searchParams.get("b")) ??
    fieldLead?.referenceDriverId ??
    null;
  const refLap = refId
    ? resolveLapNumber(
        refId,
        searchParams.get("lapB"),
        fieldLead?.referenceLap ?? defaultLapNumber(refId),
      )
    : null;

  return {
    driverId: focusId,
    initialLap: focusLap,
    referenceDriverId: refId,
    referenceLap: refLap,
    initialCiteId: searchParams.get("citeId") ?? undefined,
    initialQuery: searchParams.get("q") ?? undefined,
    initialSector: searchParams.get("sector") ?? "Lap",
    initialChannels: searchParams.get("ch"),
    demoForced,
    houseId: null as string | null,
    toolsDemo: false,
  };
}

export function SessionShell() {
  const pack = getSessionPack();
  const router = useRouter();
  const searchParams = useSearchParams();

  const boot = useMemo(
    () => resolveSessionParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [driverId, setDriverId] = useState(boot.driverId);
  const [lapNumber, setLapNumber] = useState(boot.initialLap);
  const [referenceDriverId, setReferenceDriverId] = useState<string | null>(
    boot.referenceDriverId,
  );
  const [referenceLapNumber, setReferenceLapNumber] = useState<number | null>(
    boot.referenceLap,
  );
  const [activeHouse, setActiveHouse] = useState<string | null>(
    boot.houseId ?? (boot.toolsDemo ? "tools" : null),
  );
  const [plotChannelIds, setPlotChannelIds] = useState(() => {
    if (boot.initialChannels) {
      const ids = boot.initialChannels.split(",").filter(Boolean);
      // Legacy house/demo URLs pinned a thin Lap pack — lift to full Race stage.
      if (
        ids.length > 0 &&
        ids.length < RACE_PLOT_IDS.length &&
        ids.includes("speed") &&
        ids.includes("throttle") &&
        ids.includes("brake")
      ) {
        return [...RACE_PLOT_IDS];
      }
      if (ids.length) return ids;
    }
    return [...RACE_PLOT_IDS];
  });
  const [playheadM, setPlayheadM] = useState(1800);
  const [evidence, setEvidence] = useState<{
    startM: number;
    endM: number;
  } | null>(null);
  const [selectedCite, setSelectedCite] = useState<CiteTarget | null>(null);
  const [pulsingCiteId, setPulsingCiteId] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(
    boot.initialSector,
  );
  const [askOpen, setAskOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [racerSheet, setRacerSheet] = useState<"Focus" | "Reference" | null>(
    null,
  );
  const [mapWindow, setMapWindow] = useState<{
    startM: number;
    endM: number;
  } | null>(null);
  /** Channel driving green/red map + compare paint when dual-car. */
  const [deltaChannelId, setDeltaChannelId] = useState("speed");
  const [demoOpen, setDemoOpen] = useState(true);
  const [demoStep, setDemoStep] = useState<DemoStep>(0);
  const [askTrigger, setAskTrigger] = useState<{
    query: string;
    nonce: number;
  } | null>(null);
  const [emphasizeCites, setEmphasizeCites] = useState(false);
  const lengthM = lapDistanceM();

  useEffect(() => {
    if (boot.demoForced) {
      setDemoOpen(true);
      return;
    }
    try {
      if (window.localStorage.getItem("citetrace-demo-dismissed") === "1") {
        setDemoOpen(false);
      }
    } catch {
      /* ignore */
    }
  }, [boot.demoForced]);

  const dismissDemo = () => {
    setDemoOpen(false);
    setEmphasizeCites(false);
    if (boot.demoForced) return;
    try {
      window.localStorage.setItem("citetrace-demo-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  const driver = getDriver(driverId);
  const driverLaps = getLapsForDriver(driverId);
  const lap = getLapSafe(driverId, lapNumber);
  const lapId = lap.id;
  const referenceDriver = referenceDriverId
    ? getDriver(referenceDriverId)
    : null;
  const referenceLaps = referenceDriverId
    ? getLapsForDriver(referenceDriverId)
    : [];
  const referenceLap =
    referenceDriverId && referenceLapNumber != null
      ? getLapSafe(referenceDriverId, referenceLapNumber)
      : null;
  const compareLapId =
    referenceLap && referenceLap.id !== lapId ? referenceLap.id : null;
  const focusAccent = accentFor(driver);
  const referenceAccentRaw = accentFor(referenceDriver ?? undefined);
  // Same-house teammates share a brand accent — force a chalk/amber Ref stroke
  // so dual-draw on stage + map never collapses into one colour.
  const referenceAccent =
    compareLapId &&
    referenceAccentRaw.accent.toLowerCase() === focusAccent.accent.toLowerCase()
      ? { ...referenceAccentRaw, accent: "#F4B942", second: "#E8EEF5" }
      : referenceAccentRaw;
  const deltas = sectorDeltas(lap, referenceLap);
  const gain = biggestGainSector(deltas);
  const loss = biggestLossSector(deltas);
  const activeDeltaChannel =
    compareLapId && getSample(deltaChannelId, lapId) && getSample(deltaChannelId, compareLapId)
      ? deltaChannelId
      : compareLapId
        ? "speed"
        : deltaChannelId;
  const channelDelta = useMemo(
    () =>
      compareLapId
        ? channelDeltaSeries(
            activeDeltaChannel,
            lapId,
            compareLapId,
            lengthM,
            200,
          )
        : null,
    [compareLapId, lapId, lengthM, activeDeltaChannel],
  );
  const deltaLegend = deltaChannelLegend(activeDeltaChannel);
  const setCompareChannel = useCallback(
    (id: string) => {
      if (!compareLapId) return;
      if (!getSample(id, lapId) || !getSample(id, compareLapId)) return;
      setDeltaChannelId(id);
    },
    [compareLapId, lapId],
  );
  useEffect(() => {
    if (!compareLapId) {
      setDeltaChannelId("speed");
      return;
    }
    if (
      !getSample(deltaChannelId, lapId) ||
      !getSample(deltaChannelId, compareLapId)
    ) {
      setDeltaChannelId("speed");
    }
  }, [compareLapId, deltaChannelId, lapId]);
  const openCompare = useCallback(() => {
    if (compareLapId) setCompareOpen(true);
  }, [compareLapId]);

  const pushUrl = useCallback(
    (next: {
      driverId: string;
      lap: number;
      referenceDriverId?: string | null;
      referenceLap?: number | null;
      citeId?: string | null;
      sector?: string | null;
      channels?: string[];
      house?: string | null;
      demo?: boolean;
    }) => {
      const params = new URLSearchParams({
        a: getDriver(next.driverId).code,
        lapA: String(next.lap),
      });
      params.set("driver", getDriver(next.driverId).code);
      params.set("lap", String(next.lap));
      if (next.referenceDriverId) {
        params.set("b", getDriver(next.referenceDriverId).code);
        if (next.referenceLap != null) {
          params.set("lapB", String(next.referenceLap));
        }
      }
      if (next.citeId) params.set("citeId", next.citeId);
      if (next.sector && next.sector !== "Lap") {
        params.set("sector", next.sector);
      }
      if (next.channels?.length) {
        params.set("ch", next.channels.join(","));
      }
      const house = next.house ?? activeHouse;
      if (house) params.set("house", house);
      if (next.demo ?? (boot.demoForced || demoOpen)) params.set("demo", "1");
      router.replace(`/session?${params.toString()}`, { scroll: false });
    },
    [router, activeHouse, boot.demoForced, demoOpen],
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
      setEmphasizeCites(false);
      if (demoOpen) setDemoStep(3);
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
          referenceDriverId,
          referenceLap: referenceLapNumber,
          citeId: cite.id,
          sector: sec ?? activeSector,
          channels: plotChannelIds,
        });
      }

      setAskOpen(false);
    },
    [
      driverId,
      lapNumber,
      playheadM,
      pushUrl,
      sectorForDistance,
      referenceDriverId,
      referenceLapNumber,
      activeSector,
      plotChannelIds,
      demoOpen,
    ],
  );

  useEffect(() => {
    if (!boot.initialCiteId) return;
    const cite = getCite(boot.initialCiteId);
    if (cite) {
      const t = window.setTimeout(() => lockCite(cite, false), 120);
      return () => window.clearTimeout(t);
    }
  }, [boot.initialCiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPlayhead = (m: number) => {
    setPlayheadM(m);
    setActiveSector(sectorForDistance(m));
  };

  const selectSector = useCallback(
    (label: string) => {
      setActiveSector(label);
      setSelectedCite(null);
      if (label === "Lap") {
        setEvidence({ startM: 0, endM: lengthM });
        setPlayheadM(lengthM / 2);
      } else {
        const s = pack.sectors.find((sec) => sec.label === label);
        if (s) {
          setEvidence({ startM: s.startM, endM: s.endM });
          setPlayheadM((s.startM + s.endM) / 2);
        }
      }
      if (demoOpen && label !== "Lap") setDemoStep(1);
      pushUrl({
        driverId,
        lap: lapNumber,
        referenceDriverId,
        referenceLap: referenceLapNumber,
        sector: label,
        channels: plotChannelIds,
      });
    },
    [
      lengthM,
      pack.sectors,
      demoOpen,
      pushUrl,
      driverId,
      lapNumber,
      referenceDriverId,
      referenceLapNumber,
      plotChannelIds,
    ],
  );

  const togglePlot = (channelId: string) => {
    setPlotChannelIds((prev) => {
      let next: string[];
      if (prev.includes(channelId)) {
        if (prev.length <= 1) return prev;
        next = prev.filter((id) => id !== channelId);
      } else {
        next = [...prev, channelId];
      }
      pushUrl({
        driverId,
        lap: lapNumber,
        referenceDriverId,
        referenceLap: referenceLapNumber,
        sector: activeSector,
        channels: next,
      });
      return next;
    });
  };

  const setPlots = (ids: string[]) => {
    setPlotChannelIds(ids);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId,
      referenceLap: referenceLapNumber,
      sector: activeSector,
      channels: ids,
    });
  };

  const selectDriver = (nextId: string) => {
    const nextLap = defaultLapNumber(nextId);
    setDriverId(nextId);
    setLapNumber(nextLap);
    setEvidence(null);
    setSelectedCite(null);
    setActiveHouse(null);
    setActiveSector("Lap");
    // Keep playhead; map markers remount via pulseKey so accent/number/code update.
    pushUrl({
      driverId: nextId,
      lap: nextLap,
      referenceDriverId,
      referenceLap: referenceLapNumber,
      channels: plotChannelIds,
      house: null,
      sector: "Lap",
    });
  };

  const selectLap = (n: number) => {
    setLapNumber(n);
    setActiveSector("Lap");
    setEvidence({ startM: 0, endM: lengthM });
    setSelectedCite(null);
    pushUrl({
      driverId,
      lap: n,
      referenceDriverId,
      referenceLap: referenceLapNumber,
      channels: plotChannelIds,
    });
  };

  const selectReferenceDriver = (nextId: string) => {
    const nextLap = defaultLapNumber(nextId);
    const nextPlots = plotsForCompare(plotChannelIds);
    setPlotChannelIds(nextPlots);
    setReferenceDriverId(nextId);
    setReferenceLapNumber(nextLap);
    setActiveHouse(null);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId: nextId,
      referenceLap: nextLap,
      channels: nextPlots,
      house: null,
    });
  };

  const selectReferenceLap = (n: number) => {
    setReferenceLapNumber(n);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId,
      referenceLap: n,
      channels: plotChannelIds,
    });
  };

  /** Dual-car needs enough channels to argue the lap — never leave a starved trio. */
  const plotsForCompare = (current: string[]) =>
    current.length < RACE_PLOT_IDS.length ? [...RACE_PLOT_IDS] : current;

  const fillTeammate = () => {
    const mate = teammateId(driverId);
    if (!mate) return;
    const flyer = bestFlyerFor(mate);
    if (!flyer) return;
    const nextPlots = plotsForCompare(plotChannelIds);
    setPlotChannelIds(nextPlots);
    setReferenceDriverId(mate);
    setReferenceLapNumber(flyer.number);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId: mate,
      referenceLap: flyer.number,
      channels: nextPlots,
    });
  };

  const fillFieldBest = () => {
    const best = fieldBestLap(lapId);
    if (!best?.driverId) return;
    const nextPlots = plotsForCompare(plotChannelIds);
    setPlotChannelIds(nextPlots);
    setReferenceDriverId(best.driverId);
    setReferenceLapNumber(best.number);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId: best.driverId,
      referenceLap: best.number,
      channels: nextPlots,
    });
  };

  const fillOtherCompound = () => {
    const other = otherCompoundLap(driverId, lap);
    if (!other) return;
    setReferenceDriverId(driverId);
    setReferenceLapNumber(other.number);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId: driverId,
      referenceLap: other.number,
      channels: plotChannelIds,
    });
  };

  const swapCars = () => {
    if (!referenceDriverId || referenceLapNumber == null) return;
    const prevFocus = { driverId, lap: lapNumber };
    setDriverId(referenceDriverId);
    setLapNumber(referenceLapNumber);
    setReferenceDriverId(prevFocus.driverId);
    setReferenceLapNumber(prevFocus.lap);
    pushUrl({
      driverId: referenceDriverId,
      lap: referenceLapNumber,
      referenceDriverId: prevFocus.driverId,
      referenceLap: prevFocus.lap,
      channels: plotChannelIds,
    });
  };

  const clearReference = () => {
    setReferenceDriverId(null);
    setReferenceLapNumber(null);
    setActiveHouse(null);
    const soloPlots = defaultPlotIds();
    setPlotChannelIds(soloPlots);
    pushUrl({
      driverId,
      lap: lapNumber,
      referenceDriverId: null,
      referenceLap: null,
      channels: soloPlots,
      house: null,
    });
  };

  const applyHouse = (houseId: string) => {
    const resolved = resolveHouse(houseId);
    if (!resolved) return;
    const racePlots = [...RACE_PLOT_IDS];
    setActiveHouse(houseId);
    setDriverId(resolved.focusDriverId);
    setLapNumber(resolved.focusLap);
    setReferenceDriverId(resolved.referenceDriverId);
    setReferenceLapNumber(resolved.referenceLap);
    setPlotChannelIds(racePlots);
    setMapWindow(null);
    setEvidence(null);
    setSelectedCite(null);
    setActiveSector("Lap");
    setDemoStep(0);
    pushUrl({
      driverId: resolved.focusDriverId,
      lap: resolved.focusLap,
      referenceDriverId: resolved.referenceDriverId,
      referenceLap: resolved.referenceLap,
      channels: racePlots,
      house: houseId,
      sector: "Lap",
    });
    if (resolved.toolsDemo || houseId === "tools") {
      setDemoOpen(true);
      openAskPanel();
    }
  };

  const openAskPanel = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1280px)").matches
    ) {
      return;
    }
    setAskOpen(true);
  };

  const runDemoStep = (step: DemoStep) => {
    setDemoStep(step);
    setDemoOpen(true);
    if (step === 0) {
      setEmphasizeCites(false);
      return;
    }
    if (step === 1) {
      const label = gain?.label ?? "S2";
      selectSector(label);
      return;
    }
    if (step === 2) {
      openAskPanel();
      setAskTrigger((prev) => ({
        query: DEMO_ASK,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
      setEmphasizeCites(false);
      setPlotChannelIds((prev) =>
        prev.includes("brake_temp") ? prev : [...prev, "brake_temp"],
      );
      return;
    }
    if (step === 3) {
      openAskPanel();
      setAskTrigger((prev) => ({
        query: DEMO_ASK,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
      setEmphasizeCites(true);
      return;
    }
    if (step === 4) {
      openAskPanel();
      setAskTrigger((prev) => ({
        query: DEMO_NO_HIT,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
      setEmphasizeCites(false);
    }
  };

  useEffect(() => {
    if (!boot.demoForced) return;
    const t = window.setTimeout(() => setDemoStep(0), 80);
    return () => window.clearTimeout(t);
  }, [boot.demoForced]);

  const weather = pack.session.weather;
  const traps = (() => {
    const open = lap.openf1;
    if (!open) return [];
    const s1 = pack.sectors.find((s) => s.label === "S1");
    const s2 = pack.sectors.find((s) => s.label === "S2");
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
      out.push({
        id: "st",
        m: Math.round(lengthM * 0.59),
        label: "ST",
        speed: open.st_speed,
      });
    }
    return out;
  })();

  const rag = (
    <RagRail
      selectedCiteId={selectedCite?.id ?? null}
      pulsingCiteId={pulsingCiteId}
      onCite={(c) => lockCite(c)}
      initialQuery={boot.initialQuery}
      autoAsk={Boolean(boot.initialQuery)}
      askTrigger={askTrigger}
      emphasizeCites={emphasizeCites}
      compact
    />
  );

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--void)]">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.2]"
        style={{
          backgroundImage: "url(/cota-tower-day.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
        aria-hidden
      />
      {/* Header scrolls away with the page; pit wall fills the viewport once it's gone. */}
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <header className="relative z-[1] flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--hairline)] bg-[var(--panel)]/92 px-3 py-1.5 font-mono text-[0.7rem] backdrop-blur-[2px]">
          <Link
            href="/"
            className="shrink-0 font-display text-[0.95rem] font-semibold tracking-tight text-[var(--chalk)] hover:text-[var(--signal)]"
          >
            Cite<span className="text-[var(--signal)]">Trace</span>
          </Link>
          <span className="hidden shrink-0 text-[var(--mute)] lg:inline">
            {STUDIO}
          </span>
          <span className="hidden text-[var(--mute)] sm:inline">/</span>
          <span className="min-w-0 text-[var(--chalk)]">
            <span className="hidden sm:inline">{pack.meeting.venue}</span>
            <span className="sm:hidden">COTA</span>
            {" · "}
            {pack.session.label}
            {pack.meeting.locality ? (
              <span className="hidden text-[var(--mute)] xl:inline">
                {" "}
                · {pack.meeting.locality}
              </span>
            ) : null}
          </span>
          <HouseSwitcher activeHouse={activeHouse} onSelect={applyHouse} />
          {weather && (
            <span className="ml-auto hidden shrink-0 text-[var(--mute)] lg:inline">
              air {weather.airTemperatureC.toFixed(1)}°C · track{" "}
              {weather.trackTemperatureC.toFixed(1)}°C · RH {weather.humidityPct}%
            </span>
          )}
          <span className="shrink-0 rounded-sm bg-[var(--signal-dim)] px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider text-[var(--signal)]">
            {pack.meta.driverCount ?? 22} cars · OpenF1
          </span>
        </header>

        <div className="flex min-h-full flex-1 flex-col">
          <CompareDuo
            focusDriver={driver}
            focusLap={lap}
            focusLaps={driverLaps}
            referenceDriver={referenceDriver}
            referenceLap={referenceLap}
            referenceLaps={referenceLaps}
            onFocusDriver={selectDriver}
            onFocusLap={selectLap}
            onReferenceDriver={selectReferenceDriver}
            onReferenceLap={selectReferenceLap}
            onSwap={swapCars}
            onClear={clearReference}
            onTeammate={fillTeammate}
            onFieldBest={fillFieldBest}
            onOtherCompound={fillOtherCompound}
            canOtherCompound={Boolean(otherCompoundLap(driverId, lap))}
            onOpenCompare={compareLapId ? openCompare : undefined}
            onInspectFocus={() => setRacerSheet("Focus")}
            onInspectReference={
              referenceDriver && referenceLap
                ? () => setRacerSheet("Reference")
                : undefined
            }
          />

          {deltas && (
            <DeltaRibbon
              lapMs={deltas.lapMs}
              sectorsMs={deltas.sectorsMs}
              activeSector={activeSector}
              onSelect={selectSector}
              onOpenCompare={openCompare}
            />
          )}

          {demoOpen && (
            <DemoGuide
              step={demoStep}
              gainLabel={gain?.label ?? "S2"}
              onStep={runDemoStep}
              onDismiss={dismissDemo}
            />
          )}

          {/* Page scroll owns the header on narrow; columns scroll inside on wide desks. */}
          <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)_240px] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden xl:grid-cols-[210px_minmax(0,1fr)_210px_280px]">
            <div className="min-h-0 md:overflow-y-auto md:overscroll-contain">
              <div className="md:hidden">
                <Plate
                  driver={driver}
                  lap={lap}
                  activeSector={activeSector}
                  sectorDeltasMs={deltas?.sectorsMs ?? null}
                  onSelectSector={selectSector}
                  onInspect={() => setRacerSheet("Focus")}
                  compact
                />
              </div>
              <div className="hidden md:block">
                <Plate
                  driver={driver}
                  lap={lap}
                  activeSector={activeSector}
                  sectorDeltasMs={deltas?.sectorsMs ?? null}
                  onSelectSector={selectSector}
                  onInspect={() => setRacerSheet("Focus")}
                />
              </div>
            </div>

            <main
              className={`flex min-h-[85vh] flex-col gap-2 bg-[var(--asphalt)] p-2 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:p-2.5 xl:p-3 ${
                compareLapId ? "compare-stage-glow" : ""
              }`}
            >
              <div className="h-[min(48vw,360px)] shrink-0 overflow-hidden md:h-[min(34vh,360px)] md:min-h-[260px]">
                <TrackSchematic
                  stage
                  paintMode={compareLapId ? "both" : "sector"}
                  activeSector={activeSector}
                  playheadM={playheadM}
                  evidence={evidence}
                  onPlayhead={onPlayhead}
                  onSector={selectSector}
                  focusAccent={focusAccent.accent}
                  referenceAccent={
                    compareLapId ? referenceAccent.accent : undefined
                  }
                  focusNumber={driver.number}
                  referenceNumber={referenceDriver?.number}
                  focusCode={driver.code}
                  referenceCode={referenceDriver?.code}
                  comparing={Boolean(compareLapId)}
                  traps={traps}
                  sectorDeltaMs={deltas?.sectorsMs ?? null}
                  gainSectorIndex={gain?.index ?? null}
                  lossSectorIndex={
                    loss && loss.ms > 0 ? loss.index : null
                  }
                  channelDelta={channelDelta}
                  deltaChannelLabel={deltaLegend.label}
                  deltaAheadLabel={deltaLegend.ahead}
                  deltaBehindLabel={deltaLegend.behind}
                  onOpenCompare={compareLapId ? openCompare : undefined}
                  onViewWindow={setMapWindow}
                  viewWindow={mapWindow}
                  onExpand={() => setMapOpen(true)}
                  onInspectFocus={() => setRacerSheet("Focus")}
                  onInspectReference={
                    referenceDriver && referenceLap
                      ? () => setRacerSheet("Reference")
                      : undefined
                  }
                  lapId={lapId}
                  compareLapId={compareLapId}
                />
              </div>
              <div className="flex min-h-[720px] flex-1 flex-col gap-1.5 md:min-h-[620px]">
                <StageAcqBar
                  plotChannelIds={plotChannelIds}
                  comparing={Boolean(compareLapId)}
                  onSetPlots={setPlots}
                  onSolo={compareLapId ? clearReference : undefined}
                  totalChannels={defaultPlotIds().length}
                  viewWindow={mapWindow}
                  onClearWindow={() => {
                    setMapWindow(null);
                    selectSector("Lap");
                  }}
                />
                <TelemetryStage
                  lapId={lapId}
                  compareLapId={compareLapId}
                  playheadM={playheadM}
                  onPlayhead={onPlayhead}
                  evidence={evidence}
                  activeCite={selectedCite}
                  drawKey={`${lapId}-${compareLapId ?? "solo"}-${plotChannelIds.join(",")}-${mapWindow?.startM ?? 0}-${mapWindow?.endM ?? 0}`}
                  plotChannelIds={plotChannelIds}
                  focusAccent={focusAccent.accent}
                  referenceAccent={
                    compareLapId ? referenceAccent.accent : undefined
                  }
                  focusLabel={`${driver.code} ${driver.number ?? ""}`.trim()}
                  referenceLabel={
                    referenceDriver
                      ? `${referenceDriver.code} ${referenceDriver.number ?? ""}`.trim()
                      : undefined
                  }
                  onOpenCompare={compareLapId ? openCompare : undefined}
                  viewWindow={mapWindow}
                  onViewWindow={setMapWindow}
                  sectorDeltaMs={deltas?.sectorsMs ?? null}
                  deltaChannelId={compareLapId ? activeDeltaChannel : null}
                  onDeltaChannel={compareLapId ? setCompareChannel : undefined}
                />
              </div>
            </main>

            <div className="min-h-[360px] border-t border-[var(--hairline)] md:min-h-0 md:overflow-y-auto md:overscroll-contain md:border-t-0">
              <SelectDock
                lapId={lapId}
                compareLapId={compareLapId}
                playheadM={playheadM}
                activeCiteId={selectedCite?.id ?? null}
                onTimelineCite={(id) => {
                  const c = getCite(id);
                  if (c) lockCite(c);
                }}
                plotChannelIds={plotChannelIds}
                onTogglePlot={togglePlot}
                onSetPlots={setPlots}
                deltaChannelId={compareLapId ? activeDeltaChannel : null}
                onDeltaChannel={compareLapId ? setCompareChannel : undefined}
                emphasizeBrake={driverId === pack.primaryDriverId}
                driverLaps={driverLaps}
                lapNumber={lapNumber}
                onSelectLap={selectLap}
                onAsk={openAskPanel}
              />
            </div>

            <div className="hidden min-h-0 overflow-y-auto overscroll-contain border-l border-[var(--hairline)] xl:block">
              {rag}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={askOpen} onOpenChange={setAskOpen}>
        <SheetContent className="md:inset-x-auto md:right-0 md:bottom-0 md:top-0 md:max-h-none md:w-[min(100vw,380px)] md:rounded-none md:border-l xl:hidden">
          <SheetTitle>Ask the session</SheetTitle>
          <div className="mt-3 max-h-[70vh] overflow-auto md:max-h-[calc(100dvh-4rem)]">
            {/* Sheet instance for < xl; xl uses the rail column */}
            <RagRail
              selectedCiteId={selectedCite?.id ?? null}
              pulsingCiteId={pulsingCiteId}
              onCite={(c) => lockCite(c)}
              initialQuery={boot.initialQuery}
              autoAsk={Boolean(boot.initialQuery)}
              askTrigger={askTrigger}
              emphasizeCites={emphasizeCites}
              compact
            />
          </div>
        </SheetContent>
      </Sheet>

      {referenceDriver && referenceLap && deltas && (
        <CompareDetailSheet
          open={compareOpen}
          onOpenChange={setCompareOpen}
          focusDriver={driver}
          focusLap={lap}
          referenceDriver={referenceDriver}
          referenceLap={referenceLap}
          deltas={deltas}
          gainLabel={gain?.label ?? null}
          lossLabel={loss && loss.ms > 0 ? loss.label : null}
          playheadM={playheadM}
          onJumpSector={selectSector}
          onPlayhead={onPlayhead}
          deltaChannelId={activeDeltaChannel}
          onDeltaChannel={setCompareChannel}
          channelDelta={channelDelta}
        />
      )}

      <CircuitMapModal
        open={mapOpen}
        onOpenChange={setMapOpen}
        activeSector={activeSector}
        playheadM={playheadM}
        evidence={evidence}
        onPlayhead={onPlayhead}
        onSector={selectSector}
        focusAccent={focusAccent.accent}
        referenceAccent={compareLapId ? referenceAccent.accent : undefined}
        focusNumber={driver.number}
        referenceNumber={referenceDriver?.number}
        focusCode={driver.code}
        referenceCode={referenceDriver?.code}
        comparing={Boolean(compareLapId)}
        traps={traps}
        sectorDeltaMs={deltas?.sectorsMs ?? null}
        gainSectorIndex={gain?.index ?? null}
        lossSectorIndex={loss && loss.ms > 0 ? loss.index : null}
        channelDelta={channelDelta}
        deltaChannelId={activeDeltaChannel}
        deltaChannelLabel={deltaLegend.label}
        deltaAheadLabel={deltaLegend.ahead}
        deltaBehindLabel={deltaLegend.behind}
        onDeltaChannel={compareLapId ? setCompareChannel : undefined}
        onOpenCompare={compareLapId ? openCompare : undefined}
        onViewWindow={setMapWindow}
        viewWindow={mapWindow}
        onInspectFocus={() => setRacerSheet("Focus")}
        onInspectReference={
          referenceDriver && referenceLap
            ? () => setRacerSheet("Reference")
            : undefined
        }
        lapId={lapId}
        compareLapId={compareLapId}
      />

      {racerSheet === "Focus" && (
        <RacerDetailSheet
          open
          onOpenChange={(o) => {
            if (!o) setRacerSheet(null);
          }}
          driver={driver}
          lap={lap}
          playheadM={playheadM}
          role="Focus"
          compareLap={referenceLap}
          onSelectLap={selectLap}
        />
      )}

      {racerSheet === "Reference" && referenceDriver && referenceLap && (
        <RacerDetailSheet
          open
          onOpenChange={(o) => {
            if (!o) setRacerSheet(null);
          }}
          driver={referenceDriver}
          lap={referenceLap}
          playheadM={playheadM}
          role="Reference"
          compareLap={lap}
          onMakeFocus={() => {
            selectDriver(referenceDriver.id);
            selectLap(referenceLap.number);
            setRacerSheet(null);
          }}
          onSelectLap={selectReferenceLap}
        />
      )}

      <footer className="relative z-[1] shrink-0 border-t border-[var(--hairline)] bg-[var(--panel)]/90 px-3 py-1 text-[0.58rem] text-[var(--mute)] backdrop-blur-[2px]">
        {STUDIO} · {PRODUCT} · {AUTHOR} · {pack.meta.driverCount ?? 22} drivers
        · OpenF1 subset + overlays · No SECU ·{" "}
        <Link href="/about" className="text-[var(--trace-cyan)]">
          Method
        </Link>
        {" · "}
        <a href={LIVE_URL} className="text-[var(--trace-cyan)]">
          Live
        </a>
        {" · "}
        <a href={PORTFOLIO_URL} className="text-[var(--trace-cyan)]">
          Portfolio
        </a>
      </footer>
    </div>
  );
}
