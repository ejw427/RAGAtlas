"use client";

import type { ReactNode } from "react";
import { dossierFor, ageFromBorn, bornYear } from "@/lib/driver-dossier";
import { HelmetMark } from "@/components/identity/HelmetMark";
import { accentFor } from "@/lib/identity";
import { getTrackPackage } from "@/lib/session";
import type { Driver } from "@/lib/types";

/**
 * Public career / kit dossier for the racer card.
 * Wikipedia + F1 link-outs only. No private-life or gossip fields.
 */
export function RacerDossier({ driver }: { driver: Driver }) {
  const dossier = dossierFor(driver);
  const accent = accentFor(driver);
  const trackPkg = getTrackPackage();
  if (!dossier) return null;

  const age = ageFromBorn(dossier.born);
  const year = bornYear(dossier);

  return (
    <section className="space-y-3" aria-label="Public racer dossier">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
          Public dossier · career & kit
        </p>
        <p className="font-mono text-[0.45rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Not private life
        </p>
      </div>

      <p className="text-[0.85rem] leading-relaxed text-[var(--mist)]">
        {dossier.summary}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Chip label={dossier.nationality} />
        {year && (
          <Chip label={age != null ? `b. ${year} · ${age}` : `b. ${year}`} />
        )}
        {dossier.birthplace && <Chip label={dossier.birthplace} />}
        {dossier.debut && <Chip label={`Debut ${dossier.debut}`} />}
      </div>

      {dossier.highlights && (
        <p className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2 font-mono text-[0.65rem] leading-relaxed text-[var(--chalk)]">
          {dossier.highlights}
        </p>
      )}

      <div className="grid gap-2">
        <KitRow
          title="Helmet"
          body={dossier.helmet}
          mark={
            <HelmetMark
              driver={driver}
              number={driver.number}
              accent={accent.accent}
              second={accent.second}
              size={56}
              track={trackPkg}
            />
          }
        />
        <KitRow title="Suit" body={dossier.suit} />
        {dossier.livery && (
          <KitRow title="Livery note" body={dossier.livery} />
        )}
      </div>

      {dossier.links.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            Link out · public sources
          </p>
          <div className="flex flex-wrap gap-2">
            {dossier.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-[var(--trace-cyan)]/40 bg-[rgba(58,215,255,0.08)] px-2.5 py-1.5 font-mono text-[0.65rem] font-semibold text-[var(--trace-cyan)] transition hover:border-[var(--signal)] hover:text-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {dossier.news && dossier.news.length > 0 && (
        <div className="border-t border-[var(--hairline)] pt-3">
          <p className="mb-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--mute)]">
            Related news
          </p>
          <ul className="space-y-1.5">
            {dossier.news.map((item) => (
              <li key={`${item.href}-${item.title}`}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-2 transition hover:border-[var(--signal)]/45 hover:bg-[var(--rail)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <p className="text-[0.78rem] font-semibold leading-snug text-[var(--chalk)]">
                    {item.title}
                  </p>
                  <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mute)]">
                    {item.source}
                    {item.date ? ` · ${item.date}` : ""}
                    {" · "}
                    <span className="text-[var(--trace-cyan)]">Open ↗</span>
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-sm border border-[var(--hairline)] bg-[var(--panel)] px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--mist)]">
      {label}
    </span>
  );
}

function KitRow({
  title,
  body,
  mark,
}: {
  title: string;
  body: string;
  mark?: ReactNode;
}) {
  return (
    <div className="flex gap-2.5 rounded-md border border-[var(--hairline)] bg-[rgba(5,7,10,0.45)] px-2.5 py-2">
      {mark && <div className="shrink-0 pt-0.5">{mark}</div>}
      <div className="min-w-0">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[var(--signal)]">
          {title}
        </p>
        <p className="mt-0.5 text-[0.72rem] leading-relaxed text-[var(--mist)]">
          {body}
        </p>
      </div>
    </div>
  );
}
