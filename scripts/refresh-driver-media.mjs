/**
 * Refresh public/drivers headshots from OpenF1 for the COTA FP2 session.
 * Skips tiny F1 fallback placeholders (<2KB).
 *
 * Usage: node scripts/refresh-driver-media.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const SESSION_KEY = 11390;
const mediaPath = join(root, "lib", "driver-media.json");
const outDir = join(root, "public", "drivers");

mkdirSync(outDir, { recursive: true });
const media = JSON.parse(readFileSync(mediaPath, "utf8"));

const drivers = await (
  await fetch(`https://api.openf1.org/v1/drivers?session_key=${SESSION_KEY}`)
).json();
const byAcronym = Object.fromEntries(
  drivers.map((d) => [d.name_acronym?.toLowerCase(), d]),
);

let ok = 0;
let fail = 0;
for (const [code, entry] of Object.entries(media)) {
  const d = byAcronym[code];
  const url = d?.headshot_url;
  if (!url) {
    console.log("no url", code);
    fail++;
    continue;
  }
  const big = url.replace("/1col/", "/2col/");
  let res = await fetch(big);
  if (!res.ok) res = await fetch(url);
  if (!res.ok) {
    console.log("fetch fail", code, res.status);
    fail++;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) {
    console.log("tiny placeholder — keep existing", code, buf.length);
    fail++;
    continue;
  }
  const ext = entry.file?.endsWith(".jpg") ? ".jpg" : ".png";
  const file = join(outDir, `${code}${ext}`);
  writeFileSync(file, buf);
  entry.file = `/drivers/${code}${ext}`;
  console.log("wrote", code, buf.length);
  ok++;
  await new Promise((r) => setTimeout(r, 100));
}

writeFileSync(mediaPath, `${JSON.stringify(media, null, 2)}\n`);
console.log({ ok, fail, mediaPath });
