import HeatMap from "../components/HeatMap";
import { buildings, scopes, scopeMatrix, kpis } from "../../lib/mock/data";
import { current } from "../../lib/rag";

function programPct() {
  let sum = 0, n = 0;
  scopes.forEach((s) => buildings.forEach((b) => { sum += scopeMatrix[s.slug][b.id][0]; n += 1; }));
  return Math.round(sum / n);
}

const manpower = [
  { trade: "Electrical", n: 142 },
  { trade: "Mechanical / cooling", n: 98 },
  { trade: "Structural / steel", n: 64 },
  { trade: "LV / cabling", n: 51 },
  { trade: "Concrete", n: 47 },
  { trade: "Fire / life safety", n: 23 },
];

const causes = ["RFI / design", "Material delivery", "Weather", "Access / sequencing", "Inspection hold"];
const delayCounts = {
  "16": [2, 1, 0, 1, 1],
  "17": [6, 4, 1, 2, 1],
  "18": [1, 0, 3, 1, 0],
};

function Spark({ series }) {
  if (!series || series.length < 2) return <div style={{ fontSize: 12, color: "var(--faint)" }}>baseline forming</div>;
  const min = Math.min(...series), max = Math.max(...series);
  const span = max - min || 1;
  const w = 220, h = 48;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / span) * (h - 8) - 4}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke="#2f4858" strokeWidth="2" />
    </svg>
  );
}

export default function Insights() {
  const prog = programPct();
  const circ = 2 * Math.PI * 52;
  const prod = kpis.find((k) => k.id === "cabling-productivity");
  const maxMan = Math.max(...manpower.map((m) => m.n));
  const maxDelay = Math.max(...buildings.flatMap((b) => delayCounts[b.id]));

  return (
    <div>
      <div className="eyebrow">Insights</div>
      <h1 className="title">Program infographics</h1>
      <p className="sub">CANVAS turns the dimensional daily data into visuals. Every chart here is computed from the same records that drive the dashboards.</p>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Program completion</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="124" height="124" viewBox="0 0 124 124">
              <circle cx="62" cy="62" r="52" fill="none" stroke="#ECEAE2" strokeWidth="14" />
              <circle cx="62" cy="62" r="52" fill="none" stroke="#5a8a1f" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(circ * prog) / 100} ${circ}`} transform="rotate(-90 62 62)" />
              <text x="62" y="68" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1b1c18" className="mono">{prog}%</text>
            </svg>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              Weighted across all scopes and buildings. Building 16 leads (fit-out and commissioning); Building 18 is in the ground.
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Manpower by trade (this week)</div>
          <div className="bars">
            {manpower.map((m) => (
              <div className="barrow" key={m.trade}>
                <span className="barlabel">{m.trade}</span>
                <span className="bartrack"><span className="barfill" style={{ width: `${(m.n / maxMan) * 100}%` }} /></span>
                <span className="barval mono">{m.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="sec">Progress heat map — scope × building</h2>
      <HeatMap />

      <h2 className="sec">Delay cause-codes — cause × building</h2>
      <div className="card">
        <div className="heat" style={{ gridTemplateColumns: "1.6fr repeat(3, 1fr)" }}>
          <div className="hh" />
          {buildings.map((b) => <div key={b.id} className="hh">{b.name}</div>)}
          {causes.map((c, ci) => (
            <Cause key={c} c={c} ci={ci} maxDelay={maxDelay} />
          ))}
        </div>
        <div className="legend"><span style={{ color: "var(--faint)" }}>Darker = more logged delays. Building 17 RFI / design is the hot spot.</span></div>
      </div>

      <h2 className="sec">Cabling productivity — 8-week trend by building</h2>
      <div className="grid g3">
        {buildings.map((b) => {
          const series = prod.series[b.id] || [];
          const cur = current(series);
          return (
            <div className="card" key={b.id}>
              <div style={{ fontWeight: 700 }}>{b.name}</div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, margin: "2px 0 8px" }}>
                {cur == null ? "—" : cur}<span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400 }}> m/shift</span>
              </div>
              <Spark series={series} />
            </div>
          );
        })}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        These are a sample of the CANVAS infographic suite. The full build adds floor-plan heat maps by zone and a scope-by-week velocity map from the same data.
      </div>
    </div>
  );
}

function Cause({ c, ci, maxDelay }) {
  return (
    <>
      <div className="rl" style={{ fontSize: 13 }}>{c}</div>
      {buildings.map((b) => {
        const v = delayCounts[b.id][ci];
        const alpha = 0.1 + 0.7 * (v / maxDelay);
        return (
          <div key={b.id} className="cell" style={{ background: `rgba(186,117,23,${v === 0 ? 0.06 : alpha})`, color: "#412402" }}>
            {v}
          </div>
        );
      })}
    </>
  );
}
