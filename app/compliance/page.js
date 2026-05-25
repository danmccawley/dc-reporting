"use client";
import { useState } from "react";
import Link from "next/link";
import { DOMAINS, STATUS, getByDomain, complianceStats } from "../../lib/compliance";
import { getSource, tierFor } from "../../lib/library";

export default function Compliance() {
  const groups = getByDomain();
  const st = complianceStats();
  const [domain, setDomain] = useState("all");
  const [open, setOpen] = useState(null);

  const shown = domain === "all" ? groups : groups.filter((g) => g.key === domain);

  return (
    <div>
      <div className="eyebrow">PROVOST · compliance &amp; regulatory</div>
      <h1 className="title">Compliance register</h1>
      <p className="sub">PROVOST keeps a live register of what the program is legally subject to — OSHA, federal, state, local, and environmental — maps each requirement to the work it affects, and tracks status, owner, evidence, and the governing citation. <strong>Click any requirement</strong> to see what it affects and to open the controlling authority. PROVOST surfaces and tracks; it is not legal advice.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap" style={{ color: st.pct >= 80 ? "#5a8a1f" : "#b98900" }}>{st.pct}%</div><div className="cap-label">Compliant or monitoring</div></div>
        <div className="card"><div className="kpi-cap">{st.total}</div><div className="cap-label">Tracked requirements</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.action ? "#b98900" : "#5a8a1f" }}>{st.action}</div><div className="cap-label">Action needed</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.overdue ? "#A32D2D" : "#5a8a1f" }}>{st.overdue}</div><div className="cap-label">Overdue</div></div>
      </div>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Jurisdiction</span>
        <button className={`seg ${domain === "all" ? "on" : ""}`} onClick={() => setDomain("all")}>All</button>
        {DOMAINS.map((d) => <button key={d.key} className={`seg ${domain === d.key ? "on" : ""}`} onClick={() => setDomain(d.key)}>{d.label}</button>)}
      </div></div>

      {shown.map((g) => (
        <div key={g.key} style={{ marginTop: 18 }}>
          <h2 className="sec" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{g.label}</span>
            <span className="mono" style={{ fontSize: 13, color: g.rag === "r" ? "#A32D2D" : g.rag === "a" ? "#b98900" : "#5a8a1f" }}>{g.open ? `${g.open} open` : "clear"}</span>
          </h2>
          {g.items.map((r) => {
            const s = STATUS[r.status]; const src = getSource(r.sourceId); const t = src ? tierFor(src.credibility) : null; const isOpen = open === r.id;
            return (
              <div key={r.id} className="card" style={{ marginBottom: 10, borderLeft: `4px solid ${s.c}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, cursor: "pointer" }} onClick={() => setOpen(isOpen ? null : r.id)}>
                  <span style={{ fontWeight: 700 }}>{r.title} <span className="mono" style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>· {r.citation}</span></span>
                  <span className="mono" style={{ fontSize: 12, color: s.c, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
                {!isOpen && (
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                    {r.authority} · affects {r.appliesTo.map((a) => a.label).join(", ")} <button className="chip" style={{ marginLeft: 6 }} onClick={() => setOpen(r.id)}>Details</button>
                  </div>
                )}
                {isOpen && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ececec" }}>
                    <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)" }}>Affects</div>
                    {r.appliesTo.map((a, i) => a.slug ? (
                      <Link key={i} href={`/scope/${a.slug}/${a.building}`} className="caprow" style={{ textDecoration: "none", color: "inherit" }}><span>{a.label}</span><span className="scopelink">open →</span></Link>
                    ) : (
                      <div key={i} className="caprow"><span>{a.label}</span><span className="mono" style={{ color: "var(--muted)" }}>program</span></div>
                    ))}
                    <div className="caprow" style={{ marginTop: 6 }}><span>Authority</span><span className="mono">{r.authority}</span></div>
                    <div className="caprow"><span>Citation</span><span className="mono">{r.citation}</span></div>
                    <div className="caprow"><span>Owner</span><span className="mono">{r.owner}</span></div>
                    <div className="caprow"><span>Due</span><span className="mono">{r.due}</span></div>
                    <div className="caprow"><span>Evidence</span><span style={{ textAlign: "right", maxWidth: "60%", fontSize: 13 }}>{r.evidence}</span></div>
                    <div style={{ fontSize: 13.5, color: r.status === "compliant" ? "#2b2f2e" : "#7a4a00", marginTop: 8, background: r.status === "action" || r.status === "overdue" ? "#fbf3df" : "transparent", padding: r.status === "action" || r.status === "overdue" ? "8px 10px" : 0, borderRadius: 8 }}>
                      <strong>{r.status === "compliant" || r.status === "monitoring" ? "Status: " : "Remediation: "}</strong>{r.remediation}
                    </div>
                    {src && (
                      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 13 }}>
                        <span style={{ color: "var(--muted)" }}>Source</span>
                        <a href={src.url} target={src.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="scopelink">{src.name} →</a>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: t.c }} />LIBRARIAN-vetted · {t.k} · {src.credibility}/100</span>
                        <Link href="/library" className="scopelink">how it&apos;s vetted →</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="relnav"><span>Related:</span><Link href="/site/16">Safety (GUARDIAN)</Link><Link href="/library">Knowledge base</Link><Link href="/schedule">Schedule</Link><Link href="/forge">Solutions factory</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Two items gate work this month: the EPA / state air permit and SPCC must clear before the Building 18 generators start, and the Building 18 superstructure permit must clear before steel sequence 2. Each requirement traces to a LIBRARIAN-vetted authority (OSHA, eCFR, EPA, or the AHJ) so you can open the controlling text. GUARDIAN feeds safety recordables into the OSHA 300 log.
      </div>
    </div>
  );
}
