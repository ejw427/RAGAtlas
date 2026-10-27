import type { Meeting } from "@/lib/types";

/** Venue aero / cooling package — original Welch Software marks, not team assets. */
export type TrackPackageId = "cota" | "bahrain" | "generic";

export type TrackPackage = {
  id: TrackPackageId;
  /** Short chip on the car stage, e.g. COTA · Austin */
  chip: string;
  /** One-line craft note under the silhouette */
  note: string;
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
  };
};

export const TRACK_PACKAGES: Record<TrackPackageId, TrackPackage> = {
  cota: {
    id: "cota",
    chip: "COTA · Austin",
    note: "Mixed DF · T1 climb · stadium stop cooling",
    rearWing: 1.18,
    frontWing: 1.06,
    cooling: 0.92,
    brakeDuct: 0.88,
    rake: 1.12,
    atmosphere: {
      skyTop: "rgba(8,14,28,0.95)",
      skyBot: "rgba(18,28,22,0.55)",
      ground: "rgba(5,7,10,0.85)",
      kerb: true,
      landmark: "tower",
    },
  },
  bahrain: {
    id: "bahrain",
    chip: "BIC · Sakhir",
    note: "Desert heat package · open ducts · medium DF",
    rearWing: 0.95,
    frontWing: 1.0,
    cooling: 1.0,
    brakeDuct: 0.95,
    rake: 1.0,
    atmosphere: {
      skyTop: "rgba(28,16,10,0.92)",
      skyBot: "rgba(42,24,12,0.5)",
      ground: "rgba(12,8,6,0.88)",
      kerb: false,
      landmark: "desert",
    },
  },
  generic: {
    id: "generic",
    chip: "Session package",
    note: "Baseline open-wheel mark",
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
