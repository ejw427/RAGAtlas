# CiteTrace pit wall

**Welch Software · Eric · [welchsoftware.net](https://www.welchsoftware.net)**

Product: **CiteTrace** — *Ask the lap. Trust the trace.*
Live: [citetrace.welchsoftware.net](https://citetrace.welchsoftware.net)
This document is the UI specification for the session screen. The waveforms stay. The wall around them changes.

Independent work. Not affiliated with any Formula 1 team, the FIA, Formula 1, or a telemetry vendor. Session accents and car drawings in this spec are original Welch Software marks. They are not team logos, liveries, helmets, or photographs.

Data underneath the layout: 2026 United States GP, Circuit of the Americas, FP2, OpenF1 public subset, 22 drivers, 5,513 m. Thermal and driver-overlay channels are synthetic and stay labeled **OVL**. Broadcast channels stay labeled **OF1**.

---

## The screen’s job

In the first eight seconds a performance engineer, or the person hiring one, should be able to answer three questions without reading a tooltip:

1. Where on the circuit is the car?
2. Who is driving it, for which team, on which tyre?
3. How does this lap compare with another car?

The graphs answer the fourth question, which is the one CiteTrace already answers well: what did the channel do at that metre, and which cite proves it?

The product frame never changes with the car. Chrome, type, and the signal green stay Welch Software. The subject of the screen — number, accent, car, teammate — changes with the selection. That is how one product is marketed to every team on the wall without becoming a fan skin.

---

## What the current wall does

The session at `/session` is a three-column engineering desk.

| Region | Today | Effect on a first look |
|---|---|---|
| Circuit | `TrackSchematic` at `h-36` inside a 200px left rail | The map reads as a legend, not a place. |
| Driver | Native `<select>` of `CODE #no · team` | No person, no car, no colour. Switching drivers feels like changing a filter. |
| Compare | One checkbox. Target is chosen for you: own baseline, else Leclerc’s Soft | A racer-versus-racer compare is not something the user can aim. |
| Graphs | Full center column, distance-domain, playhead, evidence band | This is the part to protect. |
| Channels | Toggle list in the left rail, under the thumbnail | Selection works. It is visually second to a failure-mode card and a provenance strip. |
| Ask | Permanent right column, about 228px | The cite lock is the differentiator, and it also steals the width the map needs. |

The lap strip, sector chips, weather, and delta already exist in the top chrome. They are the right objects. They are arranged as toolbars, so the circuit never gets a stage.

---

## Principles

1. **The lap is a place.** The circuit is the top of the working area, drawn from the real COTA path, tall enough to scrub with a pointer.
2. **Two cars are always addressable.** Compare is a pair of named slots, Focus and Reference, not a checkbox with a hidden target.
3. **Identity precedes the number.** Number, name, team, car, compound — then the lap time.
4. **Every object on the wall is selectable.** Driver, lap, sector, channel, cite. The selected state is a mark you can see, and the live value sits next to the channel name.
5. **Graphs remain the instrument.** The map orients. The traces measure. One playhead ties them together in the distance domain, so Turn 12 is Turn 12 for both cars.
6. **Marks are original.** A racing number, a typeset team name, a geometric helmet, and one shared open-wheel silhouette. Official logos, photographs, and copied liveries stay off the site. That is the craft a tools team will respect, and it keeps a public portfolio at welchsoftware.net on the right side of those brands.
7. **Honesty is on the plate.** Compound, OF1 versus OVL, and “compounds differ” are visible whenever a delta could be misread.

---

## The wall

Desktop, 1280px and up. The page is still `100dvh`, no document scroll. Regions scroll inside themselves.

```
┌──────────────────────────────────────────────────────────────────┐
│ CiteTrace   Welch Software     COTA · FP2        air · track · RH│
├────────────────────┬────────── vs ──────────┬────────────────────┤
│  FOCUS             │                        │  REFERENCE         │
│  16  LEC           │     compare / swap     │  44  HAM           │
│  Ferrari · Soft L10│                        │  Ferrari · Soft L9 │
│  1:35.291          │     Δ −0.615           │  1:35.906          │
├──────────┬────────────────────────────────────────────┬──────────┤
│ PLATE    │                                            │ SELECT   │
│ helmet   │              CIRCUIT                       │ Channels │
│ number   │         real path, two cars                │ Laps     │
│ car      │         sectors, evidence arc              │ Notes    │
│ compound │         I1 · I2 · ST                       │          │
│ S1 S2 S3 │                                            │ live     │
│          ├────────────────────────────────────────────┤ values   │
│          │                                            │          │
│          │              TRACES                        │ Ask      │
│          │     Focus solid · Reference dashed         │          │
│          │     same playhead, distance domain         │          │
└──────────┴────────────────────────────────────────────┴──────────┘
```

Heights that make the first look work, on a 900px-tall window after the footer:

| Band | Height | Role |
|---|---|---|
| Command | 40px | Product, session, weather. Quiet. |
| Duo | 76px | The compare. This band is the product. |
| Plate | remaining left, 252px wide | Who and what. |
| Circuit | 300–340px, top of the center | Where. |
| Traces | everything under the circuit, at least ~340px | The graphs. |
| Select | remaining right, 268px | Channels, laps, notes, Ask. |

The circuit is allowed to shrink to 220px on a short laptop. It does not return to a thumbnail in the rail. The traces never drop below the circuit; if a window is extremely short, the circuit scrolls inside the center column and the trace stack keeps a 280px minimum.

### Command

Left: CiteTrace wordmark, then “Welch Software” in mute. Center: venue and session, `Circuit of the Americas · FP2`. Right: air, track, humidity, already on the pack. No driver select in this bar. The duo owns the driver.

### Duo — Focus and Reference

This is the control a hiring manager should be able to use without a tour.

Each slot is a button-row, not a form control:

- Racing number in the team accent
- Three-letter code and full name
- Team name, compound, lap number
- Lap time in tabular figures

Between them, a `vs` control:

- Primary action label when Reference is empty: **Compare {teammate}** (one click fills Reference with the other car at that team, best flyer).
- When both slots are filled: the center shows the lap delta, and `vs` swaps the two slots.
- A text button **Clear** returns to a single car. The Reference slot stays on screen as an empty target, dashed border, so compare never disappears into a menu.

Under the duo, four preset chips. They fill Reference; they do not open a dialog.

| Chip | Fills Reference with |
|---|---|
| Teammate | The other driver at the same constructor, best flyer |
| Field best | Fastest lap in the pack that is not the Focus lap (Leclerc lap 10, 1:35.291, unless Focus is already that lap — then Antonelli lap 8) |
| Other compound | Same driver, the other stint. Enabled for Leclerc only with the current pack (Soft lap 10, Hard lap 7, long-run lap 14). Disabled, visibly, for everyone else |
| Same lap window | Keeps the Reference driver and jumps their lap list. Present so two laps of one car stay a first-class compare |

Delta readout, always in the duo once both slots are filled:

`Δ lap  −0.615` · `S1 −0.032` · `S2 −0.412` · `S3 −0.171`

Negative means Focus is faster. The sign is printed. Colour supports the sign (signal green when Focus is ahead, amber when Focus is behind) and is never the only encoding.

When the two laps are on different compounds, the duo adds a quiet label: **Compounds differ**. It does not block the compare. McLaren and Audi need this label or the delta is a trap.

### Plate — driver, team, car

The left column is the identity plate for the Focus car. A thinner echo of the Reference car sits in the duo only, so the plate does not split into two portraits and starve the map.

Contents, top to bottom:

1. **Helmet mark.** 72×72 geometric helmet, original path, filled with the team accent. Visor is a fixed band. One of three motifs (stripe, chevron, split) is chosen from `number % 3` so the 22 drivers are not identical, and so the mark is obviously not a portrait.
2. **Number.** Display size, team accent, the racing number (`16`).
3. **Name and code.** `Charles Leclerc` and `LEC`.
4. **Team line.** The team name set in the product sans (Sora), tracked slightly open. A 4px accent bar sits at the left edge of the plate. No crest from the team. A small original shield behind the number is ours: a rounded rectangle, the number, nothing else.
5. **Car.** One shared side-profile silhouette, staged on a venue atmosphere (`CarStage`), used for every driver. Body fill is the team accent. A second panel (sidepod) uses the team’s second accent. The racing number is set on the sidepod. Each tyre is a circle; the rear tyre carries the compound letter `S`, `M`, or `H`. **Track packages** (`lib/track-package.ts`) change wing, cooling, rake, and atmosphere so COTA (tower + kerb + mixed DF) does not look like Bahrain (desert heat ducts).
6. **Stint facts already in the pack.** Compound, lap, and when present: tyre age, pit stop, radio clip count. Empty fields are omitted.
7. **Sector trio.** Three selectable cells, `S1 25.630`, `S2 37.834`, `S3 31.827`, plus a `Lap` cell. Selecting one sets the evidence window and the map highlight. In compare mode each cell also shows the sector delta.

Changing Focus crossfades the plate in 180ms (instant when reduced motion is requested). The map marker and the Focus trace adopt the same accent in the same frame.

### Circuit

Promoted out of the rail into the center, above the graphs.

- Path from `trackXY` (the real COTA trace already on the pack). Stroke ~10px in chalk, casing ~22px in asphalt so it reads as a road.
- Sector spans use the existing bounds: S1 `0–1483`, S2 `1483–3672`, S3 `3672–5513`. The active sector brightens; the others stay mute.
- Evidence window paints along the path, same coordinates the traces already use.
- Focus car is a top-down open-wheel mark (`CarMarker`) on the polyline, rotated to the local tangent, filled with the team accent, number beside it.
- Reference car, when present, is a second mark in the reference accent, drawn slightly offset so the two never fully stack.
- Traps from OpenF1 sit on the map as labels: `I1`, `I2`, `ST`, with the speed in km/h.
- Pointer down on the path scrubs `playheadM` by nearest distance sample. The traces follow. Dragging a trace still scrubs the map. One playhead.
- Click a sector’s portion of the path to focus that sector. The plate’s sector cell matches.

Both cars share the playhead because the stage is distance-domain. A time-aligned compare would put the two cars in different corners. The caption under the map says **Distance domain · both cars at the same metre** whenever compare is on. That sentence is worth saying out loud in an interview.

### Traces

`TelemetryStage` stays the instrument: stacked channels, grid, playhead, evidence band, trap ticks, draw-on animation.

Changes around it, not inside the physics of the plot:

- Focus trace: 2.25px solid, team accent for the primary channel colour override on speed only. Other channels keep their existing trace palette so a brake temp is still the brake colour. Speed is the car’s colour because speed is the lap.
- Reference trace: 1.5px dashed, reference team accent, on every plotted channel that exists for that lap.
- A one-line legend on the stage header: `LEC 16 solid` · `HAM 44 dashed`.
- The stage header repeats the playhead distance and the interpolated values, which the rail already computes.

Channel selection moves to the right dock and continues to call the same `plotChannelIds` state. At least one channel remains plotted.

### Select dock

Three tabs, Channels selected by default. The dock is how “everything else” stays selectable once the map takes the center.

**Channels.** Grouped by the existing app keys: Chassis, Driver, Brakes, Tyres, Engine. Each row is the colour swatch, short name, live value at the playhead, unit, and `OF1` or `OVL`. Click toggles the plot. Four presets sit above the list and replace the set:

| Preset | Channels |
|---|---|
| Lap | speed, throttle, brake |
| Pedals | throttle, brake, brake_pressure, steering |
| Brakes | brake, brake_pressure, brake_temp, brake_temp_fl |
| Power | rpm, n_gear, fuel_flow, oil_pressure, coolant_temp |

**Laps.** The Focus driver’s laps, with time, compound, and tags (`soft_flyer`, `hard_push`, `long_run`, `best_flyer`). Replaces the current lap button strip in the second toolbar, which goes away.

**Notes.** Events, debrief notes, and the timeline cites already rendered in `ContextRail` and `Timeline`. Clicking a cite still calls `lockCite`.

**Ask** is the last control in the dock, a button that opens the existing `RagRail` as a drawer over the dock (desktop) or the existing bottom sheet (narrow). The cite lock behaviour does not change: click a cite, the playhead eases to the evidence, the band paints on the traces and on the circuit, the channel joins the plot if it was off. The 90-second demo still ends on the brake spike.

The failure-mode teaching card and the provenance strip move into Notes and into the footer line. They are true, and they should not sit above the circuit.

### Footer

One line, as now: Welch Software · CiteTrace · OpenF1 subset + overlays · No SECU · Method · Live · Portfolio. Add the house name only as data (`Ferrari` as the selected team), never as a co-brand.

---

## Selection model

One source of truth in `SessionShell`, reflected in the URL so a walk-in is a link.

| State | Meaning | URL |
|---|---|---|
| Focus driver | Whose plate, whose trace is solid | `a=LEC` |
| Focus lap | Which of that driver’s laps | `lapA=10` |
| Reference driver | The other car. Absent means single-car | `b=HAM` |
| Reference lap | Which lap of the reference | `lapB=9` |
| Sector | `Lap` or `S1`–`S3` | `sector=S2` |
| Channels | Plotted ids | `ch=speed,throttle,brake` |
| Cite | Locked evidence | `citeId=` (already supported) |

Today’s links keep working: `driver` and `lap` map to Focus when `a` is absent. `/session?driver=LEC&lap=10` still opens Leclerc’s Soft.

Compare is on whenever `b` is present. There is no separate boolean to get out of sync with the URL.

`compareTargetLap()` remains as the fallback for old “compare on” behaviour during the migration, then the checkbox and that implicit target are removed. A compare the user did not aim is the bug this spec exists to close.

---

## Team accents

Session accents. Applied to the plate, the car fill, the map wedge, and the speed trace. The void, chalk, and signal green of the product do not change.

Second accent is used only on the car’s sidepod and the helmet motif, so two colours describe a car and the rest of the wall stays quiet.

| Team | Drivers | Accent | Second |
|---|---|---|---|
| Ferrari | LEC 16, HAM 44 | `#E10600` | `#F0E7D0` |
| Mercedes | RUS 63, ANT 12 | `#00D2BE` | `#C5CCD6` |
| McLaren | NOR 1, PIA 81 | `#FF8000` | `#1A1C1F` |
| Red Bull Racing | VER 3, HAD 6 | `#1E2A78` | `#F0D030` |
| Aston Martin | ALO 14, STR 18 | `#006F62` | `#D6DE6B` |
| Williams | ALB 23, SAI 55 | `#0A2240` | `#7FB2FF` |
| Alpine | GAS 10, COL 43 | `#005BA8` | `#FF87BC` |
| Haas F1 Team | OCO 31, BEA 87 | `#E8E8E8` | `#B42318` |
| Racing Bulls | LAW 30, LIN 41 | `#2F6BFF` | `#F4F1EA` |
| Audi | HUL 27, BOR 5 | `#BB0A30` | `#C5CCD3` |
| Cadillac | PER 11, BOT 77 | `#C4A35A` | `#141414` |

Haas uses a light body so it cannot be mistaken for the Ferrari plate. Racing Bulls uses a brighter blue so it cannot be mistaken for Red Bull Racing. Audi and Cadillac are new 2026 entries in this pack; the accents are Welch choices for the demo, labeled as such in the plate tooltip: “Session accent. Not a team asset.”

Teammate pairs are fixed from this table. `lib/identity.ts` exports `accent`, `second`, `teammateId`, and `house` for each driver id.

---

## Graphics

Three original SVGs, all in `components/identity/`. No remote images, no driver photos, no logo files.

**`HelmetMark`.** Shared shell path. Motif index `number % 3`. Fill from the accent. The number is HTML next to it, not baked into the path, so it stays a real text node for screen readers.

**`CarSilhouette`.** One open-wheel side profile: nose, sidepod, engine cover, rear wing, two wheels. Accent props colour the body. Compound letter is a chip near the rear. Number sits on the sidepod. `track` selects a package (COTA / Bahrain / generic). **`CarStage`** wraps it in venue atmosphere. **`CarMarker`** is the top-down mark on the circuit.

**`Plate`.** Composes helmet, number, name, team, car, compound, sector cells. Props are a `Driver`, a `Lap`, and optional sector deltas. It does not fetch.

Alt text pattern: `Charles Leclerc, car 16, Ferrari, Soft tyre, lap 10`. The graphic is decorative beside that name; the name is the accessible object.

Motion: opacity and a 8px translate on driver change, 180ms, the existing ease. Reduced motion cuts it.

---

## Narrow windows

Under 960px the duo stacks under the command as two half-width cards with `vs` between them. The plate becomes a horizontal strip above the circuit: helmet, number, name, car at 120px, compound. The circuit is the first tall region (minimum 240px). Traces follow. The select dock becomes a bottom bar of tabs, which is the current mobile pattern with the map no longer trapped in it. Ask stays the bottom sheet.

The compare has to survive this collapse. The duo is the first thing under the wordmark, even on a phone, because that is the demo people will pinch open in a hallway.

---

## Walk-ins

Each house is a URL that opens the wall already in compare, on that team’s two cars, with the circuit in view. The spoken line is the twenty seconds at the start of a conversation. The numbers are from this pack (best flyer unless noted). Times are the lap, then sector deltas of Focus minus Reference. Negative means Focus is faster.

Use the live site in the email, not the repository.

Paste shape, every time:

> Eric · Welch Software · welchsoftware.net
> CiteTrace — [citetrace.welchsoftware.net](https://citetrace.welchsoftware.net)
> {one sentence from the house}
> The session is 2026 COTA FP2, public OpenF1, with synthetic thermal overlays labeled in the product. Independent work.

### Ferrari — `?house=ferrari`

Focus Leclerc lap 10 (Soft, 1:35.291) against Hamilton lap 9 (Soft, 1:35.906).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ LEC − HAM | −0.615 | −0.032 | −0.412 | −0.171 |

**Say:** “Leclerc’s lap 10 is the session benchmark. Against Hamilton the gap is six tenths, and four of them are in sector 2. The map paints that sector. Both cars are on the Soft, so this delta is a driver-and-lap compare, not a tyre trick.”

**Then, if they lean in:** switch Reference to Leclerc lap 7, the Hard, 1:36.510. Soft versus Hard is −1.219 on the same car (S1 −0.145, S2 −0.562, S3 −0.512). “Same driver, compound is the variable. The plate says Soft and Hard so the delta is never anonymous.”

**Point at:** the S2 cell, then the cite lock on the S3 brake spike, so the room sees evidence and not only a leaderboard.

**Email line:** I built a pit wall that puts Leclerc and Hamilton on the same metre of COTA and shows that four tenths of the gap live in sector 2 — with the circuit, the car, and the trace on one screen.

### Mercedes — `?house=mercedes`

Focus Antonelli lap 8 (1:35.333) against Russell lap 9 (1:35.793).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ ANT − RUS | −0.460 | +0.134 | −0.474 | −0.120 |

**Say:** “Antonelli is ahead on the lap. Russell is ahead in sector 1 by a tenth and a half. Antonelli takes it back in sector 2. The lap time hides a swap. Compare is on screen so you see the swap before you trust the clock.”

**Point at:** S1 going amber while the lap delta stays green. That single contrast is the Mercedes demo.

**Email line:** The lap time says Antonelli by 0.460. Sector 1 says Russell. CiteTrace shows both before anyone argues from the clock.

### Red Bull Racing — `?house=redbull`

Focus Verstappen lap 9 (1:35.480) against Hadjar lap 10 (1:36.079).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ VER − HAD | −0.599 | −0.054 | −0.160 | −0.385 |

**Say:** “Verstappen to Hadjar is six tenths. Sector 3 is most of it. I can put both cars on that part of the map and read speed, brake, and the labeled brake-temperature overlay at the same metre.”

**Point at:** the S3 arc on the circuit, then the brake channels, and say OVL out loud before they ask. They will ask.

**Email line:** A teammate compare where the map, not the timing screen, tells you the gap is in sector 3.

### McLaren — `?house=mclaren`

Focus Piastri lap 13 (Soft, 1:36.029) against Norris lap 4 (Hard, 1:36.373).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ PIA − NOR | −0.344 | −0.293 | +0.087 | −0.138 |

**Say:** “Piastri’s Soft is three and a half tenths up on Norris’s Hard. Sector 2 goes the other way: Norris is quicker there on the Hard. The plate has the compound on the tyre, and the duo says the compounds differ. I will not call this a driver delta.”

**Point at:** the Compounds differ label, then the S2 cell. This is the strongest engineering sentence on the wall. Use it.

**Email line:** The interesting McLaren lap is the one a careless tool would misread. Soft against Hard, and sector 2 disagrees with the lap time. The UI says so.

### Aston Martin — `?house=astonmartin`

Focus Alonso lap 8 (1:37.235) against Stroll lap 13 (1:37.269).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ ALO − STR | −0.034 | −0.209 | −0.016 | +0.191 |

**Say:** “Thirty-four thousandths on the lap. Alonso owns sector 1 by two tenths. Stroll owns sector 3 by two tenths. It is a dead heat that is not a dead heat once you leave the lap time.”

**Point at:** the lap delta, which looks like noise, then the two sector cells, which do not.

**Email line:** Two cars separated by 0.034s, and the sectors tell opposite stories. That is the screen I want open in a debrief.

### Williams — `?house=williams`

Focus Sainz lap 14 (1:37.701) against Albon lap 12 (1:38.035).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ SAI − ALB | −0.334 | −0.122 | −0.091 | −0.121 |

**Say:** “Sainz is ahead by a third of a second, and the three sectors share it. There is no single corner to hide in. The traces have to explain a gap that is spread over the whole lap.”

**Point at:** three sector deltas of similar size, then scrub the speed trace with both cars on it.

**Email line:** A compare where the gap is distributed across the lap, which is a harder story than a single braking zone, and the wall is built for it.

### Alpine — `?house=alpine`

Focus Gasly lap 9 (1:36.840) against Colapinto lap 5 (1:37.201).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ GAS − COL | −0.361 | −0.121 | −0.054 | −0.186 |

**Say:** “Gasly by 0.361. Sector 3 is half of it, sector 1 is the rest, sector 2 is quiet. The map makes that shape obvious before anyone opens a spreadsheet.”

**Email line:** Teammate delta with the sector that matters already painted on the circuit.

### Haas — `?house=haas`

Focus Bearman lap 10 (1:36.536) against Ocon lap 10 (1:37.111).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ BEA − OCO | −0.575 | −0.188 | −0.106 | −0.281 |

**Say:** “Bearman by just under six tenths, both on the Soft, both on lap 10 of their own run. Sector 3 is the largest piece. Same lap number, different cars, distance-aligned, so the corner lines up.”

**Email line:** Two cars, one corner of the lap, the gap visible on the map and on the speed trace together.

### Racing Bulls — `?house=racingbulls`

Focus Lawson lap 11 (1:36.331) against Lindblad lap 11 (1:36.734).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ LAW − LIN | −0.403 | +0.038 | −0.330 | −0.111 |

**Say:** “Lawson by four tenths. Lindblad actually leads sector 1, by a hair. Sector 2 is the lap. Same pattern as the Mercedes swap, smaller car, same wall.”

**Email line:** The same compare surface I would open for the front of the field, aimed at Lawson and Lindblad, with sector 2 carrying the gap.

### Audi — `?house=audi`

Focus Bortoleto lap 5 (Medium, 1:36.832) against Hulkenberg lap 10 (Soft, 1:37.040).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ BOR − HUL | −0.208 | −0.048 | −0.107 | −0.053 |

**Say:** “Bortoleto’s Medium is two tenths up on Hulkenberg’s Soft. That is the sentence. The compound is on the tyre graphic and the duo says the compounds differ. A tool that hides the tyre would hand you a false driver gap on a brand-new works team.”

**Email line:** The Audi compare is a Medium beating a Soft by 0.208. CiteTrace labels the tyre before it offers the delta.

### Cadillac — `?house=cadillac`

Focus Bottas lap 10 (1:38.422) against Perez lap 10 (1:38.934).

| | Lap | S1 | S2 | S3 |
|---|---:|---:|---:|---:|
| Δ BOT − PER | −0.512 | −0.066 | −0.164 | −0.282 |

**Say:** “Bottas by half a second, both on the Soft. Sector 3 again. A new entry still gets the same plate, the same map, and the same compare as the benchmark lap. The product does not have a favourite car.”

**Email line:** Cadillac’s two cars on the same wall as the benchmark lap, with the sector gap on the circuit.

### Motion Applied — `?house=ferrari` plus the cite

This is the tools-vendor walk-in. The nouns on the wall are the public ones: session, lap, channel, distance, compare. The viewer is not a copy of ATLAS. The piece added on top is the cite.

**Say:** “Waveforms are the job everyone can demo. The part I care about is that a claim locks the playhead, and a question the session cannot support fails closed. Speed and throttle are OpenF1. Brake temperature is a labeled synthetic overlay. The chrome says which is which.”

**Do this, in order:** open the Ferrari house so the compare is already impressive, then run the money-shot ask — `Why did brake temp spike in S3 on lap 10?` — and click the cite. The band appears on the trace and on the circuit. Then ask something out of corpus and show the no-hit.

**Email line:** I built the distance-domain wall around the vocabulary your public docs already use, and I bound every answer to a cite. I did not clone the viewer, and I did not pretend the overlay is a SECU channel.

### The portfolio card — welchsoftware.net

One paragraph, for the project page and the top of a résumé note:

> CiteTrace is a pit wall for a race session. The circuit is on screen, large enough to scrub. Any car can be set against any other car, with the sector delta, the compound, and both traces on the same metre. Selecting a driver brings up an original plate: number, team, helmet mark, and car. Under that, the traces and a cite that locks the playhead. Built by Eric at Welch Software. Live at citetrace.welchsoftware.net.

The landing page CTA becomes **Open the pit wall**, aimed at `?house=ferrari`, with **Ask the lap** as the second action. That sells the workspace — circuit, duo, cite, playhead — not a single compare feature. The night photograph and the track stroke on the hero stay. They already promise a circuit; the session should keep that promise.

---

## Build order

Phase 1 is the interview. It is shippable on its own.

**Phase 1 — the wall**

- New grid in `SessionShell`: command, duo, plate, circuit, traces, dock.
- Move `TrackSchematic` into the center at the heights above. Pointer scrub on the path. Focus wedge with tangent.
- Duo with any driver in either slot. Teammate chip. Swap. Clear.
- `Plate`, `HelmetMark`, `CarSilhouette`, `lib/identity.ts` accents.
- Speed trace and map wedge take the Focus accent. Reference trace dashed.
- URL: `a`, `lapA`, `b`, `lapB`, with `driver` and `lap` still accepted.
- Remove the compare checkbox once the duo works.

**Phase 2 — the argument**

- Sector delta cells and the Compounds differ label.
- Colour the circuit sectors by the sign of the delta, with the milliseconds labeled on the sector.
- House presets in `lib/identity.ts` resolving to the pairs in this document.
- Channel presets in the dock.
- Map trap labels.

**Phase 3 — the room**

- Ask as a drawer. Notes tab holds timeline, events, provenance.
- Landing CTA.
- Narrow-window layout.
- `sector` and `ch` on the URL.

Files the work touches:

| File | Change |
|---|---|
| `components/session/SessionShell.tsx` | Grid, duo state, URL |
| `components/session/TrackSchematic.tsx` | Stage size, scrub, two wedges, tangent |
| `components/session/TelemetryStage.tsx` | Reference stroke, legend, speed accent |
| `components/session/ContextRail.tsx` | Becomes the select dock; map leaves it |
| `components/identity/Plate.tsx` | New |
| `components/identity/HelmetMark.tsx` | New |
| `components/identity/CarSilhouette.tsx` | New |
| `lib/identity.ts` | Accents, teammates, houses |
| `lib/brand.ts` | House demo links, landing CTA copy |
| `components/landing/Hero.tsx` | Primary CTA |
| `app/globals.css` | Plate and duo use existing tokens plus accent variables set inline |

No new dependency. SVG, the session pack, and the CSS variables already on `:root`.

---

## What the build keeps true

- OpenF1 and synthetic overlays stay badged.
- The deterministic cite path stays the money shot.
- Out-of-corpus questions still fail closed.
- The footer disclaimer stays on every screen.
- Team names are used as facts about the entry. Team artwork is not.
- The product name on the chrome is CiteTrace, the studio is Welch Software, and the person on the résumé is Eric.

---

## Ninety-second script, after Phase 1

1. Open `?house=ferrari`. The circuit is the first large object. Leclerc’s plate is up. Hamilton is already in the reference slot.
2. Point at sector 2, −0.412. Both wedges sit on the same metre.
3. Toggle the Brakes preset. The graphs they came to see are still the working surface, now with a second car dashed underneath.
4. Ask the brake-spike question. Click the cite. The playhead locks on the trace and on the map.
5. Switch the house control to Mercedes. The accent, the car, and the delta all change. The product chrome does not. “Same wall. Their car.”

That last sentence is the sell.
