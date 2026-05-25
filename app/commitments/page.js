"use client";
import { useState } from "react";
import Link from "next/link";
import { enrichCommitments, costStats, CHANGE_ORDERS, INVOICES, INV_STATUS, CO_STATUS, fmtUSD, fmtM } from "../../lib/cost-native";

export default function Commitments() {
  const rows = enrichCommitments();
  const st = costStats();
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div className="eyebrow">COMPTROLLER · native cost management</div>
      <h1 className="title">Commitments &amp; cost</h1>
      <p className="sub">The native cost module — contracts, change orders, and invoices built into the platform instead of an ERP integration. Earned value (CPI / EAC) is computed from the atomic store on the <Link href="/cost" className="scopelink">cost view</Link>; this is the commercial layer that feeds the actual-cost side. This is the <strong>native</strong> provider for the cost domain. <strong>Click a commitment</strong> to see its change orders, invoices, and the scope it funds.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{fmtM(st.revised)}</div><div className="cap-label">Committed (revised)</div></div>
        <div className="card"><div className="kpi-cap">{fmtM(st.invoiced)}</div><div className="cap-label">Invoiced to date</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.coPending ? "#b98900" : "#5a8a1f" }}>{fmtM(st.coPending)}</div><div className="cap-label">Change orders pending</div></div>
        <div className="card"><div className="kpi-cap">{st.openInvoices}</div><div className="cap-label">Open pay applications</div></div>
      </div>

      <h2 className="sec">Commitments</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {rows.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <div key={c.id} style={{ borderTop: i ? "1px solid #ececec" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "13px 18px", cursor: "pointer", background: isOpen ? "#f7f6f0" : "transparent" }} onClick={() => setOpen(isOpen ? null : c.id)}>
                <span style={{ fontWeight: 700 }}>{c.vendor} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 13 }}>· {c.name} · {c.buildingName}</span></span>
                <span style={{ display: "flex", gap: 14, alignItems: "baseline", whiteSpace: "nowrap" }}>
                  <span className="mono" style={{ fontSize: 13 }}>{fmtM(c.revised)}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{c.billedPct}% billed</span>
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 16px" }}>
                  <div className="caprow"><span>Original commitment</span><span className="mono">{fmtUSD(c.original)}</span></div>
                  {c.coApproved !== 0 && <div className="caprow"><span>Approved change orders</span><span className="mono" style={{ color: c.coApproved > 0 ? "#b98900" : "#5a8a1f" }}>{fmtUSD(c.coApproved)}</span></div>}
                  <div className="caprow"><span>Revised commitment</span><span className="mono" style={{ fontWeight: 700 }}>{fmtUSD(c.revised)}</span></div>
                  <div className="caprow"><span>Invoiced / paid</span><span className="mono">{fmtUSD(c.invoiced)} / {fmtUSD(c.paid)}</span></div>
                  <div className="caprow"><span>Retention held</span><span className="mono">{fmtUSD(c.retentionHeld)}</span></div>
                  <div className="caprow"><span>Remaining to bill</span><span className="mono">{fmtUSD(c.remaining)}</span></div>
                  {c.cos.length > 0 && <div style={{ marginTop: 8, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)" }}>Change orders</div>}
                  {c.cos.map((co) => (
                    <div key={co.id} className="caprow" style={{ alignItems: "baseline" }}>
                      <span><span className="mono" style={{ marginRight: 8 }}>{co.id}</span><span style={{ fontSize: 13, color: "var(--muted)" }}>{co.reason}</span></span>
                      <span className="mono" style={{ fontSize: 12, color: CO_STATUS[co.status] }}>{fmtUSD(co.amount)} · {co.status}</span>
                    </div>
                  ))}
                  {c.invoices.length > 0 && <div style={{ marginTop: 8, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)" }}>Pay applications</div>}
                  {c.invoices.map((inv) => (
                    <div key={inv.id} className="caprow"><span><span className="mono" style={{ marginRight: 8 }}>{inv.id}</span>{inv.period}</span><span className="mono" style={{ fontSize: 12, color: INV_STATUS[inv.status] }}>{fmtUSD(inv.amount)} · {inv.status}</span></div>
                  ))}
                  <div style={{ marginTop: 10 }}><Link href={`/scope/${c.scope}/${c.building}`} className="scopelink">Funds: {c.name} · {c.buildingName} →</Link></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/cost">Earned value (CPI/EAC)</Link><Link href="/providers">Provider registry</Link><Link href="/records">Document control</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Native cost management: commitments, change orders, and pay applications live in the platform, and actual cost reconciles to the atomic labor entries that drive CPI and EAC. An org that runs cost in an ERP can switch this domain to the integration adapter in the provider registry; records keep their source tag either way.
      </div>
    </div>
  );
}
