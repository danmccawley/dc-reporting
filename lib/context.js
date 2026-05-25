import { buildings, scopes, scopeMatrix, kpis, alerts } from "./mock/data";
import { current, trailingAvg, statusRag, trendDir, round } from "./rag";

const PLATFORM = `
PLATFORM OVERVIEW (for answering "how does this work" questions):
This is a multi-site data center construction reporting platform. Site teams submit daily reports that build
a knowledge base; the platform generates weekly/monthly/quarterly/semi-annual/annual reports, each validated
and approved by construction and project managers. It is agentic, with 23 named agents under an orchestrator
called BERNARD. Core rule: all metrics are computed deterministically in code; agents narrate, monitor, and
forecast, but never invent numbers. The roster also includes MUSTER (manpower/labor-loading forecast — crew
required per scope to hold the planned finish) and COACH (just-in-time training that teaches the critical
skills a CM/PM/field user needs, surfaced on the right screen at the right moment).

NEW FIELD TOOLS (all computed from the atomic store and the CPM engine):
- Weather & delay (SENTINEL + PATHFINDER): a 10-day forecast turned into predicted slip on weather-exposed
  scopes (concrete, steel, envelope); crane/lift work is most wind-sensitive.
- Manpower forecast (MUSTER): required crew = current crew x (forecast days remaining / planned days remaining);
  the gap is the crew add needed to recover a date. Load critical-path scopes first.
- Procurement / long-lead (QUARTERMASTER): required-on-site comes from the activity start; slack = required
  minus ETA; negative slack means the delivery gates the work (e.g., Building 17 switchgear).
- Punchlist & closeout (KEYSTONE): the commissioning tail by system; closeout percent is the practical gate on go-live.
- 3-week look-ahead (MARSHAL): the next three weeks from the live schedule with constraints, built for the field.
- Daily-report quality (WARDEN): every report scored 0-100 for completeness, with specific nudges to the crew.

Five layers: (1) Ingestion - hybrid daily reports (mobile-first, offline-tolerant, photo capture) normalized
by HERALD into atomic records; (2) Data core - atomic store, configurable scope/KPI registry, deterministic
rollup engine, audit trail; (3) Agent layer - BERNARD orchestrates synthesis/anomaly/forecasting/governance;
(4) Human approval - draft -> review -> approve -> lock + version, per cadence; (5) Presentation - exec
dashboard rolling down to site, scope/KPI, weekly, daily, all interactive.

RAG and trend: status RAG compares current value to target honoring direction-of-goodness; a 4-week trailing
rolling average (current week excluded, warm-up needs 4+ weeks) drives a trend wash: amber pivots to GREEN
when trending toward goal and to RED when trending away. Rollup uses weighted worst-of (a critical-path red
turns the parent red).

Key agents: BERNARD (orchestrator), ARTIFICER (scope/KPI registry + report templates), FORGE
(the agentic solutions factory — designs purpose-built agents/workflows for unforecasted
challenges by composing existing agents, with human approval), HERALD (intake), SCOUT
(photo/visual intelligence), WARDEN (data reconciliation + daily-report quality scoring),
QUARTERMASTER (procurement/supply chain), PATHFINDER (schedule/critical path), MUSTER (manpower /
labor-loading forecast), KEYSTONE (commissioning Cx L1-L5 + punchlist/closeout), GUARDIAN (safety),
MARSHAL (field coordination + 3-week look-ahead), COMPTROLLER (cost), AUGUR (predictive
early-warning + lagged root-cause hypotheses), SENTINEL (external weather/geopolitical/economic
signals -> supply-chain delay forecasting), CANVAS (BI/infographics/launchable reports), CHRONICLER
(report narratives), CONCIERGE (the conversational assistant), LIBRARIAN (builds and curates the
knowledge base and screens every external source for reliability and credibility — agents act only
on vetted sources), MENTOR (onboarding), COACH (just-in-time training), DIPLOMAT (stakeholder
comms), COUNSEL (contract/proposal review - commercial analysis, not legal advice), ADJUTANT
(project management/RAID), AEGIS (access governance), NOTARY (audit/provenance). It deploys inside
a single-tenant enterprise environment, used by owner's reps, CMs, and PMs.

PROVENANCE & THE UNFORESEEN: every external reading is tagged with the LIBRARIAN source that
supplied it and that source's credibility tier (Authoritative / Vetted / Community / Quarantined),
so a human can always see where a forecast came from and how far to trust it. When a challenge
appears that no standing specialist covers, FORGE designs and assembles a solution from existing
agents and tools, a human owner approves it, and durable patterns are folded into the roster.
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
  if (has("weather", "rain", "storm", "wind")) return "SENTINEL pulls a 10-day forecast and PATHFINDER converts severe and high-wind days into predicted slip on the weather-exposed scopes (concrete, steel, envelope). Right now two severe storm days and a high-wind advisory fall inside the window; the largest exposure is Building 18 (foundations, slab, steel are outdoors) and Building 17 steel and envelope. See the Weather page.";
  if (has("crew", "manpower", "headcount", "labor force", "staffing", "muster")) return "MUSTER projects the crew needed to hold the planned finish: required crew = current crew x (forecast days remaining / planned days remaining). Where a scope is forecast late it sizes the crew add to recover the date and flags the shortfall. Load critical-path scopes first — adding crew off the critical path will not move go-live. See the Manpower page.";
  if (has("procure", "switchgear", "long lead", "long-lead", "delivery", "material", "quartermaster")) return "QUARTERMASTER ties material readiness to the activity that needs it. Required-on-site comes from the activity start; slack = required minus ETA. The Building 17 medium-voltage switchgear has negative slack, so it gates electrical fit-out and cascades into commissioning. See the Procurement page.";
  if (has("punch", "closeout", "close-out")) return "KEYSTONE tracks the commissioning tail by system. Building 16 is the only building in closeout; Controls / BMS is the densest open list and the practical gate on L4 functional testing. The closeout percentage is the real measure of how much tail remains. See the Punchlist page.";
  if (has("look-ahead", "lookahead", "look ahead", "three week", "3 week", "marshal")) return "MARSHAL builds the 3-week look-ahead straight from the live schedule, so the field plan and the program never drift apart. Each activity carries its constraints — gating predecessor, forecast slip, weather exposure — to resolve in week one. It's built to read on a phone in the daily huddle. See the Look-ahead page.";
  if (has("quality", "warden", "report score", "completeness")) return "WARDEN scores every daily report 0-100 for completeness (quantities, narrative, photos, crew, zone, events) and nudges the crew on what's missing. A complete report is what makes the rolled-up numbers defensible. Persistent low scores route to COACH. See the Report quality page.";
  if (has("coach", "training", "teach", "learn", "how do i read", "what does cpi", "skill")) return "COACH delivers just-in-time training — short, role-aware lessons on the critical skills (reading the critical path, earned value, RAG/trend, commissioning levels, RFI management, manpower loading, procurement risk, and more), surfaced on the right screen at the right moment. Each lesson ends with a concrete action on real program data. See the Coach page.";
  if (has("librarian", "knowledge base", "source", "credibility", "reliab", "vet"))
    return "LIBRARIAN builds and curates the knowledge base and screens every external source for reliability and credibility before any agent acts on it. Sources are scored (Authority 40, Recency 20, Corroboration 25, Track record 15) and tiered: Authoritative (95+), Vetted (80-94), Community (60-79, must be corroborated), or Quarantined (under 60, no agent may use it). The weather forecast, for instance, traces to the National Weather Service at 98/100. See the Knowledge base page.";
  if (has("forge", "solutions factory", "unforeseen", "unforecast", "new challenge", "factory"))
    return "FORGE is the agentic solutions factory. When a challenge appears that no standing specialist covers, FORGE designs a purpose-built solution by composing existing agents, tools, and data into a new micro-agent, workflow, or playbook; a human owner approves it; FORGE deploys it and then folds durable patterns into the roster or retires one-offs. Examples here include LONG-LEAD REROUTE (switchgear typhoon exposure) and RFI-EXPEDITER (now folded into the look-ahead). See the Solutions factory page.";
  if (has("commission", "cx", "keystone")) return "Commissioning is tracked by KEYSTONE across levels L1-L5. Building 16 commissioning is at 12% and behind, gated on a switchgear energization milestone; Buildings 17 and 18 have not started commissioning.";
  if (has("what is this", "what does this", "overview", "explain the platform", "how does this work")) return "This is a multi-site data center construction reporting platform. Daily field reports roll up automatically into weekly through annual reports that managers approve, every site has an interactive RAG dashboard that drills from program down to the daily entry, and 23 agents under BERNARD handle synthesis, forecasting, and governance. All numbers are computed deterministically; the agents narrate.";
  return "I can answer that fully once an API key is set (OPENAI_API_KEY) in the environment. For this key-free demo I can still answer common questions, try: \"What's behind schedule?\", \"Why is Building 17 electrical red?\", \"What does AUGUR do?\", or \"How does the RAG trend work?\"";
}
