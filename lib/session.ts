import cota from "@/data/mock/cota-2026-fp2.json";
import channelsJson from "@/data/mock/channels.json";
import failureModesJson from "@/data/mock/failure-modes.json";
import type {
  Channel,
  ChannelSample,
  CiteTarget,
  Driver,
  FailureMode,
  Lap,
  Note,
  SessionEvent,
  SessionPack,
} from "@/lib/types";

const pack = cota as unknown as SessionPack;
const channelDocs = channelsJson.channels as Channel[];
const failureModes = failureModesJson.modes as FailureMode[];

export function getSessionPack(): SessionPack {
  return pack;
}

export function getChannels(): Channel[] {
  return channelDocs;
}

export function getChannel(id: string): Channel | undefined {
  return channelDocs.find((c) => c.id === id);
}

export function getChannelsByApp(): Record<string, Channel[]> {
  const grouped: Record<string, Channel[]> = {};
  for (const ch of channelDocs) {
    (grouped[ch.app] ??= []).push(ch);
  }
  return grouped;
}

export function getFailureModes(): FailureMode[] {
  return failureModes;
}

export function getDrivers(): Driver[] {
  return pack.drivers;
}

export function getDriver(driverId?: string): Driver {
  const id = driverId ?? pack.primaryDriverId ?? pack.session.driverId;
  return pack.drivers.find((d) => d.id === id) ?? pack.drivers[0];
}

export function getLapsForDriver(driverId: string): Lap[] {
  return pack.laps
    .filter((l) => l.driverId === driverId)
    .sort((a, b) => a.number - b.number);
}

export function getLap(
  lapNumber: number,
  driverId?: string,
): Lap | undefined {
  if (driverId) {
    return pack.laps.find(
      (l) => l.number === lapNumber && l.driverId === driverId,
    );
  }
  return pack.laps.find((l) => l.number === lapNumber);
}

export function getLapById(lapId: string): Lap | undefined {
  return pack.laps.find((l) => l.id === lapId);
}

export function getSample(
  channelId: string,
  lapId: string,
): ChannelSample | undefined {
  return pack.samples.find(
    (s) => s.channelId === channelId && s.lapId === lapId,
  );
}

export function getCite(citeId: string): CiteTarget | undefined {
  return pack.cites.find((c) => c.id === citeId);
}

export function getNotes(): Note[] {
  return pack.notes;
}

export function getEvents(): SessionEvent[] {
  return pack.events;
}

function byPlotOrder(a: Channel, b: Channel): number {
  return (a.plotOrder ?? 99) - (b.plotOrder ?? 99);
}

/** Stage plots - selected ids, else every `plotDefault` channel in plotOrder. */
export function stageChannels(selectedIds?: string[]): Channel[] {
  if (selectedIds?.length) {
    return selectedIds
      .map((id) => channelDocs.find((c) => c.id === id))
      .filter((c): c is Channel => Boolean(c))
      .sort(byPlotOrder);
  }
  const preferred = channelDocs
    .filter((c) => c.plotDefault === true)
    .sort(byPlotOrder);
  if (preferred.length) return preferred;
  return [...channelDocs].sort(byPlotOrder);
}

export function defaultPlotIds(): string[] {
  return stageChannels().map((c) => c.id);
}

/** Synthetic ATLAS-shaped overlay (not OpenF1 car_data). */
export function isOverlayChannel(ch: Channel): boolean {
  return ch.sourceClass === "synthetic_atlas_like";
}

export function sourceBadge(ch: Channel): "OVL" | "OF1" {
  return isOverlayChannel(ch) ? "OVL" : "OF1";
}

export function sectorLabel(sector: CiteTarget["sector"]): string | null {
  if (sector == null) return null;
  if (typeof sector === "number") return `S${sector}`;
  return String(sector);
}

export function lapDistanceM(): number {
  return pack.meeting.lapDistanceM ?? pack.meta.venueLengthM ?? 5513;
}

export function baselineLap(driverId?: string): Lap | undefined {
  const id = driverId ?? pack.primaryDriverId;
  const own = pack.laps.find((l) => l.driverId === id && l.isBaseline);
  if (own) return own;
  return pack.laps.find((l) => l.isBaseline);
}

/** Field compare target: same-driver baseline, else primary Soft flyer. */
export function compareTargetLap(driverId: string): Lap | undefined {
  const ownBaseline = pack.laps.find(
    (l) => l.driverId === driverId && l.isBaseline,
  );
  if (ownBaseline) return ownBaseline;
  return (
    pack.laps.find((l) => l.tags?.includes("soft_flyer")) ??
    pack.laps.find((l) => l.driverId === pack.primaryDriverId)
  );
}

export function defaultDriverId(): string {
  return pack.primaryDriverId ?? pack.session.driverId ?? pack.drivers[0].id;
}

export function defaultLapNumber(driverId?: string): number {
  const id = driverId ?? defaultDriverId();
  const laps = getLapsForDriver(id);
  const soft = laps.find((l) => l.tags?.includes("soft_flyer"));
  if (soft) return soft.number;
  const best = laps.find((l) => l.tags?.includes("best_flyer"));
  if (best) return best.number;
  return laps[0]?.number ?? 10;
}

export function allowedLapNumbers(driverId?: string): number[] {
  if (driverId) return getLapsForDriver(driverId).map((l) => l.number);
  return [...new Set(pack.laps.map((l) => l.number))].sort((a, b) => a - b);
}

export function formatChannelValue(ch: Channel, value: number): string {
  if (ch.valueType === "int" || ch.id === "n_gear" || ch.id === "drs") {
    return `${Math.round(value)}${ch.unit ? ` ${ch.unit}` : ""}`;
  }
  if (ch.id === "brake_temp" || ch.unit === "°C") {
    return `${value.toFixed(0)}${ch.unit ? ` ${ch.unit}` : ""}`;
  }
  if (ch.id === "brake_pressure" || ch.unit === "kg/h") {
    return `${value.toFixed(1)} ${ch.unit}`;
  }
  if (ch.unit === "bar") {
    return `${value.toFixed(2)} ${ch.unit}`;
  }
  if (ch.unit === "g") {
    return `${value.toFixed(2)} ${ch.unit}`;
  }
  if (ch.unit === "°" && ch.id === "steering") {
    return `${value.toFixed(1)}°`;
  }
  if (ch.unit === "%") {
    return `${value.toFixed(0)}${ch.unit}`;
  }
  return `${value.toFixed(1)}${ch.unit ? ` ${ch.unit}` : ""}`;
}

export function formatLapDelta(ms: number | undefined | null): string | null {
  if (ms == null) return null;
  const sign = ms >= 0 ? "+" : "";
  return `${sign}${(ms / 1000).toFixed(3)}`;
}
