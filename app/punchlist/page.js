import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getPunchlist } from "../../lib/features";

const SC = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

export default function Punchlist() {
  const all = buildings.map((b) => getPunchlist(b.id));
  const active = all.filter((p) => p.active);

  return (
    <div>
      <div className="eyebrow">KEYSTONE · punchlist &amp; closeout</div>
      <h1 className="title">Punchlist &amp; closeout</h1>
      <p className="sub">The commissioning tail, by system. KEYSTONE tracks open versus closed punch items so the closeout work that decides go-live is visible early, not discovered at the end. A building only has a punchlist once commissioning has begun.</p>

      {active.length === 0 && <div className="card"><div className="notice">No building has entered commissioning closeout yet.</div></div>}

      {active.map((p) => (
        <div key={p.id} style={{ marginTop: 18 }}>
          <h2 className="sec" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{buildings.find((b) => b.id === p.id).name}</span>
            <span className="mono" style={{ fontSize: 14, color: p.closeoutPct >= 70 ? "#5a8a1f" : "#b98900" }}>{p.closeoutPct}% closed · {p.open} open</span>
          </h2>
          <div className="grid g3" style={{ marginBottom: 8 }}>
            <div className="card"><div className="kpi-cap">{p.open}</div><div className="cap-label">Open items</div></div>
            <div className="card"><div className="kpi-cap">{p.closed}</div><div className="cap-label">Closed items</div></div>
            <div className="card"><div className="kpi-cap" style={{ color: p.closeoutPct >= 70 ? "#5a8a1f" : "#b98900" }}>{p.closeoutPct}%</div><div className="cap-label">Closeout complete</div></div>
          </div>
          <div className="card">
            {p.systems.map((s) => (
              <div key={s.system} className="caprow" style={{ alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: SC[s.sev], display: "inline-block" }} />{s.system}
                </span>
                <span style={{ flex: 1, margin: "0 14px" }}><span className="track"><span className="fill" style={{ width: `${s.pct}%`, background: SC[s.sev] }} /></span></span>
                <span className="mono" style={{ minWidth: 110, textAlign: "right" }}>{s.open} open / {s.closed} closed</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="relnav"><span>Related:</span><Link href="/commissioning">Commissioning</Link><Link href="/capacity">Capacity</Link><Link href="/site/16">Building 16</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Building 16 is the only building in the closeout tail. Controls / BMS is the densest open list and is the practical gate on L4 functional testing; KEYSTONE flags it for an early closeout push so it does not surface as a go-live surprise.
      </div>
    </div>
  );
}
