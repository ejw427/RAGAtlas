import dossiers from "@/data/driver-dossiers.json";
import type { Driver } from "@/lib/types";

export type DriverLink = { label: string; href: string };

export type DriverNewsItem = {
  title: string;
  source: string;
  href: string;
  date?: string;
};

export type DriverDossier = {
  nationality: string;
  born?: string;
  birthplace?: string;
  debut?: string;
  highlights?: string;
  summary: string;
  helmet: string;
  suit: string;
  livery?: string;
  links: DriverLink[];
  /** Public race / team coverage — last section on the racer card. */
  news?: DriverNewsItem[];
};

const byCode = dossiers as Record<string, DriverDossier>;

export function dossierFor(
  driver: Driver | undefined,
): DriverDossier | null {
  if (!driver?.code) return null;
  return byCode[driver.code.toUpperCase()] ?? null;
}

export function bornYear(dossier: DriverDossier | null | undefined): string | null {
  if (!dossier?.born) return null;
  return dossier.born.slice(0, 4);
}

export function ageFromBorn(
  born: string | undefined,
  asOf = new Date(),
): number | null {
  if (!born) return null;
  const parts = born.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1] ?? 1);
  const d = Number(parts[2] ?? 1);
  if (!Number.isFinite(y) || y <= 0) return null;
  let age = asOf.getFullYear() - y;
  const md = (asOf.getMonth() + 1) * 100 + asOf.getDate();
  const bmd = (Number.isFinite(m) ? m : 1) * 100 + (Number.isFinite(d) ? d : 1);
  if (md < bmd) age -= 1;
  return age;
}
