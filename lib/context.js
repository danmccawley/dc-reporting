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
MARSHAL (field coordination + 3-week look-ahead), PROVOST (compliance & regulatory — a live
register across OSHA, federal, state, local, and environmental law, each requirement mapped to the
work it affects and to a LIBRARIAN-vetted authority; surfaces and tracks, not legal advice),
COMPTROLLER (cost), AUGUR (predictive
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
  if (has("commitment", "change order", "invoice", "pay app", "contract", "actual cost", "billed", "retention"))
    return "Cost is a native module (commitments, change orders, and pay applications built into the platform instead of an ERP integration). Earned value (CPI/EAC) is computed from the atomic store; this adds the commercial layer. Right now there is about a quarter-million in pending change orders (the largest is the switchgear lineup revision per RFI-118) and several open pay applications. Actual cost reconciles to the atomic labor entries. See the Commitments page; an org can switch this domain to an ERP adapter in the provider registry.";
  if (has("rfi", "submittal", "inspection", "ball in court", "ball-in-court"))
    return "RFIs, submittals, and inspections are a native module (the field workflow built in instead of a Procore integration). Two RFIs are open on the critical path — the Building 18 sequence-2 connection detail (with the EOR, gating steel) and items around the switchgear — and they feed MARSHAL's look-ahead and AUGUR's schedule-impact watch. The switchgear submittal ties to QUARTERMASTER's long-lead risk, and a fall-protection inspection deficiency is the same item PROVOST tracks under OSHA. RFI responses link to their document-control record. See the RFIs & submittals page.";
  if (has("governance", "owner capital", "budget", "funding", "capital", "stage gate", "gate", "approval", "milestone", "kahua", "e-builder"))
    return "Governance is a native module (program capital, funding, stage-gate approvals, and owner milestones built in instead of a Kahua / e-Builder integration). Committed and spent reconcile to the native cost module. Two stage gates are not yet released and both trace to compliance: the Building 18 superstructure funding waits on the superstructure permit, and the generator package is blocked on the EPA / state air permit and SPCC. See the Governance page; an org can switch this domain to a Kahua adapter in the provider registry.";
  if (has("drawing", "sheet", "bim", "model", "clash", "coordination", "acc", "autodesk", "set ", "issuance"))
    return "Drawings & models is a native module (a sheet/version register and coordination tracker built in instead of an Autodesk ACC integration). It tracks the current revision of every sheet, the drawing sets/issuances, and high-level model coordination, and pairs each sheet with its controlled record (document control) and its place on the maps. Open coordination items link to the RFIs resolving them — for example the CRAH-vs-cable-tray clash is RFI-119. It is a sheet/version and coordination register, not a model-authoring tool. See the Drawings & models page.";
  if (has("provider", "integrate", "replace", "native module", "aconex", "procore", "p6", "primavera", "swappable", "registry"))
    return "Every external capability is a swappable provider. Each domain — field/RFIs, BIM/drawings, document control, schedule, cost, governance — can be served by an integration adapter (Procore, ACC, Aconex, P6, ERP, Kahua) or by a native module built into the platform, chosen per customer and per site (mixed mode is the default). The core and all derivations are provider-agnostic; records are tagged with the provider that supplied them. Document control is native and GA today; the schedule (CPM) and cost (EVM) are native; field and BIM are native-in-progress with adapters available; governance integrates until its native module ships. See the Provider registry.";
  if (has("document control", "records", "transmittal", "revision", "submittal", "project record", "drawing register"))
    return "Document control is a native module (the project record built into the platform instead of Aconex): a controlled register with revision history, transmittals, and controlled distribution. NOTARY owns versioning and the audit trail; LIBRARIAN handles retrieval. Every document is an atomic record tagged Native, so nothing depends on an external system — and an org that prefers Aconex can switch this domain to the integration adapter without changing anything else. See the Document control page.";
  if (has("compliance", "osha", "regulat", "permit", "environmental", "provost", "law", "code", "epa", "fall protection", "swppp"))
    return "PROVOST keeps a live compliance register across OSHA, federal, state, local, and environmental requirements, each mapped to the work it affects and tied to a LIBRARIAN-vetted authority (OSHA, eCFR, EPA, or the AHJ). Right now it has two items gating work: the EPA/state air permit and the SPCC plan must clear before the Building 18 generators start, and the Building 18 superstructure permit must clear before steel sequence 2. OSHA fall protection on the B18 leading edge and the confined-space permit program are flagged for action. It surfaces and tracks; it is not legal advice. See the Compliance page.";
  if (has("forge", "solutions factory", "unforeseen", "unforecast", "new challenge", "factory"))
    return "FORGE is the agentic solutions factory. When a challenge appears that no standing specialist covers, FORGE designs a purpose-built solution by composing existing agents, tools, and data into a new micro-agent, workflow, or playbook; a human owner approves it; FORGE deploys it and then folds durable patterns into the roster or retires one-offs. Examples here include LONG-LEAD REROUTE (switchgear typhoon exposure) and RFI-EXPEDITER (now folded into the look-ahead). See the Solutions factory page.";
  if (has("commission", "cx", "keystone")) return "Commissioning is tracked by KEYSTONE across levels L1-L5. Building 16 commissioning is at 12% and behind, gated on a switchgear energization milestone; Buildings 17 and 18 have not started commissioning.";
  if (has("what is this", "what does this", "overview", "explain the platform", "how does this work")) return "This is a multi-site data center construction reporting platform. Daily field reports roll up automatically into weekly through annual reports that managers approve, every site has an interactive RAG dashboard that drills from program down to the daily entry, and 23 agents under BERNARD handle synthesis, forecasting, and governance. All numbers are computed deterministically; the agents narrate.";
  return "I can answer that fully once an API key is set (OPENAI_API_KEY) in the environment. For this key-free demo I can still answer common questions, try: \"What's behind schedule?\", \"Why is Building 17 electrical red?\", \"What does AUGUR do?\", or \"How does the RAG trend work?\"";
}

// Bernard can summarize whatever page the user is on — useful hands-free / driving.
const PAGE_SUMMARY = {
  "/": "This is the executive view: a red/amber/green heat map of every scope across Buildings 16, 17, and 18, with the agent alert feed. Building 16 leads, 17 is mid-fit-out, 18 is early structure. Tap any cell to drill in.",
  "/site": "This is a building view: each scope's percent complete, status, and trend, with the daily reports behind it. Drill into a scope to see the atomic entries.",
  "/scope": "This is a scope view: the day-by-day atomic entries that roll up to this number, plus status and trend. This is the single source of truth everything else computes from.",
  "/schedule": "This is the schedule: activities with start and finish, the critical path, and forecast finish driven by field progress. Red is the critical chain where a day lost is a day lost on go-live.",
  "/plan": "This is the build plan and critical path: float by activity and what is driving the forecast finish. Activities with no float are the ones to protect.",
  "/lookahead": "This is the three-week look-ahead from MARSHAL: what is planned, what is constrained, and what is ready to release to the field.",
  "/manpower": "This is the manpower forecast from MUSTER: the crew each scope needs to hold its planned finish, and where you are short.",
  "/procurement": "This is procurement from QUARTERMASTER: long-lead material readiness as a schedule risk. The medium-voltage switchgear is the item to watch.",
  "/weather": "This is the weather and delay view from SENTINEL and PATHFINDER: the forecast turned into predicted slip, verified against the National Weather Service. Severe-weather days are flagged.",
  "/punchlist": "This is closeout from KEYSTONE: the commissioning punchlist by system for Building 16, and what stands between here and energization.",
  "/quality": "This is report quality from WARDEN: how complete each daily report is, because a complete report is what makes every rolled-up number defensible.",
  "/cost": "This is earned value: CPI and EAC computed from the atomic labor entries. It pairs with the native commitments module.",
  "/commitments": "This is native cost management: contracts, change orders, and pay applications, with about a quarter-million in pending change orders. Actual cost reconciles to the field labor entries.",
  "/governance": "This is owner capital and governance: program capital, funding, and stage-gate approvals. Two gates are open, both waiting on compliance items for Building 18.",
  "/records": "This is native document control: the controlled register with revision history, transmittals, and distribution. Every document is an atomic record owned by NOTARY.",
  "/drawings": "This is native drawings and models: the sheet register, drawing sets, and coordination tracker, each sheet tied to its record and its place on the map.",
  "/rfis": "This is the native field workflow: RFIs, submittals, and inspections. Two RFIs are open on the critical path, including the Building 18 sequence-2 detail.",
  "/compliance": "This is the compliance register from PROVOST: OSHA, federal, state, local, and environmental requirements. Two items gate Building 18 work: the air permit and the superstructure permit.",
  "/commissioning": "This is commissioning from KEYSTONE: levels one through five by system, and the path to energization for Building 16.",
  "/capacity": "This is capacity and go-live readiness: megawatts and racks trending toward each building's online date.",
  "/library": "This is the knowledge base from LIBRARIAN: every external source, credibility-scored and tiered, so agents only act on vetted information.",
  "/forge": "This is the solutions factory from FORGE: how the platform assembles a purpose-built response when a challenge appears that no standing agent covers.",
  "/providers": "This is the provider registry: each capability domain set to integrate with an incumbent tool or run on the native module. Six domains are native, one integrates by choice.",
  "/coach": "This is COACH: short, role-aware lessons surfaced in the flow of work, each playable as a narrated class.",
  "/maps": "This is the site map: scopes placed spatially, with the option to load a real base drawing and calibrate zones.",
  "/insights": "This is insights: cross-program patterns and AUGUR's early-warning signals.",
  "/reports": "This is the report library: every locked weekly, monthly, and quarterly report, versioned and auditable.",
  "/assistant": "This is the assistant page, where I answer anything about the program in plain language, grounded in the live data.",
};
export function pageSummary(path) {
  if (!path) return "I can summarize whatever page you are on and answer questions about it.";
  if (path === "/") return PAGE_SUMMARY["/"];
  const key = Object.keys(PAGE_SUMMARY).filter((k) => k !== "/").sort((a, b) => b.length - a.length).find((k) => path.startsWith(k));
  return key ? PAGE_SUMMARY[key] : "You are on the " + path.replace(/^\//, "") + " page. Ask me anything about the program and I will answer from the live data.";
}
