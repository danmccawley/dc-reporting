// PROVOST — the compliance & regulatory agent. Maintains a live register of the
// obligations the program is subject to across OSHA, federal, state, local, and
// environmental law, maps each one to the work it affects, and tracks status,
// owner, evidence, and the governing citation. Every requirement is tied to a
// LIBRARIAN-vetted source so a human can open the controlling authority. PROVOST
// surfaces and tracks; it does not give legal advice.

export const DOMAINS = [
  { key: "osha", label: "OSHA / worker safety" },
  { key: "federal", label: "Federal" },
  { key: "state", label: "State" },
  { key: "local", label: "Local" },
  { key: "environmental", label: "Environmental" },
];

export const STATUS = {
  compliant: { label: "Compliant", c: "#5a8a1f", rag: "g" },
  monitoring: { label: "Monitoring", c: "#2f6d7d", rag: "g" },
  action: { label: "Action needed", c: "#b98900", rag: "a" },
  overdue: { label: "Overdue", c: "#A32D2D", rag: "r" },
  upcoming: { label: "Not yet started", c: "#8a8a82", rag: "n" },
};

// appliesTo entries with a slug + building deep-link to the scope drill-down.
export const REQUIREMENTS = [
  { id: "fall-protection", domain: "osha", title: "Fall protection above 6 ft", authority: "OSHA", citation: "29 CFR 1926.501", sourceId: "osha", status: "action", owner: "Site Safety / CM", due: "Open", severity: "high",
    appliesTo: [{ label: "Steel erection · B18", slug: "steel-erection", building: "18" }, { label: "Steel decking · B17", slug: "steel-decking", building: "17" }],
    evidence: "Daily fall-protection inspection logs; harness inventory.", remediation: "Two tie-off gaps flagged on B18 leading edge; reinforce anchor plan and retrain crew before next lift." },
  { id: "scaffolding", domain: "osha", title: "Scaffolding erection & inspection", authority: "OSHA", citation: "29 CFR 1926.451", sourceId: "osha", status: "compliant", owner: "Site Safety", due: "Weekly", severity: "med",
    appliesTo: [{ label: "Envelope · B17", slug: "imp-envelope", building: "17" }], evidence: "Competent-person tags current; weekly inspections logged.", remediation: "None — compliant." },
  { id: "loto", domain: "osha", title: "Lockout / tagout (energy control)", authority: "OSHA", citation: "29 CFR 1910.147", sourceId: "osha", status: "monitoring", owner: "Electrical lead", due: "Per energization", severity: "high",
    appliesTo: [{ label: "Electrical fit-out · B16", slug: "electrical", building: "16" }, { label: "Electrical fit-out · B17", slug: "electrical", building: "17" }], evidence: "LOTO procedures posted; authorized-employee roster.", remediation: "Monitoring ahead of switchgear energization milestone." },
  { id: "confined-space", domain: "osha", title: "Permit-required confined space program", authority: "OSHA", citation: "29 CFR 1926.1200–1213", sourceId: "osha", status: "action", owner: "Site Safety / CM", due: "Before MMR work", severity: "high",
    appliesTo: [{ label: "MMR / vaults · B16", slug: "commissioning", building: "16" }], evidence: "Permit program drafted; atmospheric testing kit on site.", remediation: "Finalize entry permits and rescue plan before MMR / electrical-vault entries." },
  { id: "crane", domain: "osha", title: "Cranes & derricks in construction", authority: "OSHA", citation: "29 CFR 1926.1400", sourceId: "osha", status: "compliant", owner: "Lift director", due: "Per lift", severity: "high",
    appliesTo: [{ label: "Steel erection · B17/B18", slug: "steel-erection", building: "17" }], evidence: "Operator certifications and annual inspections current; lift plans on file.", remediation: "None — compliant." },
  { id: "hazcom", domain: "osha", title: "Hazard communication (SDS)", authority: "OSHA", citation: "29 CFR 1910.1200", sourceId: "osha", status: "compliant", owner: "Site Safety", due: "Ongoing", severity: "med",
    appliesTo: [{ label: "Site-wide" }], evidence: "SDS library current; container labeling verified.", remediation: "None — compliant." },
  { id: "osha-300", domain: "osha", title: "Injury & illness recordkeeping (OSHA 300)", authority: "OSHA", citation: "29 CFR 1904", sourceId: "ecfr", status: "compliant", owner: "Safety manager", due: "Ongoing", severity: "med",
    appliesTo: [{ label: "Program-wide" }], evidence: "300 log current; GUARDIAN feeds recordables; TRIR 0.60.", remediation: "None — trending down four weeks." },
  { id: "air-permit", domain: "federal", title: "Clean Air Act — generator emissions permit", authority: "US EPA", citation: "40 CFR 60 (NSPS)", sourceId: "epa", status: "action", owner: "Project Manager", due: "Before generator start", severity: "high",
    appliesTo: [{ label: "Standby generators · B18", slug: "electrical", building: "18" }], evidence: "Permit application submitted; tier-rating documentation pending.", remediation: "Air permit must be issued before generator commissioning — track against the procurement ETA." },
  { id: "npdes", domain: "federal", title: "NPDES construction stormwater (CGP)", authority: "US EPA", citation: "Construction General Permit", sourceId: "epa", status: "compliant", owner: "Environmental lead", due: "Ongoing", severity: "med",
    appliesTo: [{ label: "Site civil / earthwork" }], evidence: "NOI filed; inspections logged under the SWPPP.", remediation: "None — compliant." },
  { id: "davis-bacon", domain: "federal", title: "Prevailing wage / certified payroll", authority: "US DOL", citation: "Davis-Bacon Act", sourceId: "ecfr", status: "monitoring", owner: "Contracts", due: "Weekly", severity: "low",
    appliesTo: [{ label: "Program-wide (if federally funded)" }], evidence: "Certified payroll collected weekly.", remediation: "Monitoring applicability of the funding source." },
  { id: "state-air-water", domain: "state", title: "State air & water permits", authority: "State environmental agency", citation: "State administrative code", sourceId: "state-reg", status: "action", owner: "Environmental lead", due: "Before generator start", severity: "high",
    appliesTo: [{ label: "Generators / dewatering · B18", slug: "electrical", building: "18" }], evidence: "State air authorization pending alongside the federal permit.", remediation: "Coordinate state authorization with the EPA air permit so neither gates generator start." },
  { id: "state-license", domain: "state", title: "Contractor & electrical licensing", authority: "State licensing board", citation: "State trade-licensing rules", sourceId: "state-reg", status: "compliant", owner: "Contracts", due: "Annual", severity: "low",
    appliesTo: [{ label: "Electrical / mechanical trades" }], evidence: "License registry verified for all trade partners.", remediation: "None — compliant." },
  { id: "building-permit", domain: "local", title: "Building permits (superstructure)", authority: "City building dept", citation: "Local building code / IBC", sourceId: "local-permit", status: "action", owner: "Project Manager", due: "Before steel sequence 2", severity: "high",
    appliesTo: [{ label: "Superstructure · B18", slug: "steel-erection", building: "18" }], evidence: "Foundation permit issued; superstructure permit under review.", remediation: "Superstructure permit must clear before steel sequence 2 — flag to the AHJ this week." },
  { id: "fire-marshal", domain: "local", title: "Fire marshal inspections", authority: "Local fire marshal", citation: "IFC / NFPA", sourceId: "local-permit", status: "monitoring", owner: "CM", due: "Scheduled", severity: "med",
    appliesTo: [{ label: "Life-safety · B16", slug: "commissioning", building: "16" }], evidence: "Inspection cadence scheduled; fire/life-safety punch tracked.", remediation: "Monitoring against the B16 commissioning tail." },
  { id: "co", domain: "local", title: "Certificate of occupancy", authority: "City building dept", citation: "Local occupancy rules", sourceId: "local-permit", status: "upcoming", owner: "Project Manager", due: "At go-live", severity: "med",
    appliesTo: [{ label: "B16 go-live" }], evidence: "Not yet applicable; prerequisites tracked.", remediation: "Sequenced after commissioning and final inspections." },
  { id: "swppp", domain: "environmental", title: "Stormwater Pollution Prevention Plan (SWPPP)", authority: "US EPA / state", citation: "CGP / state code", sourceId: "epa", status: "compliant", owner: "Environmental lead", due: "Per rain event + biweekly", severity: "med",
    appliesTo: [{ label: "Site-wide" }], evidence: "BMPs installed; inspection reports current after recent storms.", remediation: "None — compliant; watch with the incoming severe-weather days." },
  { id: "spcc", domain: "environmental", title: "Spill prevention (SPCC)", authority: "US EPA", citation: "40 CFR 112", sourceId: "epa", status: "action", owner: "Environmental lead", due: "Before fuel on site", severity: "med",
    appliesTo: [{ label: "Generator fuel storage · B18", slug: "electrical", building: "18" }], evidence: "SPCC plan drafted; secondary containment design in review.", remediation: "Finalize SPCC plan and containment before bulk fuel is delivered for the generators." },
  { id: "waste", domain: "environmental", title: "Construction waste & recycling", authority: "State / local", citation: "State waste rules", sourceId: "state-reg", status: "monitoring", owner: "CM", due: "Ongoing", severity: "low",
    appliesTo: [{ label: "Site-wide" }], evidence: "Waste diversion tracked against the owner's sustainability target.", remediation: "Monitoring diversion rate." },
];

export function getByDomain() {
  return DOMAINS.map((d) => {
    const items = REQUIREMENTS.filter((r) => r.domain === d.key);
    const worst = items.some((i) => STATUS[i.status].rag === "r") ? "r" : items.some((i) => STATUS[i.status].rag === "a") ? "a" : "g";
    return { ...d, items, rag: worst, open: items.filter((i) => ["action", "overdue"].includes(i.status)).length };
  });
}
export function complianceStats() {
  const total = REQUIREMENTS.length;
  const compliant = REQUIREMENTS.filter((r) => ["compliant", "monitoring"].includes(r.status)).length;
  const action = REQUIREMENTS.filter((r) => r.status === "action").length;
  const overdue = REQUIREMENTS.filter((r) => r.status === "overdue").length;
  return { total, compliant, action, overdue, pct: Math.round((compliant / total) * 100) };
}
