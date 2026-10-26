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
5. Switch drivers; Compare vs LEC Soft / Hard baseline

## Data

2026 United States GP · Circuit of the Americas · FP2 · **all 22 drivers** · 5513 m.

Regen: `npm run fetch:cota`

## Scripts

```bash
npm run dev
npm run build
npm run fetch:cota
npm run generate:fixture   # legacy Bahrain synthetic
```
