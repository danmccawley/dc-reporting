import Link from "next/link";
import { getProgramCost } from "../../lib/mock/data";

const FILL = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };
function cpiStatus(cpi) { return cpi >= 1 ? "g" : cpi >= 0.95 ? "a" : "r"; }
const m = (x) => `$${x.toFixed(1)}M`;

export default function Cost() {
  const p = getProgramCost();
  const variance = p.bac - p.eac;

  return (
    <div>
      <div className="eyebrow">COMPTROLLER · cost</div>
      <h1 className="title">Cost &amp; forecast</h1>
      <p className="sub">Earned-value cost, built up from the same atomic entries as progress — by scope, by building, and by day. Budget, committed, actual, and forecast at completion, with cost per megawatt.</p>

      <div className="grid g4">
        <div className="card"><div className="cap-label">Budget (BAC)</div><div className="kpi-cap">{m(p.bac)}</div></div>
        <div className="card"><div className="cap-label">Committed / actual</div><div className="kpi-cap" style={{ fontSize: 20 }}>{m(p.committed)} <span className="cap-unit">/ {m(p.ac)}</span></div></div>
        <div className="card"><div className="cap-label">Forecast (EAC)</div><div className="kpi-cap" style={{ color: variance >= 0 ? "#5a8a1f" : "#A32D2D" }}>{m(p.eac)}</div><div style={{ fontSize: 13, color: variance >= 0 ? "#5a8a1f" : "#A32D2D" }}>{variance >= 0 ? "Under" : "Over"} by {m(Math.abs(variance))}</div></div>
        <div className="card"><div className="cap-label">Program CPI</div><div className="kpi-cap" style={{ color: FILL[cpiStatus(p.cpi)] }}>{p.cpi.toFixed(2)}</div></div>
      </div>

      <h2 className="sec">By building <span className="hint">— click to see cost by scope</span></h2>
      <div className="card">
        <div className="vhead"><span style={{ flex: 2 }}>Building</span><span className="vcol">Budget</span><span className="vcol">Committed</span><span className="vcol">Actual</span><span className="vcol">EAC</span><span className="vcol">CPI</span><span className="vcol">$/MW</span><span style={{ width: 24 }} /></div>
        {p.buildings.map((b) => {
          const st = cpiStatus(b.cpi);
          return (
            <Link key={b.id} href={`/cost/${b.id}`} className="vrow" style={{ color: "inherit" }}>
              <span style={{ flex: 2, fontWeight: 600 }}>{b.name}</span>
              <span className="vcol mono">{m(b.bac)}</span>
              <span className="vcol mono">{m(b.committed)}</span>
              <span className="vcol mono">{m(b.ac)}</span>
              <span className="vcol mono" style={{ color: b.eac <= b.bac ? "#5a8a1f" : "#A32D2D" }}>{m(b.eac)}</span>
              <span className="vcol mono" style={{ color: FILL[st], fontWeight: 700 }}>{b.cpi.toFixed(2)}</span>
              <span className="vcol mono">${(b.eac / b.mw).toFixed(1)}M</span>
              <span style={{ width: 24, textAlign: "right", color: "var(--accent)", fontWeight: 600 }}>→</span>
            </Link>
          );
        })}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        CPI below 1.00 flags cost underperformance; EAC forecasts cost at completion (BAC ÷ CPI). Every figure rolls up from scope-level earned value, which in turn comes from the daily entries — so you can drill from program to building to scope to the day.
      </div>
      <div className="relnav">
        <span>Related:</span>
        <Link href="/capacity">Capacity</Link>
        <Link href="/commissioning">Commissioning</Link>
        <Link href="/schedule">Schedule</Link>
      </div>
    </div>
  );
}
