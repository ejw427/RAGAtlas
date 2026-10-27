import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarLivery } from "@/components/identity/CarLivery";
import { CarStage } from "@/components/identity/CarStage";
import { CotaCircuitMap } from "@/components/landing/CotaCircuitMap";
import { PRODUCT, STUDIO } from "@/lib/brand";
import { TEAM_ACCENTS } from "@/lib/identity";
import { VENUE_PHOTOS } from "@/lib/venue-photos";

const BEATS = [
  {
    kicker: "T1 climb",
    title: "Where the weekend starts",
    body: "Uphill commitment, crest speed, and the first brake event your garage will argue about all weekend.",
  },
  {
    kicker: "Stadium S3",
    title: "Where brakes get loud",
    body: "Heavy stops into the amphitheater - the money-shot cite for thermal overlays and pressure shape.",
  },
  {
    kicker: "Austin base",
    title: "Built where the US GP lives",
    body: `${STUDIO} ships ${PRODUCT} on real 2026 COTA FP2 telemetry so the demo language matches the track you race.`,
  },
] as const;

export function AustinVenue() {
  return (
    <section
      id="austin"
      className="scroll-mt-8 border-t border-[var(--hairline)] bg-[var(--void)]"
    >
      <div className="relative isolate min-h-[min(72vw,420px)] overflow-hidden">
        <Image
          src={VENUE_PHOTOS.tower}
          alt="Circuit of the Americas observation tower and star-spangled runoff in daylight"
          fill
          className="object-cover object-[center_28%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,7,10,0.7) 0%, rgba(5,7,10,0.22) 55%, rgba(5,7,10,0.08) 100%), linear-gradient(0deg, rgba(5,7,10,0.65) 0%, rgba(5,7,10,0.05) 60%, rgba(5,7,10,0.12) 100%)",
          }}
        />
        <div className="relative z-[1] mx-auto flex min-h-[min(72vw,420px)] max-w-[1120px] flex-col justify-end px-6 pb-12 pt-24">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--signal)]">
            Austin · Circuit of the Americas
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.05] tracking-tight text-[var(--chalk)]">
            The venue your engineers already know.
          </h2>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-[var(--mist)]">
            Observation tower. T1 hill. Stadium section. CiteTrace is a
            performance-engineering workspace demo grounded in the US Grand Prix
            circuit - not a generic telemetry toy.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-12 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-3">
          {BEATS.map((b) => (
            <div key={b.kicker} className="border-t border-[var(--hairline-strong)] pt-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                {b.kicker}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-[var(--chalk)]">
                {b.title}
              </p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--mist)]">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <CotaCircuitMap />
        </div>

        <div className="relative mt-12 isolate min-h-[240px] overflow-hidden border border-[var(--hairline)] sm:min-h-[280px]">
          <Image
            src={VENUE_PHOTOS.track}
            alt="Daytime Circuit of the Americas — race car on the red-white-blue runoff under clear sky"
            fill
            className="object-cover object-[center_40%]"
            sizes="(max-width: 1120px) 100vw, 1120px"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,7,10,0.72) 0%, rgba(5,7,10,0.22) 58%, rgba(5,7,10,0.35) 100%)",
            }}
          />
          <div className="relative z-[1] flex h-full min-h-[240px] flex-col justify-end p-6 sm:min-h-[280px] sm:p-8">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--signal)]">
              Home circuit · daylight
            </p>
            <p className="mt-2 max-w-lg font-display text-xl font-semibold tracking-tight text-[var(--chalk)] sm:text-2xl">
              Sell the craft on the track that defines the US GP weekend.
            </p>
            <p className="mt-2 max-w-md text-[0.85rem] leading-relaxed text-[var(--mist)]">
              Open the COTA FP2 pack, lock a cite on the stadium stop, and walk a
              race team through evidence beside the traces.
            </p>
            <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              <CarStage track="cota" className="border-[var(--hairline-strong)]">
                <div className="flex w-full flex-col gap-1">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--signal)]">
                    P1 · LEC Soft flyer
                  </span>
                  <CarLivery
                    accent={TEAM_ACCENTS.Ferrari}
                    number={16}
                    compoundLetter="S"
                    width={260}
                    track="cota"
                  />
                </div>
              </CarStage>
              <CarStage track="cota" className="border-[var(--hairline-strong)]">
                <div className="flex w-full flex-col gap-1">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
                    P2 · ANT Soft flyer
                  </span>
                  <CarLivery
                    accent={TEAM_ACCENTS.Mercedes}
                    number={12}
                    compoundLetter="S"
                    width={260}
                    track="cota"
                  />
                </div>
              </CarStage>
            </div>
            <div className="mt-5">
              <Button asChild>
                <Link href="/session?demo=1&house=ferrari">
                  Open COTA session
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
