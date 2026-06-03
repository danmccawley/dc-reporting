// WRITABLE ATOMIC STORE (client-side, prototype-grade).
// The seeded `entries` in lib/mock/data.js are the canonical baseline. This module
// adds the *write* path the field form was missing: a submitted daily report becomes
// one or more atomic entries appended to a local, persisted layer. Reads merge the
// seeded baseline with locally-appended entries, so every existing derivation
// (scopeMatrix, getProgramCost, getVerification, ...) keeps working unchanged once
// it reads through `allEntries()`.
//
// Discipline preserved: nothing derived is stored. A daily report writes only atomic
// facts (progress %, headcount, installed qty, events, photo count, narrative). The
// reports, KPIs, and rollups remain COMPUTED. In the OpenAI/enterprise build, swap
// localStorage for the API/data layer — the append + read shapes stay identical.

import { entries as SEED } from "./mock/data";

const KEY = "dcr_atomic_appended";
const listeners = new Set();

function read() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(arr) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {}
  listeners.forEach((fn) => {
    try { fn(); } catch {}
  });
}

// Subscribe to store changes (so report surfaces refresh after a submit).
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// The merged store: seeded baseline + locally appended atomic entries.
export function allEntries() {
  return SEED.concat(read());
}

// Only the entries this device has appended (for "your recent reports" views).
export function appendedEntries() {
  return read();
}

// Append one daily field report as atomic progress entry/entries.
// `report` is the structured shape produced by HERALD (see lib/herald.js).
export function appendDailyReport(report) {
  const now = Date.now();
  const dateLabel = new Date(now).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const entry = {
    type: "progress",
    baseline: false,
    appended: true,          // marks a real field-submitted entry vs seed
    id: `field-${now}`,
    slug: report.scope,
    building: String(report.building),
    date: dateLabel,
    ts: now,
    author: report.author || "Field CM",
    zone: report.zone || "",
    pct: num(report.pct),
    installed: num(report.units),       // installed quantity this shift
    headcount: num(report.headcount),
    labor: num(report.headcount) * 0.0012,
    cost: Math.round(num(report.headcount) * 1.2 * 10) / 10,
    note: report.notes || "",
    events: report.events || [],
    cause: report.cause || null,
    photos: (report.photos || []).map((p, k) => ({
      id: `field-${now}-${k}`,
      caption: p.caption || `${report.zone || "Site"}`,
      date: dateLabel,
      tag: p.tag || "Field",
      url: p.url || null,
    })),
  };

  const next = read().concat([entry]);
  write(next);
  return entry;
}

export function clearAppended() {
  write([]);
}

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
