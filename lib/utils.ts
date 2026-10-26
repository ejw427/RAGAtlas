import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLapTime(ms: number): string {
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec - minutes * 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export function formatSector(ms: number): string {
  return (ms / 1000).toFixed(3);
}

export function interpolateAt(
  series: { d: number[]; v: number[] },
  distanceM: number,
): number | null {
  const { d, v } = series;
  if (!d.length) return null;
  if (distanceM <= d[0]) return v[0];
  if (distanceM >= d[d.length - 1]) return v[v.length - 1];
  let lo = 0;
  let hi = d.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (d[mid] <= distanceM) lo = mid;
    else hi = mid;
  }
  const t = (distanceM - d[lo]) / (d[hi] - d[lo] || 1);
  return v[lo] + (v[hi] - v[lo]) * t;
}

export function peakInWindow(
  series: { d: number[]; v: number[] },
  startM: number,
  endM: number,
): { distanceM: number; value: number } | null {
  let best: { distanceM: number; value: number } | null = null;
  for (let i = 0; i < series.d.length; i++) {
    const dist = series.d[i];
    if (dist < startM || dist > endM) continue;
    if (!best || series.v[i] > best.value) {
      best = { distanceM: dist, value: series.v[i] };
    }
  }
  return best;
}
