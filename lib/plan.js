// Interactive build plan — CPM schedule with a real many-to-many dependency
// network, computed critical path, and throughput forecast. Planned activities,
// durations, and dependencies are the versioned reference tier; early/late
// dates, float, critical path, active status, and the estimated actual finish
// are all computed.
import { scopes, scopeMatrix } from "./mock/data";

export const PROGRAM_START = new Date("2026-01-05T00:00:00");
export const DATA_DATE = 150;
export function dayToDate(d) { const dt = new Date(PROGRAM_START); dt.setDate(dt.getDate() + Math.round(d)); return dt; }
export function fmtDate(d) { return dayToDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

const ORDER = ["foundation", "slab-on-grade", "steel-erection", "steel-decking", "imp-envelope", "electrical", "mechanical", "lv-cabling", "commissioning"];
const DUR = { foundation: 24, "slab-on-grade": 18, "steel-erection": 22, "steel-decking": 14, "imp-envelope": 20, electrical: 30, mechanical: 28, "lv-cabling": 24, commissioning: 26 };
const AREA = { foundation: "shell", "slab-on-grade": "shell", "steel-erection": "shell", "steel-decking": "shell", "imp-envelope": "shell", electrical: "elec", mechanical: "mech", "lv-cabling": "halls", commissioning: "whole" };
// Realistic construction dependency network (predecessors per scope).
const DEPS = {
  foundation: [],
  "slab-on-grade": ["foundation"],
  "steel-erection": ["foundation"],
  "steel-decking": ["steel-erection"],
  "imp-envelope": ["steel-decking"],
  electrical: ["imp-envelope", "slab-on-grade"],
  mechanical: ["imp-envelope", "slab-on-grade"],
  "lv-cabling": ["electrical"],
  commissioning: ["electrical", "mechanical", "lv-cabling"],
};
const BSTART = { 16: 0, 17: 18, 18: 40 };
const OVERLAP = 0.6; // a successor may start when a predecessor is 60% done (lead)

export const AREAS = [
  { id: "shell", name: "Shell / structure", x: 30, y: 30, w: 250, h: 90 },
  { id: "halls", name: "Data halls", x: 30, y: 135, w: 250, h: 95 },
  { id: "elec", name: "Electrical room", x: 300, y: 30, w: 130, h: 90 },
  { id: "mech", name: "Mechanical room", x: 300, y: 135, w: 130, h: 95 },
  { id: "whole", name: "Integrated systems", x: 30, y: 245, w: 400, h: 28 },
];
export const SCOPE_COLOR = {
  foundation: "#6b705c", "slab-on-grade": "#a5a58d", "steel-erection": "#3f6d7d", "steel-decking": "#5e8a9e",
  "imp-envelope": "#8a6d3b", electrical: "#b5651d", mechanical: "#2f6d4f", "lv-cabling": "#3a5ca8", commissioning: "#7a3b8a",
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const scopeName = (slug) => (scopes.find((s) => s.slug === slug) || {}).name || slug;
const areaName = (id) => (AREAS.find((a) => a.id === id) || {}).name || id;

export function getActivities(building) {
  const idOf = (slug) => `${building}-${slug}`;
  const M = {};
  // Forward pass: earliest start/finish honoring all predecessors (+ overlap lead).
  ORDER.forEach((slug) => {
    const preds = DEPS[slug];
    const es = preds.length === 0 ? (BSTART[building] || 0) : Math.max(...preds.map((p) => M[p].es + DUR[p] * OVERLAP));
    M[slug] = { slug, es, dur: DUR[slug], ef: es + DUR[slug] };
  });
  const projectFinish = Math.max(...ORDER.map((s) => M[s].ef));
  // Successors (inverse of DEPS).
  const succ = {}; ORDER.forEach((s) => (succ[s] = []));
  ORDER.forEach((s) => DEPS[s].forEach((p) => succ[p].push(s)));
  // Backward pass: latest start/finish; float; critical = ~zero float.
  [...ORDER].reverse().forEach((slug) => {
    const ss = succ[slug];
    const ls = ss.length === 0 ? projectFinish - DUR[slug] : Math.min(...ss.map((s) => M[s].ls - DUR[slug] * OVERLAP));
    M[slug].ls = ls; M[slug].float = ls - M[slug].es; M[slug].critical = ls - M[slug].es <= 0.5;
  });
  // Build activities + throughput forecast.
  const acts = ORDER.map((slug) => {
    const m = M[slug];
    const pct = (scopeMatrix[slug] && scopeMatrix[slug][building]) ? scopeMatrix[slug][building][0] : 0;
    const expected = clamp(((DATA_DATE - m.es) / m.dur) * 100, 0, 100);
    const perf = expected > 0 ? clamp(pct / expected, 0.4, 1.5) : 1;
    const forecastFinish = pct >= 100 ? m.ef : m.es + m.dur / perf;
    return {
      id: idOf(slug), building, slug, name: scopeName(slug), area: AREA[slug], areaName: areaName(AREA[slug]),
      start: m.es, dur: m.dur, plannedFinish: m.ef, forecastFinish, pct,
      float: Math.round(m.float), critical: m.critical, pred: DEPS[slug].map(idOf), succ: succ[slug].map(idOf),
    };
  });
  // Gating predecessor: the incomplete predecessor forecast to finish latest.
  const byId = Object.fromEntries(acts.map((a) => [a.id, a]));
  acts.forEach((a) => {
    const open = a.pred.map((id) => byId[id]).filter((p) => p && p.pct < 100);
    a.gatingId = a.pct >= 100 || open.length === 0 ? null : open.sort((x, y) => y.forecastFinish - x.forecastFinish)[0].id;
  });
  return acts;
}

export function actStatus(act, day) {
  if (act.pct >= 100) return { key: "done", label: "Complete" };
  if (day < act.start) return { key: "ns", label: "Not started" };
  if (act.forecastFinish > act.plannedFinish + 1) return { key: "late", label: "Active — forecast late" };
  return { key: "active", label: "Active — on track" };
}
export function isActiveOn(act, day) { return act.pct < 100 && day >= act.start && day <= Math.max(act.plannedFinish, act.forecastFinish); }

// Construction-drawing rooms (Level 1 overall floor plan) and scope→room mapping.
export const SHELL_SCOPES = ["foundation", "slab-on-grade", "steel-erection", "steel-decking", "imp-envelope"];
export const ROOMS = [
  { id: "hall1", name: "Data Hall 1", scope: "lv-cabling", x: 60, y: 70, w: 180, h: 118 },
  { id: "hall2", name: "Data Hall 2", scope: "lv-cabling", x: 60, y: 196, w: 180, h: 116 },
  { id: "elec", name: "Electrical Room", scope: "electrical", x: 248, y: 70, w: 112, h: 118 },
  { id: "mmr", name: "MMR / MDF", scope: "commissioning", x: 248, y: 196, w: 112, h: 116 },
  { id: "mech", name: "Mechanical Yard", scope: "mechanical", x: 368, y: 70, w: 132, h: 118 },
  { id: "noc", name: "NOC / Admin", scope: "commissioning", x: 368, y: 196, w: 132, h: 116 },
];
export const SLAB = { x: 40, y: 50, w: 480, h: 282 };

// Is an activity scheduled to be in progress at any point in [lo, hi]?
export function scheduledIn(act, lo, hi) {
  return act.pct < 100 && act.start <= hi && Math.max(act.plannedFinish, act.forecastFinish) >= lo;
}
// Day-offset for a JS date.
export function dateToDay(dt) { return Math.round((dt - PROGRAM_START) / 86400000); }

// Overhead site plan — campus features and the site-level dependency network.
// Buildings depend on shared infrastructure (power, cooling, backup); hovering a
// feature highlights what must be ready before it (prerequisites) and what relies
// on it (dependents).
export const SITE_FEATURES = [
  { id: "bldg16", name: "Building 16", kind: "Data center", building: "16", x: 70, y: 90, w: 120, h: 150 },
  { id: "bldg17", name: "Building 17", kind: "Data center", building: "17", x: 210, y: 90, w: 120, h: 150 },
  { id: "bldg18", name: "Building 18", kind: "Data center", building: "18", x: 350, y: 90, w: 140, h: 150 },
  { id: "substation", name: "Main substation", kind: "Switchyard / utility power", x: 525, y: 70, w: 130, h: 95, pct: 78, planned: 72 },
  { id: "genyard", name: "Generator plant", kind: "Backup power", x: 525, y: 180, w: 130, h: 70, pct: 55, planned: 92 },
  { id: "chiller", name: "Central cooling plant", kind: "Mechanical / cooling", x: 70, y: 260, w: 160, h: 72, pct: 64, planned: 86 },
  { id: "waterpond", name: "Retention pond", kind: "Stormwater", x: 250, y: 260, w: 110, h: 72, pct: 90, planned: 40 },
  { id: "parking", name: "Parking", kind: "Site civil", x: 380, y: 260, w: 110, h: 72, static: true },
  { id: "laydown", name: "Laydown yard", kind: "Staging", x: 525, y: 262, w: 130, h: 70, static: true },
  { id: "gatehouse", name: "Gatehouse", kind: "Security", x: 14, y: 28, w: 44, h: 30, static: true },
];
export const SITE_DEPS = {
  bldg16: ["substation", "chiller", "genyard"],
  bldg17: ["substation", "chiller", "genyard"],
  bldg18: ["substation", "chiller", "genyard"],
  chiller: ["waterpond"],
};
export function siteStatus(pct) { return pct >= 98 ? { k: "Ready", c: "#5a8a1f" } : pct >= 60 ? { k: "On track", c: "#2f6d4f" } : { k: "Behind", c: "#A32D2D" }; }
