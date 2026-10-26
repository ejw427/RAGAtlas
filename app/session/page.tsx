import { SessionShell } from "@/components/session/SessionShell";
import {
  allowedLapNumbers,
  defaultDriverId,
  defaultLapNumber,
  getDrivers,
} from "@/lib/session";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{
    lap?: string;
    driver?: string;
    citeId?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const drivers = getDrivers();

  const byCode = drivers.find(
    (d) => d.code.toLowerCase() === (params.driver ?? "").toLowerCase(),
  );
  const byId = drivers.find((d) => d.id === params.driver);
  const driverId = byCode?.id ?? byId?.id ?? defaultDriverId();

  const allowed = allowedLapNumbers(driverId);
  const fallback = defaultLapNumber(driverId);
  const lap = Number(params.lap ?? String(fallback));
  const initialLap =
    Number.isFinite(lap) && allowed.includes(lap) ? lap : fallback;

  return (
    <SessionShell
      initialLap={initialLap}
      initialDriverId={driverId}
      initialCiteId={params.citeId}
      initialQuery={params.q}
    />
  );
}
