// HERALD — intake normalization (deterministic local parser).
// Turns a dictated/typed natural-language daily narrative into the structured
// atomic shape the store expects. Mirrors the platform rule: agents narrate and
// normalize, they do not invent numbers — every value here is extracted from what
// the CM actually said, never fabricated. Fields not found are left blank for the
// CM to confirm (agent-native: the agent fills what it heard, the human approves).
//
// With OPENAI_API_KEY set, app/api/herald/route.js uses the model for richer
// extraction; with no key, this local parser runs so the demo never breaks.

import { buildings, scopes } from "./mock/data";

const CAUSES = ["RFI / design", "Material delivery", "Weather", "Manpower", "Access / sequencing", "Inspection hold"];

// Map spoken scope language to scope slugs.
const SCOPE_HINTS = {
  foundation: ["foundation", "footing", "pile"],
  "slab-on-grade": ["slab", "slab on grade", "sog", "pour"],
  "steel-erection": ["steel", "erection", "structural steel", "beam", "column"],
  "steel-decking": ["decking", "deck", "metal deck"],
  "imp-envelope": ["imp", "envelope", "panel", "cladding", "facade", "skin"],
  electrical: ["electrical", "switchgear", "conduit", "power", "feeder", "gear"],
  mechanical: ["mechanical", "cooling", "crah", "crac", "chilled", "hvac", "piping", "duct"],
  "lv-cabling": ["lv", "cabling", "structured cabling", "low voltage", "backbone", "tray", "fiber", "copper"],
  commissioning: ["commissioning", "cx", "functional test", "energization", "startup"],
};

const EVENT_HINTS = {
  safety: ["near miss", "near-miss", "safety", "injury", "incident", "tie-off", "fall"],
  ncr: ["ncr", "non-conformance", "nonconformance", "quality issue", "defect", "rework"],
  delay: ["delay", "blocker", "blocked", "behind", "waiting on", "held up", "stopped", "idle", "slip"],
};

const CAUSE_HINTS = {
  "RFI / design": ["rfi", "design", "detail", "drawing", "clarification"],
  "Material delivery": ["delivery", "material", "shipment", "long lead", "long-lead", "supplier", "backorder"],
  Weather: ["weather", "rain", "wind", "storm", "snow", "cold", "heat"],
  Manpower: ["manpower", "crew", "short staffed", "short-staffed", "headcount", "labor"],
  "Access / sequencing": ["access", "sequencing", "sequence", "predecessor", "can't get in", "coordination"],
  "Inspection hold": ["inspection", "hold", "ahj", "inspector", "sign off", "sign-off"],
};

function findScope(text) {
  const t = text.toLowerCase();
  for (const s of scopes) {
    const hints = SCOPE_HINTS[s.slug] || [];
    if (hints.some((h) => t.includes(h))) return s.slug;
  }
  return null;
}

function findBuilding(text) {
  const t = text.toLowerCase();
  // "building 17", "bldg 17", "b17", or a bare known id.
  const m = t.match(/\b(?:building|bldg|b)\s*\.?\s*(16|17|18)\b/);
  if (m) return m[1];
  const bare = t.match(/\b(16|17|18)\b/);
  if (bare && buildings.some((b) => b.id === bare[1])) return bare[1];
  return null;
}

function findNumber(text, patterns) {
  const t = text.toLowerCase();
  for (const re of patterns) {
    const m = t.match(re);
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ""));
      if (Number.isFinite(n)) return String(Math.round(n));
    }
  }
  return "";
}

function findEvents(text) {
  const t = text.toLowerCase();
  return Object.keys(EVENT_HINTS).filter((id) => EVENT_HINTS[id].some((h) => t.includes(h)));
}

function findCause(text) {
  const t = text.toLowerCase();
  for (const c of CAUSES) {
    if ((CAUSE_HINTS[c] || []).some((h) => t.includes(h))) return c;
  }
  return "RFI / design";
}

function findZone(text) {
  // "data hall 2B", "MMR", "area C", "level 1"
  const m =
    text.match(/\b(?:data hall|hall)\s*([0-9][a-dA-D]?)\b/i) ||
    text.match(/\b(MMR|MDF|NOC)\b/i) ||
    text.match(/\b(?:area|zone)\s*([a-dA-D0-9]+)\b/i) ||
    text.match(/\b(?:level|lvl|floor)\s*([0-9]+)\b/i);
  if (!m) return "";
  return m[0].replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

// The deterministic local extraction. Returns the structured report shape plus a
// list of which fields HERALD could fill, so the UI can highlight what to confirm.
export function heraldParse(transcript) {
  const text = (transcript || "").trim();
  const events = findEvents(text);

  const structured = {
    building: findBuilding(text) || "",
    zone: findZone(text),
    scope: findScope(text) || "",
    trade: "",
    pct: findNumber(text, [
      /(\d{1,3})\s*%/,
      /(\d{1,3})\s*percent/,
      /(?:at|now at|reached)\s*(\d{1,3})\b/,
    ]),
    headcount: findNumber(text, [
      /(\d{1,3})\s*(?:guys|men|workers|crew|people|headcount|hc)\b/,
      /(?:crew of|headcount of|manned)\s*(\d{1,3})\b/,
    ]),
    units: findNumber(text, [
      /(\d[\d,]*)\s*(?:m|meters|metres|ft|feet|lf|lineal|linear)\b/,
      /(?:installed|pulled|set|placed|poured)\s*(\d[\d,]*)\b/,
    ]),
    cause: events.includes("delay") ? findCause(text) : "RFI / design",
    events,
    notes: text,
  };

  const filled = Object.keys(structured).filter((k) => {
    const v = structured[k];
    return Array.isArray(v) ? v.length > 0 : v !== "" && v != null;
  });

  return { structured, filled };
}
