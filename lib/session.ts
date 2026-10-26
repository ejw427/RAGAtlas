import bahrain from "@/data/mock/bahrain-fp2.json";
import channelsJson from "@/data/mock/channels.json";
import type {
  Channel,
  ChannelSample,
  CiteTarget,
  Lap,
  SessionPack,
} from "@/lib/types";

const pack = bahrain as unknown as SessionPack;
const channelDocs = channelsJson.channels as Channel[];

export function getSessionPack(): SessionPack {
  return pack;
}

export function getChannels(): Channel[] {
  return channelDocs;
}

export function getChannel(id: string): Channel | undefined {
  return channelDocs.find((c) => c.id === id);
}

export function getLap(lapNumber: number): Lap | undefined {
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

export function getDriver() {
  const id = pack.primaryDriverId ?? pack.session.driverId;
  return pack.drivers.find((d) => d.id === id) ?? pack.drivers[0];
}

/** v1 plot trio per fixture-realism notes */
export function stageChannels(): Channel[] {
  const preferred = ["brake_temp", "throttle", "speed"];
  return preferred
    .map((id) => channelDocs.find((c) => c.id === id))
    .filter((c): c is Channel => Boolean(c));
}

export function sectorLabel(sector: CiteTarget["sector"]): string | null {
  if (sector == null) return null;
  if (typeof sector === "number") return `S${sector}`;
  return String(sector);
}

export function lapDistanceM(): number {
  return pack.meeting.lapDistanceM ?? pack.meta.venueLengthM ?? 5412;
}
