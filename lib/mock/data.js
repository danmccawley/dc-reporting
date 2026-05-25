// SINGLE ATOMIC STORE MODEL.
// Everything the platform reports is derived from one store of dated atomic
// entries (`entries`) plus a set of versioned references (budgets, targets,
// planned capacity, schedule baselines). Progress, cost, capacity,
// commissioning, and KPIs are all COMPUTED from the store — nothing derived is
// stored. In the real build, swap the store for the API/data layer; the
// derivations and the export shapes stay the same.

export const buildings = [
  { id: "16", name: "Building 16", phase: "Fit-out & commissioning" },
  { id: "17", name: "Building 17", phase: "Structural to MEP fit-out" },
  { id: "18", name: "Building 18", phase: "Site & foundations" },
];

export const scopes = [
  { slug: "foundation", name: "Foundation", group: "Structural" },
  { slug: "slab-on-grade", name: "Slab on grade", group: "Structural" },
  { slug: "steel-erection", name: "Steel erection", group: "Structural" },
  { slug: "steel-decking", name: "Steel decking", group: "Structural" },
  { slug: "imp-envelope", name: "IMP / envelope", group: "External" },
  { slug: "electrical", name: "Electrical fit-out", group: "Fit-out" },
  { slug: "mechanical", name: "Mechanical / cooling", group: "Fit-out" },
  { slug: "lv-cabling", name: "LV / structured cabling", group: "Fit-out" },
  { slug: "commissioning", name: "Commissioning", group: "Cx" },
];

export function getScope(slug) { return scopes.find((s) => s.slug === slug) || null; }
export function getBuilding(id) { return buildings.find((b) => b.id === id) || null; }

// ---------------------------------------------------------------------------
// VERSIONED REFERENCES (planned/target inputs — not summed from daily data).
// ---------------------------------------------------------------------------

// Cumulative percent-complete that the field has reported per scope x building.
// In production this is the running sum of installed quantities; here it seeds
// the atomic entries we generate below.
const PROGRESS_REF = {
  foundation: { 16: 100, 17: 100, 18: 71 },
  "slab-on-grade": { 16: 100, 17: 95, 18: 40 },
  "steel-erection": { 16: 100, 17: 88, 18: 18 },
  "steel-decking": { 16: 98, 17: 76, 18: 0 },
  "imp-envelope": { 16: 92, 17: 54, 18: 0 },
  electrical: { 16: 64, 17: 33, 18: 0 },
  mechanical: { 16: 58, 17: 28, 18: 0 },
  "lv-cabling": { 16: 41, 17: 9, 18: 0 },
  commissioning: { 16: 12, 17: 0, 18: 0 },
};

const MW = { 16: 96, 17: 96, 18: 120 };
const SCOPE_BUDGET = {
  foundation: 38, "slab-on-grade": 16, "steel-erection": 34, "steel-decking": 12,
  "imp-envelope": 22, electrical: 96, mechanical: 84, "lv-cabling": 28, commissioning: 30,
};
function cpiSeed(slug, bid) {
  const base = { foundation: 1.02, "slab-on-grade": 0.97, "steel-erection": 0.94, "steel-decking": 1.0, "imp-envelope": 0.99, electrical: 0.93, mechanical: 0.96, "lv-cabling": 1.01, commissioning: 0.98 };
  const adj = bid == 17 ? -0.03 : bid == 18 ? -0.02 : 0.01;
  return Math.max(0.85, (base[slug] || 1) + adj);
}

const KPI_DEFS = [
  { id: "cabling-productivity", name: "Cabling productivity", unit: "m / shift", higherIsBetter: true, target: 120,
    series: { 16: [104, 108, 101, 110, 99, 106, 109, 112], 17: [72, 80, 76, 84, 79, 90, 96, 101], 18: [40, 44] } },
  { id: "rfi-turnaround", name: "RFI turnaround", unit: "days", higherIsBetter: false, target: 5,
    series: { 16: [5.2, 4.8, 5.1, 4.6, 5.0, 4.9, 5.1, 4.7], 17: [6.0, 5.8, 6.1, 6.4, 5.9, 6.2, 7.6, 9.2], 18: [4.0, 4.5] } },
  { id: "spi", name: "Schedule performance (SPI)", unit: "index", higherIsBetter: true, target: 1.0,
    series: { 16: [0.98, 1.0, 1.01, 0.99, 1.02, 1.01, 1.03, 1.02], 17: [0.95, 0.94, 0.93, 0.92, 0.9, 0.89, 0.87, 0.84], 18: [0.99, 0.97] } },
  { id: "cpi", name: "Cost performance (CPI)", unit: "index", higherIsBetter: true, target: 1.0,
    series: { 16: [1.01, 1.0, 1.02, 1.01, 1.0, 1.01, 1.0, 1.01], 17: [0.99, 0.98, 0.97, 0.98, 0.96, 0.95, 0.95, 0.94], 18: [1.0, 1.0] } },
  { id: "trir", name: "Safety (TRIR)", unit: "per 200k hrs", higherIsBetter: false, target: 1.0,
    series: { 16: [0.9, 0.8, 0.85, 0.7, 0.75, 0.7, 0.65, 0.6], 17: [1.1, 1.0, 0.95, 1.05, 0.9, 0.95, 0.9, 0.88], 18: [0.0, 0.0] } },
  { id: "ncr-open", name: "Open NCRs", unit: "count", higherIsBetter: false, target: 5,
    series: { 16: [4, 5, 4, 6, 5, 4, 5, 4], 17: [6, 7, 8, 9, 10, 11, 13, 14], 18: [1, 2] } },
];

const CAP_REF = {
  16: { mwPlanned: 96, mwCommissioned: 62, hallsTotal: 6, hallsEnergized: 4, racksReady: 540, racksTotal: 900, firstPower: "Live", goLive: "Q4 2026", confidence: 84 },
  17: { mwPlanned: 96, mwCommissioned: 28, hallsTotal: 6, hallsEnergized: 2, racksReady: 180, racksTotal: 900, firstPower: "Q3 2026", goLive: "Q1 2027", confidence: 61 },
  18: { mwPlanned: 120, mwCommissioned: 0, hallsTotal: 8, hallsEnergized: 0, racksReady: 0, racksTotal: 1200, firstPower: "Q1 2027", goLive: "Q3 2027", confidence: 38 },
};

const CX_LABELS = ["L1 · Factory / component", "L2 · Site acceptance", "L3 · Pre-functional", "L4 · Functional", "L5 · Integrated systems test"];
const CX_REF = { 16: [100, 100, 88, 62, 30], 17: [92, 70, 34, 8, 0], 18: [40, 0, 0, 0, 0] };

const DATES = ["Fri, May 22", "Thu, May 21", "Wed, May 20", "Tue, May 19"];
const ZONES = { 16: "Data hall area 1A", 17: "Data hall area 2B", 18: "Foundation area C" };
const AUTHORS = ["Generic CM", "Generic PM", "Generic CM", "Generic PM"];
const RATE_M = 0.0012; // $M per worker-shift

// ---------------------------------------------------------------------------
// THE ATOMIC STORE — one dated, tagged entry per fact. Everything derives here.
// ---------------------------------------------------------------------------
export const entries = [];
(function build() {
  // Progress + labor cost (per scope x building x day).
  scopes.forEach((s, si) => {
    buildings.forEach((b) => {
      const p = (PROGRESS_REF[s.slug] && PROGRESS_REF[s.slug][b.id]) || 0;
      if (p <= 0) return;
      const bid = b.id, zone = ZONES[bid] || "Site area", name = s.name;
      const budget = (SCOPE_BUDGET[s.slug] || 20) * (MW[bid] / 96);
      const cpi = cpiSeed(s.slug, bid);
      const earned = (budget * p) / 100;
      const targetActual = cpi > 0 ? earned / cpi : earned;
      const baselineInstalled = Math.max(0, p - 8);
      const perDay = (p - baselineInstalled) / 4;
      let visLaborM = 0;
      for (let i = 0; i < 4; i++) {
        const cum = p - perDay * i; // i=0 is newest (= p)
        const headcount = 16 - i;
        const laborM = headcount * RATE_M;
        visLaborM += laborM;
        // A few crews file thin reports on the blocker day — short narrative, no
        // photos — so WARDEN's completeness scoring has something real to flag.
        const thin = i === 2 && si % 2 === 0;
        entries.push({
          type: "progress", baseline: false, slug: s.slug, building: bid, date: DATES[i], author: AUTHORS[i], zone,
          pct: Math.round(cum), installed: perDay, headcount, labor: laborM, cost: Math.round(headcount * 1.2 * 10) / 10,
          note: thin
            ? "Worked the area."
            : i === 0
            ? `${name} progressing in ${zone}. Logged today's installed quantities; open constraints captured for the look-ahead.`
            : `Continued ${name.toLowerCase()} in ${zone}. Crew on plan; minor sequencing notes recorded.`,
          events: i === 2 ? ["Delay / blocker — RFI / design"] : i === 1 ? ["Safety near-miss (closed same shift)"] : [],
          photos: thin ? [] : Array.from({ length: i % 2 === 0 ? 3 : 2 }, (_, k) => ({ id: `${s.slug}-${bid}-${i}-${k}`, caption: `${name} · ${zone}`, date: DATES[i], tag: ["Progress", "As-built", "Constraint"][k] || "Photo" })),
        });
      }
      entries.push({
        type: "progress", baseline: true, slug: s.slug, building: bid, date: "Prior to May 19", author: "Generic CM", zone,
        pct: Math.round(baselineInstalled), installed: baselineInstalled, headcount: 0, labor: Math.max(0, targetActual - visLaborM), cost: 0,
        note: "Cumulative installed quantities and labor recorded prior to the visible reporting window.", events: [], photos: [],
      });
    });
  });
  // KPI readings (weekly, per building).
  KPI_DEFS.forEach((def) => { buildings.forEach((b) => { (def.series[b.id] || []).forEach((value, w) => { entries.push({ type: "kpi", kpi: def.id, building: b.id, week: w, value }); }); }); });
  // Capacity events (energization, MW accepted, racks ready).
  buildings.forEach((b) => {
    const r = CAP_REF[b.id], halls = r.hallsEnergized;
    if (halls > 0) {
      const mwEach = r.mwCommissioned / halls, rackEach = r.racksReady / halls;
      for (let h = 0; h < halls; h++) {
        entries.push({ type: "capacity", building: b.id, kind: "hall", value: 1, date: DATES[0] });
        entries.push({ type: "capacity", building: b.id, kind: "mw", value: mwEach, date: DATES[0] });
        entries.push({ type: "capacity", building: b.id, kind: "rack", value: rackEach, date: DATES[0] });
      }
    }
  });
  // Commissioning sign-off readings (per Cx level).
  buildings.forEach((b) => { (CX_REF[b.id] || []).forEach((pct, i) => { entries.push({ type: "cx", building: b.id, level: i, pct, date: DATES[0] }); }); });
})();

// ---------------------------------------------------------------------------
// DERIVATIONS — recomputed from the store, never stored.
// ---------------------------------------------------------------------------
function progressEntries(slug, bid) { return entries.filter((e) => e.type === "progress" && e.slug === slug && e.building == bid); }
function scopeProgress(slug, bid) { return Math.round(progressEntries(slug, bid).reduce((a, e) => a + e.installed, 0)); }
function scopeActual(slug, bid) { return progressEntries(slug, bid).reduce((a, e) => a + e.labor, 0); }
function statusFromPct(p) { return p <= 0 ? "n" : p >= 85 ? "g" : p >= 41 ? "a" : "r"; }
function cxStatusFromPct(p) { return p <= 0 ? "n" : p >= 85 ? "g" : p >= 55 ? "a" : "r"; }

// Progress heat map — computed from summed installed quantities.
export const scopeMatrix = (() => {
  const m = {};
  scopes.forEach((s) => { m[s.slug] = {}; buildings.forEach((b) => { const p = scopeProgress(s.slug, b.id); m[s.slug][b.id] = [p, statusFromPct(p)]; }); });
  return m;
})();

// KPIs — series rebuilt from the weekly readings in the store.
export const kpis = KPI_DEFS.map((def) => ({
  id: def.id, name: def.name, unit: def.unit, higherIsBetter: def.higherIsBetter, target: def.target,
  series: Object.fromEntries(buildings.map((b) => [b.id, entries.filter((e) => e.type === "kpi" && e.kpi === def.id && e.building == b.id).sort((x, y) => x.week - y.week).map((e) => e.value)])),
}));

// Capacity — actuals summed from capacity events; planned values are references.
export const capacity = buildings.map((b) => {
  const ev = entries.filter((e) => e.type === "capacity" && e.building == b.id);
  const r = CAP_REF[b.id];
  return {
    id: b.id, name: b.name, mwPlanned: r.mwPlanned,
    mwCommissioned: Math.round(ev.filter((e) => e.kind === "mw").reduce((a, e) => a + e.value, 0)),
    hallsTotal: r.hallsTotal, hallsEnergized: ev.filter((e) => e.kind === "hall").length,
    racksReady: Math.round(ev.filter((e) => e.kind === "rack").reduce((a, e) => a + e.value, 0)),
    racksTotal: r.racksTotal, firstPower: r.firstPower, goLive: r.goLive, confidence: r.confidence,
  };
});

// Commissioning — level percent read from sign-off entries; status computed.
export const commissioning = buildings.map((b) => ({
  id: b.id, name: b.name,
  levels: CX_LABELS.map((lbl, i) => { const e = entries.find((x) => x.type === "cx" && x.building == b.id && x.level === i); const pct = e ? e.pct : 0; return { lvl: lbl, pct, status: cxStatusFromPct(pct) }; }),
}));

// Cost (COMPTROLLER) — earned value derived from progress + budgets; actual summed from labor entries.
export function getScopeCost(slug, building) {
  const pct = scopeProgress(slug, building);
  const st = scopeMatrix[slug][building][1];
  const bac = (SCOPE_BUDGET[slug] || 20) * (MW[building] / 96);
  const ev = (bac * pct) / 100;
  const ac = scopeActual(slug, building);
  const cpi = ac > 0 ? ev / ac : 1;
  const committed = Math.min(bac, ac + (bac - ev) * 0.6);
  const eac = cpi > 0 ? bac / cpi : bac;
  return { slug, building, pct, st, bac, ev, ac, committed, cpi, eac };
}
export function getBuildingCost(building) {
  const rows = scopes.map((s) => ({ name: s.name, ...getScopeCost(s.slug, building) }));
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  const ev = sum("ev"), ac = sum("ac");
  return { id: building, name: getBuilding(building).name, mw: MW[building], rows, bac: sum("bac"), ev, ac, committed: sum("committed"), eac: sum("eac"), cpi: ac > 0 ? ev / ac : 1 };
}
export function getProgramCost() {
  const bldgs = buildings.map((b) => getBuildingCost(b.id));
  const sum = (k) => bldgs.reduce((a, r) => a + r[k], 0);
  const ev = sum("ev"), ac = sum("ac");
  return { buildings: bldgs, bac: sum("bac"), ev, ac, committed: sum("committed"), eac: sum("eac"), cpi: ac > 0 ? ev / ac : 1 };
}

// Daily reports for a scope at a building — the actual atomic entries (visible window).
export function getDailyEntries(slug, building) {
  return progressEntries(slug, building).filter((e) => !e.baseline).map((e) => ({
    date: e.date, author: e.author, zone: e.zone, pct: e.pct, headcount: e.headcount, cost: e.cost, note: e.note, events: e.events, photos: e.photos,
  }));
}

// SCOUT spatial verification — reported (computed) vs photo-observed.
export function getVerification() {
  const rows = [];
  const deltas = [0, -2, -9, -4, 3, -7, 1, -11, -3];
  scopes.forEach((s, si) => {
    buildings.forEach((b) => {
      const [reported, st] = scopeMatrix[s.slug][b.id];
      if (st === "n" || reported === 0) return;
      const delta = deltas[(si + b.id.charCodeAt(1)) % deltas.length];
      const observed = Math.max(0, Math.min(100, reported + delta));
      const variance = observed - reported;
      rows.push({ scope: s.name, slug: s.slug, building: b.name, bid: b.id, reported, observed, variance, flag: Math.abs(variance) >= 6 });
    });
  });
  return rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
}

// Site photos grouped by the day taken, for the weekly/launchable report.
export function getReportPhotosByDay(building) {
  const b = building === "program" ? "17" : building;
  const inProgress = scopes.filter((s) => { const c = scopeMatrix[s.slug][b]; return c && c[1] !== "n" && c[0] > 0; }).slice(0, 3);
  const byDay = {};
  inProgress.forEach((s) => { getDailyEntries(s.slug, b).forEach((e) => { byDay[e.date] = (byDay[e.date] || []).concat(e.photos); }); });
  const order = ["Fri, May 22", "Thu, May 21", "Wed, May 20", "Tue, May 19"];
  return order.filter((d) => byDay[d]).map((d) => ({ date: d, photos: byDay[d].slice(0, 6) }));
}

// Proof helpers for the "Data model" admin panel.
export function atomicStats() {
  const by = (t) => entries.filter((e) => e.type === t).length;
  return { total: entries.length, progress: by("progress"), kpi: by("kpi"), capacity: by("capacity"), cx: by("cx") };
}
export function workedExample() {
  const slug = "electrical", bid = "16";
  const es = progressEntries(slug, bid);
  const cost = getScopeCost(slug, bid);
  return {
    label: "Electrical fit-out · Building 16",
    rows: es.map((e) => ({ date: e.date, installed: Math.round(e.installed * 10) / 10, labor: Math.round(e.labor * 100) / 100, baseline: e.baseline })),
    pct: scopeProgress(slug, bid), bac: cost.bac, ev: cost.ev, ac: cost.ac, cpi: cost.cpi,
  };
}

// ---------------------------------------------------------------------------
// References & static content preserved as-is.
// ---------------------------------------------------------------------------
export const alerts = [
  { agent: "SENTINEL", severity: "r", text: "Switchgear lot for Building 17 at delivery risk. Typhoon tracking near supplier hub; QUARTERMASTER projects a 2 to 4 week slip that cascades into electrical fit-out and Cx.", href: "/procurement" },
  { agent: "MUSTER", severity: "a", text: "Building 17 is forecast late on electrical and LV; holding the planned dates needs an estimated crew add across the critical-path scopes. See the manpower forecast for the per-scope gap.", href: "/manpower" },
  { agent: "AUGUR", severity: "a", text: "Building 17 RFI turnaround is up 51% over its 4-week average. Lagged correlation (2 weeks) with the LV cabling productivity dip. Candidate root cause flagged for human review.", href: "/insights" },
  { agent: "SENTINEL", severity: "a", text: "Two severe storm days and a high-wind advisory fall in the next 10 days. PATHFINDER attributes the largest weather slip to Building 18 (foundations, slab, steel) and Building 17 steel and envelope.", href: "/weather" },
  { agent: "KEYSTONE", severity: "r", text: "Building 16 commissioning is behind plan at 12%. L4 functional scripts gated on switchgear energization; Controls / BMS is the densest open punch list.", href: "/punchlist" },
  { agent: "WARDEN", severity: "a", text: "A handful of recent daily reports are below the completeness threshold (missing photos or quantities). Nudges sent; persistent gaps route to COACH.", href: "/quality" },
  { agent: "FORGE", severity: "a", text: "Switchgear typhoon exposure had no standing playbook, so FORGE assembled a LONG-LEAD REROUTE workflow (QUARTERMASTER + SENTINEL + PATHFINDER + DIPLOMAT). Deployed; awaiting the PM's reroute decision.", href: "/forge" },
  { agent: "LIBRARIAN", severity: "g", text: "Weather signal verified against the National Weather Service (98/100, Authoritative). A trade-forum source was quarantined and is not cleared for any agent to act on.", href: "/library" },
  { agent: "PROVOST", severity: "a", text: "Two regulatory items gate Building 18: the EPA / state air permit plus SPCC must clear before the generators start, and the superstructure building permit must clear before steel sequence 2. OSHA fall protection on the B18 leading edge is flagged for action.", href: "/compliance" },
  { agent: "GUARDIAN", severity: "g", text: "Building 16 TRIR trending down four weeks running, now 0.60 against a 1.0 target.", href: "/site/16" },
];

export const weeklyReport = {
  id: "wk-2026-21-bldg17", building: "17", week: "Week 21, 2026", status: "draft",
  narrative: "Structural topping out on the east bays held to plan this week. IMP installation continued on the north elevation. The headline risk remains electrical fit-out: RFI turnaround climbed to 9.2 days against a 6.1-day baseline, and switchgear delivery is now flagged at risk by SENTINEL. LV cabling productivity recovered toward 101 m/shift after two soft weeks. Recommend escalating the switchgear procurement risk and a focused RFI clearance push with the design team.",
  metrics: [ { label: "SPI", value: "0.84", status: "r" }, { label: "CPI", value: "0.94", status: "a" }, { label: "Open NCRs", value: "14", status: "r" }, { label: "RFI turnaround", value: "9.2 days", status: "r" } ],
};

export const dailyEntries = [
  { date: "Fri, May 22", author: "Generic CM", zone: "Data hall 2B", note: "Tray complete in 2B mains; pulled 1,180 m backbone. Two RFIs outstanding on penetration details holding pathway at the MMR.", pct: 41, headcount: 14 },
  { date: "Thu, May 21", author: "Generic CM", zone: "Data hall 2B", note: "Pull resumed after access cleared. Productivity back up. Logged 1 near-miss (housekeeping) closed same shift.", pct: 38, headcount: 13 },
  { date: "Wed, May 20", author: "Generic CM", zone: "MMR / 2A", note: "Slow shift. Waiting on RFI-0442 (sleeve locations). Crew redeployed to ladder rack in 2A to avoid idle time.", pct: 36, headcount: 13 },
];

export const reports = [
  { id: "wk-17", building: "17", cadence: "Weekly", period: "Week 21, 2026", status: "draft", summary: "Structural topping out on the east bays held to plan. IMP installation continued on the north elevation. The headline risk is electrical fit-out: RFI turnaround climbed to 9.2 days against a 6.1-day baseline, and switchgear delivery is flagged at risk by SENTINEL. LV cabling productivity recovered toward 101 m/shift after two soft weeks." },
  { id: "wk-16", building: "16", cadence: "Weekly", period: "Week 21, 2026", status: "approved", summary: "Building 16 is into fit-out and early commissioning. Envelope and structure are complete. Electrical and mechanical fit-out are progressing on plan; commissioning L1-L2 is underway but L4 functional scripts are gated on a switchgear energization milestone. Safety continues to trend down (TRIR 0.60)." },
  { id: "wk-18", building: "18", cadence: "Weekly", period: "Week 21, 2026", status: "approved", summary: "Building 18 is in site and foundations. Foundations are at 71% and slab-on-grade has begun. Steel and all downstream scopes are not yet started. Only two weeks of data exist, so trend indicators remain neutral until a four-week baseline forms." },
  { id: "mo-program", building: "program", cadence: "Monthly", period: "May 2026", status: "draft", summary: "Program-wide, the three buildings span the full delivery curve: 16 in fit-out/commissioning, 17 in structural-to-MEP, 18 in the ground. The dominant program risk is the Building 17 switchgear delivery exposure, which cascades to electrical fit-out and commissioning across the schedule. RFI turnaround at Building 17 is the leading internal indicator to watch." },
];
export function getReport(id) { return reports.find((r) => r.id === id) || null; }

export const schedule = [
  { id: "16", name: "Building 16", confidence: 84, p50: "Q4 2026", p80: "Q1 2027", critical: "Switchgear energization", milestones: [
    { name: "Foundations", when: "Complete", t: 8, status: "g" }, { name: "Structure topped out", when: "Complete", t: 22, status: "g" }, { name: "Dry-in", when: "Complete", t: 36, status: "g" }, { name: "MEP rough-in", when: "In progress", t: 54, status: "a" }, { name: "Energization", when: "Q2 2026", t: 72, status: "a" }, { name: "Cx complete", when: "Q3 2026", t: 86, status: "a" }, { name: "Go-live", when: "Q4 2026", t: 96, status: "a" } ] },
  { id: "17", name: "Building 17", confidence: 61, p50: "Q1 2027", p80: "Q2 2027", critical: "Long-lead switchgear delivery", milestones: [
    { name: "Foundations", when: "Complete", t: 8, status: "g" }, { name: "Structure", when: "In progress", t: 26, status: "a" }, { name: "Dry-in", when: "Q3 2026", t: 44, status: "a" }, { name: "MEP rough-in", when: "Q4 2026", t: 60, status: "r" }, { name: "Energization", when: "Q3 2026", t: 74, status: "r" }, { name: "Cx complete", when: "Q4 2026", t: 88, status: "a" }, { name: "Go-live", when: "Q1 2027", t: 96, status: "a" } ] },
  { id: "18", name: "Building 18", confidence: 38, p50: "Q3 2027", p80: "Q4 2027", critical: "Site civil and foundations", milestones: [
    { name: "Foundations", when: "In progress", t: 12, status: "a" }, { name: "Structure", when: "Q4 2026", t: 30, status: "r" }, { name: "Dry-in", when: "Q1 2027", t: 48, status: "r" }, { name: "MEP rough-in", when: "Q2 2027", t: 64, status: "r" }, { name: "Energization", when: "Q1 2027", t: 78, status: "r" }, { name: "Cx complete", when: "Q2 2027", t: 90, status: "r" }, { name: "Go-live", when: "Q3 2027", t: 97, status: "r" } ] },
];

export const users = [
  { name: "D. McCawley", email: "dmccawley", role: "ADMIN" },
  { name: "A. Rivera", email: "arivera", role: "CM" },
  { name: "T. Okafor", email: "tokafor", role: "CM" },
  { name: "S. Lindqvist", email: "slindqvist", role: "PM" },
  { name: "M. Hassan", email: "mhassan", role: "PM" },
  { name: "J. Park", email: "jpark", role: "CIM" },
  { name: "R. Delgado", email: "rdelgado", role: "CIM" },
];

export const integrations = [
  { name: "Procore", kind: "Field execution", status: "Connected", ingests: "RFIs, submittals, daily logs, inspections" },
  { name: "Autodesk Construction Cloud", kind: "BIM / documents", status: "Connected", ingests: "Drawings, models, issues, sheets" },
  { name: "Oracle Aconex", kind: "Document control", status: "Available", ingests: "Transmittals, correspondence, the project record" },
  { name: "Primavera P6", kind: "Master schedule", status: "Connected", ingests: "Activities, milestones, critical path, float" },
  { name: "ERP / Accounting (Sage)", kind: "Cost", status: "Available", ingests: "Commitments, invoices, actual cost" },
  { name: "Kahua / e-Builder", kind: "Owner program", status: "Available", ingests: "Capital, funding, program governance records" },
];
