// Office map pin from the admin's "Office pin location" field (Contact › Map).
// Accepts plain coordinates ("25.0957, 55.1536") or a full Google Maps link
// copied from the browser's address bar. Returns { lat, lng } or null.
// Same parser as the website's src/lib/mapPin.js — keep the two in sync.
const N = "(-?\\d{1,3}(?:\\.\\d+)?)";
const PATTERNS = [
  new RegExp(`!3d${N}!4d${N}`), // exact place marker inside a /maps/place/ link
  new RegExp(`[?&](?:q|query|ll|destination|center)=${N}(?:,|%2C)(?:\\s|%20|\\+)*${N}`, "i"),
  new RegExp(`@${N},${N}`), // map view centre
  new RegExp(`^${N}\\s*,\\s*${N}$`), // plain "lat, lng"
];

export function parseMapPin(value) {
  const s = String(value ?? "").trim();
  if (!s) return null;
  for (const re of PATTERNS) {
    const m = s.match(re);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0)) {
      return { lat, lng };
    }
  }
  return null;
}

// Google Maps URLs that drop a red pin on the exact point.
export const pinEmbedUrl = ({ lat, lng }) => `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
export const pinOpenUrl = ({ lat, lng }) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
