import raw from "../../data/countries.generated.json";

export interface CountryInfo {
  ccn3: string | null;
  cca2: string;
  nameEn: string;
  nameEs: string;
  region: string;
  subregion: string;
  flag: string;
}

export const COUNTRIES: Record<string, CountryInfo> = raw as Record<
  string,
  CountryInfo
>;

let ccn3Index: Record<string, string> | null = null;

// Normalizes "004" and "4" to the same key, since the topojson id and the
// world-countries ccn3 field don't always agree on leading zeros.
function normalizeNumericId(id: string): string {
  const n = Number(id);
  return Number.isNaN(n) ? id : String(n);
}

/** numeric ISO 3166-1 id (as used by the world-atlas topojson) -> cca3 code */
export function ccn3ToCca3(ccn3: string): string | undefined {
  if (!ccn3Index) {
    ccn3Index = {};
    for (const [cca3, info] of Object.entries(COUNTRIES)) {
      if (info.ccn3) ccn3Index[normalizeNumericId(info.ccn3)] = cca3;
    }
  }
  return ccn3Index[normalizeNumericId(ccn3)];
}

export function getCountry(cca3: string): CountryInfo | undefined {
  return COUNTRIES[cca3];
}

/**
 * "world" matches everything. Anything else is matched case-insensitively
 * against the country's region ("Americas") or subregion ("South America").
 */
export function matchesRegion(cca3: string, region: string): boolean {
  if (!region || region.toLowerCase() === "world") return true;
  const info = getCountry(cca3);
  if (!info) return false;
  const needle = region.toLowerCase();
  return (
    info.region.toLowerCase() === needle ||
    info.subregion.toLowerCase() === needle
  );
}
