import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { getSessionPack } from "@/lib/session";

export default function AboutPage() {
  const pack = getSessionPack();

  return (
    <main className="min-h-dvh bg-[var(--void)]">
      <header className="border-b border-[var(--hairline)] bg-[var(--panel)] px-6 py-4">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight"
          >
            RAG<span className="text-[var(--signal)]">Atlas</span>
          </Link>
          <Button asChild size="sm">
            <Link href="/session?lap=12">Open session</Link>
          </Button>
        </div>
      </header>

      <article className="mx-auto max-w-[800px] px-6 py-12">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--signal)]">
          Method
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Knowledge layer beside the traces
        </h1>
        <p className="mt-4 text-[var(--mist)] leading-relaxed">
          RAGAtlas is a skunkworks portfolio prototype steered toward two public
          job briefs:{" "}
          <strong className="font-medium text-[var(--chalk)]">
            Lead Software Engineer — Performance Technology
          </strong>{" "}
          (Williams Racing JD, Grove — expired vacancy used as target) and{" "}
          <strong className="font-medium text-[var(--chalk)]">
            Field Application Engineer — Software
          </strong>{" "}
          (Motion Applied / ATLAS ecosystem). It shows React/TypeScript craft,
          time-series workspace UX, and evidence-bound session retrieval — not a
          chatbot toy. Independent work — not affiliated with Williams Racing,
          Motion Applied, Formula 1, or the FIA.
        </p>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">What you are seeing</h2>
          <ul className="list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>
              <span className="text-[var(--chalk)]">Live-style dashboard</span> —
              lap/sector chrome, multi-channel waveforms, playhead scrub, circuit
              schematic, compare overlay (Speed vs L11), debrief timeline.
            </li>
            <li>
              <span className="text-[var(--chalk)]">Session RAG</span> —
              deterministic QaMap over notes, channel docs, and cite windows;
              cite click locks the telemetry stage (pulse → ease → cyan band).
            </li>
            <li>
              <span className="text-[var(--chalk)]">Fail closed</span> — out-of-window
              questions (e.g. championship standings) return an honest no-hit.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">
            Hiring-manager framing
          </h2>
          <p className="text-[var(--mist)] leading-relaxed">
            <span className="text-[var(--chalk)]">Williams Lead (Perf Tech):</span>{" "}
            architecture clarity, React/TS density, multi-store literacy
            (time-series samples + session metadata + document notes), and
            performance-user empathy — citations scrub the plot for Aero / VD /
            Vehicle Performance–style questions.
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            <span className="text-[var(--chalk)]">Motion Applied FAE Software:</span>{" "}
            ATLAS-shaped vocabulary (session, lap, channel, compare, notes), a
            teachable 90s demo, and a knowledge-base corpus engineers wish
            customers had. Pipeline language (Kafka → SQL Race / Parquet →
            Viewer) appears only as industry pattern — not a live bus in this
            app.
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            Shared wedge:{" "}
            <span className="text-[var(--chalk)]">
              evidence-bound session RAG beside ATLAS-class telemetry
            </span>
            . Waveforms alone are table stakes.
          </p>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">What we do not fake</h2>
          <ul className="list-disc space-y-2 pl-5 text-[var(--mist)]">
            <li>Williams / Motion Applied employment, offers, or partnerships</li>
            <li>Live SECU, paddock RF, factory VPN, or real team channel maps</li>
            <li>ATLAS Viewer UI clone, logos, Automation API / SQL Race credentials</li>
            <li>Kafka/Docker as a runtime dependency for this portfolio slice</li>
            <li>Redistributed FastF1 caches, OpenF1 session dumps, or iRacing IBT samples</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Data honesty</h2>
          <p className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3 font-mono text-[0.75rem] text-[var(--signal)]">
            SYNTHETIC DATA · shaped like public timing schemas · not live F1
          </p>
          <p className="text-[var(--mist)] leading-relaxed">
            Fixtures ship as static JSON under{" "}
            <code className="text-[var(--chalk)]">data/mock/</code>. Plot trio:{" "}
            <code className="text-[var(--chalk)]">brake_temp</code> (synthetic
            ATLAS-like), <code className="text-[var(--chalk)]">throttle</code> /{" "}
            <code className="text-[var(--chalk)]">speed</code> (OpenF1/FastF1-shaped).
            Bahrain GP length <strong className="text-[var(--chalk)]">5412 m</strong>;
            sector bounds <code className="text-[var(--chalk)]">[0, 1850, 3050, 5412]</code>{" "}
            so ~3120 m sits in S3. Samples are original synthetic series — not
            copyrighted dumps. Session concepts inspired by{" "}
            <span className="text-[var(--chalk)]">public ATLAS documentation</span>;
            this is not ATLAS software.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--mute)]">
            {pack.meta.credits.map((c) => (
              <li key={c}>{c}</li>
            ))}
            {pack.dataProvenance?.shapedLike.map((s) => (
              <li key={s}>Shaped like: {s}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">Stack</h2>
          <p className="text-[var(--mist)]">
            Next.js App Router · TypeScript · Tailwind · shadcn/ui primitives
            (Button, Input, Sheet) restyled to Carbon Pit Wall tokens · Oxanium /
            Sora / IBM Plex Mono · inline SVG traces & schematic · in-process
            QaMap (no API keys).
          </p>
        </section>

        <section className="mt-10 space-y-3 border-t border-[var(--hairline)] pt-8">
          <h2 className="font-display text-xl font-semibold">90s demo spine</h2>
          <ol className="list-decimal space-y-2 pl-5 text-[var(--mist)]">
            <li>Land on the hero → Open session</li>
            <li>Trace draw-on; scrub toward S3</li>
            <li>
              Ask: <em>Why did brake temp spike in S3 on lap 12?</em>
            </li>
            <li>Claim + two cites → click cite → playhead locks on 942°C</li>
          </ol>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/session?lap=12&citeId=cite_brake_spike">
              Jump to cite lock
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Back to landing</Link>
          </Button>
        </div>
      </article>

      <DisclaimerFooter />
    </main>
  );
}
