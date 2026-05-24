import { capacity } from "../../lib/mock/data";

function conf(c) { return c >= 80 ? "g" : c >= 55 ? "a" : "r"; }
const FILL = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

function Gauge({ pct }) {
  const circ = 2 * Math.PI * 30;
  const st = conf(pct);
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="30" fill="none" stroke="#ECEAE2" strokeWidth="9" />
      <circle cx="40" cy="40" r="30" fill="none" stroke={FILL[st]} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${(circ * pct) / 100} ${circ}`} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" fontSize="17" fontWeight="700" fill="#1b1c18" fontFamily="monospace">{pct}%</text>
    </svg>
  );
}

function Bar({ value, total, color }) {
  return <div className="track"><span className="fill" style={{ width: `${total ? (value / total) * 100 : 0}%`, background: color }} /></div>;
}

export default function Capacity() {
  const totalMW = capacity.reduce((a, c) => a + c.mwPlanned, 0);
  const liveMW = capacity.reduce((a, c) => a + c.mwCommissioned, 0);
  const halls = capacity.reduce((a, c) => a + c.hallsTotal, 0);
  const energized = capacity.reduce((a, c) => a + c.hallsEnergized, 0);

  return (
    <div>
      <div className="eyebrow">Capacity & readiness</div>
      <h1 className="title">Capacity delivery</h1>
      <p className="sub">The owner&apos;s view: megawatts commissioned, halls energized, and go-live confidence — not just construction percent.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap">{liveMW}<span className="cap-unit"> / {totalMW} MW</span></div><div className="cap-label">Commissioned capacity</div><Bar value={liveMW} total={totalMW} color="#5a8a1f" /></div>
        <div className="card"><div className="kpi-cap">{energized}<span className="cap-unit"> / {halls} halls</span></div><div className="cap-label">Data halls energized</div><Bar value={energized} total={halls} color="#2f4858" /></div>
        <div className="card"><div className="kpi-cap">{Math.round((liveMW / totalMW) * 100)}%</div><div className="cap-label">Program capacity delivered</div><Bar value={liveMW} total={totalMW} color="#5a8a1f" /></div>
      </div>

      <h2 className="sec">By building</h2>
      <div className="grid g3">
        {capacity.map((c) => (
          <div className="card" key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>{c.name}</span>
              <Gauge pct={c.confidence} />
            </div>
            <div className="cap-label" style={{ marginTop: -6 }}>Go-live confidence</div>
            <div className="caprow"><span>Commissioned</span><span className="mono">{c.mwCommissioned} / {c.mwPlanned} MW</span></div>
            <Bar value={c.mwCommissioned} total={c.mwPlanned} color="#5a8a1f" />
            <div className="caprow"><span>Halls energized</span><span className="mono">{c.hallsEnergized} / {c.hallsTotal}</span></div>
            <Bar value={c.hallsEnergized} total={c.hallsTotal} color="#2f4858" />
            <div className="caprow"><span>Racks ready</span><span className="mono">{c.racksReady} / {c.racksTotal}</span></div>
            <Bar value={c.racksReady} total={c.racksTotal} color="#2f4858" />
            <div className="caprow" style={{ marginTop: 8 }}><span>First power</span><span className="mono">{c.firstPower}</span></div>
            <div className="caprow"><span>Target go-live</span><span className="mono">{c.goLive}</span></div>
          </div>
        ))}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Capacity is the language owners and the compute-infrastructure team plan in. KEYSTONE feeds commissioning status; AUGUR and PATHFINDER feed go-live confidence from schedule and long-lead risk.
      </div>
    </div>
  );
}
