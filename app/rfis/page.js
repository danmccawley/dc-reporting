"use client";
import { useState } from "react";
import Link from "next/link";
import { enrichRfis, SUBMITTALS, INSPECTIONS, fieldStats, RFI_STATUS, SUB_STATUS, INS_RESULT } from "../../lib/field-native";

export default function Rfis() {
  const rfis = enrichRfis();
  const st = fieldStats();
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div className="eyebrow">MARSHAL + AUGUR · native field workflow</div>
      <h1 className="title">RFIs, submittals &amp; inspections</h1>
      <p className="sub">The native field-workflow module — the RFI lifecycle, submittals, and inspections built into the platform instead of a Procore integration. Daily reports, photos (SCOUT), and report quality (WARDEN) are already native; this completes the field domain. RFI responses link to their document-control record. This is the <strong>native</strong> provider for the field domain. <strong>Click an RFI</strong> for ball-in-court, schedule impact, and its response.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap" style={{ color: st.openRfis ? "#b98900" : "#5a8a1f" }}>{st.openRfis}</div><div className="cap-label">Open RFIs</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.critOpen ? "#A32D2D" : "#5a8a1f" }}>{st.critOpen}</div><div className="cap-label">Open on critical path</div></div>
        <div className="card"><div className="kpi-cap">{st.subsOpen}</div><div className="cap-label">Submittals in flight</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.insOpenDef ? "#b98900" : "#5a8a1f" }}>{st.insOpenDef}</div><div className="cap-label">Inspections open / deficient</div></div>
      </div>

      <h2 className="sec">RFIs</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {rfis.map((r, i) => {
          const isOpen = open === r.id; const c = RFI_STATUS[r.display] || "#6c6b62";
          return (
            <div key={r.id} style={{ borderTop: i ? "1px solid #ececec" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "13px 18px", cursor: "pointer", background: isOpen ? "#f7f6f0" : "transparent" }} onClick={() => setOpen(isOpen ? null : r.id)}>
                <span style={{ fontWeight: 700 }}><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{r.id}</span>{r.subject}{r.critical && <span className="crittag" style={{ marginLeft: 8 }}>critical</span>}</span>
                <span style={{ display: "flex", gap: 12, alignItems: "baseline", whiteSpace: "nowrap" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{r.ball}</span>
                  <span className="mono" style={{ fontSize: 12, color: c, fontWeight: 700 }}>{r.display}</span>
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 16px" }}>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
                    <span>{r.name} · Building {r.building}</span><span>Opened {r.opened}</span><span>Due {r.due}</span>{r.answered && <span>Answered {r.answered}</span>}<span>Ball: {r.ball}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: "#2b2f2e" }}>{r.note}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <Link href={`/scope/${r.scope}/${r.building}`} className="scopelink">Affects: {r.name} · Building {r.building} →</Link>
                    {r.doc && <Link href="/records" className="scopelink">Response document {r.doc} →</Link>}
                    {r.critical && r.status === "Open" && <Link href="/lookahead" className="scopelink">On the look-ahead →</Link>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="sec">Submittals</h2>
      <div className="card">
        {SUBMITTALS.map((s) => (
          <div key={s.id} className="caprow" style={{ alignItems: "baseline" }}>
            <span><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{s.id}</span>{s.subject}{s.longLead && <span className="chip" style={{ marginLeft: 8 }}>long-lead</span>}</span>
            <span className="mono" style={{ fontSize: 12, color: SUB_STATUS[s.status] || "#6c6b62" }}>Rev {s.rev} · {s.status}</span>
          </div>
        ))}
      </div>

      <h2 className="sec">Inspections</h2>
      <div className="card">
        {INSPECTIONS.map((ins) => (
          <div key={ins.id} className="caprow" style={{ alignItems: "baseline" }}>
            <span><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{ins.id}</span>{ins.type}<div style={{ fontSize: 12, color: "var(--muted)" }}>{ins.note}</div></span>
            <span className="mono" style={{ fontSize: 12, color: INS_RESULT[ins.result] || "#6c6b62" }}>{ins.result} · {ins.date}</span>
          </div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/records">Document control</Link><Link href="/lookahead">Look-ahead</Link><Link href="/compliance">Compliance</Link><Link href="/providers">Provider registry</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Native field workflow: the two open critical-path RFIs (sequence 2 detail, switchgear-adjacent items) feed MARSHAL&apos;s look-ahead and AUGUR&apos;s schedule-impact watch, the switchgear submittal ties to QUARTERMASTER&apos;s long-lead risk, and the fall-protection deficiency is the same item PROVOST tracks under OSHA. An org on Procore can switch this domain to the adapter in the provider registry.
      </div>
    </div>
  );
}
