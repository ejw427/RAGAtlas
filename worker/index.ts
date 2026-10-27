/**
 * CiteTrace Worker — POST /api/ask
 * Retrieve happens on the client; this endpoint only generates from evidence.
 * Fail closed if the model invents cite ids or returns unusable JSON.
 */

type AiRun = (
  model: string,
  inputs: {
    messages: { role: string; content: string }[];
    max_tokens?: number;
    temperature?: number;
  },
) => Promise<{ response?: string } | string>;

type AnalyticsEngineDataset = {
  writeDataPoint: (point: {
    blobs?: (string | null)[];
    doubles?: number[];
    indexes?: (string | null)[];
  }) => void;
};

export interface Env {
  AI: { run: AiRun };
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  /** Hiring-funnel events — query in CF Workers Analytics Engine */
  TRACK?: AnalyticsEngineDataset;
}

type EvidenceSnippet = {
  id: string;
  label: string;
  summary: string;
  body?: string;
};

type AskRequest = {
  query?: string;
  evidence?: EvidenceSnippet[];
  allowedCiteIds?: string[];
  draftClaim?: string;
};

type AskHit = {
  status: "hit";
  claim: string;
  rationale: string;
  citeIds: string[];
  model: string;
};

type AskMiss = {
  status: "no-hit" | "error";
  message: string;
};

/** FP8 8B instruct — non-deprecated stand-in for llama-3.1-8b-instruct */
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

const SYSTEM = `You are CiteTrace session RAG for a motorsport telemetry demo.
Answer ONLY using the evidence JSON the user provides.
Never invent lap times, temperatures, speeds, radio dialogue, or cite ids.
citeIds MUST be a non-empty subset of allowedCiteIds.
If evidence cannot support the question, return {"status":"no-hit","message":"Nothing in this session window supports that claim."}.
On success return ONLY JSON:
{"status":"hit","claim":"...","rationale":"...","citeIds":["..."]}
claim: 1-3 sentences, engineer tone. rationale: one short sentence naming the evidence.`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("no json");
  }
}

function validateHit(
  raw: unknown,
  allowed: Set<string>,
): AskHit | AskMiss {
  if (!raw || typeof raw !== "object") {
    return { status: "error", message: "Model returned non-object JSON." };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.status === "no-hit") {
    return {
      status: "no-hit",
      message:
        typeof obj.message === "string"
          ? obj.message
          : "Nothing in this session window supports that claim.",
    };
  }
  const claim = typeof obj.claim === "string" ? obj.claim.trim() : "";
  const rationale =
    typeof obj.rationale === "string" ? obj.rationale.trim() : "";
  const citeIds = Array.isArray(obj.citeIds)
    ? obj.citeIds.filter((id): id is string => typeof id === "string")
    : [];
  if (!claim || !citeIds.length) {
    return {
      status: "error",
      message: "Model omitted claim or citeIds.",
    };
  }
  const filtered = [...new Set(citeIds)].filter((id) => allowed.has(id));
  if (!filtered.length) {
    return {
      status: "error",
      message: "Model citeIds were not in the retrieved evidence set.",
    };
  }
  return {
    status: "hit",
    claim,
    rationale,
    citeIds: filtered,
    model: MODEL,
  };
}

async function handleAsk(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
      },
    });
  }
  if (req.method !== "POST") {
    return json({ status: "error", message: "POST only." }, 405);
  }

  let body: AskRequest;
  try {
    body = (await req.json()) as AskRequest;
  } catch {
    return json({ status: "error", message: "Invalid JSON body." }, 400);
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const evidence = Array.isArray(body.evidence) ? body.evidence : [];
  const allowedCiteIds = Array.isArray(body.allowedCiteIds)
    ? body.allowedCiteIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!query) {
    return json({ status: "error", message: "query required." }, 400);
  }
  if (!evidence.length || !allowedCiteIds.length) {
    return json({
      status: "no-hit",
      message:
        "Nothing in this session window supports that claim. Narrow the lap or rephrase.",
    } satisfies AskMiss);
  }

  const allowed = new Set(allowedCiteIds);
  const safeEvidence = evidence.filter((e) => e && allowed.has(e.id));
  if (!safeEvidence.length) {
    return json({
      status: "no-hit",
      message:
        "Nothing in this session window supports that claim. Narrow the lap or rephrase.",
    } satisfies AskMiss);
  }

  const userPayload = {
    query,
    allowedCiteIds: [...allowed],
    evidence: safeEvidence.map((e) => ({
      id: e.id,
      label: e.label,
      summary: e.summary,
      body: e.body?.slice(0, 600),
    })),
    draftClaim: body.draftClaim?.slice(0, 500),
  };

  try {
    const result = (await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Evidence pack:\n${JSON.stringify(userPayload)}\n\nReturn JSON only.`,
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
    })) as { response?: string };

    const text =
      typeof result?.response === "string" ? result.response : String(result);
    const parsed = extractJson(text);
    const validated = validateHit(parsed, allowed);
    if (validated.status !== "hit") {
      return json(validated);
    }
    return json(validated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Workers AI call failed.";
    return json({ status: "error", message } satisfies AskMiss, 502);
  }
}

async function handleTrack(req: Request, env: Env): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
      },
    });
  }
  if (req.method !== "POST") {
    return json({ ok: false }, 405);
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const event =
      typeof body.event === "string" ? body.event.slice(0, 64) : "page_view";
    const source =
      typeof body.utm_source === "string"
        ? body.utm_source.slice(0, 64)
        : typeof body.house === "string"
          ? body.house.slice(0, 64)
          : "unknown";
    const campaign =
      typeof body.utm_campaign === "string"
        ? body.utm_campaign.slice(0, 64)
        : "";
    const content =
      typeof body.utm_content === "string"
        ? body.utm_content.slice(0, 64)
        : "";
    const path =
      typeof body.path === "string"
        ? body.path.slice(0, 256)
        : typeof body.href === "string"
          ? body.href.slice(0, 256)
          : "";
    const referrer =
      typeof body.referrer === "string" ? body.referrer.slice(0, 256) : "";

    env.TRACK?.writeDataPoint({
      // blob1=event blob2=source blob3=campaign blob4=content blob5=path blob6=referrer
      blobs: [event, source, campaign, content, path, referrer],
      doubles: [1],
      indexes: [source],
    });
  } catch {
    /* never fail the client over analytics */
  }
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/ask" || url.pathname === "/api/ask/") {
      return handleAsk(request, env);
    }
    if (url.pathname === "/api/track" || url.pathname === "/api/track/") {
      return handleTrack(request, env);
    }
    // Asset-first for everything else when run_worker_first only matches /api/*
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
