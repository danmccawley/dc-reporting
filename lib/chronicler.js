// CHRONICLER deriver — builds a report of any cadence from the live atomic store.
// This is the cascade made explicit: a daily report is an atomic entry; weekly,
// monthly, and other cadences are DERIVED here, never separately authored. Numbers
// are computed; the narrative is assembled from computed facts (agents narrate, they
// do not invent numbers). When a key is present, app/api/chronicler can rewrite the
// narrative in prose — but the metrics it cites always come from this function.

import { allEntries } from "./store";
import { buildings, scopes, getBuilding, getScope } from "./mock/data";

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

// Pull the progress entries for a building (optionally a scope) from the live store.
function progressFor(building, scope) {
  return allEntries().filter(
    (e) => e.type === "progress" && !e.baseline && String(e.building) === String(building) && (!scope || e.slug === scope)
  );
}

// Latest reported % per scope for a building, from the most recent entry per scope.
function latestByScope(building) {
  const out = {};
  scopes.forEach((s) => {
    const es = progressFor(building, s.slug);
    if (!es.length) return;
    // Prefer appended (real field) entries by timestamp; else take max pct.
    const withTs = es.filter((e) => e.ts);
    const latest = withTs.length
      ? withTs.sort((a, b) => b.ts - a.ts)[0]
      : es.reduce((a, b) => (num(b.pct) > num(a.pct) ? b : a));
    out[s.slug] = { pct: num(latest.pct), name: s.name, headcount: num(latest.headcount), zone: latest.zone, note: latest.note, events: latest.events || [] };
  });
  return out;
}

function statusFromPct(p) { return p <= 0 ? "n" : p >= 85 ? "g" : p >= 41 ? "a" : "r"; }

// Build a structured report object for a building (or "program") at a cadence.
export function deriveReport({ building = "17", cadence = "Weekly", period = "" } = {}) {
  const targets = building === "program" ? buildings.map((b) => b.id) : [building];

  const sections = targets.map((bid) => {
    const byScope = latestByScope(bid);
    const rows = Object.keys(byScope).map((slug) => {
      const r = byScope[slug];
      return { slug, name: r.name, pct: r.pct, status: statusFromPct(r.pct), headcount: r.headcount, zone: r.zone };
    }).sort((a, b) => b.pct - a.pct);

    const reds = rows.filter((r) => r.status === "r");
    const ambers = rows.filter((r) => r.status === "a");
    const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length) : 0;

    // Count real field-submitted entries that fed this section.
    const appended = progressFor(bid).filter((e) => e.appended).length;
    const events = [];
    rows.forEach((r) => (byScope[r.slug].events || []).forEach((ev) => events.push(`${r.name}: ${ev}`)));

    return {
      building: bid,
      name: getBuilding(bid)?.name || `Building ${bid}`,
      avg,
      rows,
      reds,
      ambers,
      appended,
      events,
    };
  });

  // Assemble a computed narrative (deterministic; cites only computed numbers).
  const narrative = buildNarrative(sections, cadence, building);

  return {
    cadence,
    period: period || defaultPeriod(cadence),
    scope: building === "program" ? "Program-wide" : getBuilding(building)?.name,
    generatedAt: new Date().toLocaleString(),
    sections,
    narrative,
  };
}

function defaultPeriod(cadence) {
  const now = new Date();
  if (cadence === "Weekly") return `Week of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  if (cadence === "Monthly") return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  if (cadence === "Quarterly") return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildNarrative(sections, cadence, building) {
  const lines = [];
  sections.forEach((sec) => {
    const lead = `${sec.name} is averaging ${sec.avg}% complete across ${sec.rows.length} reported scope${sec.rows.length === 1 ? "" : "s"}`;
    const risk = sec.reds.length
      ? `, with ${sec.reds.length} scope${sec.reds.length === 1 ? "" : "s"} behind plan (${sec.reds.map((r) => r.name).join(", ")})`
      : sec.ambers.length
      ? `, with ${sec.ambers.length} scope${sec.ambers.length === 1 ? "" : "s"} to watch`
      : ", all reported scopes on track";
    const src = sec.appended ? ` This ${cadence.toLowerCase()} reflects ${sec.appended} field report${sec.appended === 1 ? "" : "s"} submitted this period.` : "";
    lines.push(lead + risk + "." + src);
    if (sec.events.length) lines.push(`Flagged this period: ${sec.events.slice(0, 4).join("; ")}.`);
  });
  if (building === "program") {
    const worst = sections.slice().sort((a, b) => a.avg - b.avg)[0];
    if (worst) lines.push(`Program attention centers on ${worst.name} at ${worst.avg}% average completion.`);
  }
  return lines.join(" ");
}
