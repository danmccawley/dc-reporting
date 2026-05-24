import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getManpowerProgram } from "../../lib/features";

export default function Manpower() {
  const program = getManpowerProgram();
  const current = program.reduce((a, b) => a + b.current, 0);
  const required = program.reduce((a, b) => a + b.required, 0);
  const gap = required - current;

  return (
    <div>
      <div className="eyebrow">MUSTER · manpower forecast</div>
      <h1 className="title">Manpower forecast</h1>
      <p className="sub">MUSTER projects the crew needed per scope to hold the planned finish. Where the throughput forecast runs later than plan, it sizes the additional crew required to compress the work back into the window, and flags the shortfall. Load the critical-path scopes first.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap">{current}</div><div className="cap-label">Current crew (active scopes)</div></div>
        <div className="card"><div className="kpi-cap">{required}</div><div className="cap-label">Required to hold the plan</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: gap > 0 ? "#A32D2D" : "#5a8a1f" }}>{gap > 0 ? `+${gap}` : gap}</div><div className="cap-label">Net shortfall</div></div>
      </div>

      {program.map((b) => (
        <div key={b.id} style={{ marginTop: 22 }}>
          <h2 className="sec" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{buildings.find((x) => x.id === b.id).name}</span>
            <span className="mono" style={{ fontSize: 14, color: b.gap > 0 ? "#A32D2D" : "#5a8a1f" }}>{b.current} → {b.required} crew{b.gap > 0 ? ` (+${b.gap})` : ""}</span>
          </h2>
          <div className="card">
            {b.rows.length === 0 && <div className="notice">No active scopes at this building yet.</div>}
            {b.rows.map((r) => (
              <Link key={r.id} href={`/scope/${r.slug}/${b.id}`} className="caprow" style={{ textDecoration: "none", color: "inherit", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: r.color, display: "inline-block" }} />
                  {r.name} {r.critical && <span className="crittag">critical</span>}
                </span>
                <span className="mono">{r.current} → {r.required}{r.gap > 0 ? <span style={{ color: "#A32D2D" }}> (+{r.gap})</span> : <span style={{ color: "#5a8a1f" }}> ok</span>}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="relnav"><span>Related:</span><Link href="/plan">Build plan</Link><Link href="/lookahead">Look-ahead</Link><Link href="/cost">Cost</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Required crew = current crew × (forecast days remaining ÷ planned days remaining). When a scope is forecast to finish late, MUSTER sizes the crew add needed to recover the date. Adding crew off the critical path will not move go-live.
      </div>
    </div>
  );
}
