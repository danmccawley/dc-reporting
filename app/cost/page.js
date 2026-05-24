import Link from "next/link";
import { cost } from "../../lib/mock/data";

function cpiStatus(cpi) { return cpi >= 1 ? "g" : cpi >= 0.95 ? "a" : "r"; }
const FILL = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

export default function Cost() {
  const budget = cost.reduce((a, c) => a + c.budget, 0);
  const committed = cost.reduce((a, c) => a + c.committed, 0);
  const actual = cost.reduce((a, c) => a + c.actual, 0);
  const eac = cost.reduce((a, c) => a + c.eac, 0);
  const variance = budget - eac;

  return (
    <div>
      <div className="eyebrow">COMPTROLLER · cost</div>
      <h1 className="title">Cost &amp; forecast</h1>
      <p className="sub">Budget, committed, actual, and forecast at completion across the program — owner-side capital governance, with cost per megawatt.</p>

      <div className="grid g3">
        <div className="card"><div className="cap-label">Program budget</div><div className="kpi-cap">${budget}M</div></div>
        <div className="card"><div className="cap-label">Committed / actual</div><div className="kpi-cap" style={{ fontSize: 22 }}>${committed}M <span className="cap-unit">/ ${actual}M</span></div></div>
        <div className="card"><div className="cap-label">Forecast at completion (EAC)</div><div className="kpi-cap" style={{ color: variance >= 0 ? "#5a8a1f" : "#A32D2D" }}>${eac}M</div><div style={{ fontSize: 13, color: variance >= 0 ? "#5a8a1f" : "#A32D2D" }}>{variance >= 0 ? "Under budget" : "Over budget"} by ${Math.abs(variance)}M</div></div>
      </div>

      <h2 className="sec">By building</h2>
      <div className="card">
        <div className="vhead"><span style={{ flex: 2 }}>Building</span><span className="vcol">Budget</span><span className="vcol">Committed</span><span className="vcol">Actual</span><span className="vcol">EAC</span><span className="vcol">CPI</span><span className="vcol">$/MW</span></div>
        {cost.map((c) => {
          const st = cpiStatus(c.cpi);
          return (
            <Link key={c.id} href={`/site/${c.id}`} className="vrow" style={{ color: "inherit" }}>
              <span style={{ flex: 2, fontWeight: 600 }}>{c.name}</span>
              <span className="vcol mono">${c.budget}M</span>
              <span className="vcol mono">${c.committed}M</span>
              <span className="vcol mono">${c.actual}M</span>
              <span className="vcol mono" style={{ color: c.eac <= c.budget ? "#5a8a1f" : "#A32D2D" }}>${c.eac}M</span>
              <span className="vcol mono" style={{ color: FILL[st], fontWeight: 700 }}>{c.cpi.toFixed(2)}</span>
              <span className="vcol mono">${(c.eac / c.mw).toFixed(1)}M</span>
            </Link>
          );
        })}
      </div>

      <div className="relnav">
        <span>Related:</span>
        <Link href="/capacity">Capacity</Link>
        <Link href="/commissioning">Commissioning</Link>
        <Link href="/schedule">Schedule</Link>
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        CPI below 1.00 flags cost underperformance; EAC is the forecast cost at completion. COMPTROLLER ingests commitments and actuals from the ERP/accounting system and computes these deterministically.
      </div>
    </div>
  );
}
