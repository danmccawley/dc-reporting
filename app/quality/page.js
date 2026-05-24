import Link from "next/link";
import { getReportQuality } from "../../lib/features";

function scoreColor(s) { return s >= 85 ? "#5a8a1f" : s >= 70 ? "#b98900" : "#A32D2D"; }

export default function Quality() {
  const q = getReportQuality();

  return (
    <div>
      <div className="eyebrow">WARDEN · report quality</div>
      <h1 className="title">Daily-report quality</h1>
      <p className="sub">WARDEN scores every daily report for completeness — quantities, narrative, photos, crew, zone, and event capture — because a complete report is what makes every rolled-up number defensible. Low-scoring reports get a specific nudge back to the crew that filed them.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap" style={{ color: scoreColor(q.avg) }}>{q.avg}<span className="cap-unit"> / 100</span></div><div className="cap-label">Average completeness</div></div>
        <div className="card"><div className="kpi-cap">{q.complete}<span className="cap-unit"> / {q.total}</span></div><div className="cap-label">Reports ≥ 85 (complete)</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: q.flaggedCount ? "#A32D2D" : "#5a8a1f" }}>{q.flaggedCount}</div><div className="cap-label">Flagged for follow-up</div></div>
      </div>

      <h2 className="sec">Flagged reports</h2>
      <div className="card">
        {q.flagged.length === 0 && <div className="notice">Every recent report scored 70 or above. Nothing to chase.</div>}
        {q.flagged.map((r, i) => (
          <div key={i} style={{ padding: "12px 0", borderTop: i ? "1px solid #ececec" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600 }}>{r.scope} · {r.building}</span>
              <span className="mono" style={{ fontWeight: 700, color: scoreColor(r.score) }}>{r.score}/100</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 4px" }}>{r.date} · {r.author} · {r.zone}</div>
            {r.missing.map((m, j) => <div key={j} style={{ fontSize: 12.5, color: "#A32D2D" }}>▲ {m}</div>)}
          </div>
        ))}
      </div>

      <h2 className="sec">What WARDEN checks</h2>
      <div className="card">
        <div className="caprow"><span>Substantive narrative (what advanced / what blocked)</span><span className="mono">20</span></div>
        <div className="caprow"><span>At least two progress photos (for SCOUT)</span><span className="mono">20</span></div>
        <div className="caprow"><span>Crew headcount recorded</span><span className="mono">15</span></div>
        <div className="caprow"><span>Installed quantities, not just a percent</span><span className="mono">15</span></div>
        <div className="caprow"><span>Work zone / area tagged</span><span className="mono">15</span></div>
        <div className="caprow"><span>Safety / quality events confirmed (or none)</span><span className="mono">15</span></div>
      </div>

      <div className="relnav"><span>Related:</span><Link href="/report/daily">Daily report</Link><Link href="/verify">SCOUT verify</Link><Link href="/coach">Coach</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        WARDEN does not block a report; it scores it and nudges. Persistent low scores on a crew route to COACH, which serves the short lesson on writing a daily report you can trust.
      </div>
    </div>
  );
}
