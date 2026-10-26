export type SectorIndex = 1 | 2 | 3;
export type SessionType = "fp1" | "fp2" | "fp3" | "quali" | "race";
export type SourceClass = "shaped_like_openf1" | "synthetic_atlas_like";

export interface Meeting {
  id: string;
  name: string;
  venue: string;
  locality?: string;
  country?: string;
  date: string;
  layout: "grand_prix";
  lapDistanceM: number;
  turnCount?: number;
}

export interface SessionWeather {
  airTemperatureC: number;
  trackTemperatureC: number;
  humidityPct: number;
  rainfall: number;
  windSpeedMps?: number;
  windDirectionDeg?: number;
}

export interface Session {
  id: string;
  meetingId: string;
  type: SessionType;
  label: string;
  driverId: string;
  primaryDriverId?: string;
  compound: string;
  distanceM: number;
  startedAt: string;
  weather?: SessionWeather;
}

export interface Driver {
  id: string;
  code: string;
  name: string;
  number?: number;
  team?: string;
}

export interface Lap {
  id: string;
  sessionId: string;
  driverId?: string;
  number: number;
  timeMs: number;
  sectorsMs: [number, number, number];
  deltaToBaselineMs?: number;
  distanceStartM: number;
  distanceEndM: number;
  isBaseline?: boolean;
  tags?: string[];
}

export interface Sector {
  id: string;
  label: string;
  startM: number;
  endM: number;
}

export interface Channel {
  id: string;
  app: string;
  name: string;
  displayName?: string;
  unit: string;
  rateHz: number;
  valueType?: string;
  description: string;
  colorToken: string;
  sourceClass?: SourceClass;
  openf1Field?: string;
  fastf1Field?: string;
  plotDefault?: boolean;
}

export interface DistanceSeries {
  d: number[];
  v: number[];
}

export interface ChannelSample {
  channelId: string;
  lapId: string;
  unit?: string;
  series: DistanceSeries;
  spike?: {
    peakC: number;
    peakDistanceM: number;
    windowStartM: number;
    windowEndM: number;
    sector: number;
  };
}

export interface Note {
  id: string;
  sessionId: string;
  lapId: string | null;
  distanceStartM: number | null;
  distanceEndM: number | null;
  body: string;
  authorRole: string;
  tags: string[];
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  lapId?: string;
  distanceM: number;
  priority: "info" | "warn" | "fault" | "warning";
  text: string;
}

export interface CiteTarget {
  id: string;
  kind: "channel" | "note" | "delta" | "event";
  lapId: string;
  sector: SectorIndex | string | null;
  channelId: string | null;
  noteId?: string;
  window: { startM: number; endM: number };
  label: string;
  summary: string;
}

export interface TimelineMarker {
  id: string;
  label: string;
  copy: string;
  citeId: string;
  distanceM: number;
}

export interface TrackXY {
  lapId: string;
  series: { d: number[]; x: number[]; y: number[] };
}

export interface SessionPack {
  schemaVersion?: number;
  disclaimer?: string;
  dataProvenance?: {
    shapedLike: string[];
    notRedistributedFrom: string[];
    circuitFactsSource: string;
  };
  meta: {
    synthetic: boolean;
    convention: string;
    credits: string[];
    venueLengthM: number;
    sampleHzApprox: number;
    pointCountTarget?: number;
  };
  meeting: Meeting;
  session: Session;
  sectorBoundsM?: number[];
  sectorSource?: string;
  sectors: Sector[];
  drivers: Driver[];
  primaryDriverId?: string;
  compound?: string;
  laps: Lap[];
  samples: ChannelSample[];
  trackXY: TrackXY;
  notes: Note[];
  events: SessionEvent[];
  cites: CiteTarget[];
  timeline: TimelineMarker[];
}

export interface QaEntry {
  id: string;
  exactQuery: string;
  patterns: string[];
  claim: string;
  rationale: string;
  citeIds: string[];
  noHit: boolean;
  noHitMessage?: string;
}

export interface RagAnswer {
  status: "empty" | "loading" | "hit" | "no-hit" | "error";
  query: string;
  claim?: string;
  rationale?: string;
  cites: CiteTarget[];
  message?: string;
}
