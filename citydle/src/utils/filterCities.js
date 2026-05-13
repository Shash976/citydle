export function filterCities(cities, query) {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return cities.filter(city => city.name.toLowerCase().includes(lower));
}
