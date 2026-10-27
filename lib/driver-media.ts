import media from "@/lib/driver-media.json";
import type { Driver } from "@/lib/types";

type MediaEntry = {
  file: string;
  number: number;
  name: string;
  team: string;
};

const byCode = media as Record<string, MediaEntry>;

/** Codes with missing/placeholder OpenF1 assets - use helmet mark instead. */
const BROKEN_CODES = new Set(["lin"]);

export function headshotFor(driver: Driver | undefined): string | null {
  if (!driver?.code) return null;
  const code = driver.code.toLowerCase();
  if (BROKEN_CODES.has(code)) return null;
  const entry = byCode[code];
  return entry?.file ?? null;
}
