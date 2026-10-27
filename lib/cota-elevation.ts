/**
 * Approximate COTA elevation profile (relative metres from S/F).
 * Shaped from public Circuit of the Americas facts — ~41 m climb to T1 crest —
 * not a surveyed DEM. Labeled as approximate in the UI.
 */
const KEYS: { m: number; z: number; note?: string }[] = [
  { m: 0, z: 0, note: "S/F" },
  { m: 80, z: 4 },
  { m: 200, z: 18 },
  { m: 320, z: 32 },
  { m: 420, z: 41, note: "T1 crest" },
  { m: 520, z: 34 },
  { m: 700, z: 22 },
  { m: 980, z: 14, note: "Esses" },
  { m: 1200, z: 11 },
  { m: 1483, z: 9, note: "S1→" },
  { m: 1800, z: 8 },
  { m: 2200, z: 6 },
  { m: 2600, z: 5, note: "T11" },
  { m: 3000, z: 7 },
  { m: 3400, z: 8 },
  { m: 3672, z: 7, note: "S2→" },
  { m: 3900, z: 6 },
  { m: 4100, z: 5, note: "Stadium" },
  { m: 4500, z: 6 },
  { m: 4900, z: 8 },
  { m: 5100, z: 10, note: "T19" },
  { m: 5350, z: 4 },
  { m: 5513, z: 0, note: "S/F" },
];

export const COTA_ELEVATION_DISCLAIMER =
  "Approx. grade · public COTA facts · not surveyed DEM";

export const COTA_CLIMB_M = 41;
export const COTA_LENGTH_M = 5513;

/** Elevation (m relative to S/F) at distance along the lap. */
export function elevationAt(distanceM: number): number {
  const m = Math.max(0, Math.min(COTA_LENGTH_M, distanceM));
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (m >= a.m && m <= b.m) {
      const t = (m - a.m) / (b.m - a.m || 1);
      return a.z + (b.z - a.z) * t;
    }
  }
  return KEYS[KEYS.length - 1].z;
}

/** Dense series for SVG profiles. */
export function elevationSeries(samples = 180): {
  d: number[];
  z: number[];
  notes: { m: number; z: number; note: string }[];
} {
  const d: number[] = [];
  const z: number[] = [];
  for (let i = 0; i < samples; i++) {
    const m = (i / Math.max(samples - 1, 1)) * COTA_LENGTH_M;
    d.push(m);
    z.push(elevationAt(m));
  }
  const notes = KEYS.filter((k) => k.note).map((k) => ({
    m: k.m,
    z: k.z,
    note: k.note!,
  }));
  return { d, z, notes };
}

export function gradePctAt(distanceM: number, windowM = 40): number {
  const a = elevationAt(Math.max(0, distanceM - windowM / 2));
  const b = elevationAt(Math.min(COTA_LENGTH_M, distanceM + windowM / 2));
  return ((b - a) / windowM) * 100;
}
