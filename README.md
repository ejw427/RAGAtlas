# RAGAtlas

**Ask the lap. Trust the trace.**

Portfolio prototype: a **knowledge + narrative layer** over ATLAS-shaped session telemetry — session RAG that cites notes/channels/lap windows, **and** a live-style engineering workspace (waveforms, playhead, circuit schematic, compare, debrief timeline).

> **SYNTHETIC DATA** · Shaped like public timing schemas · No live motorsport feeds · No API keys  
> Independent portfolio piece — **not affiliated with Williams Racing, Motion Applied, Formula 1, or the FIA.**  
> Concepts inspired by public [ATLAS](https://www.motionapplied.com/brands/atlas/) documentation.

## Portfolio intent (not an employment claim)

Steered toward two public JDs (see team docs `target-roles.md`):

| Role | What the demo shows |
|------|---------------------|
| **Lead SWE — Performance Technology** (Williams Racing, Grove) | React/TS craft, dense time-series UX, multi-store literacy (samples + metadata + notes), fail-closed RAG, performance-user empathy |
| **FAE — Software** (Motion Applied / ATLAS) | ATLAS-shaped vocabulary, teachable cite→lock demo, knowledge-base corpus, honest no-hit / grounding states |

**Gaps we do not fake:** employment, live Kafka/SECU, team channel maps, ATLAS credentials, redistributed FastF1/OpenF1 dumps, or iRacing ATLAS Express samples.

## Quick start

```bash
npm install
npm run dev -- -p 43127 -H 127.0.0.1
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

| Route | Purpose |
|-------|---------|
| `/` | Landing hero |
| `/session?lap=12` | Workspace |
| `/session?lap=12&citeId=cite_brake_spike` | Citation focus (same shell) |
| `/about` | Method, disclaimer, credits |

## 90-second demo

1. Land → **Open session**
2. Trace draw-on; scrub playhead toward S3
3. Ask: `Why did brake temp spike in S3 on lap 12?`
4. Click `L12 · S3 · brake_temp` → pulse → playhead eases → cyan band → **942°C @ 3120m**
5. Optional no-hit: `Who is the championship leader?`

## Data

Mock pack: Bahrain FP2 · fictional VER path · Soft · laps 11–13 · track **5412 m**.

| Channel | Class | Role |
|---------|-------|------|
| `brake_temp` | synthetic ATLAS-like | Spike story (942°C @ ~3120 m, S3) |
| `throttle`, `speed` | OpenF1 / FastF1-shaped | Broadcast-parity plot companions |
| `brake` | OpenF1-shaped bool | Heavy-zone logic (not default plot) |

Sector bounds (approximate-for-demo): `[0, 1850, 3050, 5412]` — keeps ~3120 m in S3.

**Credits / shape inspiration (offline at demo time):**

- [OpenF1](https://openf1.org/docs/) — `car_data` field conventions
- [FastF1](https://github.com/theOehrly/Fast-F1) (MIT) — telemetry column conventions
- Public Bahrain GP length / circuit facts

Fixtures: `data/mock/`. RAG: deterministic `qa-map.json` (money shot never flakes).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui (Button, Input, Sheet) · Oxanium / Sora / IBM Plex Mono · SVG traces

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```
