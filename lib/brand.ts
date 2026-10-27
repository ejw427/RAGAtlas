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
export const LIVE_SESSION_URL = `${LIVE_URL}/session?driver=LEC&lap=10`;
/** Default walk-in: Ferrari teammate compare on the pit wall */
export const LIVE_COMPARE_URL = `${LIVE_URL}/session?house=ferrari`;
/** Resume / LinkedIn deep link - interview demo script on */
export const LIVE_DEMO_URL = `${LIVE_URL}/session?demo=1&house=ferrari`;
export const LIVE_AUDI_URL = `${LIVE_URL}/session?demo=1&house=audi`;
export const PORTFOLIO_URL = "https://www.welchsoftware.net/projects/citetrace";
/** Money-shot ask — cite locks playhead on the stadium brake */
export const DEMO_ASK = "Why did brake temp spike in S3 on lap 10?";
export const DEMO_NO_HIT = "Who is the championship leader?";
export const DEMO_STEPS = [
  "Land > Open the pit wall (Ferrari house)",
  "Open the sector that owns the gap",
  `Ask: ${DEMO_ASK}`,
  "Click the cite > playhead locks on the map and the traces",
  "Ask again: teammate gap, weather, radio empty, OF1 vs OVL — then the no-hit probe",
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
