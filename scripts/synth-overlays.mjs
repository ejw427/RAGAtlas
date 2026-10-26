/**
 * Synthetic ATLAS-shaped overlays that OpenF1 car_data does not carry.
 * Rear/oil/coolant are produced in the fetcher. This module adds:
 *   - brake_temp_fl  (public example id Brakes.FrontLeft.Temperature)
 *   - brake_pressure (driver-input shape; not a published SECU example)
 * and the LEC Soft-flyer cites for DRS, gear, and coolant.
 * Deterministic. Safe to run more than once on a pack.
 */

const OVERLAY_NOTE_IDS = [
  "note_front_brake",
  "note_brake_pressure",
  "note_coolant_flat",
  "note_drs_off",
  "note_gear_hold",
];

const OVERLAY_CITE_IDS = [
  "cite_front_brake",
  "cite_front_note",
  "cite_pressure",
  "cite_pressure_note",
  "cite_drs",
  "cite_gear",
  "cite_coolant",
  "cite_coolant_note",
];

const OVERLAY_TIMELINE_IDS = ["tl-front", "tl-pressure", "tl-drs", "tl-gear"];

const FRONT_PEAK_C = 688;

export function interp(series, m) {
  const { d, v } = series;
  if (!d?.length) return null;
  if (m <= d[0]) return v[0];
  if (m >= d[d.length - 1]) return v[v.length - 1];
  let lo = 0;
  let hi = d.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (d[mid] <= m) lo = mid;
    else hi = mid;
  }
  const t = (m - d[lo]) / (d[hi] - d[lo] || 1);
  return v[lo] + (v[hi] - v[lo]) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function round(n, d = 0) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function sectorAt(sectors, m) {
  const hit =
    sectors?.find((s) => m >= s.startM && m < s.endM) ??
    sectors?.[sectors.length - 1];
  if (!hit) return 3;
  const n = Number(String(hit.label).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : hit.label;
}

/**
 * Front-left disc tracks the rear shape but stays cooler.
 * On the spike lap the heavy window is the hottest point, pinned at 688°C
 * (under the public ATLAS example warning of 700°C) while rear hits 942°C.
 */
export function synthFrontBrake(rearSeries, brakeSeries, spike) {
  const d = rearSeries.d;
  const v = d.map((m, i) => {
    const rearV = rearSeries.v[i];
    const b = interp(brakeSeries, m) ?? 0;
    let temp = rearV - (b >= 50 ? 120 : 160);
    temp = Math.min(temp, rearV - 50);
    temp = clamp(temp, 220, spike ? 620 : 700);
    return temp;
  });

  if (spike) {
    const half = (spike.windowEndM - spike.windowStartM) / 2 || 1;
    for (let i = 0; i < d.length; i++) {
      const m = d[i];
      if (m < spike.windowStartM || m > spike.windowEndM) continue;
      const peakShape = Math.max(
        0,
        1 - Math.abs(m - spike.peakDistanceM) / half,
      );
      const shaped = 500 + peakShape * (FRONT_PEAK_C - 500);
      v[i] = Math.min(
        Math.max(v[i], shaped),
        rearSeries.v[i] - 40,
        FRONT_PEAK_C,
      );
    }
    let lo = 0;
    while (lo < d.length - 1 && d[lo + 1] < spike.peakDistanceM) lo++;
    const hi = Math.min(lo + 1, d.length - 1);
    for (const idx of new Set([lo, hi])) {
      v[idx] = Math.min(FRONT_PEAK_C, rearSeries.v[idx] - 40);
    }
  }

  return { d: d.slice(), v: v.map((n) => round(n, 0)) };
}

/**
 * Bar-scale pressure from the binary OpenF1 brake and speed.
 * High speed at onset → high target; target falls as the car slows,
 * so the peak leads the stop instead of arriving as a late stab.
 */
export function synthBrakePressure(brakeSeries, speedSeries) {
  const d = brakeSeries.d;
  const v = [];
  let p = 0;
  for (let i = 0; i < d.length; i++) {
    const b = brakeSeries.v[i] ?? 0;
    const spd = interp(speedSeries, d[i]) ?? 0;
    if (b >= 50) {
      const target = clamp(6 + (spd / 320) * 100, 10, 115);
      p = p + (target - p) * 0.72;
    } else {
      p *= 0.62;
      if (p < 0.5) p = 0;
    }
    v.push(round(clamp(p, 0, 120), 1));
  }
  return { d: d.slice(), v };
}

function brakeRuns(brake) {
  const runs = [];
  let start = null;
  const close = (end) => {
    if (start == null || end < start) return;
    runs.push({
      startM: brake.d[start],
      endM: brake.d[end],
      i0: start,
      i1: end,
    });
    start = null;
  };
  for (let i = 0; i < brake.d.length; i++) {
    if ((brake.v[i] ?? 0) >= 50) {
      if (start == null) start = i;
    } else close(i - 1);
  }
  close(brake.d.length - 1);
  return runs;
}

function overlap(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

function windowExtent(series, startM, endM) {
  let max = null;
  let first = null;
  let last = null;
  for (let i = 0; i < series.d.length; i++) {
    const dist = series.d[i];
    if (dist < startM - 0.5 || dist > endM + 0.5) continue;
    const value = series.v[i];
    if (!first) first = { distanceM: dist, value };
    last = { distanceM: dist, value };
    if (!max || value > max.value) max = { distanceM: dist, value };
  }
  return { max, first, last };
}

function longestGearHold(series, minGear) {
  let best = null;
  let start = null;
  let gear = null;
  const close = (end) => {
    if (start == null || end < start) return;
    const startM = series.d[start];
    const endM = series.d[end];
    const span = endM - startM;
    if (!best || span > best.span) {
      best = { gear, startM: round(startM, 0), endM: round(endM, 0), span };
    }
    start = null;
    gear = null;
  };
  for (let i = 0; i < series.d.length; i++) {
    const g = Math.round(series.v[i]);
    if (g >= minGear) {
      if (start == null) {
        start = i;
        gear = g;
      } else if (g !== gear) {
        close(i - 1);
        start = i;
        gear = g;
      }
    } else close(i - 1);
  }
  close(series.d.length - 1);
  return best;
}

function fastestStraight(speed, minKph) {
  let best = null;
  let start = null;
  const close = (end) => {
    if (start == null || end < start) return;
    const sliceV = speed.v.slice(start, end + 1);
    let vmax = sliceV[0];
    let vmaxM = speed.d[start];
    for (let i = 0; i < sliceV.length; i++) {
      if (sliceV[i] >= vmax) {
        vmax = sliceV[i];
        vmaxM = speed.d[start + i];
      }
    }
    const startM = speed.d[start];
    const endM = speed.d[end];
    const span = endM - startM;
    if (!best || span > best.span) {
      best = {
        startM: round(startM, 0),
        endM: round(endM, 0),
        span,
        vmax: round(vmax, 0),
        vmaxM: round(vmaxM, 0),
      };
    }
    start = null;
  };
  for (let i = 0; i < speed.d.length; i++) {
    if (speed.v[i] >= minKph) {
      if (start == null) start = i;
    } else close(i - 1);
  }
  close(speed.d.length - 1);
  return best;
}

function sampleOf(pack, channelId, lapId) {
  return pack.samples.find(
    (s) => s.channelId === channelId && s.lapId === lapId,
  );
}

/**
 * Mutates pack: front-temp + brake-pressure samples, notes, cites, timeline, meta.
 * Returns the numeric facts the QaMap claims are written against.
 */
export function applyBeatOverlays(pack) {
  const lengthM = pack.meeting?.lapDistanceM ?? pack.meta?.venueLengthM ?? 5513;
  const soft = pack.laps.find(
    (l) => l.driverNumber === 16 && l.tags?.includes("soft_flyer"),
  );
  const lapIds = [...new Set(pack.samples.map((s) => s.lapId))];

  pack.samples = pack.samples.filter(
    (s) => s.channelId !== "brake_temp_fl" && s.channelId !== "brake_pressure",
  );

  for (const lapId of lapIds) {
    const brake = sampleOf(pack, "brake", lapId);
    const speed = sampleOf(pack, "speed", lapId);
    const rear = sampleOf(pack, "brake_temp", lapId);
    if (!brake || !speed || !rear) continue;
    const spike = rear.spike ?? null;
    const frontSeries = synthFrontBrake(rear.series, brake.series, spike);
    const frontSample = {
      channelId: "brake_temp_fl",
      lapId,
      series: frontSeries,
    };
    if (spike) {
      const pinned = round(interp(frontSeries, spike.peakDistanceM) ?? FRONT_PEAK_C, 0);
      frontSample.spike = { ...spike, peakC: pinned };
    }
    pack.samples.push(frontSample);
    pack.samples.push({
      channelId: "brake_pressure",
      lapId,
      series: synthBrakePressure(brake.series, speed.series),
    });
  }

  const facts = soft ? describeSoftFlyer(pack, soft.id, lengthM) : null;

  pack.notes = (pack.notes ?? []).filter((n) => !OVERLAY_NOTE_IDS.includes(n.id));
  pack.cites = (pack.cites ?? []).filter((c) => !OVERLAY_CITE_IDS.includes(c.id));
  pack.timeline = (pack.timeline ?? []).filter(
    (t) => !OVERLAY_TIMELINE_IDS.includes(t.id),
  );

  if (facts) {
    pack.notes.push(...facts.notes);
    pack.cites.push(...facts.cites);
    pack.timeline.push(...facts.timeline);
  }

  const channelIds = [...new Set(pack.samples.map((s) => s.channelId))];
  pack.schemaVersion = 5;
  pack.disclaimer =
    "OpenF1 subset: 2026 US GP FP2 (COTA) — best flying lap for all drivers + LEC Soft/Hard/long-run trio. Synthetic ATLAS overlays for rear/front brake temp, brake pressure, oil, and coolant. Not SECU/team data. Not a full session dump.";
  pack.meta = {
    ...pack.meta,
    channelCount: channelIds.length,
    syntheticOverlayChannels: [
      "brake_temp",
      "brake_temp_fl",
      "brake_pressure",
      "oil_pressure",
      "coolant_temp",
    ],
    convention:
      "2026 COTA FP2 — all drivers best flyer (OpenF1) + LEC trio + synthetic ATLAS overlays (rear/FL brake temp, brake pressure, oil, coolant)",
  };
  if (pack.dataProvenance) {
    const atlasDocs = new Set(pack.dataProvenance.atlasDocs ?? []);
    atlasDocs.add(
      "https://atlas.motionapplied.com/developer-resources/secu4/stream_api/reference_docs/examples/telemetry-example/",
    );
    pack.dataProvenance.atlasDocs = [...atlasDocs];
  }

  return facts;
}

function describeSoftFlyer(pack, lapId, lengthM) {
  const sectors = pack.sectors ?? [];
  const rear = sampleOf(pack, "brake_temp", lapId);
  const front = sampleOf(pack, "brake_temp_fl", lapId);
  const brake = sampleOf(pack, "brake", lapId);
  const speed = sampleOf(pack, "speed", lapId);
  const pressure = sampleOf(pack, "brake_pressure", lapId);
  const gear = sampleOf(pack, "n_gear", lapId);
  const drs = sampleOf(pack, "drs", lapId);
  const coolant = sampleOf(pack, "coolant_temp", lapId);
  const spike = rear?.spike;

  const frontPeak = spike
    ? round(interp(front.series, spike.peakDistanceM) ?? FRONT_PEAK_C, 0)
    : FRONT_PEAK_C;
  const rearPeak = spike?.peakC ?? 942;

  const runs = brakeRuns(brake.series);
  const heavy =
    (spike &&
      runs.find(
        (r) => overlap(r.startM, r.endM, spike.windowStartM, spike.windowEndM) > 0,
      )) ||
    runs[0];

  const pressWin = heavy
    ? windowExtent(pressure.series, heavy.startM, heavy.endM)
    : null;
  const speedAtPeak = pressWin?.max
    ? round(interp(speed.series, pressWin.max.distanceM) ?? 0, 0)
    : null;
  const speedAtEnd = pressWin?.last
    ? round(interp(speed.series, pressWin.last.distanceM) ?? 0, 0)
    : null;

  const gearHold = longestGearHold(gear.series, 6);
  const straight = fastestStraight(speed.series, 280);
  const drsMax = Math.max(...drs.series.v);
  const drsOffEverywhere = pack.samples
    .filter((s) => s.channelId === "drs")
    .every((s) => s.series.v.every((v) => v === 0));

  const coolStart = round(coolant.series.v[0], 1);
  const coolEnd = round(coolant.series.v[coolant.series.v.length - 1], 1);
  const coolHeavyIn = spike
    ? round(interp(coolant.series, spike.windowStartM) ?? coolStart, 1)
    : coolStart;
  const coolHeavyOut = spike
    ? round(interp(coolant.series, spike.windowEndM) ?? coolEnd, 1)
    : coolEnd;

  const sessionId = pack.session?.id ?? "ses_cota_2026_fp2";
  const heavyWindow = spike
    ? { startM: spike.windowStartM, endM: spike.windowEndM }
    : { startM: 3640, endM: 3760 };
  const heavySector = spike?.sector ?? sectorAt(sectors, heavyWindow.endM);

  const pressWindow = heavy
    ? { startM: round(heavy.startM, 0), endM: round(heavy.endM, 0) }
    : heavyWindow;

  const notes = [
    {
      id: "note_front_brake",
      sessionId,
      lapId,
      distanceStartM: heavyWindow.startM,
      distanceEndM: heavyWindow.endM,
      authorRole: "performance_engineer",
      tags: ["brakes", "cooling", "synthetic_overlay", "front"],
      body: `Synthetic front-left (Brakes.FrontLeft.Temperature shape) peaks at ${frontPeak}°C in the same heavy where rear brake_temp hits ${rearPeak}°C. Front stays under the public example warning of 700°C — rear duct, not a whole-axle loss.`,
    },
    {
      id: "note_brake_pressure",
      sessionId,
      lapId,
      distanceStartM: pressWindow.startM,
      distanceEndM: pressWindow.endM,
      authorRole: "performance_engineer",
      tags: ["brakes", "driver", "synthetic_overlay"],
      body: `Synthetic brake_pressure is shaped from OpenF1 brake (0/100) times speed. Peak ${pressWin?.max?.value ?? "—"} bar near ${pressWin?.max ? Math.round(pressWin.max.distanceM) : "—"} m while speed is still ${speedAtPeak ?? "—"} km/h, then ${pressWin?.last?.value ?? "—"} bar at the release — a trail, not a late stab.`,
    },
    {
      id: "note_coolant_flat",
      sessionId,
      lapId,
      distanceStartM: heavyWindow.endM,
      distanceEndM: lengthM,
      authorRole: "performance_engineer",
      tags: ["engine", "cooling", "synthetic_overlay"],
      body: `Synthetic coolant_temp drifts ${coolStart}°C → ${coolEnd}°C over the lap. Through the heavy it only moves ${coolHeavyIn}→${coolHeavyOut}°C — no post-brake soak step.`,
    },
    {
      id: "note_drs_off",
      sessionId,
      lapId,
      distanceStartM: straight?.startM ?? 0,
      distanceEndM: straight?.endM ?? lengthM,
      authorRole: "performance_engineer",
      tags: ["drs", "openf1"],
      body: drsOffEverywhere
        ? `OpenF1 drs is 0 on every sample in this FP2 pack. LEC's fastest stretch still peaks at ${straight?.vmax ?? "—"} km/h with DRS off.`
        : `OpenF1 drs stays at ${drsMax} on the LEC Soft flyer through the ${straight?.vmax ?? "—"} km/h stretch.`,
    },
    {
      id: "note_gear_hold",
      sessionId,
      lapId,
      distanceStartM: gearHold?.startM ?? 0,
      distanceEndM: gearHold?.endM ?? lengthM,
      authorRole: "performance_engineer",
      tags: ["gear", "openf1"],
      body: gearHold
        ? `OpenF1 n_gear holds ${gearHold.gear} for ${Math.round(gearHold.span)} m (${gearHold.startM}–${gearHold.endM} m) on the Soft flyer.`
        : "No sustained high gear on the Soft flyer.",
    },
  ];

  const cites = [
    {
      id: "cite_front_brake",
      kind: "channel",
      lapId,
      sector: heavySector,
      channelId: "brake_temp_fl",
      window: heavyWindow,
      label: `LEC L10 · S${heavySector} · brake_temp_fl`,
      summary: `peak ${frontPeak}°C vs rear ${rearPeak}°C (synthetic)`,
    },
    {
      id: "cite_front_note",
      kind: "note",
      lapId,
      sector: heavySector,
      channelId: null,
      noteId: "note_front_brake",
      window: heavyWindow,
      label: "LEC L10 · note · front stays cooler",
      summary: "rear duct, not axle-wide",
    },
    {
      id: "cite_pressure",
      kind: "channel",
      lapId,
      sector: sectorAt(sectors, pressWin?.max?.distanceM ?? pressWindow.endM),
      channelId: "brake_pressure",
      window: pressWindow,
      label: "LEC L10 · brake_pressure",
      summary: pressWin?.max
        ? `peak ${pressWin.max.value} bar @ ${Math.round(pressWin.max.distanceM)} m, ${pressWin.last.value} bar at release`
        : "synthetic trail",
    },
    {
      id: "cite_pressure_note",
      kind: "note",
      lapId,
      sector: sectorAt(sectors, pressWin?.max?.distanceM ?? pressWindow.endM),
      channelId: null,
      noteId: "note_brake_pressure",
      window: pressWindow,
      label: "LEC L10 · note · trail not stab",
      summary: "OpenF1 brake is only 0/100",
    },
    {
      id: "cite_drs",
      kind: "channel",
      lapId,
      sector: straight ? sectorAt(sectors, straight.vmaxM) : 2,
      channelId: "drs",
      window: straight
        ? { startM: straight.startM, endM: straight.endM }
        : { startM: 0, endM: lengthM },
      focusM: straight?.vmaxM,
      label: "LEC L10 · DRS",
      summary: straight
        ? `drs ${drsMax} through ${straight.vmax} km/h (${straight.startM}–${straight.endM} m)`
        : `drs ${drsMax}`,
    },
    {
      id: "cite_gear",
      kind: "channel",
      lapId,
      sector: gearHold ? sectorAt(sectors, (gearHold.startM + gearHold.endM) / 2) : 2,
      channelId: "n_gear",
      window: gearHold
        ? { startM: gearHold.startM, endM: gearHold.endM }
        : { startM: 0, endM: lengthM },
      label: gearHold ? `LEC L10 · gear ${gearHold.gear}` : "LEC L10 · gear",
      summary: gearHold
        ? `${gearHold.gear}th held ${Math.round(gearHold.span)} m`
        : "no long hold",
    },
    {
      id: "cite_coolant",
      kind: "channel",
      lapId,
      sector: heavySector,
      channelId: "coolant_temp",
      window: { startM: heavyWindow.endM, endM: lengthM },
      label: "LEC L10 · coolant_temp",
      summary: `${coolHeavyOut}°C out of the heavy → ${coolEnd}°C at the line`,
    },
    {
      id: "cite_coolant_note",
      kind: "note",
      lapId,
      sector: heavySector,
      channelId: null,
      noteId: "note_coolant_flat",
      window: { startM: heavyWindow.endM, endM: lengthM },
      label: "LEC L10 · note · no coolant soak",
      summary: "steady drift, not a step",
    },
  ];

  const timeline = [
    {
      id: "tl-front",
      label: "Front vs rear",
      copy: `Synthetic FL brake ${frontPeak}°C vs rear ${rearPeak}°C in the heavy`,
      citeId: "cite_front_brake",
      distanceM: spike?.peakDistanceM ?? heavyWindow.endM,
    },
    {
      id: "tl-pressure",
      label: "Trail brake",
      copy: pressWin?.max
        ? `Synthetic pressure peaks at ${pressWin.max.value} bar early in the stop`
        : "Synthetic brake pressure",
      citeId: "cite_pressure",
      distanceM: pressWin?.max
        ? round(pressWin.max.distanceM, 0)
        : pressWindow.startM,
    },
    {
      id: "tl-drs",
      label: "DRS off",
      copy: straight
        ? `OpenF1 DRS stays ${drsMax} at ${straight.vmax} km/h`
        : "OpenF1 DRS",
      citeId: "cite_drs",
      distanceM: straight?.vmaxM ?? 3000,
    },
    {
      id: "tl-gear",
      label: gearHold ? `Gear ${gearHold.gear}` : "Gear",
      copy: gearHold
        ? `OpenF1 holds ${gearHold.gear}th for ${Math.round(gearHold.span)} m`
        : "Gear",
      citeId: "cite_gear",
      distanceM: gearHold
        ? round((gearHold.startM + gearHold.endM) / 2, 0)
        : 3200,
    },
  ];

  return {
    frontPeak,
    rearPeak,
    pressPeak: pressWin?.max?.value ?? null,
    pressPeakM: pressWin?.max ? round(pressWin.max.distanceM, 0) : null,
    pressEnd: pressWin?.last?.value ?? null,
    pressStartM: pressWindow.startM,
    pressEndM: pressWindow.endM,
    speedAtPeak,
    speedAtEnd,
    gear: gearHold,
    straight,
    drsMax,
    drsOffEverywhere,
    coolStart,
    coolEnd,
    coolHeavyIn,
    coolHeavyOut,
    notes,
    cites,
    timeline,
  };
}
