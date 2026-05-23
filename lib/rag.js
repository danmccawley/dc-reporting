// Deterministic RAG, 4-week rolling average, and trend logic.
// In the real platform this runs server-side over the atomic store.
// Agents narrate these numbers; they never invent them.

export const ragFill = { g: "#C0DD97", a: "#FAC775", r: "#F7C1C1", n: "#ECEAE2" };
export const ragInk = { g: "#173404", a: "#412402", r: "#501313", n: "#7c7b74" };
export const ragLabel = { g: "On track", a: "Watch", r: "Behind", n: "Not started" };

// Trailing N-week average, current week EXCLUDED so the baseline is stable.
// Warm-up rule: needs window + 1 points, else returns null (UI shows no trend).
export function trailingAvg(series, window = 4) {
  if (!series || series.length < window + 1) return null;
  const slice = series.slice(series.length - 1 - window, series.length - 1);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function current(series) {
  if (!series || series.length === 0) return null;
  return series[series.length - 1];
}

// Status RAG: current value measured against target, honoring direction of goodness.
export function statusRag(value, target, higherIsBetter) {
  if (value == null) return "n";
  const ratio = higherIsBetter ? value / target : target / value;
  if (ratio >= 0.98) return "g";
  if (ratio >= 0.85) return "a";
  return "r";
}

// Trend direction vs the rolling average. "up" = toward goal, "down" = away.
export function trendDir(value, avg, higherIsBetter) {
  if (avg == null || value == null) return "none";
  const pct = avg !== 0 ? (value - avg) / Math.abs(avg) : 0;
  const toward = higherIsBetter ? pct : -pct;
  if (toward > 0.03) return "up";
  if (toward < -0.03) return "down";
  return "flat";
}

export function pctDelta(value, avg) {
  if (avg == null || value == null || avg === 0) return null;
  return ((value - avg) / Math.abs(avg)) * 100;
}

export function round(n, d = 0) {
  if (n == null) return null;
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}
