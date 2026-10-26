import Link from "next/link";

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
          Independent portfolio prototype. Not affiliated with Williams Racing,
          Motion Applied, Formula 1, or the FIA. Synthetic session fixtures
          shaped like public timing schemas · No live motorsport feeds ·
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
