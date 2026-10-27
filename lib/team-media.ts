import type { Driver } from "@/lib/types";
import type { TrackPackage, TrackPackageId } from "@/lib/track-package";

/**
 * Editorial media map for the COTA demo.
 * Car side renders + Austin special helmets are public-media caches for
 * recognition only — not affiliated with / licensed by F1 or any team.
 */
/** CDN slug under /cars/{slug}.webp — 2026 side renders. */
export const TEAM_CAR_SLUG: Record<string, string> = {
  ferrari: "ferrari",
  mercedes: "mercedes",
  mclaren: "mclaren",
  redbull: "redbullracing",
  astonmartin: "astonmartin",
  williams: "williams",
  alpine: "alpine",
  haas: "haasf1team",
  racingbulls: "racingbulls",
  audi: "audi",
  cadillac: "cadillac",
};

/** OpenF1 team_colour (Austin 2026 race) → house secondary for contrast marks. */
export const OPENF1_TEAM_COLOURS: Record<
  string,
  { accent: string; second: string; house: string }
> = {
  Ferrari: { house: "ferrari", accent: "#ED1131", second: "#FFF5E6" },
  Mercedes: { house: "mercedes", accent: "#00D7B6", second: "#C8CED6" },
  McLaren: { house: "mclaren", accent: "#F47600", second: "#111318" },
  "Red Bull Racing": {
    house: "redbull",
    accent: "#4781D7",
    second: "#F0D030",
  },
  "Aston Martin": {
    house: "astonmartin",
    accent: "#229971",
    second: "#D6DE6B",
  },
  Williams: { house: "williams", accent: "#1868DB", second: "#A8C8FF" },
  Alpine: { house: "alpine", accent: "#00A1E8", second: "#FF87BC" },
  "Haas F1 Team": { house: "haas", accent: "#9C9FA2", second: "#B42318" },
  "Racing Bulls": {
    house: "racingbulls",
    accent: "#6C98FF",
    second: "#F4F1EA",
  },
  Audi: { house: "audi", accent: "#F50537", second: "#D0D4D8" },
  Cadillac: { house: "cadillac", accent: "#909090", second: "#C4A35A" },
};

/**
 * Drivers with a documented United States GP 2026 special helmet
 * (Helmet Archive / team reveals). Everyone else runs their season shell.
 */
export const COTA_SPECIAL_HELMET_CODES = new Set([
  "ver",
  "lec",
  "ham",
  "nor",
  "pia",
  "alb",
  "sai",
  "col",
  "bea",
]);

export type HelmetPick = {
  src: string;
  /** austin = US GP one-off; season = regular 2026 kit render */
  kind: "austin" | "season";
  label: string;
};

export function carSrcForHouse(house: string | undefined): string | null {
  if (!house) return null;
  const slug = TEAM_CAR_SLUG[house];
  return slug ? `/cars/${slug}.webp` : null;
}

export function carSrcForTeam(team: string | undefined): string | null {
  if (!team) return null;
  const entry = OPENF1_TEAM_COLOURS[team];
  return entry ? carSrcForHouse(entry.house) : null;
}

export function carSrcForAccent(accent: { house: string }): string | null {
  return carSrcForHouse(accent.house);
}

function trackId(
  track?: TrackPackageId | TrackPackage | null,
): TrackPackageId | null {
  if (track == null) return null;
  return typeof track === "string" ? track : track.id;
}

/** Season kit / helmet render (right-facing F1 media). */
export function seasonHelmetSrc(code: string | undefined): string | null {
  if (!code) return null;
  return `/helmets/${code.toLowerCase()}.webp`;
}

/** Austin / COTA one-off helmet art when it exists for this driver. */
export function cotaSpecialHelmetSrc(code: string | undefined): string | null {
  if (!code) return null;
  const c = code.toLowerCase();
  if (!COTA_SPECIAL_HELMET_CODES.has(c)) return null;
  return `/helmets/cota-${c}.png`;
}

/**
 * Pick the right helmet for the venue.
 * On COTA: Austin special if published, else season shell (labelled).
 */
export function helmetPickFor(
  code: string | undefined,
  track?: TrackPackageId | TrackPackage | null,
): HelmetPick | null {
  if (!code) return null;
  const c = code.toLowerCase();
  const id = trackId(track);

  if (id === "cota") {
    const special = cotaSpecialHelmetSrc(c);
    if (special) {
      return {
        src: special,
        kind: "austin",
        label: "Austin special",
      };
    }
    const season = seasonHelmetSrc(c);
    if (season) {
      return {
        src: season,
        kind: "season",
        label: "Season helmet · no Austin one-off",
      };
    }
    return null;
  }

  const season = seasonHelmetSrc(c);
  if (!season) return null;
  return {
    src: season,
    kind: "season",
    label: id === "bahrain" ? "Season helmet · Sakhir" : "Season helmet",
  };
}

export function helmetSrcFor(
  driver: Driver | undefined,
  track?: TrackPackageId | TrackPackage | null,
): string | null {
  return helmetPickFor(driver?.code, track)?.src ?? null;
}

export function helmetSrcForCode(
  code: string | undefined,
  track?: TrackPackageId | TrackPackage | null,
): string | null {
  return helmetPickFor(code, track)?.src ?? null;
}

export function hasCotaSpecialHelmet(code: string | undefined): boolean {
  if (!code) return false;
  return COTA_SPECIAL_HELMET_CODES.has(code.toLowerCase());
}
