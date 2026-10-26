# CiteTrace — Welch Software

**Ask the lap. Trust the trace.**

[Welch Software](./) portfolio prototype: a **knowledge + narrative layer** over ATLAS-shaped session telemetry — session RAG that cites notes/channels/lap windows, **and** a live-style engineering workspace (waveforms, playhead, circuit schematic, compare, debrief timeline).

> **2026 COTA FP2** · OpenF1 public subset + synthetic ATLAS thermal overlays · No SECU / team feeds  
> Independent — **not affiliated with Formula 1 teams, commercial telemetry vendors, Formula 1, or the FIA.**  
> Concepts inspired by public [ATLAS](https://www.motionapplied.com/brands/atlas/) documentation.

Formerly sketched as “RAGAtlas”; product name is **CiteTrace** (cite → evidence, trace → telemetry) under the **Welch Software** studio label.

## Portfolio intent (not an employment claim)

Shows React/TS craft for dense time-series UX, multi-store literacy (samples + metadata + notes), fail-closed session RAG, ATLAS-shaped vocabulary, and a teachable cite→lock demo — usable across motorsport software / performance-engineering conversations without tying the site to a single vacancy.

## Quick start

```bash
npm install
npm run dev -- -p 43127 -H 127.0.0.1
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

| Route | Purpose |
|-------|---------|
| `/` | Landing — COTA night hero + real track path |
| `/session?driver=LEC&lap=10` | Workspace (22-car switcher; Lap / S1–S3 focus) |
| `/about` | Method, disclaimer, credits |

## 90-second demo

1. Land → **Open COTA session**
2. Use **Lap** for the whole lap, or S1–S3 for sector focus
3. Ask: `Why did brake temp spike in S3 on lap 10?`
4. Click cite → playhead locks on synthetic 942°C peak over real brake zone
5. Ask more of the corpus: front vs rear (688°C vs 942°C), trail vs stab (71.7 bar), Soft tyre heat (128°C), ST trap (+5 vs Hard), track cool (−3.3°C), Soft-fit pit (lap 9), or LEC radio (0/12 clips)
6. Switch drivers; Compare vs LEC Soft / Hard baseline

Regen overlays without re-fetching car_data: `npm run enrich:cota`

## Data

2026 United States GP · Circuit of the Americas · FP2 · **all 22 drivers** · 5513 m.

Regen: `npm run fetch:cota`

## Scripts

```bash
npm run dev
npm run build
npm run check              # build + wrangler deploy --dry-run
npm run deploy             # build + wrangler deploy (manual)
npm run fetch:cota
npm run generate:fixture   # legacy Bahrain synthetic
```

## Deployment

**Live:** [https://citetrace.welchsoftware.net](https://citetrace.welchsoftware.net)  
**Portfolio card:** [welchsoftware.net/projects/citetrace](https://www.welchsoftware.net/projects/citetrace)

Pushing to **`master`** runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): `npm run build` (static export → `out/`) then `wrangler deploy` to Cloudflare Workers Assets. Keep experiments on a branch — every `master` push updates the live demo.

Required GitHub repository secrets (same names as DropToPhone / the company site):

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Wrangler deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `CLOUDFLARE_ZONE_ID` | Optional — purge CDN for `citetrace.welchsoftware.net` after deploy |
| `CF_WEB_ANALYTICS_TOKEN` | Optional — Cloudflare Web Analytics beacon |

## Job applications

Use these links (not the private GitHub repo):

| Where | What to paste |
|-------|----------------|
| Resume / LinkedIn / email | `https://citetrace.welchsoftware.net` |
| Portfolio context | `https://www.welchsoftware.net/projects/citetrace` |
| Deep-link demo | `https://citetrace.welchsoftware.net/session?driver=LEC&lap=10` |

**Pitch:** Waveforms are table stakes. Grounded answers are the job.  
**Ask:** `Why did brake temp spike in S3 on lap 10?` → click cite → playhead locks.
