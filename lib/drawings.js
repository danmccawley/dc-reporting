// NATIVE DRAWINGS & MODELS (bim domain) — a capable drawing/sheet/version
// register and high-level model-coordination tracker built in instead of an
// Autodesk ACC integration. This is NOT a model-authoring tool (not a Revit /
// Navisworks replacement): it manages the sheet set, issuances, versions, and
// coordination status, and pairs with document control (the controlled record)
// and the maps (spatial placement). ARTIFICER owns the registry; LIBRARIAN
// handles retrieval; SCOUT can verify field conditions against a sheet.

export const DISCIPLINES = ["Architectural", "Structural", "Mechanical", "Electrical", "Low voltage"];

export const SHEETS = [
  { number: "A-120", title: "Roof plan & IMP layout", discipline: "Architectural", building: "17", rev: "B", status: "Current", set: "B17-IFC-3", record: "A-120", onMap: true, scope: "imp-envelope", note: "Panel module revised at north elevation." },
  { number: "A-050", title: "Life-safety plan", discipline: "Architectural", building: "16", rev: "B", status: "Current", set: "B16-IFC-2", record: "A-050", onMap: true, scope: "commissioning", note: "Revised egress at MMR." },
  { number: "S-200", title: "Steel sequence 2 framing", discipline: "Structural", building: "18", rev: "A", status: "In progress", set: "B18-REV-1", record: "S-200", onMap: false, scope: "steel-erection", note: "For review pending superstructure permit." },
  { number: "M-310", title: "CRAH layout & piping", discipline: "Mechanical", building: "17", rev: "A", status: "Current", set: "B17-IFC-3", record: "M-310", onMap: true, scope: "mechanical", note: "Issued for construction." },
  { number: "E-401", title: "Electrical one-line", discipline: "Electrical", building: "17", rev: "C", status: "Current", set: "B17-IFC-3", record: "E-401", onMap: false, scope: "electrical", note: "Switchgear lineup revised per RFI-118." },
  { number: "E-300", title: "Electrical one-line", discipline: "Electrical", building: "16", rev: "D", status: "Current", set: "B16-IFC-2", record: "E-300", onMap: false, scope: "electrical", note: "As-built markups incorporated for Cx." },
  { number: "E-220", title: "Panel schedule (old)", discipline: "Electrical", building: "17", rev: "A", status: "Superseded", set: "B17-IFC-2", record: "E-220", onMap: false, scope: "electrical", note: "Superseded by E-401 Rev C." },
  { number: "T-100", title: "Structured cabling pathways", discipline: "Low voltage", building: "17", rev: "A", status: "Current", set: "B17-IFC-3", record: null, onMap: true, scope: "lv-cabling", note: "Issued for construction." },
];

export const SETS = [
  { id: "B17-IFC-3", name: "Building 17 — IFC set Rev 3", date: "May 20", status: "Issued", sheets: 5, note: "Current construction set; includes E-401 Rev C." },
  { id: "B16-IFC-2", name: "Building 16 — IFC set Rev 2", date: "May 4", status: "Issued", sheets: 4, note: "As-built markups underway for Cx." },
  { id: "B18-REV-1", name: "Building 18 — Sequence 2 review set", date: "May 21", status: "For review", sheets: 3, note: "Held pending superstructure permit." },
];

export const MODELS = [
  { id: "MOD-17", name: "Building 17 federated model", disciplines: "A/S/M/E", status: "Current", federated: "May 19", clashes: 2 },
  { id: "MOD-16", name: "Building 16 federated model", disciplines: "A/S/M/E", status: "Current", federated: "May 8", clashes: 0 },
  { id: "MOD-18", name: "Building 18 federated model", disciplines: "A/S", status: "Updating", federated: "May 15", clashes: 1 },
];

export const COORDINATION = [
  { id: "CL-22", between: "CRAH condensate vs cable tray", building: "17", scope: "mechanical", status: "Open", rfi: "RFI-119", note: "Routing conflict; RFI open with MEOR." },
  { id: "CL-19", between: "Busway vs sprinkler main", building: "16", scope: "electrical", status: "Resolved", rfi: null, note: "Rerouted busway; closed." },
  { id: "CL-24", between: "Steel brace vs door opening", building: "18", scope: "steel-erection", status: "Open", rfi: null, note: "Pending sequence 2 detail (S-200)." },
];

export const SHEET_STATUS = { Current: "#5a8a1f", "In progress": "#b98900", Superseded: "#8a8a82" };
export const COORD_STATUS = { Open: "#b98900", Resolved: "#5a8a1f" };

export function sheetsByDiscipline() {
  return DISCIPLINES.map((d) => ({ discipline: d, sheets: SHEETS.filter((s) => s.discipline === d) })).filter((g) => g.sheets.length);
}
export function bimStats() {
  return {
    sheets: SHEETS.length,
    current: SHEETS.filter((s) => s.status === "Current").length,
    inProgress: SHEETS.filter((s) => s.status === "In progress").length,
    sets: SETS.length,
    models: MODELS.length,
    openClashes: COORDINATION.filter((c) => c.status === "Open").length,
  };
}
