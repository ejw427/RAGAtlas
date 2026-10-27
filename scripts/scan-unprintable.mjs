import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".git", ".next", "out", ".wrangler"]);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?|css|md|mjs|json)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

/** Zero-width, BOM, replacement, private use, and a few UI glyphs that often fail fonts. */
const SUSPECT =
  /[\uFFFD\uFEFF\u200B-\u200F\u2028\u2029\u2060\u00AD\uE000-\uF8FF\u25B6-\u25C4\u25BA\u25C0\u25B8\u25B9\u25AA\u25AB\u25CF\u2212\u0394\u2013\u2014\u2190-\u2193\u2026]/g;

const hits = [];
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}scripts${path.sep}scan-unprintable`)) continue;
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = SUSPECT.exec(text))) {
    const i = m.index;
    const line = text.slice(0, i).split(/\n/).length;
    hits.push({
      file: path.relative(ROOT, file),
      line,
      code: "U+" + m[0].codePointAt(0).toString(16).toUpperCase(),
      snip: JSON.stringify(text.slice(Math.max(0, i - 24), i + 24)),
    });
  }
}

console.log(JSON.stringify({ count: hits.length, hits }, null, 2));
