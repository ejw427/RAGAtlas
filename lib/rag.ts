import qaMap from "@/data/mock/qa-map.json";
import { getCite, getSessionPack } from "@/lib/session";
import type {
  CiteTarget,
  EvidenceBundle,
  EvidenceSnippet,
  Note,
  QaEntry,
  RagAnswer,
  SessionEvent,
} from "@/lib/types";

const entries = qaMap.queries as QaEntry[];

function normalize(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[^a-z0-9°]+/i)
    .filter((t) => t.length >= 2);
}

/** Score a QaMap entry. Prefers multi-pattern / longer phrases; weak short singles lose. */
function scoreEntry(n: string, entry: QaEntry): number {
  let score = 0;
  let hits = 0;
  let strongHits = 0;
  for (const pattern of entry.patterns) {
    const p = pattern.toLowerCase();
    if (!n.includes(p)) continue;
    hits += 1;
    const weight = p.includes(" ") || p.length >= 8 ? 1.65 : 1;
    score += p.length * weight;
    if (p.length >= 6 || p.includes(" ")) strongHits += 1;
  }
  if (hits === 0) return 0;
  score += hits * 10;
  if (hits === 1 && strongHits === 0) score *= 0.25;
  return score;
}

function matchEntry(query: string): QaEntry | undefined {
  const n = normalize(query);
  if (!n) return undefined;

  const exact = entries.find((e) => normalize(e.exactQuery) === n);
  if (exact) return exact;

  let best: { entry: QaEntry; score: number } | undefined;
  for (const entry of entries) {
    const score = scoreEntry(n, entry);
    if (score >= 8 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best?.entry;
}

export function resolveCites(citeIds: string[]): CiteTarget[] {
  return citeIds
    .map((id) => getCite(id))
    .filter((c): c is CiteTarget => Boolean(c));
}

function citeForNote(noteId: string): CiteTarget | undefined {
  const pack = getSessionPack();
  return pack.cites.find(
    (c) =>
      c.noteId === noteId ||
      c.id.includes(noteId.replace(/^note_/, "cite_")),
  );
}

function scoreText(tokens: string[], hay: string): number {
  const h = hay.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (h.includes(t)) score += t.length >= 5 ? 6 : 3;
  }
  return score;
}

function noteBodyForCite(cite: CiteTarget): string | undefined {
  if (!cite.noteId) return undefined;
  return getSessionPack().notes.find((n) => n.id === cite.noteId)?.body;
}

function snippetsFromCites(cites: CiteTarget[]): EvidenceSnippet[] {
  return cites.map((c) => ({
    id: c.id,
    label: c.label,
    summary: c.summary,
    body: noteBodyForCite(c),
  }));
}

function bundleHit(
  query: string,
  draftClaim: string,
  draftRationale: string,
  citeIds: string[],
): EvidenceBundle {
  const cites = resolveCites(citeIds);
  if (!cites.length) {
    return {
      status: "error",
      query,
      message: "Retrieval mapped cites that are missing from the session pack.",
      allowedCiteIds: [],
      evidence: [],
      cites: [],
    };
  }
  return {
    status: "hit",
    query,
    allowedCiteIds: cites.map((c) => c.id),
    evidence: snippetsFromCites(cites),
    draftClaim,
    draftRationale,
    cites,
  };
}

/**
 * Fail-closed retrieval over session notes + race-control events when QaMap misses.
 */
function retrieveFromPack(query: string): EvidenceBundle | null {
  const pack = getSessionPack();
  const tokens = tokenize(query).filter(
    (t) =>
      ![
        "the",
        "a",
        "an",
        "is",
        "was",
        "were",
        "did",
        "does",
        "what",
        "when",
        "where",
        "which",
        "who",
        "how",
        "any",
        "for",
        "in",
        "on",
        "of",
        "to",
        "and",
        "or",
        "this",
        "that",
        "with",
        "from",
        "about",
      ].includes(t),
  );
  if (tokens.length < 2) return null;

  type Hit = {
    score: number;
    claim: string;
    rationale: string;
    citeIds: string[];
  };

  const hits: Hit[] = [];

  for (const note of pack.notes as Note[]) {
    const hay = `${note.body} ${(note.tags ?? []).join(" ")} ${note.id}`;
    let score = scoreText(tokens, hay);
    for (const tag of note.tags ?? []) {
      if (tokens.some((t) => tag.toLowerCase().includes(t))) score += 8;
    }
    if (score < 14) continue;
    const cite =
      citeForNote(note.id) ??
      pack.cites.find(
        (c) =>
          c.kind === "note" &&
          c.summary &&
          hay.includes(c.summary.slice(0, 12)),
      );
    const citeIds = cite
      ? [cite.id]
      : pack.cites
          .filter((c) => c.lapId === note.lapId && c.kind === "note")
          .slice(0, 2)
          .map((c) => c.id);
    if (!citeIds.length) continue;
    hits.push({
      score,
      claim: note.body,
      rationale: `Retrieved from session note (${note.authorRole}${note.tags?.length ? ` · ${note.tags.slice(0, 3).join(", ")}` : ""}).`,
      citeIds,
    });
  }

  for (const evt of pack.events as SessionEvent[]) {
    const score = scoreText(tokens, evt.text);
    if (score < 16) continue;
    const citeIds = ["cite_rc_summary", "cite_track_limits"].filter((id) =>
      Boolean(getCite(id)),
    );
    if (!citeIds.length) continue;
    hits.push({
      score,
      claim: evt.text,
      rationale: "Retrieved from OpenF1 race-control messages in this FP2 pack.",
      citeIds,
    });
  }

  for (const cite of pack.cites) {
    const hay = `${cite.label} ${cite.summary}`;
    const score = scoreText(tokens, hay);
    if (score < 14) continue;
    hits.push({
      score: score + 2,
      claim: `${cite.label}: ${cite.summary}`,
      rationale: "Matched a curated evidence cite in this session pack.",
      citeIds: [cite.id],
    });
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits[0];
  if (!top || top.score < 14) return null;

  return bundleHit(query.trim(), top.claim, top.rationale, top.citeIds);
}

/**
 * Retrieve-only step for grounded Ask. Never calls a model.
 * Hit bundles feed Workers AI; no-hit fails closed before generation.
 */
export function retrieveEvidence(query: string): EvidenceBundle {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      status: "empty",
      query: "",
      message: "Run a query to bind an answer to this lap window.",
      allowedCiteIds: [],
      evidence: [],
      cites: [],
    };
  }

  const entry = matchEntry(trimmed);
  if (entry) {
    if (entry.noHit) {
      return {
        status: "no-hit",
        query: trimmed,
        message:
          entry.noHitMessage ??
          "Nothing in this session window supports that claim. Narrow the lap or rephrase.",
        allowedCiteIds: [],
        evidence: [],
        cites: [],
      };
    }
    return bundleHit(
      trimmed,
      entry.claim,
      entry.rationale,
      entry.citeIds,
    );
  }

  const retrieved = retrieveFromPack(trimmed);
  if (retrieved) return retrieved;

  return {
    status: "no-hit",
    query: trimmed,
    message:
      "Nothing in this session window supports that claim. Try a seed below — pace, ops, compare, or method — or narrow the ask.",
    allowedCiteIds: [],
    evidence: [],
    cites: [],
  };
}

/** Deterministic QaMap answer — offline / fallback path. */
export function answerQuery(query: string): RagAnswer {
  const bundle = retrieveEvidence(query);
  if (bundle.status === "empty") {
    return {
      status: "empty",
      query: "",
      cites: [],
      message: bundle.message,
      source: "qamap",
    };
  }
  if (bundle.status === "no-hit") {
    return {
      status: "no-hit",
      query: bundle.query,
      cites: [],
      message: bundle.message,
      source: "qamap",
    };
  }
  if (bundle.status === "error") {
    return {
      status: "error",
      query: bundle.query,
      cites: [],
      message: bundle.message,
      source: "qamap",
    };
  }
  return {
    status: "hit",
    query: bundle.query,
    claim: bundle.draftClaim,
    rationale: bundle.draftRationale,
    cites: bundle.cites,
    source: "qamap",
  };
}

/** All non-noHit exact queries (full corpus). */
export function seedQueries(): string[] {
  return entries.filter((e) => !e.noHit).map((e) => e.exactQuery);
}

export type SeedCategory = "thermal" | "pace" | "ops" | "compare" | "method";

export interface FeaturedSeed {
  query: string;
  category: SeedCategory;
}

const CATEGORY_ORDER: SeedCategory[] = [
  "thermal",
  "pace",
  "ops",
  "compare",
  "method",
];

/** Curated chips for the rail — employer-demo breadth, not only the brake spike. */
export function featuredSeeds(): FeaturedSeed[] {
  const featured = entries.filter((e) => e.featured && !e.noHit);
  const byCat = new Map<SeedCategory, FeaturedSeed[]>();
  for (const e of featured) {
    const cat = (e.category ?? "pace") as SeedCategory;
    const list = byCat.get(cat) ?? [];
    list.push({ query: e.exactQuery, category: cat });
    byCat.set(cat, list);
  }
  const out: FeaturedSeed[] = [];
  for (const cat of CATEGORY_ORDER) {
    for (const s of byCat.get(cat) ?? []) out.push(s);
  }
  return out;
}

export function corpusSummary() {
  const pack = getSessionPack();
  const channelIds = new Set(pack.samples.map((s) => s.channelId));
  const overlay = pack.meta.syntheticOverlayChannels ?? [];
  const openf1Channels = [...channelIds].filter(
    (id) => !overlay.includes(id),
  ).length;
  return {
    venue: pack.meeting.venue,
    sessionLabel: pack.session.label,
    yearHint: pack.meeting.date?.slice(0, 4),
    drivers: pack.meta.driverCount ?? pack.drivers.length,
    laps: pack.meta.lapCount ?? pack.laps.length,
    notes: pack.notes.length,
    channelParams: channelIds.size,
    openf1Channels,
    overlayChannels: overlay.length,
    sampleSeries: pack.samples.length,
    events: pack.events.length,
    cites: pack.cites.length,
    qaEntries: entries.filter((e) => !e.noHit).length,
    ratesHz: pack.meta.ratesHz,
    lengthM: pack.meeting.lapDistanceM ?? pack.meta.venueLengthM,
  };
}
