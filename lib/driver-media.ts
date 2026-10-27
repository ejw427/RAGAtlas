import media from "@/lib/driver-media.json";
import type { Driver } from "@/lib/types";

type MediaEntry = {
  file: string;
  number: number;
  name: string;
  team: string;
};

const byCode = media as Record<string, MediaEntry>;

export function headshotFor(driver: Driver | undefined): string | null {
  if (!driver?.code) return null;
  const code = driver.code.toLowerCase();
  const entry = byCode[code];
  return entry?.file ?? null;
}
