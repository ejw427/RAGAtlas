import media from "@/lib/driver-media.json";
import type { Driver } from "@/lib/types";

type MediaEntry = {
  file: string;
  number: number;
  name: string;
  team: string;
};

const byCode = media as Record<string, MediaEntry>;

export function headshotForCode(code: string | undefined): string | null {
  if (!code) return null;
  const entry = byCode[code.toLowerCase()];
  return entry?.file ?? null;
}

export function headshotFor(driver: Driver | undefined): string | null {
  return headshotForCode(driver?.code);
}
