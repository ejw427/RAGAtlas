import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DEMO_ASK,
  LIVE_URL,
  METHOD_HEADLINE,
  PORTFOLIO_URL,
  PRODUCT,
  TAGLINE,
  WEDGE,
} from "@/lib/brand";
import { corpusSummary } from "@/lib/rag";

const STEPS = [
  {
    n: "01",
    title: "Ask the lap",
    body: "Query the session pack — notes, channel docs, and distance windows — not the open web.",
  },
  {
    n: "02",
    title: "Get a cite",
    body: "Every claim binds to evidence chips. No match → fail closed. Deterministic QaMap, not an LLM.",
  },
  {
    n: "03",
    title: "Lock the trace",
    body: "Click a cite → playhead and evidence band lock on the waveforms. Trust what you can see.",
  },
] as const;

const CHIPS = [
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_brake_spike",
    label: "Cite lock · brake spike",
    hint: "942°C peak · S3 heavy",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_front_brake&q=Why%20is%20the%20front%20brake%20cooler%20than%20the%20rear%20on%20lap%2010%3F",
    label: "Front vs rear",
    hint: "Duct story · OVL",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_pressure&q=Was%20the%20S3%20stop%20a%20late%20stab%20or%20a%20trail%3F",
    label: "Trail, not a stab",
    hint: "Brake pressure shape",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_tyre&q=How%20hot%20was%20the%20Soft%20tyre%20through%20S2%3F",
    label: "Soft tyre heat",
    hint: "OVL surface temp",
  },
  {
    href: "/session?driver=LEC&lap=10&citeId=cite_trap_st&q=What%20was%20the%20Soft%20speed%20trap%20vs%20Hard%3F",
    label: "Speed trap +5",
    hint: "OpenF1 ST",
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
    ? `${rates.high ?? "—"}/${rates.mid ?? "—"}/${rates.low ?? "—"} Hz`
    : "—";

  return (
    <section
      id="how-it-works"
      className="scroll-mt-8 border-t border-[var(--hairline)] bg-[var(--asphalt)]"
    >
      <div className="mx-auto max-w-[1120px] px-6 py-14 sm:py-16">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--signal)]">
          How grounding works
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight text-[var(--chalk)] sm:text-3xl">
          {METHOD_HEADLINE}
        </h2>
        <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-[var(--mist)]">
          {WEDGE} {TAGLINE}
        </p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-[var(--hairline-strong)] pt-4">
              <p className="font-mono text-[0.6rem] tracking-[0.14em] text-[var(--mute)]">
                {step.n}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-[var(--chalk)]">
                {step.title}
              </p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--mist)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--hairline)] pt-8">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mute)]">
              Live corpus · {corpus.yearHint} {corpus.sessionLabel}
            </p>
            <p className="mt-1 font-mono text-[0.7rem] text-[var(--mist)]">
              {corpus.drivers} drivers · {corpus.channelParams} channels (
              {corpus.openf1Channels} OF1 / {corpus.overlayChannels} OVL) ·{" "}
              {corpus.cites} cites · {rateLabel} pack rates
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/session?driver=LEC&lap=10">Open session</Link>
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
