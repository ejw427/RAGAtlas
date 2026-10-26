/**
 * Re-apply synthetic overlays + OpenF1 corpus extras onto the cached COTA pack
 * without re-fetching car_data.
 *
 * Usage: npm run enrich:cota
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enrichSessionPack } from "./enrich-pack.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dir, "..", "data", "mock", "cota-2026-fp2.json");

const pack = JSON.parse(readFileSync(outPath, "utf8"));
const facts = enrichSessionPack(pack);
writeFileSync(outPath, JSON.stringify(pack));

const channels = [...new Set(pack.samples.map((s) => s.channelId))];
console.log(
  `Enriched ${outPath} · schema ${pack.schemaVersion} · ${channels.length} channels · ${pack.cites.length} cites · ${pack.notes.length} notes`,
);
console.log(`Channels: ${channels.join(", ")}`);
if (facts?.tyrePeakS2) {
  console.log(
    `Soft tyre S2 peak ${facts.tyrePeakS2.value}°C · ST ${facts.softTrap?.st_speed} · radio ${facts.lecRadioCount}/${facts.radioCount}`,
  );
}
