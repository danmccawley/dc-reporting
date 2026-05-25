// PROVIDER FRAMEWORK — every external capability is a swappable provider. Each
// capability domain can be served by an INTEGRATION adapter (Procore, ACC, Aconex,
// P6, ERP, Kahua) or by a NATIVE module built into this platform, chosen per
// customer/site (mixed mode is the default). The atomic store and all derivations
// are provider-agnostic: a record is the same shape no matter where it came from,
// and every record is tagged with the provider that supplied it (provenance).

export const DOMAINS = [
  { key: "field", label: "Field execution / RFIs / inspections", incumbent: "Procore", native: "Native field & RFIs", nativeMaturity: "ga", note: "Native module live: daily reports, photos (SCOUT), report quality (WARDEN), plus the RFI lifecycle, submittals, and inspections." },
  { key: "bim", label: "BIM / drawings / sheets", incumbent: "Autodesk ACC", native: "Native drawings & maps", nativeMaturity: "beta", note: "Drawings, the site map, uploaded base layers, and zone calibration are native; sheet/version sync is the remaining adapter work." },
  { key: "records", label: "Document control / project record", incumbent: "Oracle Aconex", native: "Native document control", nativeMaturity: "ga", note: "Native module live: document register with revision control, transmittals, controlled distribution, and provenance (NOTARY)." },
  { key: "schedule", label: "Master schedule", incumbent: "Primavera P6", native: "Native CPM engine", nativeMaturity: "ga", note: "The native CPM/forecast engine is arguably better here — it is live and tied to field progress, not a periodically imported file." },
  { key: "cost", label: "Commitments / invoices / actual cost", incumbent: "ERP / Accounting", native: "Native cost (COMPTROLLER)", nativeMaturity: "ga", note: "Native module live: earned value (CPI/EAC) from the atomic store plus commitments, change orders, and pay applications." },
  { key: "governance", label: "Owner capital / program governance", incumbent: "Kahua / e-Builder", native: "Native governance", nativeMaturity: "planned", note: "Native owner-capital and program governance is planned; integrate with the incumbent until it is GA." },
];

export const MATURITY = { ga: { label: "GA", c: "#5a8a1f" }, beta: { label: "Beta", c: "#2f6d7d" }, planned: { label: "Planned", c: "#b98900" } };

// Demo registry — the per-domain choice an org/site makes (mixed mode).
export const REGISTRY = {
  field: "integration",
  bim: "integration",
  records: "native",
  schedule: "native",
  cost: "native",
  governance: "integration",
};

export function providerFor(key) {
  const d = DOMAINS.find((x) => x.key === key);
  const mode = REGISTRY[key] || "integration";
  return { ...d, mode, provider: mode === "native" ? d.native : d.incumbent };
}
export function getProviderTable() {
  return DOMAINS.map((d) => {
    const mode = REGISTRY[d.key] || "integration";
    return { ...d, mode, provider: mode === "native" ? d.native : d.incumbent, provenance: mode === "native" ? "Native" : d.incumbent };
  });
}
export function providerStats() {
  const vals = Object.values(REGISTRY);
  return { total: DOMAINS.length, native: vals.filter((v) => v === "native").length, integrated: vals.filter((v) => v === "integration").length };
}
