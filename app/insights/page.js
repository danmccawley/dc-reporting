"use client";
import { useState } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { metricCards, generateFindings } from "../../lib/analytics";
import { usePrefs, BI_FRAMING } from "../components/Preferences";

function Spark({ data, good }) {
  const s = data.filter((x) => typeof x === "number");
  if (s.length < 2) return <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>warming up</span>;
  const min = Math.min(...s), max = Math.max(...s), w = 90, h = 26;
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={good ? "#5a8a1f" : "#b98900"} strokeWidth="2" /></svg>;
}

const TYPE_LABEL = { trend: "Trend", anomaly: "Anomaly", correlation: "Correlation", lagged: "Lagged correlation", rootcause: "Root cause" };
const TYPE_C = { trend: "#2f6d7d", anomaly: "#A32D2D", correlation: "#7a3b8a", lagged: "#7a3b8a", rootcause: "#b98900" };

export default function Insights() {
  const { prefs } = usePrefs();
  const [b, setB] = useState("17");
  const [framing, setFraming] = useState(prefs.biFraming || "signals");
  const cards = metricCards(b);
  const findings = generateFindings(b);
  const bn = (buildings.find((x) => x.id === b) || {}).name;

  const showSignal = framing === "signals" || framing === "both";
  const showConfident = framing === "confident" || framing === "both";

  return (
    <div>
      <div className="eyebrow">CANVAS + AUGUR · business intelligence</div>
      <h1 className="title">Business intelligence</h1>
      <p className="sub">Trends, trailing averages, period deltas, volatility, anomalies, correlations, lagged correlations, and root-cause hypotheses — all computed from the atomic weekly readings. Every finding drills to the data behind it. Findings are <strong>signals to investigate</strong> with evidence attached; correlation is a lead, not a proof. <Link href="/preferences" className="scopelink">Set your default framing</Link>.</p>

      <div className="mapctrls" style={{ justifyContent: "space-between" }}>
        <div className="ctrlgroup"><span className="ctrllabel">Building</span>
          {buildings.map((x) => <button key={x.id} className={`seg ${b === x.id ? "on" : ""}`} onClick={() => setB(x.id)}>{x.name}</button>)}
        </div>
        <div className="ctrlgroup"><span className="ctrllabel">Framing</span>
          {BI_FRAMING.map((o) => <button key={o.key} className={`seg ${framing === o.key ? "on" : ""}`} onClick={() => setFraming(o.key)}>{o.label.split(" ")[0]}</button>)}
        </div>
      </div>

      <h2 className="sec">Key metrics — {bn}</h2>
      <div className="grid g3">
        {cards.map((c) => (
          <div key={c.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
              <Spark data={c.series} good={c.good} />
            </div>
            {c.series.length >= 2 ? (
              <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--muted)" }}>
                <span className="mono" style={{ color: "var(--ink)", fontSize: 14 }}>{c.trend.last}{c.unit ? " " + c.unit : ""}</span>
                {" · "}trend <span style={{ color: c.good ? "#5a8a1f" : "#b98900", fontWeight: 600 }}>{c.trend.dir} {c.trend.pct >= 0 ? "+" : ""}{c.trend.pct.toFixed(0)}%</span>
                {" · "}4-wk avg {c.avg.toFixed(2)}{" · "}Δ {c.delta.pct >= 0 ? "+" : ""}{c.delta.pct.toFixed(0)}%
                {c.anomalyZ != null && <span style={{ color: "#A32D2D", fontWeight: 600 }}> · anomaly {c.anomalyZ.toFixed(1)}σ</span>}
                {c.target != null && <> · target {c.target}</>}
              </div>
            ) : <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--muted)" }}>Neutral until a 4-week baseline forms.</div>}
          </div>
        ))}
      </div>

      <h2 className="sec">Findings — {bn}</h2>
      {findings.length === 0 && <div className="card">No notable signals yet for {bn}. Trend indicators stay neutral until a four-week baseline forms.</div>}
      {findings.map((f) => (
        <div key={f.id} className="card" style={{ marginBottom: 10, borderLeft: `4px solid ${TYPE_C[f.type]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontWeight: 700 }}>{f.title}</span>
            <span className="mono" style={{ fontSize: 11, color: TYPE_C[f.type], fontWeight: 700, whiteSpace: "nowrap" }}>{TYPE_LABEL[f.type]}</span>
          </div>
          {showSignal && <div style={{ fontSize: 13.5, color: "#2b2f2e", marginTop: 6 }}><span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>SIGNAL </span>{f.signal}</div>}
          {showConfident && <div style={{ fontSize: 13.5, color: "#2b2f2e", marginTop: 6, background: "#f7f6f0", borderRadius: 8, padding: "8px 10px" }}><span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>CONFIDENT </span>{f.confident}</div>}
          <div style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
            {f.evidence.map((e, i) => <Link key={i} href={e.href} className="scopelink">{e.label} →</Link>)}
          </div>
        </div>
      ))}

      <div className="relnav"><span>Related:</span><Link href="/preferences">Preferences</Link><Link href="/coach">Coach</Link><Link href={`/site/${b}`}>{bn}</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        This is computed BI, not stored: trends, correlations, and lagged correlations come straight from the weekly atomic readings, and each finding links to the work behind it. Analytics raises these as hypotheses for human review — the platform never asserts a cause it cannot evidence.
      </div>
    </div>
  );
}
