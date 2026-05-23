import { buildings, scopes, scopeMatrix, kpis, alerts } from "./mock/data";
import { current, trailingAvg, statusRag, trendDir, round } from "./rag";

const PLATFORM = `
PLATFORM OVERVIEW (for answering "how does this work" questions):
This is a multi-site data center construction reporting platform. Site teams submit daily reports that build
a knowledge base; the platform generates weekly/monthly/quarterly/semi-annual/annual reports, each validated
and approved by construction and project managers. It is agentic, with 23 named agents under an orchestrator
called BERNARD. Core rule: all metrics are computed deterministically in code; agents narrate, monitor, and
forecast, but never invent numbers.

Five layers: (1) Ingestion - hybrid daily reports (mobile-first, offline-tolerant, photo capture) normalized
by HERALD into atomic records; (2) Data core - atomic store, configurable scope/KPI registry, deterministic
rollup engine, audit trail; (3) Agent layer - BERNARD orchestrates synthesis/anomaly/forecasting/governance;
(4) Human approval - draft -> review -> approve -> lock + version, per cadence; (5) Presentation - exec
dashboard rolling down to site, scope/KPI, weekly, daily, all interactive.

RAG and trend: status RAG compares current value to target honoring direction-of-goodness; a 4-week trailing
rolling average (current week excluded, warm-up needs 4+ weeks) drives a trend wash: amber pivots to GREEN
when trending toward goal and to RED when trending away. Rollup uses weighted worst-of (a critical-path red
turns the parent red).

Key agents: BERNARD (orchestrator), ARTIFICER (generalist for the unforeseen + factory pattern), HERALD
(intake), SCOUT (photo/visual intelligence), WARDEN (data reconciliation), QUARTERMASTER (procurement/supply
chain), PATHFINDER (schedule/critical path), KEYSTONE (commissioning Cx L1-L5), GUARDIAN (safety), MARSHAL
(quality), COMPTROLLER (cost), AUGUR (predictive early-warning + lagged root-cause hypotheses), SENTINEL
(external weather/geopolitical/economic signals -> supply-chain delay forecasting), CANVAS (BI/infographics/
launchable reports), CHRONICLER (report narratives), CONCIERGE (this Q&A assistant), LIBRARIAN (knowledge base
+ research vetting), MENTOR (master-class teaching for CMs/PMs), DIPLOMAT (stakeholder comms), COUNSEL
(contract/proposal review - commercial analysis, not legal advice), ADJUTANT (project management/RAID), AEGIS
(access governance), NOTARY (audit/provenance). It deploys inside OpenAI ChatGPT Enterprise, single-tenant,
used by owner's reps, CMs, and PMs.
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
  d += "\nActive agent alerts:\n";
  alerts.forEach((a) => (d += `- [${a.agent}] ${a.text}\n`));
  return PLATFORM + "\n" + d;
}

// Lightweight local responder used when no OPENAI_API_KEY is set, so the demo
// still answers the common questions from the live data.
export function localAnswer(q) {
  const s = (q || "").toLowerCase();
  const has = (...w) => w.some((x) => s.includes(x));
  if (has("behind", "red", "at risk", "worst", "concern"))
    return "Behind right now: Building 17 electrical fit-out (33%), mechanical (28%), and LV cabling (9%) are red, and Building 18 slab-on-grade and steel erection are red against plan. Building 16 commissioning is also behind at 12%. The dominant program risk is the Building 17 switchgear delivery exposure flagged by SENTINEL.";
  if (has("building 17", "bldg 17", "b17") && has("electrical"))
    return "Building 17 electrical fit-out is at 33% and flagged red. The driver is RFI turnaround climbing to 9.2 days versus a 6.1-day 4-week average, plus switchgear delivery flagged at risk by SENTINEL, which cascades into electrical fit-out and commissioning.";
  if (has("rfi"))
    return "Building 17 RFI turnaround is 9.2 days against a 6.1-day 4-week average, up about 51% and trending the wrong way (lower is better). AUGUR flags a 2-week lagged correlation with the LV cabling productivity dip as a candidate root cause for human review.";
  if (has("augur")) return "AUGUR is the predictive early-warning and root-cause agent. It computes correlations across KPIs, including lagged correlation, then surfaces ranked candidate drivers with their lag and a confidence level as hypotheses for a human to confirm. It narrates; the statistics are computed in code.";
  if (has("sentinel")) return "SENTINEL monitors external weather, geopolitical, and economic signals, vets them through LIBRARIAN, and maps them to your actual supplier/material exposure. Here it has flagged switchgear delivery for Building 17 at risk, which QUARTERMASTER and PATHFINDER project as a 2-4 week slip cascading into electrical fit-out and commissioning.";
  if (has("rag", "red amber green", "trend", "color")) return "RAG status compares the current value to its target, honoring whether higher or lower is better. Separately, a 4-week rolling average drives a trend wash: amber pivots to green when a metric trends toward goal and to red when it trends away. Trend stays neutral until a site has four full weeks of data (see Building 18).";
  if (has("offline", "field", "mobile", "phone")) return "The daily report is mobile-first and offline-tolerant. On the jobsite it works one-handed, captures photos from the camera (feeding SCOUT), and if there's no signal it saves the report on the device and syncs automatically on reconnect. See the Field page for the phone demo.";
  if (has("commission", "cx", "keystone")) return "Commissioning is tracked by KEYSTONE across levels L1-L5. Building 16 commissioning is at 12% and behind, gated on a switchgear energization milestone; Buildings 17 and 18 have not started commissioning.";
  if (has("what is this", "what does this", "overview", "explain the platform", "how does this work")) return "This is a multi-site data center construction reporting platform. Daily field reports roll up automatically into weekly through annual reports that managers approve, every site has an interactive RAG dashboard that drills from program down to the daily entry, and 23 agents under BERNARD handle synthesis, forecasting, and governance. All numbers are computed deterministically; the agents narrate.";
  return "I can answer that fully once an OpenAI API key is set (OPENAI_API_KEY) in the environment. For this key-free demo I can still answer common questions, try: \"What's behind schedule?\", \"Why is Building 17 electrical red?\", \"What does AUGUR do?\", or \"How does the RAG trend work?\"";
}
