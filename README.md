# CiteTrace — Welch Software

**Ask the lap. Trust the trace.**

[Welch Software](./) portfolio prototype: a **knowledge + narrative layer** over ATLAS-shaped session telemetry — session RAG that cites notes/channels/lap windows, **and** a live-style engineering workspace (waveforms, playhead, circuit schematic, compare, debrief timeline).

> **2026 COTA FP2** · OpenF1 public subset + synthetic ATLAS thermal overlays · No SECU / team feeds  
> Independent — **not affiliated with, endorsed by, or licensed by Formula 1, the FIA, or any team.**  
> Car / helmet art is **editorial public media for demo recognition only** — not a commercial product.  
> Concepts inspired by public [ATLAS](https://www.motionapplied.com/brands/atlas/) documentation.

Formerly sketched as “RAGAtlas”; product name is **CiteTrace** (cite → evidence, trace → telemetry) under the **Welch Software** studio label.

## Portfolio intent (not an employment claim)

Shows React/TS craft for dense time-series UX, multi-store literacy (samples + metadata + notes), fail-closed session RAG, ATLAS-shaped vocabulary, and a teachable cite→lock demo — usable across motorsport software / performance-engineering conversations without tying the site to a single vacancy.

## Quick start

```bash
npm install
npm run dev -- -p 43127 -H 127.0.0.1
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127). Ask uses the **QaMap offline fallback** in plain `next dev`.

For **Workers AI** grounding locally:

```bash
npm run build && npx wrangler dev
```

| Route | Purpose |
|-------|---------|
| `/` | Landing — COTA daytime hero + real track path |
| `/session?house=ferrari` | Pit wall — map + Focus/Reference compare (any house) |
| `/session?driver=LEC&lap=10` | Workspace deep link (legacy params still work) |
| `/about` | Method, disclaimer, credits |

## Walk-through

1. Land → **Open COTA session**
2. Use **Lap** for the whole lap, or S1–S3 for sector focus
3. Ask: `Why did brake temp spike in S3 on lap 10?`
4. Click cite → playhead locks on synthetic 942°C peak over real brake zone
5. Ask beyond the spike: LEC vs HAM (−615 ms), field order, Soft flyer 1:35.291, long-run L14, track cool (−3.3°C), Soft-fit pit, radio empty (0/12), OF1 vs OVL, race control / T18 NFA
6. Probe fail-closed: `Who is the championship leader?` — then switch drivers / house

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
npx wrangler dev           # after build — serves /api/ask + Workers AI
npm run fetch:cota
npm run generate:fixture   # legacy Bahrain synthetic
```

**Ask path:** retrieve cites/notes in the browser → `POST /api/ask` (Workers AI) → validate cite ids → lock playhead. No evidence → silence.

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

## Workspace UI

The session screen is specified as a pit wall: the COTA map on stage, any car against any other car, and a driver plate (number, team, original helmet mark, car). Graphs stay the instrument underneath. Walk-in copy for every 2026 team, plus Motion Applied, is in [docs/ui-workspace.md](docs/ui-workspace.md).

## Job applications

**Story to lead every email:** Just shipped CiteTrace — a **first stab** built from **public OpenF1** results for the **2026 United States GP · Circuit of the Americas · FP2** (session found online, all 22 drivers). Circuit on stage · any-car compare · cite→playhead lock · labeled ATLAS-shaped overlays (OF1 vs OVL). Independent portfolio prototype — not a team tool.

Send-ready emails: `D:\welch-website\public\private\ew-f1-20261024\emails.html` (+ `EMAIL-*.txt`). Never send the private GitHub repo.

| Where | What to paste |
|-------|----------------|
| Resume / LinkedIn / email | `https://citetrace.welchsoftware.net` |
| Portfolio context | `https://www.welchsoftware.net/projects/citetrace` |
| Resume / interview demo | `https://citetrace.welchsoftware.net/session?a=LEC&lapA=10&b=ANT&lapB=8&demo=1` |
| Audi Revolut F1 walk-in | `https://citetrace.welchsoftware.net/session?demo=1&house=audi` |
| McLaren walk-in | `https://citetrace.welchsoftware.net/session?demo=1&house=mclaren` |
| Williams walk-in | `https://citetrace.welchsoftware.net/session?demo=1&house=williams` |
| Red Bull walk-in | `https://citetrace.welchsoftware.net/session?demo=1&house=redbull` |
| Motion / ATLAS money shot | Ferrari walk-in + ask brake-temp S3 L10 (OF1 vs OVL) |

**Pitch:** Waveforms are table stakes. Grounded answers are the job.  
**Ask:** `Why did brake temp spike in S3 on lap 10?` → click cite → playhead locks.  
**Audi line:** Medium beating Soft by 0.208 — compounds labeled before the delta.
