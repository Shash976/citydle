const EARTH_RADIUS_KM = 6371;
const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

export function toMiles(km) {
  return Math.round(km * 0.621371);
}

export function formatDistance(km, useMiles) {
  const n = useMiles ? toMiles(km) : km;
  return `${n.toLocaleString()} ${useMiles ? "mi" : "km"}`;
}

// Points on the small circle of radius `radiusKm` around a spot, as [lat, lon]
// pairs. Closed (first point repeated) so it can be drawn as a path.
export function circlePoints(lat, lon, radiusKm, steps = 96) {
  const delta = radiusKm / EARTH_RADIUS_KM;
  const lat1 = rad(lat);
  const lon1 = rad(lon);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(delta) +
        Math.cos(lat1) * Math.sin(delta) * Math.cos(theta)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(theta) * Math.sin(delta) * Math.cos(lat1),
        Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2)
      );
    pts.push([deg(lat2), ((deg(lon2) + 540) % 360) - 180]);
  }
  return pts;
}

// Initial compass bearing (0 = north, 90 = east) of the great-circle path
// from point 1 to point 2.
export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = rad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(rad(lat2));
  const x =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
