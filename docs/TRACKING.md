# CiteTrace tracking (Cloudflare)

## What you get

| Layer | Where to look | What it shows |
|-------|----------------|---------------|
| **Zone / HTTP analytics** | Cloudflare → Analytics → Traffic (zone `welchsoftware.net`) filter host `citetrace.welchsoftware.net` | Requests, countries, status codes, bots |
| **Web Analytics (RUM)** | Cloudflare → Web Analytics → `citetrace.welchsoftware.net` | Page views, visits, Core Web Vitals (needs beacon token) |
| **Workers Analytics Engine** | Workers → `citetrace` → Analytics Engine dataset `citetrace_events` | Custom events: `page_view`, `ask_hit`, `ask_miss` with `utm_source` / house |
| **Workers Observability** | Workers → `citetrace` → Observability / Logs | `/api/ask` + `/api/track` invocations |

## Setup checklist

1. Run GitHub Action **Setup CF Web Analytics** (workflow_dispatch).
2. Copy `CF_WEB_ANALYTICS_TOKEN` from the job summary → GitHub repo secret.
3. Re-run **Deploy** (or push) so `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` is baked into the static export.
4. Confirm beacon: view-source on live site → `cloudflareinsights.com/beacon.min.js`.

## Attribution (who clicked)

Every outreach URL should include UTMs, e.g.:

```
https://citetrace.welchsoftware.net/session?demo=1&house=audi&utm_source=audi&utm_medium=email&utm_campaign=f1-outreach-2026&utm_content=house
```

Canonical builders: `lib/campaign.ts` → `TRACKED.audi`, `TRACKED.mclaren`, …

| Source (`utm_source`) | Meaning |
|------------------------|---------|
| `audi` | Audi email / share |
| `mclaren` | McLaren email |
| `williams` | Williams email |
| `motion` | Motion Applied |
| `redbull` | Red Bull |
| `linkedin` | LinkedIn featured |
| `hybrid` / `generic` | Broad race-ops |

Client stores first-touch UTM in `sessionStorage` and POSTs to `/api/track` (Analytics Engine).

## Query Analytics Engine (example)

In Cloudflare dashboard → Analytics & Logs → Workers Analytics Engine, or GraphQL:

- Filter `blob1` = event (`page_view`, `ask_hit`, …)
- Filter `index1` / `blob2` = `utm_source` (`audi`, `mclaren`, …)

## Already-sent emails

Links without UTMs still show up as page views / HTTP hits. New clicks with UTMs are attributed by house.
