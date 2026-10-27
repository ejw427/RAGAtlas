"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CiteChip } from "@/components/session/CiteChip";
import { answerQuery, seedQueries } from "@/lib/rag";
import { DEMO_ASK, DEMO_NO_HIT } from "@/lib/brand";
import type { CiteTarget, RagAnswer } from "@/lib/types";
import { prefersReducedMotion } from "@/lib/motion";

const EMPTY: RagAnswer = {
  status: "empty",
  query: "",
  cites: [],
  message: "Run a query to bind an answer to this lap window.",
};

export function RagRail({
  selectedCiteId,
  pulsingCiteId,
  onCite,
  initialQuery,
  autoAsk = false,
  askTrigger,
  emphasizeCites = false,
  compact = false,
}: {
  selectedCiteId: string | null;
  pulsingCiteId: string | null;
  onCite: (cite: CiteTarget) => void;
  initialQuery?: string;
  autoAsk?: boolean;
  /** Increment to force a new ask (demo step). */
  askTrigger?: { query: string; nonce: number } | null;
  emphasizeCites?: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery ?? DEMO_ASK);
  const [answer, setAnswer] = useState<RagAnswer>(EMPTY);
  const seeds = seedQueries();
  const autoAsked = useRef(false);
  const lastTrigger = useRef(0);

  const submit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setAnswer(EMPTY);
      return;
    }
    setAnswer({
      status: "loading",
      query: trimmed,
      cites: [],
      message: "Matching QaMap patterns (deterministic)…",
    });
    const delay = prefersReducedMotion() ? 40 : 280;
    await new Promise((r) => setTimeout(r, delay));
    setAnswer(answerQuery(trimmed));
  };

  useEffect(() => {
    if (!autoAsk || !initialQuery?.trim() || autoAsked.current) return;
    autoAsked.current = true;
    const t = window.setTimeout(() => void submit(initialQuery), 200);
    return () => window.clearTimeout(t);
  }, [autoAsk, initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!askTrigger?.query || askTrigger.nonce === lastTrigger.current) return;
    lastTrigger.current = askTrigger.nonce;
    setQuery(askTrigger.query);
    void submit(askTrigger.query);
  }, [askTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside
      className={
        compact
          ? "flex h-full min-h-0 flex-col gap-2.5 overflow-auto bg-[var(--rail)] p-2.5"
          : "flex h-full min-h-0 flex-col gap-3 overflow-auto bg-[var(--rail)] p-3 md:border-l md:border-[var(--hairline)]"
      }
    >
      <div>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Ask the session
        </p>
        <p className="mt-1 rounded-sm border border-[var(--signal)]/25 bg-[var(--signal-dim)] px-2 py-1 font-mono text-[0.58rem] leading-snug text-[var(--signal)]">
          Deterministic QaMap · fail closed — not an LLM
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(query);
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={DEMO_ASK}
          aria-label="Session query"
          className="min-w-0 flex-1 text-[0.8rem]"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Ask
        </Button>
      </form>

      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-auto">
        {seeds.slice(0, compact ? 4 : seeds.length).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              void submit(s);
            }}
            title={s}
            className="border border-[var(--hairline)] px-2 py-1 text-left font-mono text-[0.58rem] text-[var(--mute)] hover:border-[var(--hairline-strong)] hover:text-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {s.length > 48 ? `${s.slice(0, 46)}…` : s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setQuery(DEMO_NO_HIT);
            void submit(DEMO_NO_HIT);
          }}
          className="border border-[var(--warn)]/35 px-2 py-1 font-mono text-[0.58rem] text-[var(--warn)] hover:bg-[var(--warn)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          No-hit probe
        </button>
      </div>

      <div className="min-h-[6rem] border-t border-[var(--hairline)] pt-3">
        {answer.status === "empty" && (
          <div className="space-y-2">
            <p className="text-[0.78rem] leading-snug text-[var(--mist)]">
              {answer.message}
            </p>
            <ol className="list-decimal space-y-1 pl-4 font-mono text-[0.62rem] text-[var(--mute)]">
              <li>Ask the money-shot (or tap a seed)</li>
              <li>Click an Evidence cite</li>
              <li>Playhead locks on the band</li>
            </ol>
          </div>
        )}
        {answer.status === "loading" && (
          <p className="font-mono text-[0.75rem] text-[var(--trace-cyan)]">
            {answer.message}
          </p>
        )}
        {answer.status === "no-hit" && (
          <p className="text-[0.8rem] text-[var(--warn)]">{answer.message}</p>
        )}
        {answer.status === "error" && (
          <p className="text-[0.8rem] text-[var(--fault)]">{answer.message}</p>
        )}
        {answer.status === "hit" && (
          <div className="space-y-3">
            <p className="text-[0.82rem] leading-relaxed text-[var(--chalk)]">
              {answer.claim}
            </p>
            {answer.rationale && (
              <p className="text-[0.72rem] text-[var(--mist)]">
                {answer.rationale}
              </p>
            )}
            <div className="space-y-1.5">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--mute)]">
                Evidence · click to lock playhead
              </p>
              {answer.cites.map((cite, i) => (
                <CiteChip
                  key={cite.id}
                  cite={cite}
                  selected={selectedCiteId === cite.id}
                  pulsing={pulsingCiteId === cite.id}
                  emphasize={emphasizeCites && i === 0}
                  onSelect={onCite}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-auto text-[0.62rem] leading-snug text-[var(--mute)]">
        Pattern map over notes & channel docs — silence when the session cannot
        support the claim. Method: /about
      </p>
    </aside>
  );
}
