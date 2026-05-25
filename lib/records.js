// NATIVE DOCUMENT CONTROL — the first native module that replaces an incumbent
// (Oracle Aconex). A controlled document register with revision history,
// transmittals, controlled distribution, and provenance. Versioning and the audit
// trail are owned by NOTARY; LIBRARIAN handles retrieval/search. Every record is
// native (source = "Native") and carries its full revision history.

export const DOC_TYPES = ["Drawing", "Submittal", "Spec section", "RFI response", "Permit", "Transmittal", "Report"];

export const STATUS = {
  Issued: { c: "#5a8a1f" }, "For review": { c: "#2f6d7d" }, Draft: { c: "#b98900" }, Superseded: { c: "#8a8a82" }, Void: { c: "#A32D2D" },
};

export const DOCUMENTS = [
  { id: "E-401", number: "E-401", title: "Electrical one-line — Building 17", type: "Drawing", building: "17", scope: "electrical", rev: "C", status: "Issued", issued: "Wed, May 20", by: "EOR", distribution: ["CM", "PM", "Electrical lead"],
    versions: [{ rev: "C", date: "Wed, May 20", by: "EOR", note: "Switchgear lineup revised per RFI-118." }, { rev: "B", date: "Apr 28", by: "EOR", note: "Issued for construction." }, { rev: "A", date: "Mar 30", by: "EOR", note: "Issued for review." }] },
  { id: "RFI-118", number: "RFI-118", title: "Switchgear clearance at MMR — Building 17", type: "RFI response", building: "17", scope: "electrical", rev: "1", status: "Issued", issued: "Tue, May 19", by: "EOR", distribution: ["CM", "Electrical lead"],
    versions: [{ rev: "1", date: "Tue, May 19", by: "EOR", note: "Response issued; clearance confirmed with 6 in. relief." }] },
  { id: "SUB-204", number: "SUB-204", title: "Medium-voltage switchgear submittal", type: "Submittal", building: "17", scope: "electrical", rev: "B", status: "For review", issued: "Mon, May 18", by: "Electrical sub", distribution: ["EOR", "CM", "QUARTERMASTER"],
    versions: [{ rev: "B", date: "Mon, May 18", by: "Electrical sub", note: "Resubmittal addressing EOR comments." }, { rev: "A", date: "Apr 22", by: "Electrical sub", note: "Initial submittal — returned revise & resubmit." }] },
  { id: "A-120", number: "A-120", title: "Roof plan & IMP layout — Building 17", type: "Drawing", building: "17", scope: "imp-envelope", rev: "B", status: "Issued", issued: "May 12", by: "AOR", distribution: ["CM", "PM", "Envelope lead"],
    versions: [{ rev: "B", date: "May 12", by: "AOR", note: "Panel module revised at north elevation." }, { rev: "A", date: "Apr 8", by: "AOR", note: "Issued for construction." }] },
  { id: "S-200", number: "S-200", title: "Steel sequence 2 framing — Building 18", type: "Drawing", building: "18", scope: "steel-erection", rev: "A", status: "For review", issued: "May 21", by: "SEOR", distribution: ["CM", "Steel sub"],
    versions: [{ rev: "A", date: "May 21", by: "SEOR", note: "Issued for review pending superstructure permit." }] },
  { id: "PERMIT-18B", number: "PERMIT-18B", title: "Superstructure building permit — Building 18", type: "Permit", building: "18", scope: "steel-erection", rev: "—", status: "For review", issued: "May 15", by: "PM", distribution: ["PM", "CM"],
    versions: [{ rev: "—", date: "May 15", by: "PM", note: "Application under AHJ review; gates steel sequence 2." }] },
  { id: "M-310", number: "M-310", title: "CRAH layout & piping — Building 17", type: "Drawing", building: "17", scope: "mechanical", rev: "A", status: "Issued", issued: "May 6", by: "MEOR", distribution: ["CM", "Mechanical lead"],
    versions: [{ rev: "A", date: "May 6", by: "MEOR", note: "Issued for construction." }] },
  { id: "SPEC-260500", number: "SPEC 26 05 00", title: "Common work results for electrical", type: "Spec section", building: "17", scope: "electrical", rev: "A", status: "Issued", issued: "Mar 30", by: "EOR", distribution: ["All trades"],
    versions: [{ rev: "A", date: "Mar 30", by: "EOR", note: "Issued for construction." }] },
  { id: "E-300", number: "E-300", title: "Electrical one-line — Building 16", type: "Drawing", building: "16", scope: "electrical", rev: "D", status: "Issued", issued: "May 4", by: "EOR", distribution: ["CM", "PM", "Cx agent"],
    versions: [{ rev: "D", date: "May 4", by: "EOR", note: "As-built markups incorporated for Cx." }, { rev: "C", date: "Feb 18", by: "EOR", note: "IFC." }] },
  { id: "A-050", number: "A-050", title: "Life-safety plan — Building 16", type: "Drawing", building: "16", scope: "commissioning", rev: "B", status: "Issued", issued: "Apr 30", by: "AOR", distribution: ["CM", "Fire marshal"],
    versions: [{ rev: "B", date: "Apr 30", by: "AOR", note: "Revised egress at MMR." }, { rev: "A", date: "Jan 22", by: "AOR", note: "IFC." }] },
  { id: "E-220", number: "E-220", title: "Panel schedule — Building 17 (old)", type: "Drawing", building: "17", scope: "electrical", rev: "A", status: "Superseded", issued: "Apr 2", by: "EOR", distribution: ["CM"],
    versions: [{ rev: "A", date: "Apr 2", by: "EOR", note: "Superseded by E-401 Rev C." }] },
];

export const TRANSMITTALS = [
  { id: "T-066", no: "T-066", to: "Electrical sub", date: "Wed, May 20", status: "Sent", items: ["E-401", "RFI-118"], note: "Revised one-line and RFI response for the switchgear lineup." },
  { id: "T-065", no: "T-065", to: "Steel sub", date: "May 21", status: "Sent", items: ["S-200"], note: "Sequence 2 framing for review; held pending permit." },
  { id: "T-064", no: "T-064", to: "All trades", date: "May 12", status: "Acknowledged", items: ["A-120"], note: "Roof/IMP revision." },
];

export function docStats() {
  const issued = DOCUMENTS.filter((d) => d.status === "Issued").length;
  const review = DOCUMENTS.filter((d) => d.status === "For review").length;
  const superseded = DOCUMENTS.filter((d) => d.status === "Superseded").length;
  return { total: DOCUMENTS.length, issued, review, superseded, transmittals: TRANSMITTALS.length };
}
export function getDocument(id) { return DOCUMENTS.find((d) => d.id === id) || null; }
