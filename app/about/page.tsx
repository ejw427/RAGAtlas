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
      →
    </span>
  );
}

export default function AboutPage() {
  const pack = getSessionPack();
  const corpus = corpusSummary();
  const channels = getChannels();
  const rates = corpus.ratesHz;
  const rateLabel = rates
    ? `${rates.high ?? "—"}/${rates.mid ?? "—"}/${rates.low ?? "—"} Hz`
    : "—";

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
            <Link href="/session?demo=1&house=ferrari">90s demo</Link>
          </Button>
        </div>
      </header>

      <div className="relative isolate h-40 overflow-hidden border-b border-[var(--hairline)] sm:h-52">
        <Image
          src="/cota-tower-dusk.jpg"
          alt="Circuit of the Americas observation tower at dusk"
          fill
          className="object-cover object-[center_40%]"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,7,10,0.35) 0%, rgba(5,7,10,0.88) 100%)",
          }}
        />
        <div className="relative z-[1] mx-auto flex h-full max-w-[800px] items-end px-6 pb-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--signal)]">
            Austin · Circuit of the Americas · 2026 FP2
          </p>
        </div>
      </div>

      <article className="mx-auto max-w-[800px] px-6 py-12">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--signal)]">
          {STUDIO} · Method
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {PRODUCT}: {METHOD_HEADLINE}
        </h1>
        <p className="mt-2 font-display text-lg text-[var(--chalk)]">{WEDGE}</p>
        <p className="mt-1 text-[var(--mist)]">{TAGLINE}</p>
        <p className="mt-4 text-[var(--mist)] leading-relaxed">
          {PRODUCT} is a {STUDIO} portfolio prototype: React/TypeScript craft for
          dense time-series workspaces, multi-store session literacy (samples +
          metadata + notes), and evidence-bound retrieval — not a chatbot toy.
          Independent work. Not affiliated with Formula 1 teams, commercial
          telemetry vendors, Formula 1, or the FIA.
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

        {/* 90-second demo */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            What this proves in 90 seconds
          </h2>
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
              Email / LinkedIn blurb · {AUTHOR}
            </p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--chalk)]">
              {EMAIL_BLURB}
            </p>
            <p className="mt-2 font-mono text-[0.62rem] text-[var(--signal)]">
              {LIVE_DEMO_URL.replace(/^https:\/\//, "")}
            </p>
          </div>
          <Button asChild size="sm" className="mt-2">
            <Link href="/session?demo=1&house=ferrari">Run the 90s demo</Link>
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
              value={`${corpus.lengthM?.toLocaleString() ?? "—"} m`}
            />
            <Stat label="Cites" value={String(corpus.cites)} />
          </div>
        </section>

        {/* Problem → product */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Problem → product
          </h2>
          <p className="text-[var(--mist)] leading-relaxed">
            Session Q&amp;A without grounding invents physics: a fluent answer
            that cannot point at a channel window, note, or sector is worse than
            silence for performance users.
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            {PRODUCT} binds every claim to a cite — then locks the playhead and
            paints an evidence band on the traces. Out-of-window questions
            fail closed. The wedge is not “AI on telemetry”; it is{" "}
            <span className="text-[var(--chalk)]">
              evidence beside the traces
            </span>
            .
          </p>
        </section>

        {/* 90s demo */}
        <section className="mt-10 space-y-4 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            What you can do in 90 seconds
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-[var(--mist)]">
            <li>Open the COTA session — LEC Soft flyer by default</li>
            <li>
              Use <span className="text-[var(--chalk)]">Lap</span> for the whole
              lap, or S1–S3 for sector focus; scrub the playhead
            </li>
            <li>Ask a grounded question → claim + cites → click a cite → lock</li>
            <li>Switch drivers; Compare vs Soft flyer / Hard baseline</li>
          </ol>
          <div className="grid gap-2 sm:grid-cols-2">
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_brake_spike"
              label="Cite lock · brake spike"
              hint="Playhead eases to synthetic 942°C peak on the real heavy zone"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_front_brake&q=Why%20is%20the%20front%20brake%20cooler%20than%20the%20rear%20on%20lap%2010%3F"
              label="Front vs rear"
              hint="Synthetic FL peaks at 688°C under the rear 942°C duct flag"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_pressure&q=Was%20the%20S3%20stop%20a%20late%20stab%20or%20a%20trail%3F"
              label="Trail, not a stab"
              hint="Brake pressure peaks at 71.7 bar while speed is still high"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_tyre&q=How%20hot%20was%20the%20Soft%20tyre%20through%20S2%3F"
              label="Soft tyre heat"
              hint="Synthetic FL tyre 128°C in S2 vs Hard 105°C"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_trap_st&q=What%20was%20the%20Soft%20speed%20trap%20vs%20Hard%3F"
              label="Speed trap +5"
              hint="OpenF1 ST 319 vs Hard 314 km/h"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&citeId=cite_delta_soft&q=Where%20did%20Soft%20gain%20vs%20the%20Hard%20push%3F"
              label="Soft vs Hard delta"
              hint="OpenF1 sector story — Soft flyer vs Hard push"
            />
            <DemoChip
              href="/session?driver=LEC&lap=7&citeId=cite_track_limits&q=Any%20track%20limits%20issues%20for%20Leclerc%3F"
              label="Track limits · T19"
              hint="Race-control grounded note from the FP2 session"
            />
            <DemoChip
              href="/session?driver=LEC&lap=10&q=Who%20is%20the%20championship%20leader%3F"
              label="Honest no-hit"
              hint="Championship standings — fail closed, no invented claim"
            />
          </div>
          <Button asChild>
            <Link href="/session?demo=1&house=ferrari">Run 90s demo</Link>
          </Button>
        </section>

        {/* System shape */}
        <section className="mt-10 space-y-4 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">System shape</h2>
          <p className="text-[var(--mist)] leading-relaxed">
            One session pack, three stores, one retrieval path. Cites are first-class
            objects — not chat footnotes.
          </p>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-x-2 sm:gap-y-2"
            role="img"
            aria-label="Samples, metadata, and notes feed a deterministic QaMap that produces a cite, which locks the telemetry stage"
          >
            <FlowNode label="Samples" sub="car_data · overlays" />
            <FlowArrow />
            <FlowNode label="Metadata" sub="laps · weather · stints" />
            <FlowArrow />
            <FlowNode label="Notes" sub="events · debrief" />
            <FlowArrow />
            <FlowNode label="QaMap" sub="deterministic" accent />
            <FlowArrow />
            <FlowNode label="Cite → stage" sub="playhead + band" accent />
          </div>
          <p className="font-mono text-[0.65rem] text-[var(--mute)]">
            {corpus.notes} notes · {corpus.events} events · {corpus.cites} cites ·{" "}
            {channels.length} channel docs
          </p>
        </section>

        {/* Engineering judgment */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Engineering judgment
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">Deterministic QaMap</span> —
              the money-shot demo never flakes; honesty over LLM theater for a
              portfolio walkthrough.
            </li>
            <li>
              <span className="text-[var(--chalk)]">
                OpenF1 subset + labeled overlays
              </span>{" "}
              — real broadcast car_data, pits, weather series, and team radio
              for the field; synthetic rear/front brake temp, brake pressure,
              tyre surface, steering, long-g, fuel flow, oil, and coolant where
              public feeds have no ATLAS-class plant channels — provenance is
              explicit in the chrome.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Distance-domain stage</span>{" "}
              — whole-lap and sector focus, playhead scrub, compare overlays;
              matches how engineers argue about the lap.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Field + depth</span> — best
              flyer for all {corpus.drivers} cars; LEC Hard / Soft / long-run
              trio for Soft-vs-Hard narrative depth.
            </li>
          </ul>
        </section>

        {/* Craft signals */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Craft signals</h2>
          <ul className="list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">React / TypeScript UX</span>{" "}
              — dense pit-wall chrome, SVG waveforms, keyboard-focusable controls.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Multi-store literacy</span>{" "}
              — samples, session metadata, and notes as one grounded corpus.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Telemetry vocabulary</span>{" "}
              — session, lap, channel, compare, notes, events — shaped like public
              ATLAS docs without cloning vendor UI.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Provenance labeling</span> —
              OpenF1 vs synthetic overlay called out in-product; fail-closed when
              the window cannot support the claim.
            </li>
          </ul>
        </section>

        {/* Stack */}
        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Stack</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Next.js App Router",
              "TypeScript",
              "Tailwind",
              "SVG stage",
              "In-process QaMap",
              "OpenF1 fetch script",
              "Static session pack",
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
            <code className="text-[var(--chalk)]">cota-2026-fp2.json</code> —
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
              Vendor Viewer UI clones, logos, or Automation / SQL Race credentials
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
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--hairline)] pt-8">
          <Button asChild>
            <Link href="/session?demo=1&house=ferrari">Run 90s demo</Link>
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
