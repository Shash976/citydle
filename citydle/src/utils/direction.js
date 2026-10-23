import { bearing } from "./distance";

const ARROWS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

// Arrow pointing from the guessed city towards the target, following the
// great-circle bearing so it stays right away from the equator and across the
// date line.
export function getDirectionEmoji(lat1, lon1, lat2, lon2) {
  const b = bearing(lat1, lon1, lat2, lon2);
  return ARROWS[Math.round(b / 45) % 8];
}
