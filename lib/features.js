// NEW FEATURE DERIVATIONS — every value below is computed from the atomic store
// (lib/mock/data) and the CPM engine (lib/plan). Nothing derived is stored.
// Powers: Weather & delay (SENTINEL+PATHFINDER), Manpower forecast (MUSTER),
// Procurement / long-lead (QUARTERMASTER), Punchlist & closeout (KEYSTONE),
// 3-week look-ahead (MARSHAL), and Daily-report quality scoring (WARDEN).
import { buildings, entries, scopes, scopeMatrix } from "./mock/data";
import { getActivities, DATA_DATE, dayToDate, fmtDate, scheduledIn, actStatus, SCOPE_COLOR } from "./plan";

const round = (v, n = 0) => { const f = 10 ** n; return Math.round(v * f) / f; };

// Outdoor / weather-sensitive scopes (crane + envelope + concrete).
export const WEATHER_SCOPES = ["foundation", "slab-on-grade", "steel-erection", "steel-decking", "imp-envelope"];
const WIND_SCOPES = ["steel-erection", "steel-decking", "imp-envelope"]; // crane / lift sensitive

// ---------------------------------------------------------------------------
// 1. WEATHER & DELAY  (SENTINEL feeds the signal; PATHFINDER converts to slip)
// ---------------------------------------------------------------------------
const WX = [
  { label: "Clear", ic: "☀", hi: 86, precip: 0, wind: 7, sev: "ok" },
  { label: "Partly cloudy", ic: "⛅", hi: 88, precip: 10, wind: 9, sev: "ok" },
  { label: "Scattered storms", ic: "⛈", hi: 81, precip: 70, wind: 22, sev: "severe" },
  { label: "Severe storms / wind", ic: "⛈", hi: 78, precip: 85, wind: 31, sev: "severe" },
  { label: "Showers clearing", ic: "🌦", hi: 83, precip: 45, wind: 16, sev: "watch" },
  { label: "Clear", ic: "☀", hi: 87, precip: 5, wind: 8, sev: "ok" },
  { label: "Clear", ic: "☀", hi: 90, precip: 0, wind: 10, sev: "ok" },
  { label: "High wind advisory", ic: "💨", hi: 85, precip: 15, wind: 28, sev: "watch" },
  { label: "Partly cloudy", ic: "⛅", hi: 86, precip: 20, wind: 12, sev: "ok" },
  { label: "Clear", ic: "☀", hi: 88, precip: 0, wind: 9, sev: "ok" },
];

export function getWeatherForecast() {
  return WX.map((w, i) => ({ ...w, day: DATA_DATE + i, date: fmtDate(DATA_DATE + i), offset: i }));
}

export function getWeatherImpact() {
  const fc = getWeatherForecast();
  const severe = fc.filter((d) => d.sev === "severe");
  const watch = fc.filter((d) => d.sev === "watch");
  const windDays = fc.filter((d) => d.wind >= 25);
  return buildings.map((b) => {
    // Exposure = weather-sensitive scopes actually in progress now (the field is
    // working them today), not the idealized CPM window.
    const acts = getActivities(b.id).filter((a) => a.pct > 0 && a.pct < 100 && WEATHER_SCOPES.includes(a.slug));
    const impacted = acts.map((a) => {
      const windSensitive = WIND_SCOPES.includes(a.slug);
      let slip = severe.length * 1.0 + watch.length * 0.5;
      if (windSensitive) slip += windDays.length * 1.0;
      return { id: a.id, slug: a.slug, name: a.name, windSensitive, slip: round(slip, 1) };
    });
    const slip = impacted.reduce((m, x) => Math.max(m, x.slip), 0);
    return { id: b.id, name: b.name, impacted, slip: round(slip, 1), severeDays: severe.length, watchDays: watch.length };
  });
}

// ---------------------------------------------------------------------------
// 2. MANPOWER FORECAST  (MUSTER) — crew needed to hold the planned finish.
// ---------------------------------------------------------------------------
function latestHeadcount(slug, bid) {
  const e = entries.filter((x) => x.type === "progress" && x.slug === slug && x.building == bid && !x.baseline).sort((a, b) => (b.headcount || 0) - (a.headcount || 0))[0];
  return e ? e.headcount : 0;
}

export function getManpower(building) {
  const acts = getActivities(building).filter((a) => a.pct > 0 && a.pct < 100);
  const rows = acts.map((a) => {
    const current = latestHeadcount(a.slug, building) || 12;
    const daysToPlanned = Math.max(7, a.plannedFinish - DATA_DATE);
    const daysToForecast = Math.max(7, a.forecastFinish - DATA_DATE);
    // Recovery factor: how much you must compress the forecast back into the plan,
    // bounded to a realistic surge (no more than +150% crew on one scope).
    const factor = Math.max(1, Math.min(2.5, daysToForecast / daysToPlanned));
    const required = Math.round(current * factor);
    const gap = required - current;
    return { id: a.id, slug: a.slug, name: a.name, area: a.areaName, critical: a.critical, current, required, gap, pct: a.pct, color: SCOPE_COLOR[a.slug] };
  });
  const current = rows.reduce((s, r) => s + r.current, 0);
  const required = rows.reduce((s, r) => s + r.required, 0);
  return { id: building, rows: rows.sort((x, y) => y.gap - x.gap), current, required, gap: required - current };
}
export function getManpowerProgram() {
  return buildings.map((b) => getManpower(b.id));
}

// ---------------------------------------------------------------------------
// 3. PROCUREMENT / LONG-LEAD  (QUARTERMASTER) — material readiness tied to the
//    activity that needs it; late delivery becomes a gating schedule risk.
// ---------------------------------------------------------------------------
const PROCURE = [
  { item: "Medium-voltage switchgear lineup", building: "17", scope: "electrical", leadWeeks: 38, status: "At risk", note: "Typhoon near supplier hub; SENTINEL flag.", needBy: 20, etaOffset: 41 },
  { item: "Standby generators (3.0 MW)", building: "18", scope: "electrical", leadWeeks: 44, status: "On order", note: "Factory slot confirmed.", needBy: 60, etaOffset: 44 },
  { item: "CRAH / cooling units", building: "17", scope: "mechanical", leadWeeks: 26, status: "In fabrication", note: "On plan.", needBy: 44, etaOffset: 26 },
  { item: "Busway / power distribution", building: "16", scope: "electrical", leadWeeks: 20, status: "Delivered", note: "On site, staged in laydown.", needBy: -8, etaOffset: -30 },
  { item: "Structural steel package", building: "18", scope: "steel-erection", leadWeeks: 22, status: "In fabrication", note: "Mill rolling; sequence 1 first.", needBy: 8, etaOffset: 18 },
  { item: "Structured cabling / fiber", building: "17", scope: "lv-cabling", leadWeeks: 12, status: "On order", note: "Multiple vendors; low risk.", needBy: 50, etaOffset: 30 },
  { item: "IMP envelope panels", building: "17", scope: "imp-envelope", leadWeeks: 16, status: "Delivered", note: "North elevation staged.", needBy: -20, etaOffset: -20 },
];

export function getProcurement() {
  return PROCURE.map((p) => {
    const act = getActivities(p.building).find((a) => a.slug === p.scope);
    const needDay = DATA_DATE + p.needBy;
    const etaDay = DATA_DATE + p.etaOffset;
    const slackDays = needDay - etaDay; // positive = arrives before needed
    const delivered = p.status === "Delivered";
    const gating = !delivered && (!!act ? act.pct < 100 : true) && slackDays < 0;
    const risk = gating || p.status === "At risk" ? "r" : !delivered && slackDays < 14 ? "a" : "g";
    return {
      ...p, scopeName: (scopes.find((s) => s.slug === p.scope) || {}).name, color: SCOPE_COLOR[p.scope],
      requiredOnSite: fmtDate(needDay), eta: fmtDate(etaDay), slackDays, slipWeeks: gating ? Math.ceil(-slackDays / 7) : 0, gating, risk,
    };
  }).sort((a, b) => ({ r: 0, a: 1, g: 2 }[a.risk] - { r: 0, a: 1, g: 2 }[b.risk]));
}

// ---------------------------------------------------------------------------
// 4. PUNCHLIST & CLOSEOUT  (KEYSTONE) — the commissioning tail.
// ---------------------------------------------------------------------------
const PUNCH_SYSTEMS = [
  { system: "Electrical", open: 18, closed: 64, sev: "a" },
  { system: "Mechanical / cooling", open: 11, closed: 39, sev: "a" },
  { system: "Controls / BMS", open: 23, closed: 27, sev: "r" },
  { system: "Fire / life-safety", open: 6, closed: 41, sev: "g" },
  { system: "Architectural / finishes", open: 9, closed: 88, sev: "g" },
];
export function getPunchlist(building) {
  // Only buildings in the commissioning tail have a meaningful punchlist.
  const cxStarted = (scopeMatrix.commissioning[building] || [0])[0] > 0;
  if (!cxStarted) return { id: building, active: false, systems: [], open: 0, closed: 0, closeoutPct: 0 };
  const systems = PUNCH_SYSTEMS.map((s) => ({ ...s, total: s.open + s.closed, pct: Math.round((s.closed / (s.open + s.closed)) * 100) }));
  const open = systems.reduce((a, s) => a + s.open, 0);
  const closed = systems.reduce((a, s) => a + s.closed, 0);
  return { id: building, active: true, systems, open, closed, closeoutPct: Math.round((closed / (open + closed)) * 100) };
}

// ---------------------------------------------------------------------------
// 5. THREE-WEEK LOOK-AHEAD  (MARSHAL) — from the CPM engine, field-first.
// ---------------------------------------------------------------------------
export function getLookahead(building) {
  const acts = getActivities(building);
  const byId = Object.fromEntries(acts.map((a) => [a.id, a]));
  const weeks = [0, 1, 2].map((w) => ({ week: w + 1, label: `${fmtDate(DATA_DATE + w * 7)} – ${fmtDate(DATA_DATE + w * 7 + 6)}`, items: [] }));
  const describe = (a, weekLo) => {
    const gate = a.gatingId ? byId[a.gatingId] : null;
    const constraints = [];
    if (gate) constraints.push(`Held by ${gate.name} (${gate.pct}%)`);
    if (a.forecastFinish > a.plannedFinish + 1) constraints.push(`Forecast ${Math.round(a.forecastFinish - a.plannedFinish)}d late`);
    if (WEATHER_SCOPES.includes(a.slug)) constraints.push("Weather-exposed");
    return { id: a.id, slug: a.slug, name: a.name, area: a.areaName, crew: latestHeadcount(a.slug, building) || 12, critical: a.critical, status: actStatus(a, weekLo).label, constraints, color: SCOPE_COLOR[a.slug] };
  };
  acts.forEach((a) => {
    if (a.pct >= 100) return;
    let wk = -1;
    if (a.pct > 0) wk = 0; // in progress now → this week
    else if (a.start >= DATA_DATE && a.start <= DATA_DATE + 20) wk = Math.floor((a.start - DATA_DATE) / 7); // starting soon
    if (wk >= 0 && wk < 3) weeks[wk].items.push(describe(a, DATA_DATE + wk * 7));
  });
  return { id: building, weeks };
}

// ---------------------------------------------------------------------------
// 6. DAILY-REPORT QUALITY  (WARDEN) — completeness score + nudges.
// ---------------------------------------------------------------------------
function scoreEntry(e) {
  const checks = [
    { key: "note", ok: (e.note || "").length >= 70, pts: 20, miss: "Add a substantive narrative (what advanced, what blocked)" },
    { key: "photos", ok: (e.photos || []).length >= 2, pts: 20, miss: "Attach at least two progress photos for SCOUT" },
    { key: "headcount", ok: (e.headcount || 0) > 0, pts: 15, miss: "Record crew headcount" },
    { key: "quantity", ok: (e.installed || 0) > 0, pts: 15, miss: "Log installed quantities, not just a percent" },
    { key: "zone", ok: !!e.zone, pts: 15, miss: "Tag the work zone / area" },
    { key: "events", ok: Array.isArray(e.events), pts: 15, miss: "Confirm safety / quality events (or none)" },
  ];
  const score = checks.filter((c) => c.ok).reduce((a, c) => a + c.pts, 0);
  return { score, missing: checks.filter((c) => !c.ok).map((c) => c.miss) };
}

export function getReportQuality() {
  const recent = entries.filter((e) => e.type === "progress" && !e.baseline);
  const rows = recent.map((e) => {
    const { score, missing } = scoreEntry(e);
    const b = buildings.find((x) => x.id == e.building);
    return { date: e.date, author: e.author, building: b ? b.name : e.building, scope: (scopes.find((s) => s.slug === e.slug) || {}).name, zone: e.zone, score, missing };
  });
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length) : 0;
  const complete = rows.filter((r) => r.score >= 85).length;
  const flagged = rows.filter((r) => r.score < 70).sort((a, b) => a.score - b.score).slice(0, 8);
  return { avg, total: rows.length, complete, flaggedCount: rows.filter((r) => r.score < 70).length, flagged };
}
