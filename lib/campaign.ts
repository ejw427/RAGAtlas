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
  url.searchParams.set("utm_campaign", "f1-outreach-2026");
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
  motion: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "motion",
    "atlas-fae",
  ),
  hybrid: withCampaign(
    "/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1",
    "hybrid",
    "generic",
  ),
  linkedin: withCampaign("/", "linkedin", "featured"),
  about: withCampaign("/about", "generic", "method"),
} as const;
