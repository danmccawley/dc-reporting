// schema.ts — the complete data contract for DC Field Reporting (Codex authority).
// Zod v4, strict throughout. When code and this file disagree, THIS WINS.
//
// Discipline: these are ATOMIC FACTS only. Nothing derived is stored — reports,
// KPIs, RAG, rollups, "behind", narratives are all COMPUTED on read (helpers at
// the bottom encode the key derivations so they are never accidentally persisted).
//
// The base types (DailyFieldReport, ProgressEntry, IntakeQueueItem) are reconstructed
// to match lib/store.js + lib/herald.js + the prior package. The v2 additions below
// them cover field capture, the L1–L5 System Startup Matrix, the massing reporting
// view, and the reporting/approval/template layer. See SPEC-RECONCILED-v2.md.

import { z } from "zod";

// ===========================================================================
// BASE — daily report intake & the atomic store
// ===========================================================================
export const Photo = z.strictObject({
  id: z.string(),
  caption: z.string().default(""),
  date: z.string(),
  tag: z.string().default("Field"),
  url: z.string().nullable().default(null),
});

export const ManpowerLine = z.strictObject({
  trade: z.string(),
  company: z.string(),
  headcount: z.number().int().nonnegative(),
});

export const FieldEvent = z.enum(["safety", "ncr", "delay"]);
export const Cause = z.enum([
  "RFI / design", "Material delivery", "Weather",
  "Manpower", "Access / sequencing", "Inspection hold",
]);

// The structured daily report a CM submits (dictated/typed → normalized by HERALD).
export const DailyFieldReport = z.strictObject({
  id: z.string(),
  building: z.string(),
  scope: z.string(),                  // scope slug
  zone: z.string().default(""),
  trade: z.string().default(""),
  pct: z.number().min(0).max(100),
  headcount: z.number().int().nonnegative().default(0),
  units: z.number().nonnegative().default(0),       // installed quantity this shift
  cause: Cause.nullable().default(null),
  events: z.array(FieldEvent).default([]),
  manpower: z.array(ManpowerLine).default([]),
  notes: z.string().default(""),
  safetyNotes: z.string().default(""),
  photos: z.array(Photo).default([]),
  author: z.string().default("Field CM"),
  date: z.string(),
  ts: z.number(),                     // epoch ms
});

// The atomic progress entry appended to the store (one+ per daily report).
// SINGLE SOURCE OF TRUTH. Everything else computes from these.
export const ProgressEntry = z.strictObject({
  type: z.literal("progress"),
  baseline: z.boolean().default(false),
  appended: z.boolean().default(true),
  id: z.string(),
  slug: z.string(),                   // scope slug
  building: z.string(),
  date: z.string(),
  ts: z.number(),
  author: z.string(),
  zone: z.string().default(""),
  pct: z.number().min(0).max(100),
  installed: z.number().nonnegative().default(0),
  headcount: z.number().int().nonnegative().default(0),
  labor: z.number().nonnegative().default(0),
  cost: z.number().nonnegative().default(0),
  note: z.string().default(""),
  events: z.array(FieldEvent).default([]),
  cause: Cause.nullable().default(null),
  photos: z.array(Photo).default([]),
});

// Offline intake buffer item (PWA capture → sync). Idempotent by key.
export const IntakeQueueItem = z.strictObject({
  idempotencyKey: z.string(),
  syncStatus: z.enum(["queued", "syncing", "synced", "failed"]),
  queuedAt: z.string(),
  lastAttemptAt: z.string().nullable().default(null),
  attemptCount: z.number().int().nonnegative().default(0),
  payload: DailyFieldReport,
});

// ===========================================================================
// V2 ADDITIONS
// ===========================================================================

// ---- Field capture & annotation engine (Slice 1) ----
export const CaptureKind = z.enum(["site_photo", "drawing_sheet"]);
export const CoordSpace = z.enum(["image", "titleblock_normalized"]);
export const Box = z.strictObject({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });

export const Capture = z.strictObject({
  id: z.string(),
  kind: CaptureKind,
  source: z.string(),                 // "upload" | "scan" | "procore" | ...
  uri: z.string(),
  building: z.string(),
  sheetNumber: z.string().nullable().default(null),
  discipline: z.string().nullable().default(null),
  titleblockBox: Box.nullable().default(null),
  offlineCached: z.boolean().default(false),
  capturedAt: z.string(),
  author: z.string(),
});

export const ReferencePoint = z.strictObject({
  id: z.string(),
  captureId: z.string(),
  n: z.number().int().positive(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  coordSpace: CoordSpace,             // titleblock_normalized survives revision swaps
  label: z.string().nullable().default(null),
});

export const Note = z.strictObject({
  id: z.string(),
  text: z.string().min(1),
  inputMode: z.enum(["voice", "text"]),
  referencePointId: z.string().nullable().default(null),  // null = standalone
  reportId: z.string(),
  createdAt: z.string(),
});

// ---- Systems, zones, the L1–L5 System Startup Matrix (Slices 3, 5) ----
export const Discipline = z.enum([
  "Architectural", "Structural", "Mechanical", "Electrical",
  "Low voltage", "Controls", "Fire/Life-safety",
]);

export const System = z.strictObject({
  id: z.string(),
  name: z.string(),
  discipline: Discipline,
  building: z.string(),
});

export const ZoneBinding = z.strictObject({
  id: z.string(),
  zoneId: z.string(),
  captureId: z.string(),
  systemId: z.string(),
  building: z.string(),
  normalizedBox: Box,
});

export const CxLevel = z.union([
  z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]); // 0 = pre-L1 (construction run-up)
export const CxTag = z.enum(["none", "red", "yellow", "green", "blue", "white"]);

export const Signoff = z.strictObject({ by: z.string(), role: z.string(), at: z.string() });

export const PunchItem = z.strictObject({
  id: z.string(),
  systemId: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  status: z.enum(["open", "closed"]),
  description: z.string(),
});

export const CommissioningRecord = z.strictObject({
  id: z.string(),
  systemId: z.string(),
  building: z.string(),
  level: CxLevel,
  tag: CxTag,
  plannedLevelForPeriod: CxLevel,
  testDate: z.string().nullable().default(null),
  signoffs: z.array(Signoff).default([]),
  openPunchIds: z.array(z.string()).default([]),
}).refine((r) => tagForLevel(r.level) === r.tag, {
  message: "tag must match level (0:none 1:red 2:yellow 3:green 4:blue 5:white)",
  path: ["tag"],
});

export const ScheduleActivity = z.strictObject({
  id: z.string(),
  systemId: z.string(),
  building: z.string(),
  name: z.string(),
  plannedFinish: z.number(),
  forecastFinish: z.number(),
  pct: z.number().min(0).max(100),
  critical: z.boolean().default(false),
  gatingId: z.string().nullable().default(null),
});

// ---- 3D massing reporting view (Slice 9) — geometry human-confirmed, never invented ----
export const Vec2 = z.tuple([z.number(), z.number()]);
export const MassingLevel = z.strictObject({
  name: z.string(),
  footprint: z.array(Vec2).min(3),
  floorToFloor: z.number().positive(),   // REQUIRED, human-confirmed
  confirmedBy: z.string(),
});
export const StatusOverlay = z.strictObject({
  systemId: z.string(),
  levelName: z.string(),
  status: z.enum(["on_track", "at_risk", "behind"]),
});
export const MassingModel = z.strictObject({
  id: z.string(),
  building: z.string(),
  levels: z.array(MassingLevel).min(1),
  statusOverlays: z.array(StatusOverlay).default([]),
});

// ---- Reporting / approval / distribution / templates (Slices 6, 7) ----
export const ReportSlot = z.strictObject({
  key: z.string(),
  dataField: z.string().nullable(),     // null = unmapped, flagged for manual bind
  position: z.number().int(),
});
export const ReportTemplate = z.strictObject({
  id: z.string(),
  name: z.string(),
  source: z.enum(["builtin", "learned"]),
  slots: z.array(ReportSlot),
  reviewedBy: z.string().nullable().default(null),
});
export const NumberOverride = z.strictObject({
  field: z.string(),
  value: z.unknown(),
  reason: z.string().min(1),            // override REQUIRES a reason
  by: z.string(),
});
export const DerivedReportSnapshot = z.strictObject({
  reportId: z.string(),
  cadence: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "OnDemand"]),
  period: z.string(),
  building: z.string(),
  computedValues: z.record(z.string(), z.unknown()),
  sourceReportIds: z.array(z.string()),
  narrativeEdits: z.array(z.strictObject({ field: z.string(), text: z.string() })).default([]),
  numberOverrides: z.array(NumberOverride).default([]),
  approvedBy: z.string(),
  approvedAt: z.string(),
  version: z.number().int().positive(),
});
export const DistributionConfig = z.strictObject({
  reportType: z.string(),
  defaultRecipients: z.array(z.string()).default([]),
  autoDeliver: z.boolean().default(false),
  channel: z.enum(["email", "link", "both"]).default("email"),
  sandbox: z.boolean().default(true),   // true until security review clears
});

// ===========================================================================
// DERIVATIONS — computed, never stored
// ===========================================================================
export function tagForLevel(level: number): z.infer<typeof CxTag> {
  return (["none", "red", "yellow", "green", "blue", "white"] as const)[level] ?? "none";
}
export function canAdvanceLevel(
  rec: z.infer<typeof CommissioningRecord>,
  punches: z.infer<typeof PunchItem>[],
): boolean {
  if (rec.level >= 5) return false;
  const next = rec.level + 1;
  return !punches.some((p) => p.systemId === rec.systemId && p.level === next && p.status === "open");
}
export function isBehind(a: z.infer<typeof ScheduleActivity>): boolean {
  return a.forecastFinish > a.plannedFinish;
}
export function isBehindCx(r: z.infer<typeof CommissioningRecord>): boolean {
  return r.level < r.plannedLevelForPeriod;
}

export const SCHEMA_VERSION = "v2";
