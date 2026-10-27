import type { Driver, Lap } from "@/lib/types";
import {
  getDriver,
  getDrivers,
  getLap,
  getLapsForDriver,
  getSessionPack,
} from "@/lib/session";
import { OPENF1_TEAM_COLOURS } from "@/lib/team-media";

export type TeamAccent = {
  house: string;
  accent: string;
  second: string;
};

/** Exact OpenF1 team_colour from the live COTA session pack. */
export const TEAM_ACCENTS: Record<string, TeamAccent> = Object.fromEntries(
  Object.entries(OPENF1_TEAM_COLOURS).map(([team, c]) => [
    team,
    { house: c.house, accent: c.accent, second: c.second },
  ]),
) as Record<string, TeamAccent>;

export const FALLBACK_ACCENT: TeamAccent = {
  house: "field",
  accent: "#C6FF4A",
  second: "#9AA7B8",
};

export function accentFor(driver: Driver | undefined): TeamAccent {
  if (!driver?.team) return FALLBACK_ACCENT;
  return TEAM_ACCENTS[driver.team] ?? FALLBACK_ACCENT;
}

export function teammateId(driverId: string): string | undefined {
  const driver = getDriver(driverId);
  if (!driver.team) return undefined;
  return getDrivers().find(
    (d) => d.team === driver.team && d.id !== driverId,
  )?.id;
}

export function helmetMotif(number?: number): 0 | 1 | 2 {
  return (((number ?? 0) % 3) + 3) % 3 as 0 | 1 | 2;
}

export function compoundOf(lap: Lap): string {
  const pack = getSessionPack();
  const tag = lap.tags?.find((t) =>
    ["soft", "hard", "medium", "intermediate", "wet"].includes(t),
  );
  if (tag) return tag;
  return pack.session.compound.toLowerCase();
}

export function compoundLetter(compound: string): string {
  return (compound[0] ?? "S").toUpperCase();
}

export type HousePreset = {
  id: string;
  label: string;
  focusCode: string;
  focusLap: number;
  referenceCode: string;
  referenceLap: number;
};

export const HOUSE_PRESETS: HousePreset[] = [
  {
    id: "ferrari",
    label: "Ferrari",
    focusCode: "LEC",
    focusLap: 10,
    referenceCode: "HAM",
    referenceLap: 9,
  },
  {
    id: "mercedes",
    label: "Mercedes",
    focusCode: "ANT",
    focusLap: 8,
    referenceCode: "RUS",
    referenceLap: 9,
  },
  {
    id: "redbull",
    label: "Red Bull Racing",
    focusCode: "VER",
    focusLap: 9,
    referenceCode: "HAD",
    referenceLap: 10,
  },
  {
    id: "mclaren",
    label: "McLaren",
    focusCode: "PIA",
    focusLap: 13,
    referenceCode: "NOR",
    referenceLap: 4,
  },
  {
    id: "astonmartin",
    label: "Aston Martin",
    focusCode: "ALO",
    focusLap: 8,
    referenceCode: "STR",
    referenceLap: 13,
  },
  {
    id: "williams",
    label: "Williams",
    focusCode: "SAI",
    focusLap: 14,
    referenceCode: "ALB",
    referenceLap: 12,
  },
  {
    id: "alpine",
    label: "Alpine",
    focusCode: "GAS",
    focusLap: 9,
    referenceCode: "COL",
    referenceLap: 5,
  },
  {
    id: "haas",
    label: "Haas",
    focusCode: "BEA",
    focusLap: 10,
    referenceCode: "OCO",
    referenceLap: 10,
  },
  {
    id: "racingbulls",
    label: "Racing Bulls",
    focusCode: "LAW",
    focusLap: 11,
    referenceCode: "LIN",
    referenceLap: 11,
  },
  {
    id: "audi",
    label: "Audi",
    focusCode: "BOR",
    focusLap: 5,
    referenceCode: "HUL",
    referenceLap: 10,
  },
  {
    id: "cadillac",
    label: "Cadillac",
    focusCode: "BOT",
    focusLap: 10,
    referenceCode: "PER",
    referenceLap: 10,
  },
];

/** Command-bar switcher entries (teams + tools walk-in). */
export const HOUSE_SWITCHER: { id: string; label: string }[] = [
  ...HOUSE_PRESETS.map((h) => ({ id: h.id, label: h.label })),
  { id: "tools", label: "Tools" },
];

export function resolveHouse(houseId: string | null | undefined): {
  focusDriverId: string;
  focusLap: number;
  referenceDriverId: string;
  referenceLap: number;
  toolsDemo?: boolean;
} | null {
  if (!houseId) return null;
  const key = houseId.toLowerCase();
  // Tools vendor walk-in uses the Ferrari pair + cite money shot.
  if (key === "tools" || key === "motion" || key === "motionapplied") {
    const ferrari = resolveHouse("ferrari");
    return ferrari ? { ...ferrari, toolsDemo: true } : null;
  }
  const preset = HOUSE_PRESETS.find(
    (h) => h.id === key || h.label.toLowerCase() === key,
  );
  if (!preset) return null;
  const drivers = getDrivers();
  const focus = drivers.find(
    (d) => d.code.toLowerCase() === preset.focusCode.toLowerCase(),
  );
  const reference = drivers.find(
    (d) => d.code.toLowerCase() === preset.referenceCode.toLowerCase(),
  );
  if (!focus || !reference) return null;
  return {
    focusDriverId: focus.id,
    focusLap: preset.focusLap,
    referenceDriverId: reference.id,
    referenceLap: preset.referenceLap,
  };
}

export function fieldBestLap(excludeLapId?: string): Lap | undefined {
  const pack = getSessionPack();
  const laps = pack.laps
    .filter((l) => l.id !== excludeLapId)
    .slice()
    .sort((a, b) => a.timeMs - b.timeMs);
  return laps[0];
}

/** P1 vs P2 best flyers — default pit-wall compare for the field. */
export function fieldTopTwoCompare(): {
  focusDriverId: string;
  focusLap: number;
  referenceDriverId: string;
  referenceLap: number;
} | null {
  const pack = getSessionPack();
  const sorted = pack.laps.slice().sort((a, b) => a.timeMs - b.timeMs);
  const seen = new Set<string>();
  const best: Lap[] = [];
  for (const lap of sorted) {
    if (seen.has(lap.driverId)) continue;
    seen.add(lap.driverId);
    best.push(lap);
    if (best.length >= 2) break;
  }
  const p1 = best[0];
  const p2 = best[1];
  if (!p1 || !p2) return null;
  return {
    focusDriverId: p1.driverId,
    focusLap: p1.number,
    referenceDriverId: p2.driverId,
    referenceLap: p2.number,
  };
}

export function otherCompoundLap(driverId: string, currentLap: Lap): Lap | undefined {
  const current = compoundOf(currentLap);
  const laps = getLapsForDriver(driverId).filter((l) => l.id !== currentLap.id);
  const opposite = current === "soft" ? "hard" : current === "hard" ? "soft" : null;
  if (opposite) {
    const hit = laps.find((l) => compoundOf(l) === opposite);
    if (hit) return hit;
  }
  return laps.find((l) => compoundOf(l) !== current);
}

export function bestFlyerFor(driverId: string): Lap | undefined {
  const laps = getLapsForDriver(driverId);
  return (
    laps.find((l) => l.tags?.includes("soft_flyer")) ??
    laps.find((l) => l.tags?.includes("best_flyer")) ??
    laps[0]
  );
}

export function resolveDriverParam(param: string | null | undefined): string | null {
  if (!param) return null;
  const drivers = getDrivers();
  const byCode = drivers.find(
    (d) => d.code.toLowerCase() === param.toLowerCase(),
  );
  if (byCode) return byCode.id;
  const byId = drivers.find((d) => d.id === param);
  return byId?.id ?? null;
}

export function sectorDeltas(
  focus: Lap,
  reference: Lap | null | undefined,
): { lapMs: number; sectorsMs: [number, number, number] } | null {
  if (!reference) return null;
  return {
    lapMs: focus.timeMs - reference.timeMs,
    sectorsMs: [
      focus.sectorsMs[0] - reference.sectorsMs[0],
      focus.sectorsMs[1] - reference.sectorsMs[1],
      focus.sectorsMs[2] - reference.sectorsMs[2],
    ],
  };
}

export function formatDeltaSec(ms: number): string {
  const s = ms / 1000;
  const sign = s > 0 ? "+" : s < 0 ? "-" : "";
  return `${sign}${Math.abs(s).toFixed(3)}`;
}

/** Sector where Focus gains the most vs Reference (most negative delta). */
export function biggestGainSector(
  deltas: { sectorsMs: [number, number, number] } | null | undefined,
): { label: "S1" | "S2" | "S3"; index: number; ms: number } | null {
  if (!deltas) return null;
  let best = 0;
  for (let i = 1; i < 3; i++) {
    if (deltas.sectorsMs[i] < deltas.sectorsMs[best]) best = i;
  }
  const labels = ["S1", "S2", "S3"] as const;
  return {
    label: labels[best],
    index: best,
    ms: deltas.sectorsMs[best],
  };
}

/** Sector where Focus loses the most (most positive delta). */
export function biggestLossSector(
  deltas: { sectorsMs: [number, number, number] } | null | undefined,
): { label: "S1" | "S2" | "S3"; index: number; ms: number } | null {
  if (!deltas) return null;
  let best = 0;
  for (let i = 1; i < 3; i++) {
    if (deltas.sectorsMs[i] > deltas.sectorsMs[best]) best = i;
  }
  const labels = ["S1", "S2", "S3"] as const;
  return {
    label: labels[best],
    index: best,
    ms: deltas.sectorsMs[best],
  };
}

/** Default dual-car / house walk-in — full race story on stage (not a starved trio). */
export const RACE_PLOT_IDS = [
  "speed",
  "throttle",
  "brake",
  "brake_pressure",
  "brake_temp",
  "brake_temp_fl",
  "n_gear",
  "steering",
  "rpm",
  "drs",
  "g_long",
  "tyre_surf_fl",
] as const;

export function channelPresets(): Record<string, string[]> {
  return {
    Race: [...RACE_PLOT_IDS],
    Lap: ["speed", "throttle", "brake"],
    Pedals: ["throttle", "brake", "brake_pressure", "steering"],
    Brakes: ["brake", "brake_pressure", "brake_temp", "brake_temp_fl"],
    Thermal: [
      "brake_temp",
      "brake_temp_fl",
      "tyre_surf_fl",
      "coolant_temp",
      "oil_pressure",
    ],
    Power: ["rpm", "n_gear", "fuel_flow", "oil_pressure", "coolant_temp"],
    /** Filled by caller with defaultPlotIds() when needed - placeholder key order. */
    All: [],
  };
}

export function resolvePreset(
  name: string,
  allIds: string[],
): string[] {
  if (name === "All") return allIds;
  const presets = channelPresets();
  const ids = presets[name];
  return ids?.length ? ids : [...RACE_PLOT_IDS];
}

export function resolveLapNumber(
  driverId: string,
  lapParam: string | null | undefined,
  fallback: number,
): number {
  const n = Number(lapParam ?? String(fallback));
  if (!Number.isFinite(n)) return fallback;
  const allowed = getLapsForDriver(driverId).map((l) => l.number);
  return allowed.includes(n) ? n : fallback;
}

export function getLapSafe(driverId: string, lapNumber: number): Lap {
  return (
    getLap(lapNumber, driverId) ??
    getLapsForDriver(driverId)[0] ??
    getSessionPack().laps[0]
  );
}
