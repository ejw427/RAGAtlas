/** Welch Software portfolio product identity */
export const STUDIO = "Welch Software";
export const AUTHOR = "Eric";
export const PRODUCT = "CiteTrace";
export const TAGLINE = "Ask the lap. Trust the trace.";
export const PRODUCT_LINE = `${STUDIO} · ${PRODUCT}`;
/** Method / pitch headline — technical sell on /about */
export const METHOD_HEADLINE =
  "Retrieve → generate → cite → lock the playhead";
/** One-line wedge for hiring-manager skim */
export const WEDGE =
  "Waveforms are table stakes. Grounded answers are the job.";
/** Candidate line for landing / applications */
export const CANDIDATE_LINE =
  `Built by ${AUTHOR} · ${STUDIO} · first-stab pit wall from public 2026 COTA FP2 OpenF1`;
/** Canonical live demo URL (use on resume / LinkedIn / applications) */
export const LIVE_URL = "https://citetrace.welchsoftware.net";
/** Default pit wall: FP2 P1 vs P2 (LEC Soft flyer vs ANT Soft flyer) */
export const SESSION_FIELD_PATH = "/session?a=LEC&lapA=10&b=ANT&lapB=8";
export const SESSION_FIELD_DEMO_PATH = `${SESSION_FIELD_PATH}&demo=1`;
export const LIVE_SESSION_URL = `${LIVE_URL}${SESSION_FIELD_PATH}`;
/** Default walk-in: field winner vs second place */
export const LIVE_COMPARE_URL = `${LIVE_URL}${SESSION_FIELD_PATH}`;
/** Resume / LinkedIn deep link - interview walk-through on */
export const LIVE_DEMO_URL = `${LIVE_URL}${SESSION_FIELD_DEMO_PATH}`;
export const LIVE_AUDI_URL = `${LIVE_URL}/session?demo=1&house=audi`;
export const PORTFOLIO_URL = "https://www.welchsoftware.net/projects/citetrace";

/** Prefer these in new outreach — UTMs show up in Cloudflare as path/query */
export {
  TRACKED as LIVE_TRACKED,
  withCampaign,
} from "@/lib/campaign";
/** Money-shot ask — cite locks playhead on the stadium brake */
export const DEMO_ASK = "Why did brake temp spike in S3 on lap 10?";
export const DEMO_NO_HIT = "Who is the championship leader?";
export const DEMO_STEPS = [
  "Land > Open COTA session (P1 LEC vs P2 ANT)",
  "Open the sector that owns the gap",
  `Ask: ${DEMO_ASK}`,
  "Click the cite > playhead locks on the map and the traces",
  "Ask again: field pace, weather, radio empty, OF1 vs OVL — then the no-hit probe",
] as const;

/** Freshness lead — use at the top of every outreach email */
export const FRESHNESS_LEAD =
  "I just shipped CiteTrace — a first-stab pit wall built from public OpenF1 results for the 2026 United States GP · Circuit of the Americas · FP2 (session found online, all 22 drivers). Circuit on stage, any-car compare, cite→playhead lock, labeled ATLAS-shaped overlays (OF1 vs OVL).";

/** Default outreach blurb (Ferrari money-shot) */
export const EMAIL_BLURB = `${FRESHNESS_LEAD} Waveforms are table stakes. Grounded answers are the job. Live: ${LIVE_URL} · Portfolio: ${PORTFOLIO_URL} · Demo: ${LIVE_DEMO_URL}`;

/** Audi Revolut F1 outreach — Medium vs Soft labeled compare */
export const EMAIL_BLURB_AUDI = `${FRESHNESS_LEAD} Audi walk-in: Bortoleto Medium vs Hülkenberg Soft (−0.208) with compounds labeled before the delta. ${LIVE_AUDI_URL} · ${PORTFOLIO_URL}`;

/** Motion Applied / ATLAS FAE outreach */
export const EMAIL_BLURB_MOTION = `${FRESHNESS_LEAD} Shaped around public ATLAS vocabulary without cloning the viewer — the cite locks the playhead. Ask: "${DEMO_ASK}" → ${LIVE_DEMO_URL} · ${PORTFOLIO_URL}`;
