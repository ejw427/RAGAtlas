import qaMap from "@/data/mock/qa-map.json";
import { getCite, getSessionPack } from "@/lib/session";
import type { CiteTarget, QaEntry, RagAnswer } from "@/lib/types";

const entries = qaMap.queries as QaEntry[];

function normalize(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchEntry(query: string): QaEntry | undefined {
  const n = normalize(query);
  if (!n) return undefined;

  const exact = entries.find((e) => normalize(e.exactQuery) === n);
  if (exact) return exact;

  let best: { entry: QaEntry; score: number } | undefined;
  for (const entry of entries) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (n.includes(pattern.toLowerCase())) score += pattern.length;
    }
    if (score > 0 && (!best || score > best.score)) {
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

/** Deterministic QaMap answer — never invents physics. */
export function answerQuery(query: string): RagAnswer {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      status: "empty",
      query: "",
      cites: [],
      message: "Run a query to bind an answer to this lap window.",
    };
  }

  const entry = matchEntry(trimmed);
  if (!entry) {
    return {
      status: "no-hit",
      query: trimmed,
      cites: [],
      message:
        "Nothing in this session window supports that claim. Narrow the lap or rephrase.",
    };
  }

  if (entry.noHit) {
    return {
      status: "no-hit",
      query: trimmed,
      cites: [],
      message:
        entry.noHitMessage ??
        "Nothing in this session window supports that claim. Narrow the lap or rephrase.",
    };
  }

  const cites = resolveCites(entry.citeIds);
  if (!cites.length) {
    return {
      status: "error",
      query: trimmed,
      cites: [],
      message: "Retrieval mapped cites that are missing from the session pack.",
    };
  }

  return {
    status: "hit",
    query: trimmed,
    claim: entry.claim,
    rationale: entry.rationale,
    cites,
  };
}

export function seedQueries(): string[] {
  return entries.filter((e) => !e.noHit).map((e) => e.exactQuery);
}

export function corpusSummary() {
  const pack = getSessionPack();
  return {
    notes: pack.notes.length,
    channels: getSessionPack().samples.length,
    events: pack.events.length,
    cites: pack.cites.length,
  };
}
