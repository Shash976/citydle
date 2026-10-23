import cities from "../data/cities.json";

export default cities;

export const cityLabel = (city) => `${city.name}, ${city.country}`;

// Lowercase, no accents or punctuation, single spaces. "Saint-Denis" and
// "saint denis" end up the same.
export function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’‘`.]/g, "")
    .replace(/[^a-z0-9, ]+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

const index = cities.map((city) => ({
  city,
  name: normalize(city.name),
  alts: (city.alt || []).map(normalize),
  label: normalize(cityLabel(city)),
}));

// Cities the game will pick as the answer: capitals and the hand-picked
// list. Anything in cities.json is still a valid guess.
export const targetPool = cities.filter((c) => c.common);

export function pickTarget(previous) {
  const pool = previous ? targetPool.filter((c) => c !== previous) : targetPool;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Lower is better. null means no match.
function score(entry, q) {
  if (entry.name === q) return 0;
  if (entry.alts.includes(q)) return 0.5;
  if (entry.name.startsWith(q)) return 1;
  if (entry.alts.some((a) => a.startsWith(q))) return 1.5;
  if (entry.name.includes(" " + q)) return 2;
  if (entry.name.includes(q)) return 3;
  if (entry.alts.some((a) => a.includes(q))) return 3.5;
  if (entry.label.startsWith(q)) return 4; // "paris, fr"
  return null;
}

export function searchCities(query, limit = 8) {
  const q = normalize(query);
  if (q.length < 2) return [];
  const hits = [];
  for (const entry of index) {
    const s = score(entry, q);
    if (s !== null) hits.push({ city: entry.city, s });
  }
  hits.sort(
    (a, b) =>
      a.s - b.s ||
      Boolean(b.city.common) - Boolean(a.city.common) ||
      b.city.pop - a.city.pop
  );
  return hits.slice(0, limit).map((h) => h.city);
}

// Turn whatever is typed in the box into one city.
//   { city }        exactly one match
//   { ambiguous }   several cities share that name, caller should ask which
//   {}              nothing matches
export function resolveCity(text) {
  const q = normalize(text);
  if (!q) return {};
  const byLabel = index.find((e) => e.label === q);
  if (byLabel) return { city: byLabel.city };
  const matches = index.filter((e) => e.name === q || e.alts.includes(q));
  if (matches.length === 1) return { city: matches[0].city };
  if (matches.length > 1) return { ambiguous: matches.map((e) => e.city) };
  return {};
}
