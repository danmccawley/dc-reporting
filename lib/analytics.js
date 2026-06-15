// BUSINESS INTELLIGENCE ENGINE (CANVAS + AUGUR) — deterministic analytics over
// the atomic KPI series. Every function is pure math over the dated readings in
// the store; findings carry the evidence they were computed from. Findings are
// framed two ways — a cautious "signal to investigate" and a "confident" read —
// because with construction-scale history a correlation is a lead, not a proof.
import { kpis, buildings } from "./mock/data";

const num = (a) => a.filter((x) => typeof x === "number" && !isNaN(x));
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export function stdev(a) { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); }
export function slope(a) { // simple linear regression slope over index 0..n-1
  const n = a.length; if (n < 2) return 0;
  const xs = a.map((_, i) => i); const mx = mean(xs); const my = mean(a);
  let nu = 0, de = 0; for (let i = 0; i < n; i++) { nu += (xs[i] - mx) * (a[i] - my); de += (xs[i] - mx) ** 2; }
  return de ? nu / de : 0;
}
export function trend(a) {
  const s = num(a); if (s.length < 2) return { dir: "flat", slope: 0, pct: 0, first: s[0] ?? null, last: s[s.length - 1] ?? null, n: s.length };
  const sl = slope(s); const first = s[0]; const last = s[s.length - 1];
  const pct = first ? ((last - first) / Math.abs(first)) * 100 : 0;
  const dir = Math.abs(pct) < 2 ? "flat" : pct > 0 ? "up" : "down";
  return { dir, slope: sl, pct, first, last, n: s.length };
}
export function trailingAvg(a, w = 4) { const s = num(a); return mean(s.slice(Math.max(0, s.length - w))); }
export function delta(a) { const s = num(a); if (s.length < 2) return { abs: 0, pct: 0 }; const last = s[s.length - 1], prev = s[s.length - 2]; return { abs: last - prev, pct: prev ? ((last - prev) / Math.abs(prev)) * 100 : 0 }; }
export function volatility(a) { const s = num(a); const m = mean(s); return m ? stdev(s) / Math.abs(m) : 0; }
export function anomalies(a, z = 1.8) { const s = num(a); const m = mean(s); const sd = stdev(s); if (!sd) return []; return s.map((v, i) => ({ i, v, z: (v - m) / sd })).filter((p) => Math.abs(p.z) >= z); }
export function lastIsAnomaly(a, z = 1.8) { const s = num(a); const sd = stdev(s.slice(0, -1)); if (!sd || s.length < 4) return null; const m = mean(s.slice(0, -1)); const zz = (s[s.length - 1] - m) / sd; return Math.abs(zz) >= z ? zz : null; }
export function pearson(a, b) {
  const n = Math.min(a.length, b.length); if (n < 3) return 0;
  const A = a.slice(0, n), B = b.slice(0, n); const ma = mean(A), mb = mean(B);
  let nu = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { const x = A[i] - ma, y = B[i] - mb; nu += x * y; da += x * x; db += y * y; }
  return da && db ? nu / Math.sqrt(da * db) : 0;
}
// a leads b by `lag` weeks: corr(a[t], b[t+lag]). Returns best lag by |r|.
export function laggedCorr(a, b, maxLag = 3) {
  let best = { lag: 0, r: pearson(a, b) };
  for (let lag = 1; lag <= maxLag; lag++) {
    const A = a.slice(0, a.length - lag), B = b.slice(lag);
    const r = pearson(A, B);
    if (Math.abs(r) > Math.abs(best.r)) best = { lag, r };
  }
  return best;
}
export function forecastNext(a) { const s = num(a); if (s.length < 2) return s[s.length - 1] ?? 0; return s[s.length - 1] + slope(s); }

const rStrength = (r) => { const x = Math.abs(r); return x >= 0.85 ? "strong" : x >= 0.6 ? "moderate" : x >= 0.4 ? "weak" : "negligible"; };
const fmtPct = (p) => (p >= 0 ? "+" : "") + p.toFixed(0) + "%";

export function metricFor(id) { return kpis.find((k) => k.id === id); }
export function seriesFor(id, b) { const k = metricFor(id); return (k && k.series[b]) || []; }
export function buildingName(b) { return (buildings.find((x) => x.id === b) || {}).name || "Building " + b; }

// Per-building metric cards: trend, trailing avg, delta, vs target, anomaly.
export function metricCards(b) {
  return kpis.map((k) => {
    const s = k.series[b] || [];
    const t = trend(s); const avg = trailingAvg(s); const d = delta(s); const an = lastIsAnomaly(s);
    const good = k.higherIsBetter ? t.dir === "up" : t.dir === "down";
    const vsTarget = k.target != null ? (k.higherIsBetter ? s[s.length - 1] - k.target : k.target - s[s.length - 1]) : null;
    return { id: k.id, name: k.name, unit: k.unit, target: k.target, series: s, trend: t, avg, delta: d, anomalyZ: an, good, vsTarget, higherIsBetter: k.higherIsBetter };
  });
}

// The findings generator — trends, correlations, lagged correlations, anomalies,
// and root-cause hypotheses, each with both framings and evidence links.
export function generateFindings(b = "17") {
  const out = [];
  const cards = metricCards(b);
  const bn = buildingName(b);
  const link = { label: `${bn} detail`, href: `/site/${b}` };

  // notable trends
  cards.filter((c) => c.series.length >= 4 && Math.abs(c.trend.pct) >= 6).forEach((c) => {
    const worsening = !c.good;
    out.push({
      id: `trend-${b}-${c.id}`, type: "trend", title: `${c.name} ${c.trend.dir} ${fmtPct(c.trend.pct)} on ${bn}`,
      metrics: [c.id], magnitude: Math.abs(c.trend.pct),
      signal: `${c.name} has moved ${fmtPct(c.trend.pct)} over ${c.trend.n} weeks on ${bn} (now ${c.trend.last}${c.unit ? " " + c.unit : ""}, 4-wk avg ${c.avg.toFixed(2)}). ${worsening ? "Trending the wrong way — worth a look." : "Trending favorably."}`,
      confident: `${c.name} is ${worsening ? "deteriorating" : "improving"} on ${bn}: ${fmtPct(c.trend.pct)} over ${c.trend.n} weeks, now ${c.trend.last}${c.unit ? " " + c.unit : ""} vs a ${c.target} target.`,
      evidence: [link], framingBias: worsening ? "watch" : "good",
    });
  });

  // anomalies (last-week spike/drop)
  cards.filter((c) => c.anomalyZ != null).forEach((c) => {
    out.push({
      id: `anom-${b}-${c.id}`, type: "anomaly", title: `${c.name} anomaly on ${bn}`,
      metrics: [c.id], magnitude: Math.abs(c.anomalyZ) * 10,
      signal: `Latest ${c.name} reading on ${bn} is ${c.anomalyZ.toFixed(1)}σ from its recent mean — an outlier worth confirming.`,
      confident: `${c.name} broke its band on ${bn} this week (${c.anomalyZ.toFixed(1)}σ); treat as a step change, not noise.`,
      evidence: [link],
    });
  });

  // correlations + lagged correlations among metrics on this building
  const ids = cards.filter((c) => c.series.length >= 5).map((c) => c.id);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = seriesFor(ids[i], b), c2 = seriesFor(ids[j], b);
    const r = pearson(a, c2); const lag = laggedCorr(a, c2);
    if (Math.abs(r) >= 0.6 || Math.abs(lag.r) >= 0.75) {
      const na = metricFor(ids[i]).name, nb = metricFor(ids[j]).name;
      const lagged = Math.abs(lag.r) > Math.abs(r) && lag.lag > 0;
      out.push({
        id: `corr-${b}-${ids[i]}-${ids[j]}`, type: lagged ? "lagged" : "correlation",
        title: `${na} ${lagged ? `leads ${nb} by ${lag.lag} wk` : `tracks ${nb}`} on ${bn}`,
        metrics: [ids[i], ids[j]], magnitude: Math.abs(lagged ? lag.r : r) * 100,
        signal: lagged
          ? `${na} appears to lead ${nb} by ${lag.lag} week${lag.lag > 1 ? "s" : ""} on ${bn} (r=${lag.r.toFixed(2)}, ${rStrength(lag.r)}). Worth checking whether the first is driving the second.`
          : `${na} and ${nb} move together on ${bn} (r=${r.toFixed(2)}, ${rStrength(r)}). A relationship to investigate, not yet a cause.`,
        confident: lagged
          ? `${na} is driving ${nb} on ${bn}: a ${lag.lag}-week lead with r=${lag.r.toFixed(2)}.`
          : `${na} and ${nb} are coupled on ${bn} (r=${r.toFixed(2)}); manage them together.`,
        evidence: [link], r, lag,
      });
    }
  }

  // root-cause hypothesis for the worst-trending "outcome" metric (SPI)
  const spi = cards.find((c) => c.id === "spi");
  if (spi && !spi.good && spi.series.length >= 5) {
    const drivers = ["rfi-turnaround", "ncr-open"].map((id) => {
      const lag = laggedCorr(seriesFor(id, b), seriesFor("spi", b));
      return { id, name: metricFor(id).name, lag };
    }).filter((d) => Math.abs(d.lag.r) >= 0.5).sort((a, c) => Math.abs(c.lag.r) - Math.abs(a.lag.r));
    if (drivers.length) {
      out.push({
        id: `root-${b}-spi`, type: "rootcause", title: `Root-cause hypothesis: ${bn} schedule slip`,
        metrics: ["spi", ...drivers.map((d) => d.id)], magnitude: 95,
        signal: `${bn} SPI is sliding. Candidate drivers that move ahead of it: ${drivers.map((d) => `${d.name} (${d.lag.lag}-wk lead, r=${d.lag.r.toFixed(2)})`).join("; ")}. Hypotheses for human review.`,
        confident: `${bn} schedule slip is driven by ${drivers[0].name} (${drivers[0].lag.lag}-week lead, r=${drivers[0].lag.r.toFixed(2)})${drivers[1] ? ` with ${drivers[1].name} compounding it` : ""}.`,
        evidence: [link, { label: "RFIs", href: "/rfis" }, { label: "Schedule", href: "/schedule" }],
      });
    }
  }

  return out.sort((a, b2) => b2.magnitude - a.magnitude);
}

// A compact spoken/written brief the analytics surface can use, by depth level.
export function biBrief(b = "17", level = 2) {
  const f = generateFindings(b);
  if (!f.length) return "No notable signals yet for this view.";
  if (level <= 2) { const top = f.slice(0, 3); return "Top signals: " + top.map((x) => x.title).join("; ") + "."; }
  if (level === 3) return f.slice(0, 5).map((x) => x.signal).join(" ");
  const rc = f.find((x) => x.type === "rootcause");
  return (rc ? rc.signal + " " : "") + f.filter((x) => x.type !== "rootcause").slice(0, 3).map((x) => x.signal).join(" ");
}
