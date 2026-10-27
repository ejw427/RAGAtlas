import { getSample } from "@/lib/session";
import { interpolateAt } from "@/lib/utils";

/** Resample Focus - Reference speed along the lap (distance domain). */
export function speedDeltaSeries(
  focusLapId: string,
  referenceLapId: string,
  lengthM: number,
  samples = 240,
): { d: number[]; v: number[] } | null {
  const a = getSample("speed", focusLapId);
  const b = getSample("speed", referenceLapId);
  if (!a || !b) return null;
  const n = Math.min(a.series.d.length, b.series.d.length, samples);
  const d: number[] = [];
  const v: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1);
    const m = t * lengthM;
    const va = interpolateAt(a.series, m);
    const vb = interpolateAt(b.series, m);
    if (va == null || vb == null) continue;
    d.push(m);
    v.push(va - vb);
  }
  if (d.length < 2) return null;
  return { d, v };
}

export function liveDeltaAt(
  series: { d: number[]; v: number[] } | null,
  playheadM: number,
): number | null {
  if (!series) return null;
  return interpolateAt(series, playheadM);
}
