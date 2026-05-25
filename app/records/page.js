"use client";
import { useState } from "react";
import Link from "next/link";
import { DOC_TYPES, STATUS, DOCUMENTS, TRANSMITTALS, docStats } from "../../lib/records";

export default function Records() {
  const st = docStats();
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(null);
  const shown = type === "all" ? DOCUMENTS : DOCUMENTS.filter((d) => d.type === type);

  return (
    <div>
      <div className="eyebrow">NOTARY + LIBRARIAN · native document control</div>
      <h1 className="title">Document control</h1>
      <p className="sub">The native document-control module — the project record built into the platform instead of a separate tool. A controlled register with revision history, transmittals, and controlled distribution; NOTARY owns versioning and the audit trail, LIBRARIAN handles retrieval. This is the <strong>native</strong> provider for the document-control domain; an org can integrate Aconex instead from the provider registry. <strong>Click any document</strong> to see its revision history and where it is used.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{st.total}</div><div className="cap-label">Controlled documents</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#5a8a1f" }}>{st.issued}</div><div className="cap-label">Issued (current)</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#2f6d7d" }}>{st.review}</div><div className="cap-label">For review</div></div>
        <div className="card"><div className="kpi-cap">{st.transmittals}</div><div className="cap-label">Recent transmittals</div></div>
      </div>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Type</span>
        <button className={`seg ${type === "all" ? "on" : ""}`} onClick={() => setType("all")}>All</button>
        {DOC_TYPES.map((t) => <button key={t} className={`seg ${type === t ? "on" : ""}`} onClick={() => setType(t)}>{t}</button>)}
      </div></div>

      <h2 className="sec">Register</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {shown.map((d, i) => {
          const s = STATUS[d.status]; const isOpen = open === d.id;
          return (
            <div key={d.id} style={{ borderTop: i ? "1px solid #ececec" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "13px 18px", cursor: "pointer", background: isOpen ? "#f7f6f0" : "transparent" }} onClick={() => setOpen(isOpen ? null : d.id)}>
                <span style={{ fontWeight: 700 }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{d.number}</span>{d.title}
                </span>
                <span style={{ display: "flex", gap: 12, alignItems: "baseline", whiteSpace: "nowrap" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>Rev {d.rev}</span>
                  <span className="mono" style={{ fontSize: 12, color: s.c, fontWeight: 700 }}>{d.status}</span>
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 16px" }}>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
                    <span>{d.type}</span><span>Building {d.building}</span><span>Issued {d.issued} by {d.by}</span>
                    <span>Distribution: {d.distribution.join(", ")}</span>
                    <span style={{ color: "var(--accent)" }}>Source: Native</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)", marginBottom: 4 }}>Revision history</div>
                  {d.versions.map((v, j) => (
                    <div key={j} className="caprow" style={{ alignItems: "baseline" }}>
                      <span><span className="mono" style={{ fontWeight: 700, marginRight: 8 }}>Rev {v.rev}</span><span style={{ fontSize: 13, color: "var(--muted)" }}>{v.note}</span></span>
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{v.date} · {v.by}</span>
                    </div>
                  ))}
                  {d.scope && <div style={{ marginTop: 10 }}><Link href={`/scope/${d.scope}/${d.building}`} className="scopelink">Where it&apos;s used: {d.scope} · Building {d.building} →</Link></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="sec">Recent transmittals</h2>
      <div className="card">
        {TRANSMITTALS.map((t) => (
          <div key={t.id} className="caprow" style={{ alignItems: "baseline" }}>
            <span><span className="mono" style={{ fontWeight: 700, marginRight: 8 }}>{t.no}</span>to {t.to} · {t.items.join(", ")}<div style={{ fontSize: 12, color: "var(--muted)" }}>{t.note}</div></span>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{t.date} · {t.status}</span>
          </div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/providers">Provider registry</Link><Link href="/analyze">Document analysis (COUNSEL)</Link><Link href="/library">Knowledge base</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Because this is the native provider, every document is an atomic record with full revision history owned by NOTARY — nothing depends on an external system. An org that already lives in Aconex can switch this domain to the integration adapter in the provider registry without changing anything else; records simply carry their source provider.
      </div>
    </div>
  );
}
