import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import {
  AUTHOR,
  CANDIDATE_LINE,
  DEMO_ASK,
  DEMO_STEPS,
  EMAIL_BLURB,
  LIVE_DEMO_URL,
  LIVE_URL,
  METHOD_HEADLINE,
  PORTFOLIO_URL,
  PRODUCT,
  STUDIO,
  TAGLINE,
  WEDGE,
} from "@/lib/brand";
import { HOUSE_PRESETS } from "@/lib/identity";
import { corpusSummary } from "@/lib/rag";
import { getChannels, getSessionPack } from "@/lib/session";
import { cn } from "@/lib/utils";
import { VENUE_PHOTOS } from "@/lib/venue-photos";

const ABOUT_DAY_STRIP = [
  {
    src: VENUE_PHOTOS.hero,
    alt: "COTA daytime — Texas flag over the track",
    label: "Hero · Texas flag",
  },
  {
    src: VENUE_PHOTOS.tower,
    alt: "COTA observation tower in daylight",
    label: "Tower · daylight",
  },
  {
    src: VENUE_PHOTOS.esses,
    alt: "COTA esses in daylight",
    label: "Esses · T3–T6",
  },
  {
    src: VENUE_PHOTOS.garage,
    alt: "Garage bay at COTA",
    label: "Garage",
  },
] as const;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[5.5rem] border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2">
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-[0.85rem] text-[var(--chalk)]">
        {value}
      </p>
    </div>
  );
}

function DemoChip({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2.5 transition hover:border-[var(--hairline-strong)] hover:bg-[var(--signal-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
    >
      <span className="font-mono text-[0.72rem] text-[var(--signal)]">
        {label}
      </span>
      <span className="mt-0.5 block text-[0.72rem] leading-snug text-[var(--mist)]">
        {hint}
      </span>
    </Link>
  );
}

function FlowNode({
  label,
  sub,
  accent,
}: {
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[6.5rem] flex-1 border px-2.5 py-2 text-center",
        accent
          ? "border-[var(--signal)] bg-[var(--signal-dim)]"
          : "border-[var(--hairline)] bg-[var(--panel)]",
      )}
    >
      <p
        className={cn(
          "font-mono text-[0.68rem]",
          accent ? "text-[var(--signal)]" : "text-[var(--chalk)]",
        )}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[0.6rem] leading-snug text-[var(--mute)]">
        {sub}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span
      className="hidden shrink-0 self-center font-mono text-[var(--mute)] sm:inline"
      aria-hidden
    >
      {">"}
    </span>
  );
}

export default function AboutPage() {
  const pack = getSessionPack();
  const corpus = corpusSummary();
  const channels = getChannels();
  const rates = corpus.ratesHz;
  const rateLabel = rates
    ? `${rates.high ?? "-"}/${rates.mid ?? "-"}/${rates.low ?? "-"} Hz`
    : "-";

  return (
    <main className="min-h-dvh bg-[var(--void)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--panel)] px-6 py-4">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--mute)]">
              {STUDIO}
            </p>
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight"
            >
              Cite<span className="text-[var(--signal)]">Trace</span>
            </Link>
          </div>
          <Button asChild size="sm">
            <Link href="/session?demo=1&house=ferrari">Open pit wall</Link>
          </Button>
        </div>
      </header>

      <div className="relative isolate h-40 overflow-hidden border-b border-[var(--hairline)] sm:h-52">
        <Image
          src={VENUE_PHOTOS.tower}
          alt="Circuit of the Americas observation tower in daylight"
          fill
          className="object-cover object-[center_28%]"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,7,10,0.12) 0%, rgba(5,7,10,0.58) 100%)",
          }}
        />
        <div className="relative z-[1] mx-auto flex h-full max-w-[800px] items-end px-6 pb-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--signal)]">
            Austin · Circuit of the Americas · 2026 FP2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-[var(--hairline)] sm:grid-cols-4">
        {ABOUT_DAY_STRIP.map((shot) => (
          <figure
            key={shot.src}
            className="relative isolate min-h-[96px] overflow-hidden border-r border-[var(--hairline)] last:border-r-0 sm:min-h-[120px]"
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(5,7,10,0.85)] to-transparent px-2 pb-1.5 pt-6 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-[var(--signal)]">
              {shot.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <article className="mx-auto max-w-[800px] px-6 py-12">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--signal)]">
          {STUDIO} · Method · hiring-manager deep cut
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {METHOD_HEADLINE}
        </h1>
        <p className="mt-2 font-display text-lg text-[var(--chalk)]">{WEDGE}</p>
        <p className="mt-1 text-[var(--mist)]">{TAGLINE}</p>
        <p className="mt-4 text-[var(--mist)] leading-relaxed">
          This page is the technical sell. {AUTHOR} at {STUDIO} just shipped{" "}
          {PRODUCT} as a first-stab pit wall from{" "}
          <span className="text-[var(--chalk)]">public OpenF1</span> for the{" "}
          <span className="text-[var(--chalk)]">
            2026 United States GP · Circuit of the Americas · FP2
          </span>{" "}
          (session found online, all 22 drivers). Not a chatbot bolted onto a
          chart library — a distance-domain workspace where every claim is a
          first-class cite that locks the playhead on the map and the traces, or
          the system fails closed. Independent portfolio prototype. Not
          affiliated with Formula 1, the FIA, or any team.
        </p>
        <p className="mt-3 font-mono text-[0.65rem] text-[var(--mute)]">
          Live:{" "}
          <a
            href={LIVE_URL}
            className="text-[var(--signal)] underline-offset-2 hover:underline"
          >
            {LIVE_URL.replace(/^https:\/\//, "")}
          </a>
          {" · "}
          <a
            href={PORTFOLIO_URL}
            className="text-[var(--signal)] underline-offset-2 hover:underline"
          >
            Portfolio card
          </a>
        </p>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Why a tools / Digital Solutions hiring manager should care
          </h2>
          <ul className="list-disc space-y-2.5 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">Race-weekend → product in days</span>{" "}
              — pulled a live public corpus, shaped a multi-rate session pack,
              and shipped a React/TypeScript pit wall with any-car compare and
              evidence-bound asks. That is the delivery shape Digital Solutions /
              performance-tools teams need under calendar pressure.
            </li>
            <li>
              <span className="text-[var(--chalk)]">
                Fail-closed session RAG, not LLM theatre
              </span>{" "}
              — QaMap + notes retrieve cites first; Cloudflare Workers AI may
              only phrase from that set; offline{" "}
              <span className="font-mono text-[0.78rem]">next dev</span> uses the
              deterministic draft so the money-shot never flakes in a hallway demo.
            </li>
            <li>
              <span className="text-[var(--chalk)]">ATLAS-shaped literacy without a clone</span>{" "}
              — session / lap / channel / distance / compare vocabulary from public
              ATLAS docs; OF1 vs OVL badges so synthetic plant overlays never pretend
              to be SECU.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Dense operator UX</span> — SVG
              waveforms, circuit scrub, Focus/Reference duo, sector deltas, compound
              honesty. The same craft that ships under pressure on long-running
              C#/.NET field systems (TRACS) and Meridian.
            </li>
          </ul>
          <p className="text-[var(--mist)] leading-relaxed">
            {CANDIDATE_LINE}. Money-shot ask:{" "}
            <span className="font-mono text-[var(--chalk)]">{DEMO_ASK}</span>
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-[var(--mist)]">
            {DEMO_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2.5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
              Paste into email / LinkedIn · {AUTHOR}
            </p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--chalk)]">
              {EMAIL_BLURB}
            </p>
            <p className="mt-2 font-mono text-[0.62rem] text-[var(--signal)]">
              {LIVE_DEMO_URL.replace(/^https:\/\//, "")}
            </p>
          </div>
          <Button asChild size="sm" className="mt-2">
            <Link href="/session?demo=1&house=ferrari">Open pit wall</Link>
          </Button>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            House walk-ins
          </h2>
          <p className="text-[var(--mist)] leading-relaxed">
            Same pit wall, re-aimed. Use the House switcher in-session or deep-link.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {HOUSE_PRESETS.map((h) => (
              <Link
                key={h.id}
                href={`/session?demo=1&house=${h.id}`}
                className="border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2.5 transition hover:border-[var(--hairline-strong)] hover:bg-[var(--signal-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <span className="font-mono text-[0.72rem] text-[var(--signal)]">
                  {h.label}
                </span>
                <span className="mt-0.5 block text-[0.72rem] text-[var(--mist)]">
                  {h.focusCode} L{h.focusLap} vs {h.referenceCode} L
                  {h.referenceLap}
                </span>
              </Link>
            ))}
            <Link
              href="/session?demo=1&house=tools"
              className="border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2.5 transition hover:border-[var(--hairline-strong)] hover:bg-[var(--signal-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <span className="font-mono text-[0.72rem] text-[var(--signal)]">
                Tools vendor
              </span>
              <span className="mt-0.5 block text-[0.72rem] text-[var(--mist)]">
                Cite lock · OF1 vs OVL · fail closed
              </span>
            </Link>
          </div>
        </section>

        {/* Corpus strip */}
        <section className="mt-8" aria-label="Session corpus">
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
            Live corpus · {corpus.yearHint} {corpus.sessionLabel} ·{" "}
            {corpus.venue}
          </p>
          <div className="flex flex-wrap gap-2">
            <Stat label="Drivers" value={String(corpus.drivers)} />
            <Stat label="Laps" value={String(corpus.laps)} />
            <Stat label="Channels" value={String(corpus.channelParams)} />
            <Stat
              label="OpenF1 / overlay"
              value={`${corpus.openf1Channels} / ${corpus.overlayChannels}`}
            />
            <Stat label="Series" value={String(corpus.sampleSeries)} />
            <Stat label="Rates" value={rateLabel} />
            <Stat
              label="Track"
              value={`${corpus.lengthM?.toLocaleString() ?? "-"} m`}
            />
            <Stat label="Cites" value={String(corpus.cites)} />
          </div>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Problem → product (the technical bet)
          </h2>
          <p className="text-[var(--mist)] leading-relaxed">
            Unbound session Q&amp;A invents physics. A fluent sentence that cannot
            point at a channel window, note, or sector is worse than silence for
            performance users — and a liability in a debrief.
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            {PRODUCT} treats cites as first-class objects: retrieve evidence →
            generate only from that set → click a cite → lock playhead + paint an
            evidence band on the distance-domain traces and the circuit. Out of
            corpus → fail closed. The wedge is not “AI on telemetry”; it is{" "}
            <span className="text-[var(--chalk)]">
              evidence beside the traces
            </span>
            , with provenance you can audit in the chrome (OF1 vs OVL).
          </p>
        </section>

        {/* Session walk-through */}
        <section className="mt-10 space-y-4 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            What you can do in the session
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-[var(--mist)]">
            <li>Open the COTA session - LEC Soft flyer by default</li>
            <li>
              Use <span className="text-[var(--chalk)]">Lap</span> for the whole
              lap, or S1-S3 for sector focus; scrub the playhead
            </li>
            <li>
              Ask a grounded question {">"} claim + cites {">"} click a cite {">"}{" "}
              lock
            </li>
            <li>Switch drivers; Compare vs Soft flyer / Hard baseline</li>
          </ol>
          <div className="grid gap-2 sm:grid-cols-2">
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_brake_spike"
              label="Thermal · brake spike"
              hint="Playhead eases to synthetic 942°C peak on the real heavy zone"
            />
            <DemoChip
              href="/session?house=ferrari&q=How%20does%20Leclerc%20compare%20to%20Hamilton%3F&citeId=cite_teammate"
              label="Compare · LEC vs HAM"
              hint="Soft flyers −615 ms · same ST 319 — gap mostly S2"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_field_pace&q=Who%20was%20fastest%20in%20FP2%20in%20this%20pack%3F"
              label="Pace · field order"
              hint="LEC / ANT / VER Soft best-flyers from OpenF1"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_weather&q=Did%20the%20track%20cool%20during%20FP2%3F"
              label="Ops · track cools"
              hint="OpenF1 weather −3.3°C track across FP2"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_pit&q=When%20did%20Leclerc%20fit%20Softs%3F"
              label="Ops · Soft-fit pit"
              hint="Stint map laps 9–11 · pit on lap 9"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_radio&q=Any%20team%20radio%20for%20Leclerc%20in%20FP2%3F"
              label="Ops · team radio empty"
              hint="12 clips in pack · 0 for car 16 — honest silence"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_of1_ovl&q=What%20is%20OpenF1%20vs%20OVL%20in%20this%20pack%3F"
              label="Method · OF1 vs OVL"
              hint="Broadcast vs synthetic labels — the honesty pitch"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&q=Who%20is%20the%20championship%20leader%3F"
              label="Honest no-hit"
              hint="Championship standings - fail closed, no invented claim"
            />
          </div>
          <Button asChild>
            <Link href="/session?demo=1&house=ferrari">Open pit wall</Link>
          </Button>
        </section>

        {/* System shape */}
        <section className="mt-10 space-y-4 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">System shape</h2>
          <p className="text-[var(--mist)] leading-relaxed">
            One session pack, three stores, retrieve-then-generate. Cites are
            first-class objects - not chat footnotes. Workers AI only phrases
            answers from retrieved evidence.
          </p>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-x-2 sm:gap-y-2"
            role="img"
            aria-label="Samples, metadata, and notes retrieve evidence, Workers AI grounds a claim, then a cite locks the telemetry stage"
          >
            <FlowNode label="Samples" sub="car_data · overlays" />
            <FlowArrow />
            <FlowNode label="Metadata" sub="laps · weather · stints" />
            <FlowArrow />
            <FlowNode label="Notes" sub="events · debrief" />
            <FlowArrow />
            <FlowNode label="Retrieve" sub="QaMap + notes" accent />
            <FlowArrow />
            <FlowNode label="Workers AI" sub="grounded only" accent />
            <FlowArrow />
            <FlowNode label="Cite > stage" sub="playhead + band" accent />
          </div>
          <p className="font-mono text-[0.65rem] text-[var(--mute)]">
            {corpus.notes} notes · {corpus.events} events · {corpus.cites} cites ·{" "}
            {channels.length} channel docs
          </p>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Engineering judgment (what I chose and why)
          </h2>
          <ul className="list-disc space-y-2.5 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">
                Retrieve → generate → cite → stage lock
              </span>{" "}
              — QaMap + session notes are the retrieval layer; Workers AI is a
              phrasing step, not a knowledge store. No evidence → silence. That
              contract is what I would defend in a tools interview.
            </li>
            <li>
              <span className="text-[var(--chalk)]">
                OpenF1 subset + labeled ATLAS-shaped overlays
              </span>{" "}
              — real broadcast car_data, pits, weather, team radio for the field;
              synthetic brake temp / pressure, tyre surface, steering, long-g,
              fuel flow, oil, coolant where public feeds have no plant channel.
              OF1 vs OVL is painted in-product so a hiring manager never has to
              ask “is that real?”
            </li>
            <li>
              <span className="text-[var(--chalk)]">Distance-domain stage</span>{" "}
              — metres, not wall-clock only: whole-lap and S1–S3 focus, dual-car
              overlays, sector deltas, compound labels. Matches how engineers
              argue the lap.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Field + depth</span> — best
              flyer for all {corpus.drivers} cars; LEC Soft / Hard / long-run trio
              for compound narratives; house walk-ins for every 2026 team on the
              wall.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Ship path</span> — static
              session pack + Cloudflare Workers Assets + GitHub Actions
              push-to-prod; fetch/enrich scripts for regenerating the COTA pack
              without rewriting the UI.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Craft signals (read this as a résumé for the screen)
          </h2>
          <ul className="list-disc space-y-2.5 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">React / TypeScript</span> —
              dense pit-wall chrome, SVG waveforms, keyboard-focusable controls,
              URL-addressable Focus/Reference compares.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Multi-store literacy</span> —
              samples + session metadata + notes as one grounded corpus; cites
              resolve to windows, not chat footnotes.
            </li>
            <li>
              <span className="text-[var(--chalk)]">
                Polyglot delivery habit
              </span>{" "}
              — Cursor-first day-to-day on long-running C#/.NET field systems and
              Meridian; this slice proves the same ownership shape in modern
              React/TS edge deploy.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Provenance discipline</span> —
              OpenF1 vs synthetic overlay labeled; fail-closed when the window
              cannot support the claim; editorial kit marks only — no fake team
              affiliation.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Stack</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Next.js App Router",
              "TypeScript",
              "React 19",
              "Tailwind",
              "SVG stage / waveforms",
              "In-process QaMap",
              "Cloudflare Workers AI",
              "Workers Assets",
              "OpenF1 fetch + enrich",
              "Static COTA session pack",
              "GitHub Actions deploy",
            ].map((s) => (
              <span
                key={s}
                className="border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1 font-mono text-[0.65rem] text-[var(--mist)]"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Honesty last */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Data honesty</h2>
          <p className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 font-mono text-[0.75rem] text-[var(--signal)]">
            OPENF1 SUBSET · 2026 US GP FP2 (COTA) · synthetic ATLAS overlays · not
            SECU
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            Pack{" "}
            <code className="text-[var(--chalk)]">cota-2026-fp2.json</code> -
            {corpus.drivers} drivers (best flying lap) plus LEC Hard/Soft/long-run.
            Real OpenF1 car_data, location path, weather, stints, race control.
            Overlays:{" "}
            {(pack.meta.syntheticOverlayChannels ?? []).join(", ")}. Regen with{" "}
            <code className="text-[var(--chalk)]">npm run fetch:cota</code>. Not
            ATLAS software.
          </p>
          <h3 className="pt-2 font-display text-base font-semibold text-[var(--chalk)]">
            What we do not fake
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-[var(--mist)]">
            <li>Employment, offers, or partnerships with any team or vendor</li>
            <li>Live SECU, paddock RF, factory VPN, or real team channel maps</li>
            <li>
              A licence to use Formula 1, team, or driver marks commercially —
              liveries and helmets here are editorial demo context only
            </li>
            <li>
              Vendor Viewer UI clones or Automation / SQL Race credentials
            </li>
            <li>Kafka/Docker as a runtime dependency for this portfolio slice</li>
            <li>
              Full redistributed FastF1 caches, OpenF1 session dumps, or iRacing
              IBT samples
            </li>
          </ul>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--mute)]">
            {pack.meta.credits.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {pack.dataProvenance?.shapedLike.map((s) => (
              <li key={s}>Shaped like: {s}</li>
            ))}
            <li>
              Venue photographs: daytime Circuit of the Americas stills via
              Unsplash (Charlie Schroeder, Sai Kiran Belana) and Wikimedia
              Commons (Steve / mrlaugh — CC BY-SA 2.0 main straight) — used on
              landing, about, car stages, and session chrome
            </li>
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--hairline)] pt-8">
          <Button asChild>
            <Link href="/session?demo=1&house=ferrari">Open pit wall</Link>
          </Button>
          <Button asChild variant="rail">
            <Link href="/session?driver=LEC&lap=10&citeId=cite_brake_spike">
              Jump to cite lock
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Back to landing</Link>
          </Button>
        </div>
        <p className="mt-4 font-mono text-[0.62rem] text-[var(--mute)]">
          Built by {STUDIO} as an independent portfolio piece · {PRODUCT}
        </p>
      </article>

      <DisclaimerFooter />
    </main>
  );
}
