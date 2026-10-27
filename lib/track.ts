/** Client-side hiring-funnel events → POST /api/track (Workers Analytics Engine). */

const KEY = "citetrace-campaign";

type Campaign = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  house?: string;
  landedAt: string;
  path: string;
};

function readCampaign(): Campaign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Campaign) : null;
  } catch {
    return null;
  }
}

export function writeCampaign(c: Campaign) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function trackEvent(
  event: string,
  extra: Record<string, string | undefined> = {},
) {
  if (typeof window === "undefined") return;
  const campaign = readCampaign() ?? {
    landedAt: new Date().toISOString(),
    path: window.location.pathname,
  };
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event,
      ...campaign,
      ...extra,
      href: window.location.href,
    }),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}

export type { Campaign };
export { KEY as CAMPAIGN_STORAGE_KEY, readCampaign };
