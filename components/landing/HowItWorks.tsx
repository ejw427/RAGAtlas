import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarSilhouette } from "@/components/identity/CarSilhouette";
import { CarStage } from "@/components/identity/CarStage";
import {
  DEMO_ASK,
  LIVE_URL,
  METHOD_HEADLINE,
  PORTFOLIO_URL,
  PRODUCT,
  TAGLINE,
  WEDGE,
} from "@/lib/brand";
import { TEAM_ACCENTS } from "@/lib/identity";
import { corpusSummary } from "@/lib/rag";

const STEPS = [
  {
    n: "01",
    title: "Ask the lap",
    body: "Query the COTA pack — thermal, pace, weather, pits, race control, teammate gap, OF1 vs OVL — not the open web.",
    mark: "Thermal · Pace · Ops · Compare",
  },
  {
    n: "02",
    title: "Get a cite",
    body: "Every claim binds to evidence chips. Retrieve first, then Workers AI phrases only from cites — no match > fail closed.",
    mark: "S3 brake · Soft flyer",
  },
  {
    n: "03",
    title: "Lock the trace",
    body: "Click a cite > playhead and evidence band lock on the waveforms. Walk a hiring manager through what you can prove.",
    mark: "Playhead + band",
  },
] as const;

const CHIPS = [
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_brake_spike",
    label: "Thermal · stadium brake",
    hint: "942°C peak · S3 heavy",
  },
  {
    href: "/session?house=ferrari&q=How%20does%20Leclerc%20compare%20to%20Hamilton%3F&citeId=cite_teammate",
    label: "Compare · LEC vs HAM",
    hint: "−615 ms Soft flyers",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_weather&q=Did%20the%20track%20cool%20during%20FP2%3F",
    label: "Ops · track cools",
    hint: "OpenF1 weather −3.3°C",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_radio&q=Any%20team%20radio%20for%20Leclerc%20in%20FP2%3F",
    label: "Ops · radio empty",
    hint: "0/12 clips for LEC",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_of1_ovl&q=What%20is%20OpenF1%20vs%20OVL%20in%20this%20pack%3F",
    label: "Method · OF1 vs OVL",
    hint: "Labeled sources",
  },
  {
    href: "/session?driver=LEC&lap=10&q=Who%20is%20the%20championship%20leader%3F",
    label: "Honest no-hit",
    hint: "Fail closed",
  },
] as const;

export function HowItWorks() {
  const corpus = corpusSummary();
  const rates = corpus.ratesHz;
  const rateLabel = rates
    ? `${rates.high ?? "-"}/${rates.mid ?? "-"}/${rates.low ?? "-"} Hz`
    : "-";

  return (
    <section
      id="how-it-works"
      className="scroll-mt-8 border-t border-[var(--hairline)] bg-[var(--asphalt)]"
    >
      <div className="relative isolate overflow-hidden border-b border-[var(--hairline)]">
        <div className="absolute inset-0">
          <Image
            src="/cota-pitwall.jpg"
            alt="Race engineers at a pit-wall telemetry booth overlooking a floodlit Circuit of the Americas session"
            fill
            className="object-cover object-[center_30%] opacity-45"
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,15,20,0.55) 0%, rgba(11,15,20,0.92) 100%), linear-gradient(90deg, rgba(5,7,10,0.85) 0%, rgba(5,7,10,0.35) 60%, rgba(5,7,10,0.75) 100%)",
            }}
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-[1120px] px-6 py-12 sm:py-14">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--signal)]">
            How grounding works · pit wall
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-[var(--chalk)] sm:text-3xl">
            {METHOD_HEADLINE}
          </h2>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-[var(--mist)]">
            {WEDGE} {TAGLINE} Demo it like a race team debrief - COTA asphalt,
            locked cites, honest provenance.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-14 sm:py-16">
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="border-t border-[var(--hairline-strong)] pt-4"
            >
              <p className="font-mono text-[0.6rem] tracking-[0.14em] text-[var(--mute)]">
                {step.n}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-[var(--chalk)]">
                {step.title}
              </p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--mist)]">
                {step.body}
              </p>
              <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--signal)]">
                {step.mark}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-6 border-t border-[var(--hairline)] pt-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
              Live corpus · {corpus.yearHint} {corpus.sessionLabel} · Austin
            </p>
            <p className="mt-1 font-mono text-[0.7rem] text-[var(--mist)]">
              {corpus.drivers} drivers · {corpus.channelParams} channels (
              {corpus.openf1Channels} OF1 / {corpus.overlayChannels} OVL) ·{" "}
              {corpus.cites} cites · {rateLabel} pack rates
            </p>
            <div className="mt-4 max-w-sm">
              <CarStage track="cota">
                <CarSilhouette
                  accent={TEAM_ACCENTS.Ferrari.accent}
                  second={TEAM_ACCENTS.Ferrari.second}
                  number={16}
                  compoundLetter="S"
                  width={260}
                  track="cota"
                  showPackageChip
                />
              </CarStage>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/session?demo=1&house=ferrari">Run 90s demo</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/about">Full method</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
            90-second demos · money shot: {DEMO_ASK}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CHIPS.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2.5 transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--rail)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <p className="font-mono text-[0.72rem] text-[var(--chalk)]">
                  {chip.label}
                </p>
                <p className="mt-0.5 font-mono text-[0.58rem] text-[var(--mute)]">
                  {chip.hint}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 font-mono text-[0.6rem] text-[var(--mute)]">
          {PRODUCT} ·{" "}
          <a
            href={LIVE_URL}
            className="text-[var(--trace-cyan)] hover:text-[var(--signal)]"
          >
            {LIVE_URL.replace(/^https:\/\//, "")}
          </a>
          {" · "}
          <a
            href={PORTFOLIO_URL}
            className="text-[var(--trace-cyan)] hover:text-[var(--signal)]"
          >
            Portfolio card
          </a>
        </p>
      </div>
    </section>
  );
}
