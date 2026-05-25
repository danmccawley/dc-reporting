// NATIVE GOVERNANCE (governance domain) — owner capital and program governance
// built in instead of a Kahua / e-Builder integration. DIPLOMAT (owner-facing)
// and NOTARY (approvals/audit) own it. Capital reconciles to the native cost
// module: committed = sum of revised commitments, spent = sum paid. Stage gates
// require human (owner) approval before a phase or its funding releases.
import { costStats } from "./cost-native";
import { buildings } from "./mock/data";

const cs = costStats();
const AUTHORIZED = 26000000; // illustrative program capital for the demo scale
const CONTINGENCY = 1600000;

export const FUNDING = [
  { id: "EQ", source: "Owner equity", committed: 9000000, drawn: 5200000 },
  { id: "LOAN", source: "Construction facility", committed: 15000000, drawn: 1540000 },
  { id: "GRANT", source: "Utility incentive (efficiency)", committed: 2000000, drawn: 0 },
];

export const GATES = [
  { id: "G-1", title: "Release Building 16 commissioning budget", status: "Approved", approver: "Owner / PM", releases: "Cx agent scope + final inspections funding", depends: "Cx readiness review", date: "Apr 30" },
  { id: "G-2", title: "Authorize Building 17 fit-out procurement", status: "Approved", approver: "Owner", releases: "MV switchgear + CRAH purchase orders", depends: "GMP amendment 2", date: "May 6" },
  { id: "G-3", title: "Release Building 18 superstructure funding", status: "Pending", approver: "Owner / Board", releases: "Steel sequence 2 commitment + erection", depends: "Superstructure permit (PROVOST) + CO-013", date: "Target May 30" },
  { id: "G-4", title: "Approve Building 18 generator package", status: "Blocked", approver: "Owner", releases: "Generator commitment + SPCC/air-permit scope", depends: "EPA / state air permit + SPCC (PROVOST)", date: "Held" },
];

export const MILESTONES = [
  { id: "M-16", title: "Building 16 energization", target: "Jun 18", forecast: "Jun 20", status: "a" },
  { id: "M-17", title: "Building 17 topping out", target: "Jul 2", forecast: "Jul 2", status: "g" },
  { id: "M-18", title: "Building 18 superstructure start", target: "Jun 2", forecast: "Jun 9", status: "r" },
];

export const GATE_C = { Approved: "#5a8a1f", Pending: "#b98900", Blocked: "#A32D2D" };

export function capitalByBuilding() {
  // Allocate authorized capital across buildings roughly by their committed share.
  const total = cs.revised || 1;
  return buildings.map((b) => {
    const share = Math.max(0.2, (b.id === "18" ? 0.42 : b.id === "17" ? 0.34 : 0.24));
    const allocated = Math.round(AUTHORIZED * share);
    return { id: b.id, name: b.name, allocated };
  });
}
export function govStats() {
  const drawn = FUNDING.reduce((s, f) => s + f.drawn, 0);
  const fundingCommitted = FUNDING.reduce((s, f) => s + f.committed, 0);
  return {
    authorized: AUTHORIZED, contingency: CONTINGENCY,
    committed: cs.revised, spent: cs.paid,
    remaining: AUTHORIZED - cs.revised,
    drawn, fundingCommitted,
    gatesOpen: GATES.filter((g) => g.status !== "Approved").length,
  };
}
export const fmtM = (n) => (n < 0 ? "-" : "") + "$" + (Math.abs(n) / 1e6).toFixed(2) + "M";
export const fmtUSD = (n) => "$" + Math.round(n).toLocaleString();
