import { getChannel, getSample } from "@/lib/session";
import { interpolateAt } from "@/lib/utils";

/** Resample Focus − Reference for any channel along the lap (distance domain). */
export function channelDeltaSeries(
  channelId: string,
  focusLapId: string,
  referenceLapId: string,
  lengthM: number,
  samples = 240,
): { d: number[]; v: number[] } | null {
  const a = getSample(channelId, focusLapId);
  const b = getSample(channelId, referenceLapId);
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

/** Resample Focus − Reference speed along the lap (distance domain). */
export function speedDeltaSeries(
  focusLapId: string,
  referenceLapId: string,
  lengthM: number,
  samples = 240,
): { d: number[]; v: number[] } | null {
  return channelDeltaSeries(
    "speed",
    focusLapId,
    referenceLapId,
    lengthM,
    samples,
  );
}

export function liveDeltaAt(
  series: { d: number[]; v: number[] } | null,
  playheadM: number,
): number | null {
  if (!series) return null;
  return interpolateAt(series, playheadM);
}

/** Short legend copy for the active map-delta channel. */
export function deltaChannelLegend(channelId: string): {
  label: string;
  unit: string;
  ahead: string;
  behind: string;
} {
  const ch = getChannel(channelId);
  const label = ch?.displayName ?? ch?.name ?? channelId;
  const unit = ch?.unit ?? "";
  if (channelId === "speed") {
    return {
      label,
      unit,
      ahead: "Focus faster",
      behind: "Focus slower",
    };
  }
  return {
    label,
    unit,
    ahead: `Focus +${label}`,
    behind: `Focus −${label}`,
  };
}
