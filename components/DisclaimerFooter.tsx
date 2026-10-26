import Link from "next/link";
import { PRODUCT, STUDIO } from "@/lib/brand";

export function DisclaimerFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={
        compact
          ? "border-t border-[var(--hairline)] px-4 py-2 text-[0.65rem] text-[var(--mute)]"
          : "border-t border-[var(--hairline)] px-6 py-8 text-sm text-[var(--mute)]"
      }
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="text-[var(--chalk)]">{STUDIO}</span> · {PRODUCT} —
          independent portfolio prototype. Not affiliated with Formula 1 teams,
          commercial telemetry vendors, Formula 1, or the FIA. 2026 COTA OpenF1
          subset + synthetic ATLAS-style overlays · No SECU / team feeds ·
          Concepts inspired by public ATLAS documentation.
        </p>
        {!compact && (
          <Link
            href="/about"
            className="shrink-0 text-[var(--trace-cyan)] hover:text-[var(--signal)]"
          >
            Method & credits
          </Link>
        )}
      </div>
    </footer>
  );
}
