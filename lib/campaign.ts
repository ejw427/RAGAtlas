/**
 * Hiring-outreach attribution for Cloudflare Web Analytics (+ client beacons).
 * Stick these query params on every link you send so CF shows which house clicked.
 */

export type CampaignHouse =
  | "audi"
  | "mclaren"
  | "williams"
  | "motion"
  | "redbull"
  | "ferrari"
  | "cadillac"
  | "gm"
  | "penske"
  | "hybrid"
  | "linkedin"
  | "generic";

const LIVE = "https://citetrace.welchsoftware.net";

export function withCampaign(
  pathOrUrl: string,
  house: CampaignHouse,
  content?: string,
): string {
  const url = pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl, LIVE);
  url.searchParams.set("utm_source", house);
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", "race-outreach-202611");
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

/** Canonical tracked walk-ins — paste these in emails going forward */
export const TRACKED = {
  home: withCampaign("/", "generic", "home"),
  fieldP1P2: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "generic",
    "p1-p2",
  ),
  audi: withCampaign("/session?demo=1&house=audi", "audi", "house"),
  mclaren: withCampaign("/session?demo=1&house=mclaren", "mclaren", "house"),
  williams: withCampaign(
    "/session?demo=1&house=williams",
    "williams",
    "house",
  ),
  redbull: withCampaign("/session?demo=1&house=redbull", "redbull", "house"),
  ferrari: withCampaign("/session?demo=1&house=ferrari", "ferrari", "house"),
  cadillac: withCampaign(
    "/session?demo=1&house=cadillac",
    "cadillac",
    "house",
  ),
  /** GM Motorsports — Cadillac F1 + WEC/IMSA tooling path */
  gm: withCampaign("/session?demo=1&house=cadillac", "gm", "motorsports"),
  /** Team Penske — IndyCar / IMSA / WEC org software */
  penske: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "penske",
    "senior-se",
  ),
  motion: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "motion",
    "atlas",
  ),
  motionFullstack: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "motion",
    "fullstack",
  ),
  motionAi: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "motion",
    "ai-platform",
  ),
  motionFae: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "motion",
    "fae-software",
  ),
  hybrid: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "hybrid",
    "generic",
  ),
  linkedin: withCampaign("/", "linkedin", "featured"),
  about: withCampaign("/about", "generic", "method"),
} as const;
