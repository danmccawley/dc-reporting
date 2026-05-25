// LIBRARIAN — builds and curates the knowledge base, and screens every external
// source for reliability and credibility before any agent is allowed to act on
// it. Each source carries a credibility score and a tier; SENTINEL, AUGUR,
// QUARTERMASTER and others consume only what LIBRARIAN has vetted. Nothing here
// is a derived program number; this is the provenance layer.

export const CATEGORIES = [
  { key: "weather", label: "Weather & environment" },
  { key: "supply", label: "Supplier & logistics" },
  { key: "codes", label: "Codes & standards" },
  { key: "regulatory", label: "Regulations & permits" },
  { key: "macro", label: "Geopolitical & economic" },
  { key: "record", label: "Project record" },
  { key: "reference", label: "Engineering reference" },
];

// credibility → tier
export function tierFor(score) {
  return score >= 95 ? { k: "Authoritative", c: "#5a8a1f" } : score >= 80 ? { k: "Vetted", c: "#2f6d7d" } : score >= 60 ? { k: "Community", c: "#b98900" } : { k: "Unverified", c: "#A32D2D" };
}

export const SOURCES = [
  { id: "nws", name: "NOAA / National Weather Service", category: "weather", url: "https://www.weather.gov", credibility: 98, lastChecked: "Fri, May 22", usedBy: ["SENTINEL", "PATHFINDER"], basis: "Government meteorological authority; primary observations and models.", note: "Primary weather signal for delay forecasting." },
  { id: "spc", name: "NWS Storm Prediction Center", category: "weather", url: "https://www.spc.noaa.gov", credibility: 97, lastChecked: "Fri, May 22", usedBy: ["SENTINEL"], basis: "Authoritative severe-weather and convective outlooks.", note: "Severe-storm and high-wind advisories." },
  { id: "wx-api", name: "Commercial forecast API (hourly)", category: "weather", url: "https://www.weather.gov", credibility: 88, lastChecked: "Fri, May 22", usedBy: ["SENTINEL"], basis: "Cross-checked against NWS; good for hourly granularity.", note: "Used only where it agrees with NWS." },
  { id: "supplier-edi", name: "Switchgear supplier delivery feed (EDI)", category: "supply", url: "#", credibility: 82, lastChecked: "Thu, May 21", usedBy: ["QUARTERMASTER", "SENTINEL"], basis: "First-party vendor data; corroborated against freight tracking.", note: "Long-lead ETA source; corroboration required." },
  { id: "freight", name: "Global freight / port status", category: "supply", url: "#", credibility: 79, lastChecked: "Thu, May 21", usedBy: ["SENTINEL", "QUARTERMASTER"], basis: "Aggregated logistics data; treated as corroborating, not primary.", note: "Community tier — must be confirmed by a second source." },
  { id: "nec", name: "NFPA 70 (NEC) — National Electrical Code", category: "codes", url: "https://www.nfpa.org", credibility: 99, lastChecked: "Mon, May 5", usedBy: ["KEYSTONE", "COUNSEL"], basis: "Adopted electrical standard; controlling reference.", note: "Authoritative for electrical Cx and inspections." },
  { id: "ashrae", name: "ASHRAE / data-center thermal guidelines", category: "codes", url: "https://www.ashrae.org", credibility: 96, lastChecked: "Mon, May 5", usedBy: ["KEYSTONE"], basis: "Recognized industry thermal standard.", note: "Mechanical / cooling acceptance basis." },
  { id: "osha", name: "OSHA — 29 CFR 1926 / 1910", category: "regulatory", url: "https://www.osha.gov/laws-regs", credibility: 99, lastChecked: "Fri, May 22", usedBy: ["PROVOST", "GUARDIAN"], basis: "Federal workplace-safety regulation; controlling authority.", note: "Primary safety-compliance authority." },
  { id: "ecfr", name: "Electronic Code of Federal Regulations (eCFR)", category: "regulatory", url: "https://www.ecfr.gov", credibility: 99, lastChecked: "Fri, May 22", usedBy: ["PROVOST", "COUNSEL"], basis: "Official, continuously updated federal regulation text.", note: "Citation source of record for federal rules." },
  { id: "epa", name: "US EPA regulations & permits", category: "regulatory", url: "https://www.epa.gov/laws-regulations", credibility: 98, lastChecked: "Thu, May 21", usedBy: ["PROVOST"], basis: "Federal environmental authority (air, water, waste).", note: "Environmental-compliance authority." },
  { id: "fedreg", name: "Federal Register", category: "regulatory", url: "https://www.federalregister.gov", credibility: 96, lastChecked: "Thu, May 21", usedBy: ["PROVOST", "LIBRARIAN"], basis: "Official journal of federal rulemaking and notices.", note: "Tracks new and proposed rules." },
  { id: "state-reg", name: "State environmental & licensing agency", category: "regulatory", url: "#", credibility: 95, lastChecked: "Wed, May 20", usedBy: ["PROVOST"], basis: "State authority for air/water permits and trade licensing.", note: "State-level permits and licensing." },
  { id: "local-permit", name: "City building & permits / fire marshal", category: "regulatory", url: "#", credibility: 89, lastChecked: "Wed, May 20", usedBy: ["PROVOST"], basis: "Local jurisdiction; permits, inspections, occupancy.", note: "Local permits and inspections; corroborated with the AHJ." },
  { id: "fred", name: "Materials price indices (FRED)", category: "macro", url: "https://fred.stlouisfed.org", credibility: 95, lastChecked: "Wed, May 20", usedBy: ["COMPTROLLER", "AUGUR"], basis: "Federal Reserve economic data.", note: "Escalation and commodity-cost signals." },
  { id: "p6", name: "Primavera P6 master schedule", category: "record", url: "#", credibility: 94, lastChecked: "Fri, May 22", usedBy: ["PATHFINDER", "MARSHAL"], basis: "Project system of record for the baseline schedule.", note: "Schedule baseline reference tier." },
  { id: "aconex", name: "Oracle Aconex project record", category: "record", url: "#", credibility: 93, lastChecked: "Fri, May 22", usedBy: ["LIBRARIAN", "COUNSEL"], basis: "Controlled transmittals and correspondence.", note: "Authoritative project record." },
  { id: "forum", name: "Trade forum / vendor blog", category: "reference", url: "#", credibility: 48, lastChecked: "Tue, May 19", usedBy: [], basis: "Unverified community content; no editorial control.", note: "Quarantined — not cleared for any agent to act on." },
];

export function getSourcesByCategory() {
  return CATEGORIES.map((c) => ({ ...c, sources: SOURCES.filter((s) => s.category === c.key).sort((a, b) => b.credibility - a.credibility) }));
}
export function getSource(id) { return SOURCES.find((s) => s.id === id) || null; }
export function weatherSources() { return SOURCES.filter((s) => s.category === "weather").sort((a, b) => b.credibility - a.credibility); }
export function librarianStats() {
  const vetted = SOURCES.filter((s) => s.credibility >= 80).length;
  const quarantined = SOURCES.filter((s) => s.credibility < 60).length;
  return { total: SOURCES.length, vetted, quarantined, categories: CATEGORIES.length };
}
