import Link from "next/link";
import { LIVE_URL, PORTFOLIO_URL, PRODUCT, STUDIO } from "@/lib/brand";

export function DisclaimerFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={
        compact
          ? "border-t border-[var(--hairline)] px-4 py-2 text-[0.65rem] text-[var(--mute)]"
          : "border-t border-[var(--hairline)] px-6 py-8 text-sm text-[var(--mute)]"
      }
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p>
          <span className="text-[var(--chalk)]">{STUDIO}</span> · {PRODUCT} —
          independent portfolio prototype. Not affiliated with Formula 1 teams,
          commercial telemetry vendors, Formula 1, or the FIA. 2026 COTA OpenF1
          subset + synthetic ATLAS-style overlays · No SECU / team feeds ·
          Concepts inspired by public ATLAS documentation.
        </p>
        <div className="flex shrink-0 flex-col gap-1 font-mono text-[0.7rem] sm:items-end">
          <a
            href={LIVE_URL}
            className="text-[var(--trace-cyan)] hover:text-[var(--signal)]"
          >
            {LIVE_URL.replace(/^https:\/\//, "")}
          </a>
          <a
            href={PORTFOLIO_URL}
            className="text-[var(--trace-cyan)] hover:text-[var(--signal)]"
          >
            Portfolio card
          </a>
          {!compact && (
            <Link
              href="/about"
              className="text-[var(--trace-cyan)] hover:text-[var(--signal)]"
            >
              Method & credits
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
