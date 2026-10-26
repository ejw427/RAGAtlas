/** Welch Software portfolio product identity */
export const STUDIO = "Welch Software";
export const PRODUCT = "CiteTrace";
export const TAGLINE = "Ask the lap. Trust the trace.";
export const PRODUCT_LINE = `${STUDIO} · ${PRODUCT}`;
/** Method / pitch headline */
export const METHOD_HEADLINE = "Knowledge beside the traces";
/** One-line wedge for hiring-manager skim */
export const WEDGE =
  "Waveforms are table stakes. Grounded answers are the job.";
/** Canonical live demo URL (use on resume / LinkedIn / applications) */
export const LIVE_URL = "https://citetrace.welchsoftware.net";
export const LIVE_SESSION_URL = `${LIVE_URL}/session?driver=LEC&lap=10`;
export const PORTFOLIO_URL = "https://www.welchsoftware.net/projects/citetrace";
/** 90-second demo ask — keep this the money shot */
export const DEMO_ASK = "Why did brake temp spike in S3 on lap 10?";
export const DEMO_STEPS = [
  "Land → Open COTA session",
  `Ask: ${DEMO_ASK}`,
  "Click the cite → playhead locks on the evidence band",
  "Switch drivers; Compare Soft vs Hard on LEC",
] as const;
