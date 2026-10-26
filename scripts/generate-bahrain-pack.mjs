/**
 * Regenerates synthetic Bahrain FP2 session pack.
 * Shaped like OpenF1/FastF1 car_data + ATLAS-style multi-rate apps/params.
 * Does NOT pull live feeds or redistribute caches.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const outPath = join(root, "data", "mock", "bahrain-fp2.json");
const prev = JSON.parse(readFileSync(outPath, "utf8"));

const LENGTH = 5412;
const LAP_MS = { lap_11: 96420, lap_12: 96602, lap_13: 96510 };

/** Distance-domain point counts stand in for ATLAS multi-rate bursts. */
const RATES = {
  high: { hz: 20, n: 480 }, // OpenF1-shaped car_data companions
  mid: { hz: 10, n: 280 }, // thermal / chassis refs
  low: { hz: 2, n: 96 }, // engine plant (SECU-example style)
};

const HEAVY = [
  [580, 760],
  [1380, 1560],
  [2180, 2420],
  [3080, 3220],
  [4180, 4420],
  [5080, 5320],
];

const STRAIGHT_DRS = [
  [800, 1300],
  [2500, 3000],
  [3300, 4100],
  [4500, 5000],
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function inRanges(m, ranges) {
  return ranges.some(([a, b]) => m >= a && m <= b);
}

function heavyFactor(m) {
  for (const [a, b] of HEAVY) {
    if (m >= a && m <= b) {
      const mid = (a + b) / 2;
      const half = (b - a) / 2 || 1;
      return 1 - Math.abs(m - mid) / half;
    }
  }
  return 0;
}

function distances(n) {
  const d = [];
  for (let i = 0; i < n; i++) d.push((i / (n - 1)) * LENGTH);
  return d;
}

function resampleTrack(series, n) {
  const d = distances(n);
  const x = [];
  const y = [];
  let lo = 0;
  for (const m of d) {
    while (lo < series.d.length - 2 && series.d[lo + 1] < m) lo++;
    const hi = Math.min(lo + 1, series.d.length - 1);
    const t =
      series.d[hi] === series.d[lo]
        ? 0
        : (m - series.d[lo]) / (series.d[hi] - series.d[lo] || 1);
    x.push(Number(lerp(series.x[lo], series.x[hi], t).toFixed(1)));
    y.push(Number(lerp(series.y[lo], series.y[hi], t).toFixed(1)));
  }
  return { d, x, y };
}

function gearFromSpeed(spd) {
  if (spd < 40) return 1;
  if (spd < 80) return 2;
  if (spd < 120) return 3;
  if (spd < 160) return 4;
  if (spd < 200) return 5;
  if (spd < 240) return 6;
  if (spd < 280) return 7;
  return 8;
}

function roundSeries(d, v, digits = 1) {
  return {
    d: d.map((x) => Number(x.toFixed(1))),
    v: v.map((x) => Number(x.toFixed(digits))),
  };
}

function buildLapDynamics(lapId) {
  const slowS2 = lapId === "lap_12" ? 0.94 : lapId === "lap_13" ? 0.98 : 1;
  const spike = lapId === "lap_12";
  const n = RATES.high.n;
  const d = distances(n);
  const speed = [];
  const throttle = [];
  const brake = [];
  const rpm = [];
  const nGear = [];
  const drs = [];

  let spd = 180;
  for (let i = 0; i < n; i++) {
    const m = d[i];
    const hf = heavyFactor(m);
    const inS2 = m >= 1850 && m < 3050;
    const targetCruise = (inS2 ? 255 * slowS2 : 295) * (1 - 0.55 * hf);
    const brakeOn = hf > 0.15;
    if (brakeOn) {
      spd = lerp(spd, targetCruise * 0.35, 0.35);
      throttle.push(Math.round(clamp(8 * (1 - hf), 0, 25)));
      brake.push(100);
    } else {
      spd = lerp(spd, targetCruise, 0.18);
      throttle.push(Math.round(clamp(92 + 6 * Math.sin(m / 400), 55, 100)));
      brake.push(0);
    }
    spd = clamp(spd, 55, 318);
    speed.push(spd);
    const g = gearFromSpeed(spd);
    nGear.push(g);
    rpm.push(
      Math.round(
        clamp(4200 + spd * 28 + g * 180 + (brakeOn ? -900 : 200), 3800, 11800),
      ),
    );
    const drsEligible = inRanges(m, STRAIGHT_DRS) && !brakeOn && spd > 240;
    drs.push(drsEligible ? 12 : spd > 220 ? 8 : 1);
  }

  return { d, speed, throttle, brake, rpm, nGear, drs, spike, slowS2 };
}

function brakeTempSeries(dyn, n) {
  const d = distances(n);
  const v = [];
  let temp = 420;
  let j = 0;
  for (let i = 0; i < n; i++) {
    const m = d[i];
    while (j < dyn.d.length - 1 && dyn.d[j] < m) j++;
    const hf = heavyFactor(m);
    const energy = hf * (dyn.spike && m >= 3080 && m <= 3220 ? 38 : 18);
    temp = temp + energy - 1.15;
    if (dyn.spike && m >= 3080 && m <= 3180) {
      const peakShape = 1 - Math.abs(m - 3120) / 100;
      temp = Math.max(temp, 780 + peakShape * 162);
    }
    if (!dyn.spike && m >= 3080 && m <= 3180) {
      temp = Math.min(temp, 820);
    }
    temp = clamp(temp, 280, 960);
    v.push(temp);
  }
  return roundSeries(d, v, 0);
}

function oilPressureSeries(dyn, n) {
  const d = distances(n);
  const v = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const m = d[i];
    while (j < dyn.d.length - 1 && dyn.d[j] < m) j++;
    const hf = heavyFactor(m);
    const base = 4.6 - hf * 0.55 - (dyn.spike && m > 3080 && m < 3200 ? 0.35 : 0);
    v.push(clamp(base + 0.08 * Math.sin(m / 700), 3.2, 5.2));
  }
  return roundSeries(d, v, 2);
}

function coolantSeries(dyn, n) {
  const d = distances(n);
  const v = [];
  let t = 92;
  for (let i = 0; i < n; i++) {
    const m = d[i];
    const hf = heavyFactor(m);
    t += 0.04 + hf * 0.12 + (dyn.spike ? 0.02 : 0);
    t -= m > 4500 ? 0.05 : 0;
    v.push(clamp(t, 88, 108));
  }
  return roundSeries(d, v, 1);
}

function sampleHigh(dyn, channelId) {
  const map = {
    speed: dyn.speed,
    throttle: dyn.throttle,
    brake: dyn.brake,
    rpm: dyn.rpm,
    n_gear: dyn.nGear,
    drs: dyn.drs,
  };
  const digits = channelId === "throttle" || channelId === "speed" ? 1 : 0;
  return {
    channelId,
    lapId: dyn.lapId,
    series: roundSeries(dyn.d, map[channelId], digits),
  };
}

function buildSamples() {
  const samples = [];
  for (const lapId of ["lap_11", "lap_12", "lap_13"]) {
    const dyn = { ...buildLapDynamics(lapId), lapId };
    for (const id of ["speed", "throttle", "brake", "rpm", "n_gear", "drs"]) {
      samples.push(sampleHigh(dyn, id));
    }
    const bt = brakeTempSeries(dyn, RATES.mid.n);
    const entry = {
      channelId: "brake_temp",
      lapId,
      series: bt,
    };
    if (dyn.spike) {
      entry.spike = {
        peakC: 942,
        peakDistanceM: 3120,
        windowStartM: 3080,
        windowEndM: 3180,
        sector: 3,
      };
      // Force exact peak for cite demo
      let best = 0;
      for (let i = 0; i < bt.d.length; i++) {
        if (Math.abs(bt.d[i] - 3120) < Math.abs(bt.d[best] - 3120)) best = i;
      }
      bt.v[best] = 942;
    }
    samples.push(entry);
    samples.push({
      channelId: "oil_pressure",
      lapId,
      series: oilPressureSeries(dyn, RATES.low.n),
    });
    samples.push({
      channelId: "coolant_temp",
      lapId,
      series: coolantSeries(dyn, RATES.low.n),
    });
  }
  return samples;
}

const samples = buildSamples();
const trackXY = {
  lapId: "lap_12",
  series: resampleTrack(prev.trackXY.series, RATES.high.n),
};

const pack = {
  ...prev,
  schemaVersion: 2,
  disclaimer:
    "Synthetic session fixtures. Not live F1, SECU, or team data. Multi-rate channels shaped like public ATLAS docs + OpenF1/FastF1 field conventions.",
  dataProvenance: {
    shapedLike: [
      "OpenF1 car_data",
      "FastF1 Telemetry",
      "ATLAS apps/parameters/events (public docs)",
      "ATLAS SECU Stream API telemetry example parameter groups",
    ],
    notRedistributedFrom: [
      "OpenF1 live pulls",
      "FastF1 cache",
      "iRacing IBT",
      "ATLAS SQL Race / team configs",
    ],
    circuitFactsSource:
      "https://en.wikipedia.org/wiki/Bahrain_International_Circuit",
    atlasDocs: [
      "https://docs.atlas.motionapplied.com/developer-resources/rta/worked-guide/configuration/channels-parameters/",
      "https://docs.atlas.motionapplied.com/developer-resources/secu4/stream_api/reference_docs/examples/telemetry-example/",
    ],
  },
  meta: {
    synthetic: true,
    convention:
      "ATLAS-shaped apps (Chassis/Driver/Engine/Brakes) · multi-rate samples · OpenF1/FastF1 car_data fields + synthetic thermal/plant params",
    credits: [
      "OpenF1 — public car_data field conventions (https://openf1.org/docs/)",
      "FastF1 (MIT) — telemetry column conventions (https://github.com/theOehrly/Fast-F1)",
      "ATLAS public docs — apps, parameters, multi-rate channels, events",
      "Circuit length 5412 m — public Bahrain GP layout facts",
    ],
    venueLengthM: LENGTH,
    sampleHzApprox: RATES.high.hz,
    ratesHz: {
      high: RATES.high.hz,
      mid: RATES.mid.hz,
      low: RATES.low.hz,
    },
    pointCountTarget: RATES.high.n,
    channelCount: 9,
    lapTimeMsRef: LAP_MS,
  },
  notes: [
    ...prev.notes,
    {
      id: "note_oil_window",
      sessionId: "ses_bahrain_fp2_mock",
      lapId: "lap_12",
      distanceStartM: 3080,
      distanceEndM: 3180,
      authorRole: "performance_engineer",
      tags: ["engine", "oil", "S3"],
      body: "Oil pressure dipped to ~3.7 bar under the S3 heavy — still above abort; correlate with brake energy, not pump fault.",
    },
  ],
  events: [
    ...prev.events,
    {
      id: "evt_oil_dip_s3",
      sessionId: "ses_bahrain_fp2_mock",
      lapId: "lap_12",
      distanceM: 3125,
      priority: "info",
      text: "Oil pressure soft under heavy · S3",
    },
    {
      id: "evt_drs_detect",
      sessionId: "ses_bahrain_fp2_mock",
      lapId: "lap_11",
      distanceM: 2600,
      priority: "info",
      text: "DRS detected · main straight",
    },
  ],
  cites: [
    ...prev.cites,
    {
      id: "cite_oil_s3",
      kind: "channel",
      lapId: "lap_12",
      sector: 3,
      channelId: "oil_pressure",
      window: { startM: 3080, endM: 3180 },
      label: "L12 · S3 · oil_pressure",
      summary: "~3.7 bar under heavy",
    },
    {
      id: "cite_rpm_s2",
      kind: "channel",
      lapId: "lap_12",
      sector: 2,
      channelId: "rpm",
      window: { startM: 1850, endM: 3050 },
      label: "L12 · S2 · rpm",
      summary: "lower cruise vs L11",
    },
    {
      id: "cite_oil_note",
      kind: "note",
      lapId: "lap_12",
      sector: 3,
      channelId: null,
      noteId: "note_oil_window",
      window: { startM: 3080, endM: 3180 },
      label: "L12 · note · oil under heavy",
      summary: "correlate with brake energy",
    },
  ],
  timeline: [
    ...prev.timeline,
    {
      id: "tl-oil",
      label: "Oil soft",
      copy: "L12 S3 oil_pressure soft under heavy — not abort",
      citeId: "cite_oil_s3",
      distanceM: 3125,
    },
  ],
  samples,
  trackXY,
};

writeFileSync(outPath, JSON.stringify(pack));
const bytes = Buffer.byteLength(JSON.stringify(pack));
console.log(
  `Wrote ${outPath} (${(bytes / 1024).toFixed(1)} KiB, ${samples.length} samples, rates ${RATES.high.hz}/${RATES.mid.hz}/${RATES.low.hz} Hz)`,
);
