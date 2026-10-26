import { SessionShell } from "@/components/session/SessionShell";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ lap?: string; citeId?: string }>;
}) {
  const params = await searchParams;
  const lap = Number(params.lap ?? "12");
  const initialLap = Number.isFinite(lap) && lap >= 11 && lap <= 13 ? lap : 12;

  return (
    <SessionShell initialLap={initialLap} initialCiteId={params.citeId} />
  );
}
