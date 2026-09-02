#!/usr/bin/env node
// Regenerates data/countries.generated.json from the `world-countries` package.
// Run with: npm run build:countries
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import countries from "world-countries";

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data"
);

const byCca3 = {};

for (const c of countries) {
  if (!c.cca3) continue;
  byCca3[c.cca3] = {
    ccn3: c.ccn3 || null, // numeric ISO id, joins to the world-atlas topojson "id"
    cca2: c.cca2,
    nameEn: c.name.common,
    nameEs: c.translations?.spa?.common || c.name.common,
    region: c.region, // e.g. "Americas"
    subregion: c.subregion, // e.g. "South America"
    flag: c.flag, // emoji flag
  };
}

writeFileSync(
  path.join(outDir, "countries.generated.json"),
  JSON.stringify(byCca3, null, 2) + "\n"
);

console.log(`Wrote ${Object.keys(byCca3).length} countries.`);
