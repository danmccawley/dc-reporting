// Seeded mock data for the prototype. This is the ONLY place data comes from.
// In the real build, swap this module for an API/data layer behind the same shape.

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

// status: g (on track) | a (watch) | r (behind) | n (not started)
export const scopeMatrix = {
  foundation: { 16: [100, "g"], 17: [100, "g"], 18: [71, "a"] },
  "slab-on-grade": { 16: [100, "g"], 17: [95, "g"], 18: [40, "r"] },
  "steel-erection": { 16: [100, "g"], 17: [88, "g"], 18: [18, "r"] },
  "steel-decking": { 16: [98, "g"], 17: [76, "a"], 18: [0, "n"] },
  "imp-envelope": { 16: [92, "g"], 17: [54, "a"], 18: [0, "n"] },
  electrical: { 16: [64, "a"], 17: [33, "r"], 18: [0, "n"] },
  mechanical: { 16: [58, "a"], 17: [28, "r"], 18: [0, "n"] },
  "lv-cabling": { 16: [41, "a"], 17: [9, "r"], 18: [0, "n"] },
  commissioning: { 16: [12, "r"], 17: [0, "n"], 18: [0, "n"] },
};

// KPIs with 8-week weekly series per building (last value = current week).
// Building 18 is intentionally short on history to demonstrate the warm-up rule.
export const kpis = [
  {
    id: "cabling-productivity",
    name: "Cabling productivity",
    unit: "m / shift",
    higherIsBetter: true,
    target: 120,
    series: {
      16: [104, 108, 101, 110, 99, 106, 109, 112],
      17: [72, 80, 76, 84, 79, 90, 96, 101],
      18: [40, 44],
    },
  },
  {
    id: "rfi-turnaround",
    name: "RFI turnaround",
    unit: "days",
    higherIsBetter: false,
    target: 5,
    series: {
      16: [5.2, 4.8, 5.1, 4.6, 5.0, 4.9, 5.1, 4.7],
      17: [6.0, 5.8, 6.1, 6.4, 5.9, 6.2, 7.6, 9.2],
      18: [4.0, 4.5],
    },
  },
  {
    id: "spi",
    name: "Schedule performance (SPI)",
    unit: "index",
    higherIsBetter: true,
    target: 1.0,
    series: {
      16: [0.98, 1.0, 1.01, 0.99, 1.02, 1.01, 1.03, 1.02],
      17: [0.95, 0.94, 0.93, 0.92, 0.9, 0.89, 0.87, 0.84],
      18: [0.99, 0.97],
    },
  },
  {
    id: "cpi",
    name: "Cost performance (CPI)",
    unit: "index",
    higherIsBetter: true,
    target: 1.0,
    series: {
      16: [1.01, 1.0, 1.02, 1.01, 1.0, 1.01, 1.0, 1.01],
      17: [0.99, 0.98, 0.97, 0.98, 0.96, 0.95, 0.95, 0.94],
      18: [1.0, 1.0],
    },
  },
  {
    id: "trir",
    name: "Safety (TRIR)",
    unit: "per 200k hrs",
    higherIsBetter: false,
    target: 1.0,
    series: {
      16: [0.9, 0.8, 0.85, 0.7, 0.75, 0.7, 0.65, 0.6],
      17: [1.1, 1.0, 0.95, 1.05, 0.9, 0.95, 0.9, 0.88],
      18: [0.0, 0.0],
    },
  },
  {
    id: "ncr-open",
    name: "Open NCRs",
    unit: "count",
    higherIsBetter: false,
    target: 5,
    series: {
      16: [4, 5, 4, 6, 5, 4, 5, 4],
      17: [6, 7, 8, 9, 10, 11, 13, 14],
      18: [1, 2],
    },
  },
];

export const alerts = [
  {
    agent: "SENTINEL",
    severity: "r",
    text: "Switchgear lot for Building 17 at delivery risk. Typhoon tracking near supplier hub; QUARTERMASTER projects a 2 to 4 week slip that cascades into electrical fit-out and Cx.",
    href: "/schedule",
  },
  {
    agent: "AUGUR",
    severity: "a",
    text: "Building 17 RFI turnaround is up 51% over its 4-week average. Lagged correlation (2 weeks) with the LV cabling productivity dip. Candidate root cause flagged for human review.",
    href: "/insights",
  },
  {
    agent: "KEYSTONE",
    severity: "r",
    text: "Building 16 commissioning is behind plan at 12%. L4 functional scripts gated on switchgear energization milestone.",
    href: "/commissioning",
  },
  {
    agent: "GUARDIAN",
    severity: "g",
    text: "Building 16 TRIR trending down four weeks running, now 0.60 against a 1.0 target.",
    href: "/site/16",
  },
];

export const weeklyReport = {
  id: "wk-2026-21-bldg17",
  building: "17",
  week: "Week 21, 2026",
  status: "draft", // draft | approved
  narrative:
    "Structural topping out on the east bays held to plan this week. IMP installation continued on the north elevation. The headline risk remains electrical fit-out: RFI turnaround climbed to 9.2 days against a 6.1-day baseline, and switchgear delivery is now flagged at risk by SENTINEL. LV cabling productivity recovered toward 101 m/shift after two soft weeks. Recommend escalating the switchgear procurement risk and a focused RFI clearance push with the design team.",
  metrics: [
    { label: "SPI", value: "0.84", status: "r" },
    { label: "CPI", value: "0.94", status: "a" },
    { label: "Open NCRs", value: "14", status: "r" },
    { label: "RFI turnaround", value: "9.2 days", status: "r" },
  ],
};

export const dailyEntries = [
  {
    date: "Fri, May 22",
    author: "Generic CM",
    zone: "Data hall 2B",
    note: "Tray complete in 2B mains; pulled 1,180 m backbone. Two RFIs outstanding on penetration details holding pathway at the MMR.",
    pct: 41,
    headcount: 14,
  },
  {
    date: "Thu, May 21",
    author: "Generic CM",
    zone: "Data hall 2B",
    note: "Pull resumed after grid access cleared. Productivity back up. Logged 1 near-miss (housekeeping) closed same shift.",
    pct: 38,
    headcount: 13,
  },
  {
    date: "Wed, May 20",
    author: "Generic CM",
    zone: "MMR / 2A",
    note: "Slow shift. Waiting on RFI-0442 (sleeve locations). Crew redeployed to ladder rack in 2A to avoid idle time.",
    pct: 36,
    headcount: 13,
  },
];

export function getScope(slug) {
  return scopes.find((s) => s.slug === slug) || null;
}
export function getBuilding(id) {
  return buildings.find((b) => b.id === id) || null;
}

// Launchable reports (CANVAS-generated). Sections render from scopeMatrix + kpis.
export const reports = [
  {
    id: "wk-17", building: "17", cadence: "Weekly", period: "Week 21, 2026", status: "draft",
    summary:
      "Structural topping out on the east bays held to plan. IMP installation continued on the north elevation. The headline risk is electrical fit-out: RFI turnaround climbed to 9.2 days against a 6.1-day baseline, and switchgear delivery is flagged at risk by SENTINEL. LV cabling productivity recovered toward 101 m/shift after two soft weeks.",
  },
  {
    id: "wk-16", building: "16", cadence: "Weekly", period: "Week 21, 2026", status: "approved",
    summary:
      "Building 16 is into fit-out and early commissioning. Envelope and structure are complete. Electrical and mechanical fit-out are progressing on plan; commissioning L1-L2 is underway but L4 functional scripts are gated on a switchgear energization milestone. Safety continues to trend down (TRIR 0.60).",
  },
  {
    id: "wk-18", building: "18", cadence: "Weekly", period: "Week 21, 2026", status: "approved",
    summary:
      "Building 18 is in site and foundations. Foundations are at 71% and slab-on-grade has begun. Steel and all downstream scopes are not yet started. Only two weeks of data exist, so trend indicators remain neutral until a four-week baseline forms.",
  },
  {
    id: "mo-program", building: "program", cadence: "Monthly", period: "May 2026", status: "draft",
    summary:
      "Program-wide, the three buildings span the full delivery curve: 16 in fit-out/commissioning, 17 in structural-to-MEP, 18 in the ground. The dominant program risk is the Building 17 switchgear delivery exposure, which cascades to electrical fit-out and commissioning across the schedule. RFI turnaround at Building 17 is the leading internal indicator to watch.",
  },
];

export function getReport(id) {
  return reports.find((r) => r.id === id) || null;
}

// Daily reports for a specific scope at a specific building (generated, deterministic).
export function getDailyEntries(slug, building) {
  const cell = scopeMatrix[slug] ? scopeMatrix[slug][building] : null;
  if (!cell) return [];
  const [pct, st] = cell;
  if (st === "n" || pct === 0) return [];
  const scope = scopes.find((s) => s.slug === slug);
  const name = scope ? scope.name : "scope";
  const dates = ["Fri, May 22", "Thu, May 21", "Wed, May 20", "Tue, May 19"];
  const zones = { "16": "Data hall area 1A", "17": "Data hall area 2B", "18": "Foundation area C" };
  const authors = ["Generic CM", "Generic PM", "Generic CM", "Generic PM"];
  const zone = zones[building] || "Site area";
  return dates.map((d, i) => ({
    date: d,
    author: authors[i],
    zone,
    pct: Math.max(0, pct - i * 2),
    headcount: 16 - i,
    note:
      i === 0
        ? `${name} progressing in ${zone}. Logged today's installed quantities; open constraints captured for the look-ahead.`
        : `Continued ${name.toLowerCase()} in ${zone}. Crew on plan; minor sequencing notes recorded.`,
    events: i === 2 ? ["Delay / blocker — RFI / design"] : i === 1 ? ["Safety near-miss (closed same shift)"] : [],
    photos: Array.from({ length: i % 2 === 0 ? 3 : 2 }, (_, p) => ({
      id: `${slug}-${building}-${i}-${p}`,
      caption: `${name} · ${zone}`,
      date: d,
      tag: ["Progress", "As-built", "Constraint"][p] || "Photo",
    })),
  }));
}

// Site photos grouped by the day they were taken, for the weekly/launchable report.
export function getReportPhotosByDay(building) {
  const b = building === "program" ? "17" : building;
  const inProgress = scopes.filter((s) => {
    const c = scopeMatrix[s.slug][b];
    return c && c[1] !== "n" && c[0] > 0;
  }).slice(0, 3);
  const byDay = {};
  inProgress.forEach((s) => {
    getDailyEntries(s.slug, b).forEach((e) => {
      byDay[e.date] = (byDay[e.date] || []).concat(e.photos);
    });
  });
  const order = ["Fri, May 22", "Thu, May 21", "Wed, May 20", "Tue, May 19"];
  return order.filter((d) => byDay[d]).map((d) => ({ date: d, photos: byDay[d].slice(0, 6) }));
}

// Capacity / readiness — the owner's language: MW, halls energized, go-live confidence.
export const capacity = [
  { id: "16", name: "Building 16", mwPlanned: 96, mwCommissioned: 62, hallsTotal: 6, hallsEnergized: 4, racksReady: 540, racksTotal: 900, firstPower: "Live", goLive: "Q4 2026", confidence: 84 },
  { id: "17", name: "Building 17", mwPlanned: 96, mwCommissioned: 28, hallsTotal: 6, hallsEnergized: 2, racksReady: 180, racksTotal: 900, firstPower: "Q3 2026", goLive: "Q1 2027", confidence: 61 },
  { id: "18", name: "Building 18", mwPlanned: 120, mwCommissioned: 0, hallsTotal: 8, hallsEnergized: 0, racksReady: 0, racksTotal: 1200, firstPower: "Q1 2027", goLive: "Q3 2027", confidence: 38 },
];

// SCOUT spatial verification — reported % vs photo-observed %, with divergence flags.
export function getVerification() {
  const rows = [];
  const deltas = [0, -2, -9, -4, 3, -7, 1, -11, -3];
  scopes.forEach((s, si) => {
    buildings.forEach((b) => {
      const c = scopeMatrix[s.slug] ? scopeMatrix[s.slug][b.id] : null;
      if (!c || c[1] === "n" || c[0] === 0) return;
      const reported = c[0];
      const delta = deltas[(si + b.id.charCodeAt(1)) % deltas.length];
      const observed = Math.max(0, Math.min(100, reported + delta));
      const variance = observed - reported;
      rows.push({ scope: s.name, slug: s.slug, building: b.name, bid: b.id, reported, observed, variance, flag: Math.abs(variance) >= 6 });
    });
  });
  return rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
}

// Simulated users for the admin role-assignment screen.
export const users = [
  { name: "D. McCawley", email: "dmccawley", role: "ADMIN" },
  { name: "A. Rivera", email: "arivera", role: "CM" },
  { name: "T. Okafor", email: "tokafor", role: "CM" },
  { name: "S. Lindqvist", email: "slindqvist", role: "PM" },
  { name: "M. Hassan", email: "mhassan", role: "PM" },
  { name: "J. Park", email: "jpark", role: "CIM" },
  { name: "R. Delgado", email: "rdelgado", role: "CIM" },
];

// Integrate-don't-replace: data sources the platform ingests from.
export const integrations = [
  { name: "Procore", kind: "Field execution", status: "Connected", ingests: "RFIs, submittals, daily logs, inspections" },
  { name: "Autodesk Construction Cloud", kind: "BIM / documents", status: "Connected", ingests: "Drawings, models, issues, sheets" },
  { name: "Oracle Aconex", kind: "Document control", status: "Available", ingests: "Transmittals, correspondence, the project record" },
  { name: "Primavera P6", kind: "Master schedule", status: "Connected", ingests: "Activities, milestones, critical path, float" },
  { name: "ERP / Accounting (Sage)", kind: "Cost", status: "Available", ingests: "Commitments, invoices, actual cost" },
  { name: "Kahua / e-Builder", kind: "Owner program", status: "Available", ingests: "Capital, funding, program governance records" },
];

// Schedule (PATHFINDER) — milestones on a program timeline + schedule-risk confidence.
export const schedule = [
  { id: "16", name: "Building 16", confidence: 84, p50: "Q4 2026", p80: "Q1 2027", critical: "Switchgear energization", milestones: [
    { name: "Foundations", when: "Complete", t: 8, status: "g" },
    { name: "Structure topped out", when: "Complete", t: 22, status: "g" },
    { name: "Dry-in", when: "Complete", t: 36, status: "g" },
    { name: "MEP rough-in", when: "In progress", t: 54, status: "a" },
    { name: "Energization", when: "Q2 2026", t: 72, status: "a" },
    { name: "Cx complete", when: "Q3 2026", t: 86, status: "a" },
    { name: "Go-live", when: "Q4 2026", t: 96, status: "a" },
  ] },
  { id: "17", name: "Building 17", confidence: 61, p50: "Q1 2027", p80: "Q2 2027", critical: "Long-lead switchgear delivery", milestones: [
    { name: "Foundations", when: "Complete", t: 8, status: "g" },
    { name: "Structure", when: "In progress", t: 26, status: "a" },
    { name: "Dry-in", when: "Q3 2026", t: 44, status: "a" },
    { name: "MEP rough-in", when: "Q4 2026", t: 60, status: "r" },
    { name: "Energization", when: "Q3 2026", t: 74, status: "r" },
    { name: "Cx complete", when: "Q4 2026", t: 88, status: "a" },
    { name: "Go-live", when: "Q1 2027", t: 96, status: "a" },
  ] },
  { id: "18", name: "Building 18", confidence: 38, p50: "Q3 2027", p80: "Q4 2027", critical: "Site civil and foundations", milestones: [
    { name: "Foundations", when: "In progress", t: 12, status: "a" },
    { name: "Structure", when: "Q4 2026", t: 30, status: "r" },
    { name: "Dry-in", when: "Q1 2027", t: 48, status: "r" },
    { name: "MEP rough-in", when: "Q2 2027", t: 64, status: "r" },
    { name: "Energization", when: "Q1 2027", t: 78, status: "r" },
    { name: "Cx complete", when: "Q2 2027", t: 90, status: "r" },
    { name: "Go-live", when: "Q3 2027", t: 97, status: "r" },
  ] },
];

// Commissioning (KEYSTONE) — Cx levels L1-L5 by building.
export const commissioning = [
  { id: "16", name: "Building 16", levels: [
    { lvl: "L1 · Factory / component", pct: 100, status: "g" },
    { lvl: "L2 · Site acceptance", pct: 100, status: "g" },
    { lvl: "L3 · Pre-functional", pct: 88, status: "g" },
    { lvl: "L4 · Functional", pct: 62, status: "a" },
    { lvl: "L5 · Integrated systems test", pct: 30, status: "r" },
  ] },
  { id: "17", name: "Building 17", levels: [
    { lvl: "L1 · Factory / component", pct: 92, status: "g" },
    { lvl: "L2 · Site acceptance", pct: 70, status: "a" },
    { lvl: "L3 · Pre-functional", pct: 34, status: "r" },
    { lvl: "L4 · Functional", pct: 8, status: "r" },
    { lvl: "L5 · Integrated systems test", pct: 0, status: "n" },
  ] },
  { id: "18", name: "Building 18", levels: [
    { lvl: "L1 · Factory / component", pct: 40, status: "r" },
    { lvl: "L2 · Site acceptance", pct: 0, status: "n" },
    { lvl: "L3 · Pre-functional", pct: 0, status: "n" },
    { lvl: "L4 · Functional", pct: 0, status: "n" },
    { lvl: "L5 · Integrated systems test", pct: 0, status: "n" },
  ] },
];

// Cost (COMPTROLLER) — budget vs committed vs actual, CPI, EAC, $/MW. Figures in $M.
export const cost = [
  { id: "16", name: "Building 16", budget: 420, committed: 372, actual: 318, cpi: 0.98, eac: 428, mw: 96 },
  { id: "17", name: "Building 17", budget: 430, committed: 300, actual: 196, cpi: 0.95, eac: 452, mw: 96 },
  { id: "18", name: "Building 18", budget: 540, committed: 120, actual: 64, cpi: 1.01, eac: 535, mw: 120 },
];
