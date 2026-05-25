// NATIVE FIELD MODULE (field domain) — the native module that replaces a Procore
// integration for the field commercial/quality workflow. Daily reports, photos
// (SCOUT), and report quality (WARDEN) are already native; this adds the RFI
// lifecycle (MARSHAL coordination + AUGUR schedule-impact), submittals
// (QUARTERMASTER), and inspections (GUARDIAN / PROVOST). RFI responses link to the
// document-control record; nothing depends on an external system.
import { scopes } from "./mock/data";
const scopeName = (slug) => (scopes.find((s) => s.slug === slug) || {}).name || slug;

export const RFIS = [
  { id: "RFI-118", subject: "Switchgear clearance at MMR", building: "17", scope: "electrical", status: "Answered", ball: "Closed", opened: "May 11", due: "May 18", answered: "May 19", critical: true, doc: "RFI-118", note: "Clearance confirmed with 6 in. relief; one-line revised (E-401 Rev C)." },
  { id: "RFI-121", subject: "Sequence 2 connection detail", building: "18", scope: "steel-erection", status: "Open", ball: "EOR", opened: "May 20", due: "May 27", answered: null, critical: true, doc: null, note: "Gates steel sequence 2; coordinate with superstructure permit." },
  { id: "RFI-119", subject: "CRAH condensate routing", building: "17", scope: "mechanical", status: "Open", ball: "MEOR", opened: "May 16", due: "May 23", answered: null, critical: false, doc: null, note: "Routing conflict with cable tray; awaiting direction." },
  { id: "RFI-117", subject: "Fire-rated penetration at MMR wall", building: "16", scope: "commissioning", status: "Answered", ball: "Closed", opened: "May 6", due: "May 13", answered: "May 12", critical: false, doc: null, note: "Approved firestop assembly issued." },
  { id: "RFI-120", subject: "LV pathway separation", building: "17", scope: "lv-cabling", status: "Open", ball: "CM", opened: "May 18", due: "May 25", answered: null, critical: false, doc: null, note: "Internal review before issuing to EOR." },
];

export const SUBMITTALS = [
  { id: "SUB-204", subject: "Medium-voltage switchgear", building: "17", scope: "electrical", status: "Revise & resubmit", ball: "Sub", rev: "B", doc: "SUB-204", longLead: true },
  { id: "SUB-210", subject: "CRAH units", building: "17", scope: "mechanical", status: "Approved", ball: "Closed", rev: "A", doc: null, longLead: true },
  { id: "SUB-198", subject: "IMP envelope panels", building: "17", scope: "imp-envelope", status: "Approved", ball: "Closed", rev: "A", doc: null, longLead: false },
  { id: "SUB-215", subject: "Structured cabling system", building: "17", scope: "lv-cabling", status: "Under review", ball: "EOR", rev: "A", doc: null, longLead: false },
];

export const INSPECTIONS = [
  { id: "INS-301", type: "Rough-in electrical", building: "16", scope: "electrical", result: "Pass", date: "May 18", by: "AHJ", note: "MMR rough-in accepted." },
  { id: "INS-305", type: "Steel bolt-up (special inspection)", building: "17", scope: "steel-erection", result: "Pass", date: "May 14", by: "SI agency", note: "Torque verified, sequence 1." },
  { id: "INS-308", type: "Fireproofing thickness", building: "17", scope: "steel-decking", result: "Open", date: "Scheduled May 26", by: "SI agency", note: "Pending decking completion." },
  { id: "INS-310", type: "Fall-protection audit", building: "18", scope: "steel-erection", result: "Deficiency", date: "May 21", by: "Site safety", note: "Two tie-off gaps on leading edge; PROVOST OSHA item open." },
];

export const RFI_STATUS = { Answered: "#5a8a1f", Open: "#b98900", Overdue: "#A32D2D" };
export const SUB_STATUS = { Approved: "#5a8a1f", "Under review": "#2f6d7d", "Revise & resubmit": "#b98900", Rejected: "#A32D2D" };
export const INS_RESULT = { Pass: "#5a8a1f", Open: "#2f6d7d", Deficiency: "#A32D2D" };

export function enrichRfis() {
  const DATA = "May 25";
  return RFIS.map((r) => {
    const open = r.status === "Open";
    const overdue = open && new Date("2026 " + r.due) < new Date("2026 " + DATA);
    return { ...r, name: scopeName(r.scope), display: overdue ? "Overdue" : r.status, daysOpen: open ? "open" : "closed" };
  });
}
export function fieldStats() {
  const rfis = enrichRfis();
  const openRfis = rfis.filter((r) => r.status === "Open").length;
  const overdue = rfis.filter((r) => r.display === "Overdue").length;
  const critOpen = rfis.filter((r) => r.status === "Open" && r.critical).length;
  const subsOpen = SUBMITTALS.filter((s) => !["Approved"].includes(s.status)).length;
  const insOpenDef = INSPECTIONS.filter((i) => i.result !== "Pass").length;
  return { totalRfis: RFIS.length, openRfis, overdue, critOpen, subsOpen, insOpenDef };
}
