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
  },
  {
    agent: "AUGUR",
    severity: "a",
    text: "Building 17 RFI turnaround is up 51% over its 4-week average. Lagged correlation (2 weeks) with the LV cabling productivity dip. Candidate root cause flagged for human review.",
  },
  {
    agent: "KEYSTONE",
    severity: "r",
    text: "Building 16 commissioning is behind plan at 12%. L4 functional scripts gated on switchgear energization milestone.",
  },
  {
    agent: "GUARDIAN",
    severity: "g",
    text: "Building 16 TRIR trending down four weeks running, now 0.60 against a 1.0 target.",
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
    author: "J. Alvarez (LV Foreman)",
    zone: "Data hall 2B",
    note: "Tray complete in 2B mains; pulled 1,180 m backbone. Two RFIs outstanding on penetration details holding pathway at the MMR.",
    pct: 41,
    headcount: 14,
  },
  {
    date: "Thu, May 21",
    author: "J. Alvarez (LV Foreman)",
    zone: "Data hall 2B",
    note: "Pull resumed after grid access cleared. Productivity back up. Logged 1 near-miss (housekeeping) closed same shift.",
    pct: 38,
    headcount: 13,
  },
  {
    date: "Wed, May 20",
    author: "J. Alvarez (LV Foreman)",
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
