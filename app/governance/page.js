"use client";
import { useState } from "react";
import Link from "next/link";
import { FUNDING, GATES, MILESTONES, GATE_C, capitalByBuilding, govStats, fmtM, fmtUSD } from "../../lib/governance";

export default function Governance() {
  const st = govStats();
  const cap = capitalByBuilding();
  const [open, setOpen] = useState(null);
  const ragc = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

  return (
    <div>
      <div className="eyebrow">DIPLOMAT + NOTARY · native governance</div>
      <h1 className="title">Owner capital &amp; program governance</h1>
      <p className="sub">The native governance module — program capital, funding, stage-gate approvals, and owner milestones built into the platform instead of a Kahua / e-Builder integration. Capital reconciles to the native cost module (committed and spent come straight from commitments and payments). Stage gates require owner approval before a phase or its funding releases. This is the <strong>native</strong> provider for the governance domain. <strong>Click a gate</strong> to see what it releases and what it depends on.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{fmtM(st.authorized)}</div><div className="cap-label">Authorized capital</div></div>
        <div className="card"><div className="kpi-cap">{fmtM(st.committed)}</div><div className="cap-label">Committed</div></div>
        <div className="card"><div className="kpi-cap">{fmtM(st.spent)}</div><div className="cap-label">Spent to date</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.gatesOpen ? "#b98900" : "#5a8a1f" }}>{st.gatesOpen}</div><div className="cap-label">Approval gates open</div></div>
      </div>

      <h2 className="sec">Capital by building</h2>
      <div className="card">
        {cap.map((c) => (
          <Link key={c.id} href={`/cost/${c.id}`} className="caprow" style={{ textDecoration: "none", color: "inherit" }}>
            <span>{c.name}</span><span className="mono">{fmtM(c.allocated)} allocated <span className="scopelink">open →</span></span>
          </Link>
        ))}
        <div className="caprow" style={{ borderTop: "1px solid #ececec", marginTop: 4, paddingTop: 8 }}><span>Contingency held</span><span className="mono">{fmtUSD(st.contingency)}</span></div>
      </div>

      <h2 className="sec">Funding sources</h2>
      <div className="card">
        {FUNDING.map((f) => (
          <div key={f.id} className="caprow"><span>{f.source}</span><span className="mono">{fmtM(f.drawn)} drawn / {fmtM(f.committed)}</span></div>
        ))}
        <div className="caprow" style={{ borderTop: "1px solid #ececec", marginTop: 4, paddingTop: 8 }}><span style={{ fontWeight: 700 }}>Total drawn</span><span className="mono" style={{ fontWeight: 700 }}>{fmtM(st.drawn)} / {fmtM(st.fundingCommitted)}</span></div>
      </div>

      <h2 className="sec">Stage-gate approvals</h2>
      {GATES.map((g) => {
        const isOpen = open === g.id;
        return (
          <div key={g.id} className="card" style={{ marginBottom: 10, borderLeft: `4px solid ${GATE_C[g.status]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, cursor: "pointer" }} onClick={() => setOpen(isOpen ? null : g.id)}>
              <span style={{ fontWeight: 700 }}>{g.title}</span>
              <span className="mono" style={{ fontSize: 12, color: GATE_C[g.status], fontWeight: 700, whiteSpace: "nowrap" }}>{g.status}</span>
            </div>
            {!isOpen && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>Releases {g.releases} · {g.approver} <button className="chip" style={{ marginLeft: 6 }} onClick={() => setOpen(g.id)}>Details</button></div>}
            {isOpen && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ececec" }}>
                <div className="caprow"><span>Releases</span><span style={{ textAlign: "right", maxWidth: "62%" }}>{g.releases}</span></div>
                <div className="caprow"><span>Approver</span><span className="mono">{g.approver}</span></div>
                <div className="caprow"><span>Depends on</span><span style={{ textAlign: "right", maxWidth: "62%" }}>{g.depends}</span></div>
                <div className="caprow"><span>Target / date</span><span className="mono">{g.date}</span></div>
                {(g.depends.includes("permit") || g.depends.includes("PROVOST")) && <div style={{ marginTop: 8 }}><Link href="/compliance" className="scopelink">See the gating compliance item →</Link></div>}
              </div>
            )}
          </div>
        );
      })}

      <h2 className="sec">Owner milestones</h2>
      <div className="card">
        {MILESTONES.map((m) => (
          <div key={m.id} className="caprow"><span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: ragc[m.status], marginRight: 8 }} />{m.title}</span><span className="mono" style={{ fontSize: 12 }}>target {m.target} · forecast {m.forecast}</span></div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/commitments">Commitments</Link><Link href="/cost">Earned value</Link><Link href="/compliance">Compliance</Link><Link href="/providers">Provider registry</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Two gates are not yet released and both trace to compliance: the Building 18 superstructure funding waits on the superstructure permit, and the generator package is blocked on the EPA / state air permit and SPCC. Because governance is native, committed and spent reconcile to the same atomic entries that drive CPI and EAC — no separate system of record.
      </div>
    </div>
  );
}
