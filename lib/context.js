import { buildings, scopes, scopeMatrix, kpis, alerts } from "./mock/data";
import { current, trailingAvg, statusRag, trendDir, round } from "./rag";

const PLATFORM = `
PLATFORM OVERVIEW:
This is a data-center construction daily-reporting platform. Construction managers
submit daily reports, captures, reference points, and notes as atomic facts. Weekly,
monthly, owner, commissioning, and analytics views are computed from those facts on
read and wait for human approval before distribution.

Core rule: all metrics are computed deterministically in code. The lean function set
normalizes, derives, analyzes, reads visual evidence, and checks report quality. It
does not invent numbers, store derived rollups, or act without human approval.

Lean function set:
- HERALD normalizes daily field input into atomic records.
- CHRONICLER derives report cadences from the atomic store.
- analytics computes trends, anomalies, lagged correlations, and evidence links.
- SCOUT reads photos and drawings and can clean up human marks without inventing geometry.
- WARDEN checks daily-report completeness and quality.

External systems such as Procore, ACC, P6, Aconex, ERP, and Kahua are read-only
signals or swappable providers. The platform does not replace them as native systems
of record in this prototype.
`;

export function buildContext() {
  let d = "LIVE DEMO DATA (simulated):\nBuildings:\n";
  buildings.forEach((b) => (d += `- ${b.name}: ${b.phase}\n`));
  d += "\nScope progress (% complete, status g=on track a=watch r=behind n=not started):\n";
  scopes.forEach((s) => {
    const row = scopeMatrix[s.slug];
    d += `- ${s.name}: ` + buildings.map((b) => `${b.name.replace("Building ", "B")}=${row[b.id][0]}%/${row[b.id][1]}`).join(", ") + "\n";
  });
  d += "\nKPIs (current value, 4-week avg, status, trend) by building:\n";
  kpis.forEach((k) => {
    d += `- ${k.name} (${k.unit}, target ${k.target}, ${k.higherIsBetter ? "higher" : "lower"} is better):\n`;
    buildings.forEach((b) => {
      const series = k.series[b.id] || [];
      const cur = current(series);
      const avg = trailingAvg(series, 4);
      const st = cur == null ? "n" : statusRag(cur, k.target, k.higherIsBetter);
      const tr = trendDir(cur, avg, k.higherIsBetter);
      d += `   ${b.name}: current=${cur == null ? "n/a" : round(cur, 2)}, 4wk-avg=${avg == null ? "forming" : round(avg, 2)}, status=${st}, trend=${tr}\n`;
    });
  });
  d += "\nActive computed alerts:\n";
  alerts.forEach((a) => (d += `- [${a.agent}] ${a.text}\n`));
  return PLATFORM + "\n" + d;
}
