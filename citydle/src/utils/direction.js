export function getDirectionEmoji(lat1, lon1, lat2, lon2) {
  // Normalize longitude difference to the shortest path
  let dLon = lon2 - lon1;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  const dLat = lat2 - lat1;
  const angle = Math.atan2(dLat, dLon) * 180 / Math.PI;

  if (angle > -22.5 && angle <= 22.5) return "→";
  if (angle > 22.5 && angle <= 67.5) return "↗";
  if (angle > 67.5 && angle <= 112.5) return "↑";
  if (angle > 112.5 && angle <= 157.5) return "↖";
  if (angle > 157.5 || angle <= -157.5) return "←";
  if (angle > -157.5 && angle <= -112.5) return "↙";
  if (angle > -112.5 && angle <= -67.5) return "↓";
  if (angle > -67.5 && angle <= -22.5) return "↘";
  return "";
}
