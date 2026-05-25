import Link from "next/link";
import { getSourcesByCategory, librarianStats, tierFor } from "../../lib/library";

export default function Library() {
  const cats = getSourcesByCategory();
  const st = librarianStats();

  return (
    <div>
      <div className="eyebrow">LIBRARIAN · knowledge base</div>
      <h1 className="title">Knowledge base &amp; source vetting</h1>
      <p className="sub">LIBRARIAN builds and curates the knowledge base behind the platform and screens every external source for reliability and credibility before any agent is allowed to act on it. Sources are scored and tiered; the agents consume only what is vetted. Click any source to open it.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{st.total}</div><div className="cap-label">Curated sources</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#5a8a1f" }}>{st.vetted}</div><div className="cap-label">Vetted or authoritative</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.quarantined ? "#A32D2D" : "#5a8a1f" }}>{st.quarantined}</div><div className="cap-label">Quarantined</div></div>
        <div className="card"><div className="kpi-cap">{st.categories}</div><div className="cap-label">Domains covered</div></div>
      </div>

      <h2 className="sec">How LIBRARIAN screens a source</h2>
      <div className="card">
        <div className="caprow"><span><strong>Authority</strong> — who publishes it, and is it the controlling reference?</span><span className="mono">40</span></div>
        <div className="caprow"><span><strong>Recency</strong> — last checked, and how fast the domain changes</span><span className="mono">20</span></div>
        <div className="caprow"><span><strong>Corroboration</strong> — does an independent source agree?</span><span className="mono">25</span></div>
        <div className="caprow"><span><strong>Track record</strong> — historical accuracy of this source</span><span className="mono">15</span></div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>Score ≥ 95 Authoritative · 80–94 Vetted · 60–79 Community (must be corroborated) · under 60 Quarantined (no agent may act on it).</div>
      </div>

      {cats.map((c) => c.sources.length > 0 && (
        <div key={c.key} style={{ marginTop: 18 }}>
          <h2 className="sec">{c.label}</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {c.sources.map((s, i) => {
              const t = tierFor(s.credibility);
              return (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", color: "inherit", padding: "14px 18px", borderTop: i ? "1px solid #ececec" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontWeight: 700 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: t.c, display: "inline-block", marginRight: 8 }} />{s.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: t.c, fontWeight: 700 }}>{t.k} · {s.credibility}/100</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{s.basis}</div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 5, fontSize: 12, color: "var(--muted)" }}>
                    <span>Last checked {s.lastChecked}</span>
                    <span>{s.usedBy.length ? `Used by ${s.usedBy.join(", ")}` : "Not cleared for use"}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      <div className="relnav"><span>Related:</span><Link href="/weather">Weather</Link><Link href="/procurement">Procurement</Link><Link href="/insights">Insights</Link><Link href="/forge">Solutions factory</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        When SENTINEL or AUGUR raise an external signal, it is tagged with the LIBRARIAN source and its credibility, so a human can always see where a forecast came from and how far to trust it. The quarantined trade forum is kept visible but is not cleared for any agent to act on.
      </div>
    </div>
  );
}
