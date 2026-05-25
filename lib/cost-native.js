// NATIVE COST MANAGEMENT (cost domain) — the native module that replaces an ERP /
// accounting integration for construction cost control. COMPTROLLER owns it. The
// earned-value math (CPI/EAC) already lives in the atomic store; this module adds
// the commercial layer: commitments (contracts / POs), change orders, and invoices
// / pay applications. Actual cost still reconciles to the atomic labor entries.
import { buildings, scopes } from "./mock/data";

const round = (v) => Math.round(v);
const scopeName = (slug) => (scopes.find((s) => s.slug === slug) || {}).name || slug;

// Commitments = executed contracts / purchase orders against scopes.
export const COMMITMENTS = [
  { id: "CMT-016-EL", building: "16", scope: "electrical", vendor: "Apex Electrical", original: 4200000, invoiced: 2680000, paid: 2410000, retention: 0.05 },
  { id: "CMT-017-EL", building: "17", scope: "electrical", vendor: "Apex Electrical", original: 4350000, invoiced: 1390000, paid: 1250000, retention: 0.05 },
  { id: "CMT-017-ME", building: "17", scope: "mechanical", vendor: "Northwind Mechanical", original: 3100000, invoiced: 980000, paid: 882000, retention: 0.05 },
  { id: "CMT-018-ST", building: "18", scope: "steel-erection", vendor: "Ironline Steel", original: 5200000, invoiced: 1040000, paid: 936000, retention: 0.10 },
  { id: "CMT-ALL-LV", building: "17", scope: "lv-cabling", vendor: "GridConnect LV", original: 1850000, invoiced: 420000, paid: 378000, retention: 0.05 },
  { id: "CMT-016-CX", building: "16", scope: "commissioning", vendor: "VeriCx Agents", original: 720000, invoiced: 230000, paid: 207000, retention: 0.05 },
];

// Change orders adjust a commitment's value (and may carry schedule impact).
export const CHANGE_ORDERS = [
  { id: "CO-012", commitment: "CMT-017-EL", amount: 184000, status: "Approved", reason: "Switchgear lineup revision per RFI-118.", days: 0 },
  { id: "CO-013", commitment: "CMT-018-ST", amount: 96000, status: "Pending", reason: "Sequence 2 connection detail; awaiting permit.", days: 4 },
  { id: "CO-011", commitment: "CMT-017-ME", amount: -42000, status: "Approved", reason: "Value-engineered CRAH piping.", days: 0 },
  { id: "CO-014", commitment: "CMT-016-EL", amount: 73000, status: "In review", reason: "Added busway run at MMR.", days: 0 },
];

// Invoices / pay applications draw down a commitment.
export const INVOICES = [
  { id: "PA-016-07", commitment: "CMT-016-EL", period: "Apr", amount: 410000, status: "Paid" },
  { id: "PA-016-08", commitment: "CMT-016-EL", period: "May", amount: 268000, status: "Approved" },
  { id: "PA-017-03", commitment: "CMT-017-EL", period: "May", amount: 320000, status: "Submitted" },
  { id: "PA-018-02", commitment: "CMT-018-ST", period: "May", amount: 280000, status: "Approved" },
  { id: "PA-017-ME-02", commitment: "CMT-017-ME", period: "May", amount: 190000, status: "Submitted" },
];

export const INV_STATUS = { Paid: "#5a8a1f", Approved: "#2f6d7d", Submitted: "#b98900", Rejected: "#A32D2D" };
export const CO_STATUS = { Approved: "#5a8a1f", "In review": "#2f6d7d", Pending: "#b98900", Rejected: "#A32D2D" };

export function enrichCommitments() {
  return COMMITMENTS.map((c) => {
    const cos = CHANGE_ORDERS.filter((x) => x.commitment === c.id);
    const coApproved = cos.filter((x) => x.status === "Approved").reduce((s, x) => s + x.amount, 0);
    const revised = c.original + coApproved;
    const invoices = INVOICES.filter((x) => x.commitment === c.id);
    const remaining = revised - c.invoiced;
    const retentionHeld = round(c.invoiced * c.retention);
    return { ...c, name: scopeName(c.scope), buildingName: (buildings.find((b) => b.id === c.building) || {}).name, cos, coApproved, revised, invoices, remaining, retentionHeld, billedPct: Math.round((c.invoiced / revised) * 100) };
  });
}
export function costStats() {
  const rows = enrichCommitments();
  const original = rows.reduce((s, r) => s + r.original, 0);
  const revised = rows.reduce((s, r) => s + r.revised, 0);
  const invoiced = rows.reduce((s, r) => s + r.invoiced, 0);
  const paid = rows.reduce((s, r) => s + r.paid, 0);
  const coPending = CHANGE_ORDERS.filter((x) => x.status !== "Approved").reduce((s, x) => s + x.amount, 0);
  const openInvoices = INVOICES.filter((x) => x.status !== "Paid").length;
  return { original, revised, invoiced, paid, coPending, openInvoices, committedDelta: revised - original };
}
export const fmtUSD = (n) => "$" + (n < 0 ? "-" : "") + Math.abs(Math.round(n)).toLocaleString();
export const fmtM = (n) => (n < 0 ? "-" : "") + "$" + (Math.abs(n) / 1e6).toFixed(2) + "M";
