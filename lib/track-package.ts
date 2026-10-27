import type { Meeting } from "@/lib/types";

/** Venue aero / atmosphere package for stages (COTA tower, Bahrain heat, etc.). */
export type TrackPackageId = "cota" | "bahrain" | "generic";

export type TrackPackage = {
  id: TrackPackageId;
  /** Short chip on the car stage, e.g. COTA · Austin */
  chip: string;
  /** One-line craft note under the silhouette */
  note: string;
  /** Plain-English package blurb for popups / stages */
  plain: string;
  /** Rear wing relative height (1 = baseline) */
  rearWing: number;
  /** Front wing span (1 = baseline) */
  frontWing: number;
  /** Sidepod inlet openness 0–1 (heat tracks run more open) */
  cooling: number;
  /** Brake duct openness 0–1 */
  brakeDuct: number;
  /** Floor rake exaggeration for side profile */
  rake: number;
  atmosphere: {
    skyTop: string;
    skyBot: string;
    ground: string;
    kerb: boolean;
    landmark: "tower" | "desert" | "none";
    /** Optional asphalt ribbon tint under the car */
    asphalt?: string;
    accentGlow?: string;
  };
};

export const TRACK_PACKAGES: Record<TrackPackageId, TrackPackage> = {
  cota: {
    id: "cota",
    chip: "COTA · Austin",
    note: "High DF · T1 climb · stadium brake cooling",
    plain:
      "Circuit of the Americas package: taller rear wing for the T1 hill, open ducts for the stadium stop, red/white kerb stage.",
    rearWing: 1.32,
    frontWing: 1.12,
    cooling: 0.95,
    brakeDuct: 0.92,
    rake: 1.18,
    atmosphere: {
      skyTop: "rgba(6,12,28,0.97)",
      skyBot: "rgba(22,36,28,0.62)",
      ground: "rgba(4,6,9,0.92)",
      kerb: true,
      landmark: "tower",
      asphalt: "rgba(18,22,28,0.95)",
      accentGlow: "rgba(255,77,94,0.22)",
    },
  },
  bahrain: {
    id: "bahrain",
    chip: "BIC · Sakhir",
    note: "Desert heat · open ducts · medium DF",
    plain:
      "Sakhir heat package: wide cooling inlets, open brake ducts, lower rear wing for the straights.",
    rearWing: 0.88,
    frontWing: 0.98,
    cooling: 1.0,
    brakeDuct: 0.98,
    rake: 1.0,
    atmosphere: {
      skyTop: "rgba(36,18,10,0.94)",
      skyBot: "rgba(52,28,14,0.55)",
      ground: "rgba(14,8,5,0.9)",
      kerb: false,
      landmark: "desert",
      asphalt: "rgba(28,18,12,0.9)",
      accentGlow: "rgba(255,160,80,0.2)",
    },
  },
  generic: {
    id: "generic",
    chip: "Session package",
    note: "Baseline open-wheel mark",
    plain: "Neutral open-wheel mark when the venue is unknown.",
    rearWing: 1.0,
    frontWing: 1.0,
    cooling: 0.7,
    brakeDuct: 0.65,
    rake: 1.0,
    atmosphere: {
      skyTop: "rgba(8,10,14,0.9)",
      skyBot: "rgba(12,16,22,0.45)",
      ground: "rgba(5,7,10,0.8)",
      kerb: false,
      landmark: "none",
      asphalt: "rgba(14,16,20,0.88)",
    },
  },
};

export function trackPackageIdForMeeting(
  meeting: Pick<Meeting, "id" | "venue" | "locality"> | null | undefined,
): TrackPackageId {
  if (!meeting) return "generic";
  const blob = `${meeting.id} ${meeting.venue} ${meeting.locality ?? ""}`.toLowerCase();
  if (
    blob.includes("cota") ||
    blob.includes("americas") ||
    blob.includes("austin")
  ) {
    return "cota";
  }
  if (blob.includes("bahrain") || blob.includes("sakhir")) {
    return "bahrain";
  }
  return "generic";
}

export function trackPackageForMeeting(
  meeting: Pick<Meeting, "id" | "venue" | "locality"> | null | undefined,
): TrackPackage {
  return TRACK_PACKAGES[trackPackageIdForMeeting(meeting)];
}
