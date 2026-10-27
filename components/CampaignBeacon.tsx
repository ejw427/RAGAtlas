"use client";

import { useEffect } from "react";
import {
  CAMPAIGN_STORAGE_KEY,
  readCampaign,
  trackEvent,
  writeCampaign,
  type Campaign,
} from "@/lib/track";

/** Capture UTM / house from the URL and ping /api/track (Analytics Engine). */
export function CampaignBeacon() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Campaign = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
      house: params.get("house") ?? undefined,
      landedAt: new Date().toISOString(),
      path: window.location.pathname + window.location.search,
    };

    const prev = readCampaign();
    const campaign =
      fromUrl.utm_source || fromUrl.house
        ? fromUrl
        : (prev ?? { landedAt: fromUrl.landedAt, path: fromUrl.path });

    if (fromUrl.utm_source || fromUrl.house) writeCampaign(campaign);

    trackEvent("page_view", {
      referrer: document.referrer || "",
    });

    // Keep storage key stable across modules
    void CAMPAIGN_STORAGE_KEY;
  }, []);

  return null;
}

export { trackEvent };
