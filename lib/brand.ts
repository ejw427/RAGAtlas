/** Welch Software portfolio product identity */
export const STUDIO = "Welch Software";
export const AUTHOR = "Eric";
export const PRODUCT = "CiteTrace";
export const TAGLINE = "Ask the lap. Trust the trace.";
export const PRODUCT_LINE = `${STUDIO} · ${PRODUCT}`;
/** Method / pitch headline */
export const METHOD_HEADLINE = "Knowledge beside the traces";
/** One-line wedge for hiring-manager skim */
export const WEDGE =
  "Waveforms are table stakes. Grounded answers are the job.";
/** Candidate line for landing / applications */
export const CANDIDATE_LINE =
  `Built by ${AUTHOR} · ${STUDIO} · portfolio prototype for motorsport software roles`;
/** Canonical live demo URL (use on resume / LinkedIn / applications) */
export const LIVE_URL = "https://citetrace.welchsoftware.net";
export const LIVE_SESSION_URL = `${LIVE_URL}/session?driver=LEC&lap=10`;
/** Default walk-in: Ferrari teammate compare on the pit wall */
export const LIVE_COMPARE_URL = `${LIVE_URL}/session?house=ferrari`;
/** Resume / LinkedIn deep link — interview demo script on */
export const LIVE_DEMO_URL = `${LIVE_URL}/session?demo=1&house=ferrari`;
export const PORTFOLIO_URL = "https://www.welchsoftware.net/projects/citetrace";
/** 90-second demo ask — keep this the money shot */
export const DEMO_ASK = "Why did brake temp spike in S3 on lap 10?";
export const DEMO_NO_HIT = "Who is the championship leader?";
export const DEMO_STEPS = [
  "Land → Compare two cars (Ferrari house)",
  "Open the sector that owns the gap",
  `Ask: ${DEMO_ASK}`,
  "Click the cite → playhead locks on the map and the traces",
] as const;
export const EMAIL_BLURB = `I built CiteTrace — a pit wall for a race session. Circuit on stage, any car vs any car, evidence-bound asks that lock the playhead. ${LIVE_DEMO_URL}`;
