/**
 * Fetch 2026 United States GP (COTA) OpenF1 public data → SessionPack JSON.
 * ALL drivers: best flying lap each + LEC Soft/Hard/long-run trio.
 * Does NOT commit a full session dump.
 *
 * Usage: node scripts/fetch-cota-2026-pack.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enrichSessionPack } from "./enrich-pack.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const outPath = join(root, "data", "mock", "cota-2026-fp2.json");

const SESSION_KEY = 11390;
const MEETING_KEY = 1297;
const PRIMARY_DN = 16; // LEC
const LEC_EXTRA = [7, 14]; // Soft flyer (best) is always included; these are additional
const LENGTH_M = 5513;
const MAX_FLYER_S = 110; // exclude in-laps / cool-downs from "best"
const PTS_PRIMARY = 400;
const PTS_FIELD = 240;
const BASE_URL = "https://api.openf1.org/v1";

async function get(path) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  for (let i = 0; i < 10; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = 1800 * (i + 1);
      console.warn(`429 — wait ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`rate-limited ${url}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const parseTs = (s) => new Date(s).getTime();
const round = (n, d = 1) => {
  const p = 10 ** d;
  return Math.round(n * p) / p;
};

function distancesFromCar(rows) {
  if (!rows.length) return [];
  const d = [0];
  for (let i = 1; i < rows.length; i++) {
    const dt = (parseTs(rows[i].date) - parseTs(rows[i - 1].date)) / 1000;
    const v =
      ((rows[i - 1].speed + rows[i].speed) / 2 / 3.6) * Math.max(dt, 0);
    d.push(d[i - 1] + v);
  }
  const scale = d[d.length - 1] > 0 ? LENGTH_M / d[d.length - 1] : 1;
  return d.map((x) => round(x * scale, 1));
}

function seriesFrom(rows, distances, field, digits = 1) {
  return {
    d: distances.slice(),
    v: rows.map((r) => round(Number(r[field] ?? 0), digits)),
  };
}

function downsampleSeries(series, maxPts) {
  if (series.d.length <= maxPts) return series;
  const outD = [];
  const outV = [];
  for (let i = 0; i < maxPts; i++) {
    const idx = Math.round((i / (maxPts - 1)) * (series.d.length - 1));
    outD.push(series.d[idx]);
    outV.push(series.v[idx]);
  }
  return { d: outD, v: outV };
}

function resampleXY(points, n) {
  if (points.length < 2) return { d: [], x: [], y: [] };
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const total = cum[cum.length - 1] || 1;
  const d = [];
  const x = [];
  const y = [];
  let lo = 0;
  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * total;
    while (lo < cum.length - 2 && cum[lo + 1] < target) lo++;
    const t =
      cum[lo + 1] === cum[lo]
        ? 0
        : (target - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
    d.push(round((i / (n - 1)) * LENGTH_M, 1));
    x.push(round(points[lo].x + (points[lo + 1].x - points[lo].x) * t, 1));
    y.push(round(points[lo].y + (points[lo + 1].y - points[lo].y) * t, 1));
  }
  return { d, x, y };
}

function interp(series, m) {
  const { d, v } = series;
  if (!d.length) return null;
  if (m <= d[0]) return v[0];
  if (m >= d[d.length - 1]) return v[d.length - 1];
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

function synthThermal(brakeSeries, speedSeries, spike) {
  const nMid = 200;
  const nLow = 64;
  const dMid = [];
  const brakeTemp = [];
  let temp = 410;
  for (let i = 0; i < nMid; i++) {
    const m = (i / (nMid - 1)) * LENGTH_M;
    dMid.push(round(m, 1));
    const b = interp(brakeSeries, m) ?? 0;
    const spd = interp(speedSeries, m) ?? 200;
    temp = clamp(temp + (b / 100) * (0.02 * spd) - 1.05, 260, 980);
    if (spike && m >= spike.windowStartM && m <= spike.windowEndM) {
      const half = (spike.windowEndM - spike.windowStartM) / 2 || 1;
      const peakShape = 1 - Math.abs(m - spike.peakDistanceM) / half;
      temp = Math.max(temp, 760 + Math.max(0, peakShape) * 180);
    }
    brakeTemp.push(round(temp, 0));
  }
  if (spike) {
    let best = 0;
    for (let i = 0; i < dMid.length; i++) {
      if (
        Math.abs(dMid[i] - spike.peakDistanceM) <
        Math.abs(dMid[best] - spike.peakDistanceM)
      )
        best = i;
    }
    brakeTemp[best] = spike.peakC;
  }
  const dLow = [];
  const oil = [];
  const cool = [];
  let coolant = 94;
  for (let i = 0; i < nLow; i++) {
    const m = (i / (nLow - 1)) * LENGTH_M;
    dLow.push(round(m, 1));
    const b = interp(brakeSeries, m) ?? 0;
    oil.push(
      round(
        clamp(
          4.55 -
            (b / 100) * 0.7 -
            (spike && m > spike.windowStartM && m < spike.windowEndM
              ? 0.25
              : 0),
          3.1,
          5.2,
        ),
        2,
      ),
    );
    coolant += 0.05 + (b / 100) * 0.08;
    cool.push(round(clamp(coolant, 88, 112), 1));
  }
  return {
    brake_temp: { d: dMid, v: brakeTemp },
    oil_pressure: { d: dLow, v: oil },
    coolant_temp: { d: dLow, v: cool },
  };
}

function heaviestBrakeWindow(brakeSeries) {
  const win = 120;
  let best = { startM: 4000, endM: 4120, score: 0, peakM: 4060 };
  for (let start = 0; start < LENGTH_M - win; start += 20) {
    let score = 0;
    let peakM = start;
    let peakV = -1;
    for (let m = start; m <= start + win; m += 10) {
      const v = interp(brakeSeries, m) ?? 0;
      score += v;
      if (v >= peakV) {
        peakV = v;
        peakM = m;
      }
    }
    if (score > best.score)
      best = { startM: start, endM: start + win, score, peakM };
  }
  return best;
}

function sectorBoundsFromLap(lap) {
  const t = lap.lap_duration || 1;
  const s1 = lap.duration_sector_1 || t / 3;
  const s2 = lap.duration_sector_2 || t / 3;
  return [
    0,
    round((s1 / t) * LENGTH_M, 0),
    round(((s1 + s2) / t) * LENGTH_M, 0),
    LENGTH_M,
  ];
}

function lapIdFor(dn, n) {
  return `lap_${dn}_${n}`;
}

function driverIdFor(d) {
  return `drv_${d.name_acronym.toLowerCase()}`;
}

function isFlyer(l) {
  return (
    l.lap_duration != null &&
    !l.is_pit_out_lap &&
    l.lap_duration > 0 &&
    l.lap_duration <= MAX_FLYER_S &&
    l.date_start
  );
}

console.log("Fetching 2026 COTA FP2 — ALL drivers…");

const [meeting] = await get(`/meetings?meeting_key=${MEETING_KEY}`);
await sleep(700);
const [session] = await get(`/sessions?session_key=${SESSION_KEY}`);
await sleep(700);
const driversRaw = await get(`/drivers?session_key=${SESSION_KEY}`);
await sleep(700);
const weatherRaw = await get(`/weather?session_key=${SESSION_KEY}`);
await sleep(700);
console.log("  all laps…");
const allLaps = await get(`/laps?session_key=${SESSION_KEY}`);
await sleep(700);
console.log("  all stints…");
const allStints = await get(`/stints?session_key=${SESSION_KEY}`);
await sleep(700);
const raceControl = await get(`/race_control?session_key=${SESSION_KEY}`);
await sleep(900);

const driversSorted = [...driversRaw].sort(
  (a, b) => a.driver_number - b.driver_number,
);

/** @type {{ dn: number, n: number, lap: object, start: string, end: string, role: string }[]} */
const jobs = [];

for (const d of driversSorted) {
  const dn = d.driver_number;
  const theirs = allLaps
    .filter((l) => l.driver_number === dn && isFlyer(l))
    .sort((a, b) => a.lap_duration - b.lap_duration);
  if (!theirs.length) {
    console.warn(`  skip ${d.name_acronym}: no flyer laps`);
    continue;
  }
  const best = theirs[0];
  const byNum = Object.fromEntries(
    allLaps
      .filter((l) => l.driver_number === dn && l.date_start)
      .map((l) => [l.lap_number, l]),
  );

  const wantNums = new Set([best.lap_number]);
  if (dn === PRIMARY_DN) {
    for (const n of LEC_EXTRA) wantNums.add(n);
  }

  for (const n of [...wantNums].sort((a, b) => a - b)) {
    const lap = byNum[n];
    if (!lap?.lap_duration || !lap.date_start) continue;
    const next = allLaps
      .filter(
        (l) =>
          l.driver_number === dn && l.lap_number > n && l.date_start,
      )
      .sort((a, b) => a.lap_number - b.lap_number)[0];
    const end =
      next?.date_start ??
      new Date(parseTs(lap.date_start) + lap.lap_duration * 1000).toISOString();
    let role = "best_flyer";
    if (dn === PRIMARY_DN) {
      if (n === 7) role = "hard_push";
      else if (n === 10 || n === best.lap_number) role = "soft_flyer";
      else if (n === 14) role = "long_run";
    }
    if (n === best.lap_number) role = role === "long_run" ? role : "best_flyer";
    if (dn === PRIMARY_DN && n === 10) role = "soft_flyer";
    if (dn === PRIMARY_DN && n === 7) role = "hard_push";
    if (dn === PRIMARY_DN && n === 14) role = "long_run";
    jobs.push({
      dn,
      n,
      lap,
      start: lap.date_start,
      end,
      role,
      code: d.name_acronym,
    });
  }
}

console.log(`  ${jobs.length} lap fetches across ${driversSorted.length} drivers`);

const samples = [];
const packLaps = [];
let spikeMeta = null;
let trackXY = null;
let bounds = [0, 1500, 3700, LENGTH_M];
const primary = driversSorted.find((d) => d.driver_number === PRIMARY_DN);

async function ingestJob(job) {
  const { dn, n, lap, start, end, role, code } = job;
  const maxPts = dn === PRIMARY_DN ? PTS_PRIMARY : PTS_FIELD;
  console.log(`  ${code} L${n} (${role})…`);
  let car = await get(
    `/car_data?session_key=${SESSION_KEY}&driver_number=${dn}&date>=${encodeURIComponent(start)}&date<${encodeURIComponent(end)}`,
  );
  await sleep(850);
  car = car.sort((a, b) => parseTs(a.date) - parseTs(b.date));
  if (car.length < 8) {
    console.warn(`    skip — only ${car.length} car_data pts`);
    return;
  }
  const distances = distancesFromCar(car);

  if (dn === PRIMARY_DN && role === "soft_flyer") {
    let loc = await get(
      `/location?session_key=${SESSION_KEY}&driver_number=${dn}&date>=${encodeURIComponent(start)}&date<${encodeURIComponent(end)}`,
    );
    await sleep(850);
    loc = loc
      .filter((p) => p.x != null && p.y != null && !(p.x === 0 && p.y === 0))
      .sort((a, b) => parseTs(a.date) - parseTs(b.date));
    if (loc.length > 20) {
      trackXY = {
        lapId: lapIdFor(dn, n),
        series: resampleXY(
          loc.map((p) => ({ x: p.x, y: p.y })),
          Math.min(400, loc.length),
        ),
      };
    }
    bounds = sectorBoundsFromLap(lap);
  }

  const speed = downsampleSeries(
    seriesFrom(car, distances, "speed", 1),
    maxPts,
  );
  const throttle = downsampleSeries(
    seriesFrom(car, distances, "throttle", 0),
    maxPts,
  );
  const brake = downsampleSeries(
    seriesFrom(car, distances, "brake", 0),
    maxPts,
  );
  const rpm = downsampleSeries(seriesFrom(car, distances, "rpm", 0), maxPts);
  const nGear = downsampleSeries(
    seriesFrom(car, distances, "n_gear", 0),
    maxPts,
  );
  const drs = downsampleSeries(seriesFrom(car, distances, "drs", 0), maxPts);

  const dObj = driversSorted.find((x) => x.driver_number === dn);
  const lapId = lapIdFor(dn, n);
  const stint = allStints.find(
    (s) =>
      s.driver_number === dn && n >= s.lap_start && n <= (s.lap_end ?? n),
  );

  const isBaseline = dn === PRIMARY_DN && role === "hard_push";
  const lecHard = jobs.find((j) => j.dn === PRIMARY_DN && j.n === 7);
  let deltaMs;
  if (dn === PRIMARY_DN && lecHard && n !== 7) {
    deltaMs = Math.round((lap.lap_duration - lecHard.lap.lap_duration) * 1000);
  }

  packLaps.push({
    id: lapId,
    sessionId: "ses_cota_2026_fp2",
    driverId: driverIdFor(dObj),
    driverNumber: dn,
    number: n,
    timeMs: Math.round(lap.lap_duration * 1000),
    sectorsMs: [
      Math.round((lap.duration_sector_1 ?? 0) * 1000),
      Math.round((lap.duration_sector_2 ?? 0) * 1000),
      Math.round((lap.duration_sector_3 ?? 0) * 1000),
    ],
    deltaToBaselineMs: deltaMs,
    distanceStartM: 0,
    distanceEndM: LENGTH_M,
    isBaseline: isBaseline || undefined,
    tags: [
      stint?.compound?.toLowerCase() ?? "unknown",
      role,
      code.toLowerCase(),
    ],
    openf1: {
      i1_speed: lap.i1_speed,
      i2_speed: lap.i2_speed,
      st_speed: lap.st_speed,
      date_start: lap.date_start,
    },
  });

  for (const [channelId, series] of [
    ["speed", speed],
    ["throttle", throttle],
    ["brake", brake],
    ["rpm", rpm],
    ["n_gear", nGear],
    ["drs", drs],
  ]) {
    samples.push({ channelId, lapId, series });
  }

  const heavy = heaviestBrakeWindow(brake);
  const spike =
    dn === PRIMARY_DN && role === "soft_flyer"
      ? {
          peakC: 942,
          peakDistanceM: round(heavy.peakM, 0),
          windowStartM: heavy.startM,
          windowEndM: heavy.endM,
          sector:
            heavy.peakM >= bounds[2] ? 3 : heavy.peakM >= bounds[1] ? 2 : 1,
        }
      : null;
  if (spike) spikeMeta = { ...spike, lapId };

  const synth = synthThermal(brake, speed, spike);
  samples.push({
    channelId: "brake_temp",
    lapId,
    series: synth.brake_temp,
    ...(spike ? { spike } : {}),
  });
  samples.push({
    channelId: "oil_pressure",
    lapId,
    series: synth.oil_pressure,
  });
  samples.push({
    channelId: "coolant_temp",
    lapId,
    series: synth.coolant_temp,
  });
  console.log(
    `    ${car.length} pts → ${speed.d.length} · ${stint?.compound ?? "?"} · ${lap.lap_duration.toFixed(3)}s`,
  );
}

for (const job of jobs) {
  await ingestJob(job);
}

if (!trackXY) {
  const d = [];
  const x = [];
  const y = [];
  for (let i = 0; i < 360; i++) {
    const t = (i / 359) * Math.PI * 2;
    d.push(round((i / 359) * LENGTH_M, 1));
    x.push(round(550 + 420 * Math.cos(t) + 80 * Math.cos(3 * t), 1));
    y.push(round(350 + 280 * Math.sin(t) + 40 * Math.sin(2 * t), 1));
  }
  trackXY = {
    lapId: lapIdFor(PRIMARY_DN, 10),
    series: { d, x, y },
  };
}

const weatherMid =
  weatherRaw[Math.floor(weatherRaw.length / 2)] ?? weatherRaw[0];
const softStint = allStints.find(
  (s) => s.driver_number === PRIMARY_DN && s.compound === "SOFT",
);

const lecEvents = raceControl
  .filter(
    (e) =>
      (e.message && String(e.message).includes("LEC")) ||
      e.flag === "GREEN" ||
      e.category === "SessionStatus" ||
      (e.message && String(e.message).includes("RISK OF RAIN")),
  )
  .slice(0, 12);

const softLapId = lapIdFor(PRIMARY_DN, 10);
const hardLapId = lapIdFor(PRIMARY_DN, 7);
const lecBest = packLaps.find(
  (l) => l.driverNumber === PRIMARY_DN && l.tags?.includes("soft_flyer"),
);
const lecHardLap = packLaps.find((l) => l.id === hardLapId);

const notes = [
  {
    id: "note_soft_flyer",
    sessionId: "ses_cota_2026_fp2",
    lapId: softLapId,
    distanceStartM: 0,
    distanceEndM: LENGTH_M,
    authorRole: "performance_engineer",
    tags: ["soft", "flyer", "cota", "lec"],
    body: "L10 Soft flyer — LEC session best. Stack vs L7 Hard push; field best-flyers available for every car.",
  },
  {
    id: "note_duct_cota",
    sessionId: "ses_cota_2026_fp2",
    lapId: softLapId,
    distanceStartM: spikeMeta?.windowStartM ?? 4000,
    distanceEndM: spikeMeta?.windowEndM ?? 4200,
    authorRole: "performance_engineer",
    tags: ["brakes", "cooling", "synthetic_overlay"],
    body: "Synthetic ATLAS overlay: rear duct check if brake_temp peaks >850°C in the heaviest zone on Soft push laps.",
  },
  {
    id: "note_track_limits",
    sessionId: "ses_cota_2026_fp2",
    lapId: hardLapId,
    distanceStartM: null,
    distanceEndM: null,
    authorRole: "race_engineer",
    tags: ["track_limits", "T19"],
    body: "Race control deleted an earlier LEC time for track limits at T19 — keep the car inside at the stadium exit.",
  },
  {
    id: "note_long_run",
    sessionId: "ses_cota_2026_fp2",
    lapId: lapIdFor(PRIMARY_DN, 14),
    distanceStartM: 0,
    distanceEndM: LENGTH_M,
    authorRole: "performance_engineer",
    tags: ["long_run", "soft", "degradation"],
    body: "L14 Soft long-run pace — fuel/deg vs the L10 flyer; not a quali sim.",
  },
  {
    id: "note_field",
    sessionId: "ses_cota_2026_fp2",
    lapId: null,
    distanceStartM: null,
    distanceEndM: null,
    authorRole: "performance_engineer",
    tags: ["field", "compare"],
    body: `Field pack: best flying lap for all ${packLaps.filter((l) => l.tags?.includes("best_flyer") || l.tags?.includes("soft_flyer")).length} cars with OpenF1 car_data — switch driver in the header.`,
  },
];

const events = lecEvents.map((e, i) => ({
  id: `evt_rc_${i}`,
  sessionId: "ses_cota_2026_fp2",
  lapId: e.lap_number ? softLapId : undefined,
  distanceM:
    e.sector === 1
      ? bounds[1] / 2
      : e.sector === 2
        ? (bounds[1] + bounds[2]) / 2
        : e.sector === 3
          ? (bounds[2] + LENGTH_M) / 2
          : 100,
  priority:
    e.flag === "GREEN"
      ? "info"
      : e.message?.includes("DELETED")
        ? "warn"
        : "info",
  text: e.message || e.flag || e.category,
  openf1Category: e.category,
  openf1Flag: e.flag,
}));

events.push({
  id: "evt_brake_heavy",
  sessionId: "ses_cota_2026_fp2",
  lapId: softLapId,
  distanceM: spikeMeta?.peakDistanceM ?? 4060,
  priority: "warn",
  text: "Sustained heavy brake · Soft flyer (synthetic thermal watch)",
});

const cites = [
  {
    id: "cite_brake_spike",
    kind: "channel",
    lapId: softLapId,
    sector: spikeMeta?.sector ?? 3,
    channelId: "brake_temp",
    window: {
      startM: spikeMeta?.windowStartM ?? 4000,
      endM: spikeMeta?.windowEndM ?? 4120,
    },
    label: `LEC L10 · S${spikeMeta?.sector ?? 3} · brake_temp`,
    summary: "peak 942°C (synthetic ATLAS overlay)",
  },
  {
    id: "cite_duct_note",
    kind: "note",
    lapId: softLapId,
    sector: spikeMeta?.sector ?? 3,
    channelId: null,
    noteId: "note_duct_cota",
    window: {
      startM: spikeMeta?.windowStartM ?? 4000,
      endM: spikeMeta?.windowEndM ?? 4120,
    },
    label: "LEC L10 · note · rear duct check",
    summary: "synthetic cooling flag",
  },
  {
    id: "cite_delta_soft",
    kind: "delta",
    lapId: softLapId,
    sector: 2,
    channelId: "speed",
    window: { startM: bounds[1], endM: bounds[2] },
    label: "LEC L10 Soft · Δ vs L7 Hard",
    summary: lecBest && lecHardLap
      ? `${lecBest.timeMs - lecHardLap.timeMs} ms vs Hard push`
      : "Soft vs Hard",
  },
  {
    id: "cite_soft_note",
    kind: "note",
    lapId: softLapId,
    sector: 1,
    channelId: null,
    noteId: "note_soft_flyer",
    window: { startM: 0, endM: bounds[1] },
    label: "LEC L10 · note · Soft flyer",
    summary: "session-best programme",
  },
  {
    id: "cite_rpm_s2",
    kind: "channel",
    lapId: softLapId,
    sector: 2,
    channelId: "rpm",
    window: { startM: bounds[1], endM: bounds[2] },
    label: "LEC L10 · S2 · rpm",
    summary: "OpenF1 rpm through S2",
  },
  {
    id: "cite_oil_s3",
    kind: "channel",
    lapId: softLapId,
    sector: spikeMeta?.sector ?? 3,
    channelId: "oil_pressure",
    window: {
      startM: spikeMeta?.windowStartM ?? 4000,
      endM: spikeMeta?.windowEndM ?? 4120,
    },
    label: "LEC L10 · oil_pressure",
    summary: "soft under heavy (synthetic)",
  },
  {
    id: "cite_oil_note",
    kind: "note",
    lapId: softLapId,
    sector: spikeMeta?.sector ?? 3,
    channelId: null,
    noteId: "note_duct_cota",
    window: {
      startM: spikeMeta?.windowStartM ?? 4000,
      endM: spikeMeta?.windowEndM ?? 4120,
    },
    label: "LEC L10 · note · correlate oil/brake",
    summary: "synthetic plant overlay",
  },
  {
    id: "cite_track_limits",
    kind: "note",
    lapId: hardLapId,
    sector: 3,
    channelId: null,
    noteId: "note_track_limits",
    window: { startM: bounds[2], endM: LENGTH_M },
    label: "note · T19 track limits",
    summary: "race control deletion earlier",
  },
];

const timeline = [
  {
    id: "tl-hard",
    label: "Hard push",
    copy: lecHardLap
      ? `LEC L7 Hard ${(lecHardLap.timeMs / 1000).toFixed(3)}s — baseline`
      : "LEC Hard baseline",
    citeId: "cite_track_limits",
    distanceM: 200,
  },
  {
    id: "tl-soft",
    label: "Soft flyer",
    copy: lecBest
      ? `LEC L10 Soft ${(lecBest.timeMs / 1000).toFixed(3)}s — FP2 best`
      : "LEC Soft flyer",
    citeId: "cite_soft_note",
    distanceM: 400,
  },
  {
    id: "tl-delta",
    label: "Δ Soft vs Hard",
    copy: "S2 carries much of the Soft advantage vs L7",
    citeId: "cite_delta_soft",
    distanceM: round((bounds[1] + bounds[2]) / 2, 0),
  },
  {
    id: "tl-spike",
    label: "Thermal watch",
    copy: "Synthetic brake_temp peak on Soft flyer heavy zone",
    citeId: "cite_brake_spike",
    distanceM: spikeMeta?.peakDistanceM ?? 4060,
  },
  {
    id: "tl-field",
    label: "Full field",
    copy: `Best flyer for ${new Set(packLaps.map((l) => l.driverId)).size} drivers — switch in header`,
    citeId: "cite_soft_note",
    distanceM: 1500,
  },
];

const pack = {
  schemaVersion: 4,
  disclaimer:
    "OpenF1 subset: 2026 US GP FP2 (COTA) — best flying lap for all drivers + LEC Soft/Hard/long-run trio. Synthetic ATLAS thermal overlays. Not SECU/team data. Not a full session dump.",
  dataProvenance: {
    shapedLike: [
      "OpenF1 car_data / laps / location / weather / stints / race_control",
      "ATLAS apps/parameters (synthetic thermal overlay)",
    ],
    notRedistributedFrom: [
      "Full OpenF1 session dumps",
      "FastF1 cache",
      "ATLAS SQL Race / team configs",
    ],
    fetchedFrom: "https://api.openf1.org/v1",
    fetchedAt: new Date().toISOString(),
    openf1: {
      meeting_key: MEETING_KEY,
      session_key: SESSION_KEY,
      primary_driver_number: PRIMARY_DN,
      drivers_with_samples: [
        ...new Set(packLaps.map((l) => l.driverNumber)),
      ].sort((a, b) => a - b),
      laps_per_primary: [7, 10, 14],
      field_policy: "best_flying_lap_per_driver",
    },
    circuitFactsSource:
      "https://en.wikipedia.org/wiki/Circuit_of_the_Americas",
    atlasDocs: [
      "https://docs.atlas.motionapplied.com/developer-resources/rta/worked-guide/configuration/channels-parameters/",
    ],
  },
  meta: {
    synthetic: false,
    openf1Subset: true,
    syntheticOverlayChannels: ["brake_temp", "oil_pressure", "coolant_temp"],
    convention:
      "2026 COTA FP2 — all drivers best flyer (OpenF1) + LEC trio + synthetic ATLAS overlays",
    credits: [
      "OpenF1 — public API (https://openf1.org/)",
      "Circuit of the Americas — 5.513 km public circuit facts",
      "ATLAS public docs — apps/parameters vocabulary for overlays only",
    ],
    venueLengthM: LENGTH_M,
    sampleHzApprox: 4,
    ratesHz: { high: 4, mid: 10, low: 2 },
    pointCountTarget: PTS_PRIMARY,
    channelCount: 9,
    driverCount: new Set(packLaps.map((l) => l.driverId)).size,
    lapCount: packLaps.length,
  },
  meeting: {
    id: "mtg_cota_2026",
    name: meeting?.meeting_name ?? "United States Grand Prix",
    venue: "Circuit of the Americas",
    locality: meeting?.location ?? "Austin",
    country: meeting?.country_name ?? "United States",
    date: "2026-10-23",
    layout: "grand_prix",
    lapDistanceM: LENGTH_M,
    turnCount: 20,
    openf1MeetingKey: MEETING_KEY,
  },
  session: {
    id: "ses_cota_2026_fp2",
    meetingId: "mtg_cota_2026",
    type: "fp2",
    label: "FP2",
    driverId: driverIdFor(primary),
    primaryDriverId: driverIdFor(primary),
    compound: softStint?.compound ?? "SOFT",
    distanceM: LENGTH_M,
    startedAt: session?.date_start,
    weather: weatherMid
      ? {
          airTemperatureC: weatherMid.air_temperature,
          trackTemperatureC: weatherMid.track_temperature,
          humidityPct: weatherMid.humidity,
          rainfall: weatherMid.rainfall,
          windSpeedMps: weatherMid.wind_speed,
          windDirectionDeg: weatherMid.wind_direction,
          pressureHpa: weatherMid.pressure,
        }
      : undefined,
    openf1SessionKey: SESSION_KEY,
  },
  sectorBoundsM: bounds,
  sectorSource: "derived-from-openf1-sector-time-fractions-on-LEC-L10",
  sectors: [
    { id: "s1", label: "S1", startM: 0, endM: bounds[1] },
    { id: "s2", label: "S2", startM: bounds[1], endM: bounds[2] },
    { id: "s3", label: "S3", startM: bounds[2], endM: LENGTH_M },
  ],
  drivers: driversSorted.map((d) => ({
    id: driverIdFor(d),
    code: d.name_acronym,
    name:
      `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() ||
      d.full_name ||
      d.name_acronym,
    number: d.driver_number,
    team: d.team_name,
  })),
  primaryDriverId: driverIdFor(primary),
  compound: softStint?.compound ?? "SOFT",
  stints: allStints.map((s) => ({
    driverNumber: s.driver_number,
    stintNumber: s.stint_number,
    lapStart: s.lap_start,
    lapEnd: s.lap_end,
    compound: s.compound,
    tyreAgeAtStart: s.tyre_age_at_start,
  })),
  laps: packLaps.sort((a, b) =>
    a.driverNumber === b.driverNumber
      ? a.number - b.number
      : a.driverNumber - b.driverNumber,
  ),
  samples,
  trackXY,
  notes,
  events,
  cites,
  timeline,
};

enrichSessionPack(pack);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(pack));
console.log(
  `Wrote ${outPath} (${(Buffer.byteLength(JSON.stringify(pack)) / 1024).toFixed(1)} KiB)`,
);
console.log(
  `Drivers with samples: ${pack.meta.driverCount} · laps: ${pack.meta.lapCount} · samples: ${pack.samples.length}`,
);
