// Regenerates src/data/cities.json.
//
//   npm run build:cities
//
// Source data is `all-the-cities` (a packaged copy of GeoNames, CC BY 4.0,
// https://www.geonames.org). Country names and continents come from
// `countries-list`. Nothing here runs at game time; the output is committed.
//
// To make the list bigger or smaller change MIN_POP. To force a specific city
// in regardless of size add its GeoNames id to seed-cities.json. To fix a
// spelling or add a nickname people might type, use RENAMES / ALT_NAMES below.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const allCities = require("all-the-cities");
const { countries } = require("countries-list");

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "src", "data", "cities.json");
const seeds = JSON.parse(fs.readFileSync(path.join(here, "seed-cities.json"), "utf8"));

const MIN_POP = 150_000;

// GeoNames feature codes for "section of a city", abandoned, historical and
// destroyed places. These are districts and ghosts, not cities you would guess.
const SKIP_FEATURES = new Set(["PPLX", "PPLQ", "PPLH", "PPLW"]);

// GeoNames uses local-language or outdated names for a lot of places. Keys are
// "<ISO country>|<name with diacritics stripped>".
const RENAMES = {
  "DE|Koln": "Cologne",
  "DE|Frankfurt am Main": "Frankfurt",
  "SE|Goteborg": "Gothenburg",
  "CH|Geneve": "Geneva",
  "CH|Bern": "Bern",
  "BE|Antwerpen": "Antwerp",
  "UA|Kyiv": "Kyiv",
  "RU|Groznyy": "Grozny",
  "TR|Diyarbakir": "Diyarbakir",
  "PS|Gaza": "Gaza City",
  "IQ|Basrah": "Basra",
  "AE|Al Ain City": "Al Ain",
  "TM|Turkmenabat": "Turkmenabat",
  "KZ|Nur-Sultan": "Astana",
  "KZ|Turkestan": "Turkistan",
  "IN|Allahabad": "Prayagraj",
  "IN|Gurgaon": "Gurugram",
  "IN|Darjiling": "Darjeeling",
  "MM|Nay Pyi Taw": "Naypyidaw",
  "LA|Muang Phonsavan": "Phongsavan",
  "VN|Haiphong": "Hai Phong",
  "KR|Jeju City": "Jeju",
  "JP|Fukui-shi": "Fukui",
  "MN|Ulan Bator": "Ulaanbaatar",
  "PH|Davao": "Davao City",
  "AL|Shkoder": "Shkoder",
  "GR|Patra": "Patras",
  "ZA|Port Elizabeth": "Gqeberha",
  "SO|Hargeysa": "Hargeisa",
  "MA|Fes": "Fez",
  "LY|Misratah": "Misrata",
  "HT|Okap": "Cap-Haitien",
  "MX|Xalapa de Enriquez": "Xalapa",
  "MX|Acapulco de Juarez": "Acapulco",
  "US|Washington, D.C.": "Washington DC",
  "CA|Quebec": "Quebec City",
  "LB|Ra's Bayrut": "Beirut",
  "IN|Surat": "Surat",
  "IN|Hora": "Howrah",
  "IN|Haora": "Howrah",
  "SA|Sulţanah": "Sultanah",
  "LK|Sri Jayewardenepura Kotte": "Sri Jayawardenepura Kotte",
  "PA|Panama": "Panama City",
  "FM|Palikir - National Government Center": "Palikir",
};

// Names countries-list spells differently from what people say.
const COUNTRY_NAMES = {
  Turkiye: "Turkey",
  Macao: "Macau",
  "East Timor": "Timor-Leste",
  "Cabo Verde": "Cape Verde",
  Czechia: "Czech Republic",
};

// Other things people type. Searching "Bombay" should find Mumbai.
const ALT_NAMES = {
  Cologne: ["Koln"],
  Mumbai: ["Bombay"],
  Kolkata: ["Calcutta"],
  Chennai: ["Madras"],
  Bengaluru: ["Bangalore"],
  Kyiv: ["Kiev"],
  Prayagraj: ["Allahabad"],
  "Ho Chi Minh City": ["Saigon"],
  Yangon: ["Rangoon"],
  Beijing: ["Peking"],
  Gdansk: ["Danzig"],
  Gqeberha: ["Port Elizabeth"],
  Hargeisa: ["Hargeysa"],
  Ulaanbaatar: ["Ulan Bator"],
  Naypyidaw: ["Nay Pyi Taw"],
  "Saint Petersburg": ["St Petersburg", "Leningrad"],
  "Quebec City": ["Quebec"],
  "Washington DC": ["Washington"],
  "Hai Phong": ["Haiphong"],
  Gothenburg: ["Goteborg"],
  Bern: ["Berne"],
  Cairo: ["Al Qahirah"],
  Kathmandu: ["Katmandu"],
  Samarkand: ["Samarqand"],
  Astana: ["Nur-Sultan"],
  Fez: ["Fes"],
  Malacca: ["Melaka"],
  "Davao City": ["Davao"],
  "Frankfurt": ["Frankfurt am Main"],
  "Saint George's": ["St George's"],
  "Cap-Haitien": ["Cap Haitien"],
  Antwerp: ["Antwerpen"],
};

// Places GeoNames lists as cities that are really districts of a bigger one.
const EXCLUDE = new Set([
  "IQ|Al Mawsil al Jadidah",
  "IQ|Al Basrah al Qadimah",
  "IQ|Abu Ghurayb",
  "TR|Cankaya",
  "TR|Bagcilar",
  "MX|Alvaro Obregon",
  "MX|Naucalpan de Juarez",
  "IR|Kahriz",
]);

// Territories and dependencies. Their capitals are valid guesses but would make
// miserable targets (Grytviken has nobody in it), so they only become targets
// if they are in seed-cities.json.
const NON_SOVEREIGN = new Set([
  "AS", "AI", "AW", "AX", "BL", "BM", "BQ", "CC", "CK", "CW", "CX", "FK", "FO",
  "GF", "GG", "GI", "GL", "GP", "GS", "GU", "HK", "IM", "JE", "KY", "MF", "MO",
  "MP", "MQ", "MS", "NC", "NF", "NU", "PF", "PM", "PN", "PR", "RE", "SH", "SJ",
  "SX", "TC", "TF", "TK", "VG", "VI", "WF", "YT",
]);

const countryName = (cc) => {
  const n = strip(countries[cc].name);
  return COUNTRY_NAMES[n] || n;
};

// Bad GeoNames records: [name, lat, lon]. Dropped if a row with that name sits
// within ~5km. (This Gorakhpur is a village in Haryana carrying the population
// of the Uttar Pradesh one, which then loses the duplicate check.)
const DROP_AT = [["Gorakhpur", 29.4477, 75.6721]];
const isDropped = (name, lat, lon) =>
  DROP_AT.some(([n, la, lo]) => n === name && Math.abs(la - lat) < 0.05 && Math.abs(lo - lon) < 0.05);

// Countries that straddle two continents. Everything else uses the single
// continent countries-list gives.
function continentFor(cc, lon, lat) {
  const names = { AF: "Africa", AN: "Antarctica", AS: "Asia", EU: "Europe", NA: "North America", OC: "Oceania", SA: "South America" };
  const base = countries[cc].continent;
  if (cc === "RU") return lon < 60 ? "Europe" : "Asia"; // Urals
  if (cc === "TR") return lon < 29.3 && lat > 40.7 ? "Europe" : "Asia"; // Thrace and Istanbul
  return names[base];
}

const strip = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l").replace(/Ł/g, "L")
    .replace(/ø/g, "o").replace(/Ø/g, "O")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ð/g, "d").replace(/Ð/g, "D")
    .replace(/þ/g, "th").replace(/Þ/g, "Th")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae").replace(/œ/g, "oe")
    .replace(/[‘’`ʻʼ]/g, "'")
    .trim();

const seedIds = new Set(seeds.map((s) => s[0]));
const keep = (c) => {
  // No continent to colour a guess by, and nobody lives there.
  if (!countries[c.country] || countries[c.country].continent === "AN") return false;
  if (seedIds.has(c.cityId)) return true;
  if (c.featureCode === "PPLC") return true;
  if (SKIP_FEATURES.has(c.featureCode)) return false;
  return c.population >= MIN_POP;
};

const rows = [];
for (const c of allCities) {
  if (!keep(c)) continue;
  const geoName = strip(c.name);
  const key = `${c.country}|${geoName}`;
  if (EXCLUDE.has(key) && !seedIds.has(c.cityId)) continue;
  const [lon, lat] = c.loc.coordinates;
  const name = RENAMES[key] || geoName;
  if (isDropped(name, lat, lon)) continue;
  const row = {
    name,
    country: countryName(c.country),
    continent: continentFor(c.country, lon, lat),
    lat: Math.round(lat * 1e4) / 1e4,
    lon: Math.round(lon * 1e4) / 1e4,
    pop: c.population,
  };
  if (c.featureCode === "PPLC") row.capital = true;
  // Capitals and the hand-picked seed list are what the game picks targets
  // from. GeoNames' population is the whole prefecture for many Chinese
  // cities, so raw population is a poor stand-in for "well known".
  if ((c.featureCode === "PPLC" && !NON_SOVEREIGN.has(c.country)) || seedIds.has(c.cityId)) row.common = true;
  const alt = ALT_NAMES[name];
  if (alt) row.alt = alt;
  row._cc = c.country;
  row._admin = c.adminCode;
  row._seed = seedIds.has(c.cityId);
  rows.push(row);
}

// Two places with the same name in the same country (the Springfields). The US
// and Canada use letter codes for states, so "Springfield (MO)" works there.
// Anywhere else keep the bigger one and move on.
const groups = new Map();
for (const r of rows) {
  const k = `${r._cc}|${r.name}`;
  (groups.get(k) || groups.set(k, []).get(k)).push(r);
}
const out = [];
const dropped = [];
for (const group of groups.values()) {
  if (group.length === 1) { out.push(group[0]); continue; }
  group.sort((a, b) => b.pop - a.pop);
  if (/^[A-Z]{2}$/.test(group[0]._admin) && ["US", "CA", "AU"].includes(group[0]._cc)) {
    const seen = new Set();
    for (const r of group) {
      const label = `${r.name} (${r._admin})`;
      if (seen.has(label)) { dropped.push(label); continue; }
      seen.add(label);
      r.name = label;
      out.push(r);
    }
  } else {
    const [winner, ...rest] = group;
    // The loser may be the one flagged as a capital (Panama vs Panama City).
    for (const r of rest) {
      if (r.capital) winner.capital = true;
      if (r.common) winner.common = true;
      dropped.push(`${r.name}, ${r.country} (${r.pop})`);
    }
    out.push(winner);
  }
}

out.sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name));
const clean = out.map(({ _cc, _admin, _seed, ...r }) => r);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
// One city per line keeps diffs readable.
fs.writeFileSync(OUT, "[\n" + clean.map((r) => "  " + JSON.stringify(r)).join(",\n") + "\n]\n");

const nCountries = new Set(clean.map((r) => r.country)).size;
console.log(`wrote ${clean.length} cities from ${nCountries} countries to ${path.relative(process.cwd(), OUT)}`);
if (dropped.length) console.log(`dropped ${dropped.length} same-name duplicates in one country: ${dropped.join("; ")}`);
