import Link from "next/link";
import { getVerification } from "../../lib/mock/data";

export default function Verify() {
  const rows = getVerification();
  const flagged = rows.filter((r) => r.flag);

  return (
    <div>
      <div className="eyebrow">SCOUT · spatial verification</div>
      <h1 className="title">Reported vs observed</h1>
      <p className="sub">SCOUT estimates progress from site photos and reconciles it against what the field reported. Divergences are flagged for review — verification, not just dashboards.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap">{rows.length}</div><div className="cap-label">Scope-areas verified</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: flagged.length ? "#A32D2D" : "#5a8a1f" }}>{flagged.length}</div><div className="cap-label">Divergences flagged (≥6 pts)</div></div>
        <div className="card"><div className="kpi-cap">{Math.round((1 - flagged.length / rows.length) * 100)}%</div><div className="cap-label">Reported matches observed</div></div>
      </div>

      <h2 className="sec">Verification queue <span className="hint">— largest divergence first</span></h2>
      <div className="card">
        <div className="vhead">
          <span style={{ flex: 2 }}>Scope · building</span>
          <span className="vcol">Reported</span>
          <span className="vcol">Observed</span>
          <span className="vcol">Variance</span>
          <span style={{ width: 90 }} />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="vrow">
            <span style={{ flex: 2 }}>
              <span style={{ fontWeight: 600 }}>{r.scope}</span>
              <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 6 }}>{r.building}</span>
            </span>
            <span className="vcol mono">{r.reported}%</span>
            <span className="vcol mono">{r.observed}%</span>
            <span className="vcol mono" style={{ color: r.flag ? "#A32D2D" : "var(--muted)", fontWeight: r.flag ? 700 : 400 }}>
              {r.variance > 0 ? "+" : ""}{r.variance}
            </span>
            <span style={{ width: 90, textAlign: "right" }}>
              {r.flag ? <span className="pill s-r"><span className="dot d-r" />Review</span> : <span className="pill s-g"><span className="dot d-g" />OK</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Negative variance means the site shows less progress than was reported — the cases worth a look. In production SCOUT derives observed percent from photo and (where available) point-cloud / 360 capture, and links each flag to the underlying images.
      </div>
    </div>
  );
}
