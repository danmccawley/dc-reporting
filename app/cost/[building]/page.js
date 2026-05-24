import Link from "next/link";
import { notFound } from "next/navigation";
import { buildings, getBuilding, getBuildingCost } from "../../../lib/mock/data";

const FILL = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };
function cpiStatus(cpi) { return cpi >= 1 ? "g" : cpi >= 0.95 ? "a" : "r"; }
const m = (x) => `$${x.toFixed(1)}M`;

export function generateStaticParams() {
  return buildings.map((b) => ({ building: b.id }));
}

export default function BuildingCost({ params }) {
  const b = getBuilding(params.building);
  if (!b) return notFound();
  const c = getBuildingCost(params.building);
  const variance = c.bac - c.eac;

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/cost">Cost</Link> / {b.name}
      </div>
      <div className="eyebrow">COMPTROLLER · cost · {b.name}</div>
      <h1 className="title">{b.name} — cost by scope</h1>
      <p className="sub">Earned-value cost for each scope at this building. Click a scope to see its daily labor spend.</p>

      <div className="grid g4">
        <div className="card"><div className="cap-label">Budget (BAC)</div><div className="kpi-cap">{m(c.bac)}</div></div>
        <div className="card"><div className="cap-label">Actual to date</div><div className="kpi-cap">{m(c.ac)}</div></div>
        <div className="card"><div className="cap-label">Forecast (EAC)</div><div className="kpi-cap" style={{ color: variance >= 0 ? "#5a8a1f" : "#A32D2D" }}>{m(c.eac)}</div></div>
        <div className="card"><div className="cap-label">CPI</div><div className="kpi-cap" style={{ color: FILL[cpiStatus(c.cpi)] }}>{c.cpi.toFixed(2)}</div></div>
      </div>

      <h2 className="sec">By scope <span className="hint">— click for daily spend</span></h2>
      <div className="card">
        <div className="vhead"><span style={{ flex: 2 }}>Scope</span><span className="vcol">Budget</span><span className="vcol">Earned</span><span className="vcol">Actual</span><span className="vcol">EAC</span><span className="vcol">CPI</span><span style={{ width: 24 }} /></div>
        {c.rows.map((r) => {
          const st = r.pct > 0 ? cpiStatus(r.cpi) : "n";
          return (
            <Link key={r.slug} href={`/scope/${r.slug}/${b.id}`} className="vrow" style={{ color: "inherit" }}>
              <span style={{ flex: 2, fontWeight: 600 }}>{r.name}<span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{r.pct}%</span></span>
              <span className="vcol mono">{m(r.bac)}</span>
              <span className="vcol mono">{m(r.ev)}</span>
              <span className="vcol mono">{m(r.ac)}</span>
              <span className="vcol mono" style={{ color: r.eac <= r.bac ? "#5a8a1f" : "#A32D2D" }}>{m(r.eac)}</span>
              <span className="vcol mono" style={{ color: r.pct > 0 ? FILL[st] : "var(--faint)", fontWeight: 700 }}>{r.pct > 0 ? r.cpi.toFixed(2) : "—"}</span>
              <span style={{ width: 24, textAlign: "right", color: "var(--accent)", fontWeight: 600 }}>→</span>
            </Link>
          );
        })}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>Earned value is budget × percent complete; actual comes from the daily labor and installed-quantity entries. CPI = earned ÷ actual.</div>
    </div>
  );
}
