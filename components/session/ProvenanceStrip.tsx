"use client";

import { useState } from "react";
import Link from "next/link";
import { getSessionPack } from "@/lib/session";
import { cn } from "@/lib/utils";

export function ProvenanceStrip() {
  const pack = getSessionPack();
  const [open, setOpen] = useState(false);
  const prov = pack.dataProvenance;
  const rates = pack.meta.ratesHz;
  const openf1 = prov?.openf1;
  const fetched = prov?.fetchedAt
    ? new Date(prov.fetchedAt).toISOString().slice(0, 10)
    : null;

  return (
    <div className="border border-[var(--hairline)] bg-[var(--panel)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        aria-expanded={open}
      >
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mute)]">
          Provenance
        </span>
        <span className="font-mono text-[0.55rem] text-[var(--mist)]">
          {fetched ? `fetched ${fetched}` : "pack"} ·{" "}
          {rates
            ? `${rates.high ?? "—"}/${rates.mid ?? "—"}/${rates.low ?? "—"} Hz`
            : "rates n/a"}{" "}
          · {open ? "−" : "+"}
        </span>
      </button>
      <div
        className={cn(
          "space-y-1.5 border-t border-[var(--hairline)] px-2 pb-2 pt-1.5 font-mono text-[0.58rem] leading-snug text-[var(--mist)]",
          !open && "hidden",
        )}
      >
        <p>
          <span className="text-[var(--chalk)]">OF1</span> broadcast car_data ·{" "}
          <span className="text-[var(--trace-amber)]">OVL</span> synthetic
          ATLAS-shaped plant channels where public feeds have none.
        </p>
        {openf1 && (
          <p className="text-[var(--mute)]">
            meeting {openf1.meeting_key} · session {openf1.session_key}
            {openf1.primary_driver_number != null
              ? ` · primary #${openf1.primary_driver_number}`
              : ""}
          </p>
        )}
        {prov?.fetchedFrom && (
          <p className="truncate text-[var(--mute)]" title={prov.fetchedFrom}>
            {prov.fetchedFrom}
          </p>
        )}
        <p className="text-[var(--mute)]">
          Pack rates are demo density — not ATLAS SECU sample rates.{" "}
          <Link href="/about" className="text-[var(--trace-cyan)]">
            Method
          </Link>
        </p>
      </div>
    </div>
  );
}
