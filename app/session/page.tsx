import { Suspense } from "react";
import { SessionShell } from "@/components/session/SessionShell";

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-mist/60">
          Loading session…
        </div>
      }
    >
      <SessionShell />
    </Suspense>
  );
}
