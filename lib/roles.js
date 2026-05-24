export const ROLES = [
  { key: "CM", label: "Construction Manager" },
  { key: "PM", label: "Project Manager" },
  { key: "CIM", label: "Compute Infrastructure Management Team" },
  { key: "ADMIN", label: "Platform Administrator" },
];

export const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.key, r.label]));

// Capability matrix: which role can do what.
export const CAPS = [
  { key: "view", label: "View dashboards, reports, maps & capacity", roles: { CM: true, PM: true, CIM: true, ADMIN: true } },
  { key: "submit", label: "Submit & edit daily field reports", roles: { CM: true, PM: true, CIM: false, ADMIN: true } },
  { key: "approve_site", label: "Approve site / weekly reports", roles: { CM: true, PM: true, CIM: false, ADMIN: true } },
  { key: "approve_program", label: "Approve program / monthly+ reports", roles: { CM: false, PM: true, CIM: false, ADMIN: true } },
  { key: "validate_readiness", label: "Validate commissioning & capacity readiness", roles: { CM: false, PM: true, CIM: true, ADMIN: true } },
  { key: "counsel", label: "Run document analysis (COUNSEL)", roles: { CM: false, PM: true, CIM: true, ADMIN: true } },
  { key: "integrations", label: "Manage data-source integrations", roles: { CM: false, PM: false, CIM: false, ADMIN: true } },
  { key: "users", label: "Manage users, profiles & roles", roles: { CM: false, PM: false, CIM: false, ADMIN: true } },
  { key: "registry", label: "Edit scope / KPI registry & targets", roles: { CM: false, PM: false, CIM: false, ADMIN: true } },
];

const CAP_INDEX = Object.fromEntries(CAPS.map((c) => [c.key, c.roles]));

export function can(roleKey, capKey) {
  const row = CAP_INDEX[capKey];
  return !!(row && row[roleKey]);
}
