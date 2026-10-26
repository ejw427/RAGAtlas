/**
 * Full session-pack enrichment on top of OpenF1 car_data:
 *   - synthetic ATLAS-shaped overlays (front brake, pressure, tyre, steer, g_long, fuel)
 *   - OpenF1 corpus extras (pits, weather series, team radio)
 *   - trap-speed / stint / weather / radio cites for the LEC Soft flyer
 *
 * Deterministic. Safe to re-run.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyBeatOverlays,
  interp,
  synthBrakePressure,
  synthFrontBrake,
} from "./synth-overlays.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const EXTRA_PATH = join(__dir, "..", "data", "mock", "cota-corpus-extra.json");

const EXTRA_NOTE_IDS = [
  "note_tyre_surf",
  "note_steer",
  "note_g_long",
  "note_fuel",
  "note_trap_st",
  "note_stint_soft",
  "note_weather_cool",
  "note_radio_none",
  "note_pit_soft",
];

const EXTRA_CITE_IDS = [
  "cite_tyre",
  "cite_tyre_note",
  "cite_steer",
  "cite_g_long",
  "cite_fuel",
  "cite_trap_st",
  "cite_trap_note",
  "cite_stint",
  "cite_weather",
  "cite_radio",
  "cite_pit",
];

const EXTRA_TIMELINE_IDS = [
  "tl-tyre",
  "tl-steer",
  "tl-g",
  "tl-fuel",
  "tl-trap",
  "tl-weather",
];

const SYNTH_IDS = [
  "brake_temp_fl",
  "brake_pressure",
  "tyre_surf_fl",
  "steering",
  "g_long",
  "fuel_flow",
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function round(n, d = 0) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function sampleOf(pack, channelId, lapId) {
  return pack.samples.find(
    (s) => s.channelId === channelId && s.lapId === lapId,
  );
}

function sectorAt(sectors, m) {
  const hit =
    sectors?.find((s) => m >= s.startM && s.endM > m) ??
    sectors?.[sectors.length - 1];
  if (!hit) return 3;
  const n = Number(String(hit.label).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : hit.label;
}

/** Longitudinal g from ground-speed changes along distance. */
export function synthGLong(speedSeries) {
  const { d, v } = speedSeries;
  const outV = [];
  for (let i = 0; i < d.length; i++) {
    if (i === 0 || i === d.length - 1) {
      outV.push(0);
      continue;
    }
    const ds = (d[i + 1] - d[i - 1]) || 1;
    const dvMs = ((v[i + 1] - v[i - 1]) / 3.6) / 2;
    // rough: a ≈ Δv / Δt, Δt ≈ Δs / v_avg
    const vAvg = Math.max(8, ((v[i + 1] + v[i - 1]) / 2) / 3.6);
    const dt = ds / vAvg;
    const a = dvMs / Math.max(0.05, dt);
    outV.push(round(clamp(a / 9.81, -5.5, 2.5), 2));
  }
  return { d: d.slice(), v: outV };
}

/** Steering angle proxy from curvature of trackXY when available, else from path turning via speed/brake. */
export function synthSteering(speedSeries, brakeSeries, trackXY) {
  const { d } = speedSeries;
  const length = d[d.length - 1] || 1;
  const raw = [];
  if (trackXY?.d?.length > 10) {
    for (let i = 0; i < d.length; i++) {
      const m = d[i];
      // Skip start/finish join — OpenF1 location loop has a heading discontinuity there.
      if (m < 80 || m > length - 80) {
        raw.push(0);
        continue;
      }
      let lo = 0;
      while (lo < trackXY.d.length - 1 && trackXY.d[lo + 1] < m) lo++;
      const i0 = Math.max(0, lo - 3);
      const i1 = Math.min(trackXY.d.length - 1, lo + 3);
      const dx0 = trackXY.x[lo] - trackXY.x[i0];
      const dy0 = trackXY.y[lo] - trackXY.y[i0];
      const dx1 = trackXY.x[i1] - trackXY.x[lo];
      const dy1 = trackXY.y[i1] - trackXY.y[lo];
      const a0 = Math.atan2(dy0, dx0);
      const a1 = Math.atan2(dy1, dx1);
      let da = a1 - a0;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      const spd = interp(speedSeries, m) ?? 100;
      const scale = clamp(160 / Math.max(50, spd), 0.35, 1.8);
      raw.push(clamp((da * 180) / Math.PI * scale * 3.2, -26, 26));
    }
  } else {
    for (let i = 0; i < d.length; i++) {
      const m = d[i];
      const b = interp(brakeSeries, m) ?? 0;
      const spd = speedSeries.v[i] ?? 100;
      const prev = speedSeries.v[Math.max(0, i - 1)] ?? spd;
      raw.push(clamp((prev - spd) * 0.08 + (b / 100) * 6, -4, 18));
    }
  }
  const v = raw.map((val, i) => {
    const a = raw[Math.max(0, i - 1)];
    const c = raw[Math.min(raw.length - 1, i + 1)];
    return round((a + val + c) / 3, 1);
  });
  return { d: d.slice(), v };
}

/** Front-left tyre surface — Soft flyer runs hotter through the S2 push. */
export function synthTyreSurf(speedSeries, brakeSeries, throttleSeries, softFlyer) {
  const { d } = speedSeries;
  const v = [];
  let t = softFlyer ? 92 : 86;
  for (let i = 0; i < d.length; i++) {
    const m = d[i];
    const spd = speedSeries.v[i] ?? 0;
    const thr = interp(throttleSeries, m) ?? 0;
    const b = interp(brakeSeries, m) ?? 0;
    t += (spd / 330) * 0.35 + (thr / 100) * 0.25 + (b / 100) * 0.55 - 0.42;
    if (softFlyer) t += 0.08;
    t = clamp(t, 70, softFlyer ? 128 : 118);
    v.push(round(t, 0));
  }
  return { d: d.slice(), v };
}

/** Fuel flow shaped like throttle demand (ATLAS FuelFlow-style vocabulary). */
export function synthFuelFlow(throttleSeries, rpmSeries) {
  const { d } = throttleSeries;
  const v = [];
  for (let i = 0; i < d.length; i++) {
    const thr = throttleSeries.v[i] ?? 0;
    const rpm = interp(rpmSeries, d[i]) ?? 8000;
    const flow = (thr / 100) * (0.55 + rpm / 14000) * 95;
    v.push(round(clamp(flow, 0, 110), 1));
  }
  return { d: d.slice(), v };
}

function loadExtra() {
  try {
    return JSON.parse(readFileSync(EXTRA_PATH, "utf8"));
  } catch {
    return null;
  }
}

function peakIn(series, startM, endM) {
  let best = null;
  for (let i = 0; i < series.d.length; i++) {
    const dist = series.d[i];
    if (dist < startM || dist > endM) continue;
    if (!best || series.v[i] > best.value)
      best = { distanceM: dist, value: series.v[i] };
  }
  return best;
}

function troughIn(series, startM, endM) {
  let best = null;
  for (let i = 0; i < series.d.length; i++) {
    const dist = series.d[i];
    if (dist < startM || dist > endM) continue;
    if (!best || series.v[i] < best.value)
      best = { distanceM: dist, value: series.v[i] };
  }
  return best;
}

/**
 * Mutates pack in place. Returns facts used by QaMap claims.
 */
export function enrichSessionPack(pack) {
  const lengthM = pack.meeting?.lapDistanceM ?? pack.meta?.venueLengthM ?? 5513;
  const soft = pack.laps.find(
    (l) => l.driverNumber === 16 && l.tags?.includes("soft_flyer"),
  );
  const hard = pack.laps.find(
    (l) => l.driverNumber === 16 && l.tags?.includes("hard_push"),
  );
  const lapIds = [...new Set(pack.samples.map((s) => s.lapId))];
  const trackXY = pack.trackXY?.series;

  // Strip prior synth extras so re-runs stay clean, then rebuild.
  pack.samples = pack.samples.filter((s) => !SYNTH_IDS.includes(s.channelId));

  for (const lapId of lapIds) {
    const brake = sampleOf(pack, "brake", lapId);
    const speed = sampleOf(pack, "speed", lapId);
    const throttle = sampleOf(pack, "throttle", lapId);
    const rpm = sampleOf(pack, "rpm", lapId);
    const rear = sampleOf(pack, "brake_temp", lapId);
    if (!brake || !speed || !throttle || !rpm || !rear) continue;

    const softFlyer = soft?.id === lapId;
    const spike = rear.spike ?? null;
    const frontSeries = synthFrontBrake(rear.series, brake.series, spike);
    const frontSample = {
      channelId: "brake_temp_fl",
      lapId,
      series: frontSeries,
    };
    if (spike) {
      frontSample.spike = {
        ...spike,
        peakC: round(interp(frontSeries, spike.peakDistanceM) ?? 688, 0),
      };
    }
    pack.samples.push(frontSample);
    pack.samples.push({
      channelId: "brake_pressure",
      lapId,
      series: synthBrakePressure(brake.series, speed.series),
    });
    pack.samples.push({
      channelId: "tyre_surf_fl",
      lapId,
      series: synthTyreSurf(
        speed.series,
        brake.series,
        throttle.series,
        softFlyer,
      ),
    });
    pack.samples.push({
      channelId: "steering",
      lapId,
      series: synthSteering(
        speed.series,
        brake.series,
        softFlyer ? trackXY : null,
      ),
    });
    pack.samples.push({
      channelId: "g_long",
      lapId,
      series: synthGLong(speed.series),
    });
    pack.samples.push({
      channelId: "fuel_flow",
      lapId,
      series: synthFuelFlow(throttle.series, rpm.series),
    });
  }

  // Base beat overlays (notes/cites for front/pressure/drs/gear/coolant).
  // Re-filter samples already rebuilt above — applyBeatOverlays regenerates
  // front/pressure; strip then let it re-add, OR call describe path only.
  // Simpler: call applyBeatOverlays which rebuilds fl/pressure again (idempotent).
  const beatFacts = applyBeatOverlays(pack);

  const extra = loadExtra();
  if (extra) {
    pack.pits = extra.pits;
    pack.teamRadio = extra.teamRadio;
    pack.weatherSeries = extra.weatherSeries;
    if (extra.weatherSeries?.length) {
      const mid =
        extra.weatherSeries[Math.floor(extra.weatherSeries.length / 2)];
      const first = extra.weatherSeries[0];
      const last = extra.weatherSeries[extra.weatherSeries.length - 1];
      pack.session.weather = {
        airTemperatureC: mid.airTemperatureC,
        trackTemperatureC: mid.trackTemperatureC,
        humidityPct: mid.humidityPct,
        rainfall: mid.rainfall,
        windSpeedMps: mid.windSpeedMps,
        windDirectionDeg: mid.windDirectionDeg,
        pressureHpa: mid.pressureHpa,
      };
      pack.session.weatherSpan = {
        trackStartC: first.trackTemperatureC,
        trackEndC: last.trackTemperatureC,
        airStartC: first.airTemperatureC,
        airEndC: last.airTemperatureC,
      };
    }
  }

  pack.notes = (pack.notes ?? []).filter((n) => !EXTRA_NOTE_IDS.includes(n.id));
  pack.cites = (pack.cites ?? []).filter((c) => !EXTRA_CITE_IDS.includes(c.id));
  pack.timeline = (pack.timeline ?? []).filter(
    (t) => !EXTRA_TIMELINE_IDS.includes(t.id),
  );

  const facts = soft
    ? describeExtras(pack, soft, hard, lengthM, beatFacts, extra)
    : null;

  if (facts) {
    pack.notes.push(...facts.notes);
    pack.cites.push(...facts.cites);
    pack.timeline.push(...facts.timeline);
  }

  const channelIds = [...new Set(pack.samples.map((s) => s.channelId))];
  pack.schemaVersion = 6;
  pack.disclaimer =
    "OpenF1 subset: 2026 US GP FP2 (COTA) — best flying lap for all drivers + LEC Soft/Hard/long-run trio. Synthetic ATLAS overlays for brake temps/pressure, tyre surface, steering, g_long, fuel flow, oil, and coolant. OpenF1 pits / weather series / team radio. Not SECU/team data.";
  pack.meta = {
    ...pack.meta,
    channelCount: channelIds.length,
    syntheticOverlayChannels: [
      "brake_temp",
      "brake_temp_fl",
      "brake_pressure",
      "tyre_surf_fl",
      "steering",
      "g_long",
      "fuel_flow",
      "oil_pressure",
      "coolant_temp",
    ],
    convention:
      "2026 COTA FP2 — OpenF1 car_data + pits/weather/radio + synthetic ATLAS overlays",
    corpusExtras: {
      pits: pack.pits?.length ?? 0,
      teamRadio: pack.teamRadio?.length ?? 0,
      weatherPoints: pack.weatherSeries?.length ?? 0,
    },
  };
  if (pack.dataProvenance) {
    const shaped = new Set(pack.dataProvenance.shapedLike ?? []);
    shaped.add("OpenF1 pit / weather / team_radio");
    pack.dataProvenance.shapedLike = [...shaped];
  }

  return { beatFacts, ...facts };
}

function describeExtras(pack, soft, hard, lengthM, beatFacts, extra) {
  const lapId = soft.id;
  const sectors = pack.sectors ?? [];
  const sessionId = pack.session?.id ?? "ses_cota_2026_fp2";
  const s2 = sectors.find((s) => s.label === "S2") ?? {
    startM: 1483,
    endM: 3672,
  };
  const spike = sampleOf(pack, "brake_temp", lapId)?.spike;
  const heavyWindow = spike
    ? { startM: spike.windowStartM, endM: spike.windowEndM }
    : { startM: 3640, endM: 3760 };

  const tyre = sampleOf(pack, "tyre_surf_fl", lapId);
  const steer = sampleOf(pack, "steering", lapId);
  const gLong = sampleOf(pack, "g_long", lapId);
  const fuel = sampleOf(pack, "fuel_flow", lapId);
  const tyreHard = hard
    ? sampleOf(pack, "tyre_surf_fl", hard.id)
    : null;

  const tyrePeakS2 = peakIn(tyre.series, s2.startM, s2.endM);
  const tyreHardPeakS2 = tyreHard
    ? peakIn(tyreHard.series, s2.startM, s2.endM)
    : null;
  const steerPeak = peakIn(steer.series, 0, lengthM);
  const steerAbs = (() => {
    let best = null;
    for (let i = 0; i < steer.series.d.length; i++) {
      const dist = steer.series.d[i];
      if (dist < 100 || dist > lengthM - 100) continue;
      const abs = Math.abs(steer.series.v[i]);
      if (!best || abs > best.abs)
        best = {
          distanceM: dist,
          value: steer.series.v[i],
          abs,
        };
    }
    return best;
  })();
  const gTrough = troughIn(gLong.series, heavyWindow.startM, heavyWindow.endM);
  const fuelPeak = peakIn(fuel.series, s2.startM, s2.endM);

  const softTrap = soft.openf1 ?? {};
  const hardTrap = hard?.openf1 ?? {};
  const stDelta =
    softTrap.st_speed != null && hardTrap.st_speed != null
      ? softTrap.st_speed - hardTrap.st_speed
      : null;
  const trapM = beatFacts?.straight?.vmaxM ?? 3273;

  const weatherSeries = pack.weatherSeries ?? extra?.weatherSeries ?? [];
  const wFirst = weatherSeries[0];
  const wLast = weatherSeries[weatherSeries.length - 1];
  const trackDrop =
    wFirst && wLast
      ? round(wFirst.trackTemperatureC - wLast.trackTemperatureC, 1)
      : null;

  const lecPits = (pack.pits ?? []).filter((p) => p.driverNumber === 16);
  const softFitPit = lecPits.find((p) => p.lapNumber === 9);
  const lecStints = (pack.stints ?? []).filter((s) => s.driverNumber === 16);
  const softStint = lecStints.find((s) => s.compound === "SOFT");

  const radio = pack.teamRadio ?? [];
  const lecRadio = radio.filter((r) => r.driverNumber === 16);

  const notes = [
    {
      id: "note_tyre_surf",
      sessionId,
      lapId,
      distanceStartM: s2.startM,
      distanceEndM: s2.endM,
      authorRole: "performance_engineer",
      tags: ["tyres", "soft", "synthetic_overlay"],
      body: tyrePeakS2
        ? `Synthetic tyre_surf_fl peaks at ${tyrePeakS2.value}°C through S2 on the Soft flyer${
            tyreHardPeakS2
              ? ` vs ${tyreHardPeakS2.value}°C on the Hard push`
              : ""
          }. Overlay only — no team tyre sensor.`
        : "Synthetic tyre surface overlay.",
    },
    {
      id: "note_steer",
      sessionId,
      lapId,
      distanceStartM: round(steerAbs?.distanceM ?? 0, 0) - 40,
      distanceEndM: round(steerAbs?.distanceM ?? 0, 0) + 40,
      authorRole: "performance_engineer",
      tags: ["driver", "steering", "synthetic_overlay"],
      body: steerAbs
        ? `Synthetic steering peaks at ${steerAbs.value}° near ${Math.round(steerAbs.distanceM)} m (from OpenF1 location curvature on the Soft flyer). Not a SECU steer sensor.`
        : "Synthetic steering overlay.",
    },
    {
      id: "note_g_long",
      sessionId,
      lapId,
      distanceStartM: heavyWindow.startM,
      distanceEndM: heavyWindow.endM,
      authorRole: "performance_engineer",
      tags: ["chassis", "g_long", "synthetic_overlay"],
      body: gTrough
        ? `Synthetic g_long troughs at ${gTrough.value} g in the S3 heavy (derived from OpenF1 speed). Matches the brake-pressure trail window.`
        : "Synthetic longitudinal g overlay.",
    },
    {
      id: "note_fuel",
      sessionId,
      lapId,
      distanceStartM: s2.startM,
      distanceEndM: s2.endM,
      authorRole: "performance_engineer",
      tags: ["engine", "fuel", "synthetic_overlay"],
      body: fuelPeak
        ? `Synthetic fuel_flow (ATLAS FuelFlow-style) peaks at ${fuelPeak.value} kg/h through S2 on throttle — shaped from OpenF1 throttle × rpm, not a team fuel meter.`
        : "Synthetic fuel flow overlay.",
    },
    {
      id: "note_trap_st",
      sessionId,
      lapId,
      distanceStartM: trapM - 80,
      distanceEndM: trapM + 80,
      authorRole: "performance_engineer",
      tags: ["speed", "trap", "openf1"],
      body:
        softTrap.st_speed != null
          ? `OpenF1 speed trap: Soft flyer st_speed ${softTrap.st_speed} km/h${
              hardTrap.st_speed != null
                ? ` vs Hard ${hardTrap.st_speed} km/h (Δ ${stDelta >= 0 ? "+" : ""}${stDelta})`
                : ""
            }. Intermediate traps I1 ${softTrap.i1_speed ?? "—"} / I2 ${softTrap.i2_speed ?? "—"} km/h.`
          : "OpenF1 trap speeds unavailable.",
    },
    {
      id: "note_stint_soft",
      sessionId,
      lapId,
      distanceStartM: 0,
      distanceEndM: lengthM,
      authorRole: "performance_engineer",
      tags: ["stint", "soft", "openf1"],
      body: softStint
        ? `OpenF1 stint map: LEC Soft stint ${softStint.stintNumber} covers laps ${softStint.lapStart}–${softStint.lapEnd} (tyre age at start ${softStint.tyreAgeAtStart ?? 0}). L10 Soft flyer sits in that stint.`
        : "OpenF1 Soft stint for LEC.",
    },
    {
      id: "note_weather_cool",
      sessionId,
      lapId: null,
      distanceStartM: null,
      distanceEndM: null,
      authorRole: "performance_engineer",
      tags: ["weather", "openf1"],
      body:
        wFirst && wLast
          ? `OpenF1 weather series: track temp falls ${wFirst.trackTemperatureC}→${wLast.trackTemperatureC}°C over FP2 (Δ −${trackDrop}°C). Air stays ~${wFirst.airTemperatureC}–${wLast.airTemperatureC}°C. Soft flyer ran mid-session.`
          : "OpenF1 weather series.",
    },
    {
      id: "note_radio_none",
      sessionId,
      lapId: null,
      distanceStartM: null,
      distanceEndM: null,
      authorRole: "race_engineer",
      tags: ["team_radio", "openf1"],
      body: `OpenF1 published ${radio.length} team-radio clips for this FP2; ${lecRadio.length} are for car 16 (LEC). No LEC audio in the public subset.`,
    },
    {
      id: "note_pit_soft",
      sessionId,
      lapId,
      distanceStartM: 0,
      distanceEndM: 200,
      authorRole: "performance_engineer",
      tags: ["pit", "soft", "openf1"],
      body: softFitPit
        ? `OpenF1 pit: LEC entered the lane on lap ${softFitPit.lapNumber}${
            softFitPit.laneDurationS != null
              ? ` · lane ${softFitPit.laneDurationS}s`
              : ""
          } ahead of the Soft stint that includes the L10 flyer.`
        : "OpenF1 Soft-fit pit for LEC.",
    },
  ];

  const cites = [
    {
      id: "cite_tyre",
      kind: "channel",
      lapId,
      sector: 2,
      channelId: "tyre_surf_fl",
      window: { startM: s2.startM, endM: s2.endM },
      focusM: tyrePeakS2 ? round(tyrePeakS2.distanceM, 0) : undefined,
      label: "LEC L10 · S2 · tyre_surf_fl",
      summary: tyrePeakS2
        ? `peak ${tyrePeakS2.value}°C${
            tyreHardPeakS2 ? ` vs Hard ${tyreHardPeakS2.value}°C` : ""
          }`
        : "synthetic tyre",
    },
    {
      id: "cite_tyre_note",
      kind: "note",
      lapId,
      sector: 2,
      channelId: null,
      noteId: "note_tyre_surf",
      window: { startM: s2.startM, endM: s2.endM },
      label: "LEC L10 · note · Soft tyre heat",
      summary: "synthetic surface overlay",
    },
    {
      id: "cite_steer",
      kind: "channel",
      lapId,
      sector: steerAbs ? sectorAt(sectors, steerAbs.distanceM) : 1,
      channelId: "steering",
      window: {
        startM: Math.max(0, round((steerAbs?.distanceM ?? 400) - 60, 0)),
        endM: Math.min(lengthM, round((steerAbs?.distanceM ?? 400) + 60, 0)),
      },
      focusM: steerAbs ? round(steerAbs.distanceM, 0) : undefined,
      label: "LEC L10 · steering",
      summary: steerAbs
        ? `peak ${steerAbs.value}° @ ${Math.round(steerAbs.distanceM)} m`
        : "synthetic steer",
    },
    {
      id: "cite_g_long",
      kind: "channel",
      lapId,
      sector: spike?.sector ?? 3,
      channelId: "g_long",
      window: heavyWindow,
      focusM: gTrough ? round(gTrough.distanceM, 0) : undefined,
      label: "LEC L10 · g_long",
      summary: gTrough
        ? `trough ${gTrough.value} g in the heavy`
        : "synthetic long-g",
    },
    {
      id: "cite_fuel",
      kind: "channel",
      lapId,
      sector: 2,
      channelId: "fuel_flow",
      window: { startM: s2.startM, endM: s2.endM },
      focusM: fuelPeak ? round(fuelPeak.distanceM, 0) : undefined,
      label: "LEC L10 · S2 · fuel_flow",
      summary: fuelPeak
        ? `peak ${fuelPeak.value} kg/h (synthetic)`
        : "synthetic fuel",
    },
    {
      id: "cite_trap_st",
      kind: "channel",
      lapId,
      sector: sectorAt(sectors, trapM),
      channelId: "speed",
      window: { startM: trapM - 100, endM: trapM + 100 },
      focusM: trapM,
      label: "LEC L10 · speed trap",
      summary:
        softTrap.st_speed != null
          ? `OpenF1 st_speed ${softTrap.st_speed} km/h${
              stDelta != null
                ? ` (Δ ${stDelta >= 0 ? "+" : ""}${stDelta} vs Hard)`
                : ""
            }`
          : "trap",
    },
    {
      id: "cite_trap_note",
      kind: "note",
      lapId,
      sector: sectorAt(sectors, trapM),
      channelId: null,
      noteId: "note_trap_st",
      window: { startM: trapM - 100, endM: trapM + 100 },
      label: "LEC L10 · note · trap speeds",
      summary: "OpenF1 I1 / I2 / ST",
    },
    {
      id: "cite_stint",
      kind: "note",
      lapId,
      sector: 1,
      channelId: null,
      noteId: "note_stint_soft",
      window: { startM: 0, endM: sectors[0]?.endM ?? 1483 },
      label: "LEC · note · Soft stint",
      summary: softStint
        ? `laps ${softStint.lapStart}–${softStint.lapEnd}`
        : "Soft stint",
    },
    {
      id: "cite_weather",
      kind: "note",
      lapId: soft.id,
      sector: null,
      channelId: null,
      noteId: "note_weather_cool",
      window: { startM: 0, endM: lengthM },
      label: "session · note · track cools",
      summary:
        trackDrop != null
          ? `track −${trackDrop}°C over FP2`
          : "weather series",
    },
    {
      id: "cite_radio",
      kind: "note",
      lapId: soft.id,
      sector: null,
      channelId: null,
      noteId: "note_radio_none",
      window: { startM: 0, endM: lengthM },
      label: "session · note · team radio",
      summary: `${lecRadio.length}/${radio.length} clips for LEC`,
    },
    {
      id: "cite_pit",
      kind: "note",
      lapId,
      sector: 1,
      channelId: null,
      noteId: "note_pit_soft",
      window: { startM: 0, endM: 200 },
      label: "LEC · note · Soft-fit pit",
      summary: softFitPit
        ? `lap ${softFitPit.lapNumber} pit before Soft flyer`
        : "pit",
    },
  ];

  const timeline = [
    {
      id: "tl-tyre",
      label: "Soft tyre heat",
      copy: tyrePeakS2
        ? `Synthetic FL tyre ${tyrePeakS2.value}°C through S2`
        : "Tyre surface",
      citeId: "cite_tyre",
      distanceM: tyrePeakS2
        ? round(tyrePeakS2.distanceM, 0)
        : round((s2.startM + s2.endM) / 2, 0),
    },
    {
      id: "tl-steer",
      label: "Steer peak",
      copy: steerAbs
        ? `Synthetic steering ${steerAbs.value}° @ ${Math.round(steerAbs.distanceM)} m`
        : "Steering",
      citeId: "cite_steer",
      distanceM: steerAbs ? round(steerAbs.distanceM, 0) : 800,
    },
    {
      id: "tl-g",
      label: "Long-g trough",
      copy: gTrough
        ? `Synthetic g_long ${gTrough.value} g in the heavy`
        : "g_long",
      citeId: "cite_g_long",
      distanceM: gTrough
        ? round(gTrough.distanceM, 0)
        : heavyWindow.endM,
    },
    {
      id: "tl-fuel",
      label: "Fuel demand",
      copy: fuelPeak
        ? `Synthetic fuel_flow ${fuelPeak.value} kg/h in S2`
        : "Fuel flow",
      citeId: "cite_fuel",
      distanceM: fuelPeak
        ? round(fuelPeak.distanceM, 0)
        : round((s2.startM + s2.endM) / 2, 0),
    },
    {
      id: "tl-trap",
      label: "Speed trap",
      copy:
        softTrap.st_speed != null
          ? `OpenF1 ST ${softTrap.st_speed} km/h on Soft`
          : "Speed trap",
      citeId: "cite_trap_st",
      distanceM: trapM,
    },
    {
      id: "tl-weather",
      label: "Track cools",
      copy:
        trackDrop != null
          ? `OpenF1 track −${trackDrop}°C across FP2`
          : "Weather",
      citeId: "cite_weather",
      distanceM: 100,
    },
  ];

  return {
    tyrePeakS2,
    tyreHardPeakS2,
    steerAbs,
    gTrough,
    fuelPeak,
    softTrap,
    hardTrap,
    stDelta,
    trapM,
    trackDrop,
    weatherFirst: wFirst,
    weatherLast: wLast,
    softFitPit,
    softStint,
    radioCount: radio.length,
    lecRadioCount: lecRadio.length,
    notes,
    cites,
    timeline,
    heavy: heavyWindow,
  };
}
