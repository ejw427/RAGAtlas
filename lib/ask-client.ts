import { retrieveEvidence, resolveCites } from "@/lib/rag";
import { trackEvent } from "@/lib/track";
import type { RagAnswer } from "@/lib/types";

type AskApiHit = {
  status: "hit";
  claim: string;
  rationale: string;
  citeIds: string[];
  model: string;
};

type AskApiMiss = {
  status: "no-hit" | "error";
  message: string;
};

type AskApiResponse = AskApiHit | AskApiMiss;

function qamapFallback(
  query: string,
  draftClaim: string | undefined,
  draftRationale: string | undefined,
  cites: RagAnswer["cites"],
): RagAnswer {
  return {
    status: "hit",
    query,
    claim: draftClaim,
    rationale: draftRationale,
    cites,
    source: "qamap",
  };
}

/**
 * Retrieve evidence locally, then ground a claim with Workers AI at /api/ask.
 * Falls back to the deterministic QaMap draft when AI is offline or rejects.
 */
export async function askSession(query: string): Promise<RagAnswer> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      status: "empty",
      query: "",
      cites: [],
      message: "Run a query to bind an answer to this lap window.",
      source: "qamap",
    };
  }

  const bundle = retrieveEvidence(trimmed);
  if (bundle.status !== "hit") {
    trackEvent("ask_miss", { query: trimmed.slice(0, 80) });
    return {
      status: bundle.status,
      query: bundle.query,
      cites: [],
      message: bundle.message,
      source: "qamap",
    };
  }

  trackEvent("ask_hit", { query: trimmed.slice(0, 80) });

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: trimmed,
        evidence: bundle.evidence,
        allowedCiteIds: bundle.allowedCiteIds,
        draftClaim: bundle.draftClaim,
      }),
    });

    if (!res.ok) {
      return qamapFallback(
        trimmed,
        bundle.draftClaim,
        bundle.draftRationale,
        bundle.cites,
      );
    }

    const data = (await res.json()) as AskApiResponse;

    if (data.status === "hit") {
      const allowed = new Set(bundle.allowedCiteIds);
      const citeIds = data.citeIds.filter((id) => allowed.has(id));
      const cites = resolveCites(citeIds.length ? citeIds : bundle.allowedCiteIds);
      if (!cites.length) {
        return qamapFallback(
          trimmed,
          bundle.draftClaim,
          bundle.draftRationale,
          bundle.cites,
        );
      }
      return {
        status: "hit",
        query: trimmed,
        claim: data.claim,
        rationale: data.rationale || bundle.draftRationale,
        cites,
        source: "ai",
        model: data.model,
      };
    }

    // Model said no-hit but we had evidence — keep QaMap draft for the demo.
    if (data.status === "no-hit") {
      return qamapFallback(
        trimmed,
        bundle.draftClaim,
        bundle.draftRationale,
        bundle.cites,
      );
    }

    return qamapFallback(
      trimmed,
      bundle.draftClaim,
      bundle.draftRationale,
      bundle.cites,
    );
  } catch {
    return qamapFallback(
      trimmed,
      bundle.draftClaim,
      bundle.draftRationale,
      bundle.cites,
    );
  }
}
