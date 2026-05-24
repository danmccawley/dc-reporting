import Link from "next/link";
import HeatMap from "./components/HeatMap";
import { scopes, scopeMatrix, buildings, alerts } from "../lib/mock/data";

function rollup() {
  let sum = 0, n = 0, reds = 0, ambers = 0;
  const onTrack = {};
  buildings.forEach((b) => (onTrack[b.id] = true));
  scopes.forEach((s) => {
    buildings.forEach((b) => {
      const [pct, st] = scopeMatrix[s.slug][b.id];
      sum += pct; n += 1;
      if (st === "r") { reds += 1; onTrack[b.id] = false; }
      if (st === "a") ambers += 1;
    });
  });
  const tracked = buildings.filter((b) => onTrack[b.id]).length;
  return { pct: Math.round(sum / n), reds, ambers, tracked };
}

export default function Home() {
  const r = rollup();
  return (
    <div>
      <div className="banner">
        This is a prototype on sample data for stakeholder review. Numbers are illustrative.
      </div>
      <Link href="/field" className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: "var(--accent)", marginBottom: 18 }}>
        <span>
          <span style={{ fontWeight: 700 }}>New: mobile-first field daily report</span>
          <span style={{ display: "block", color: "var(--muted)", fontSize: 14 }}>
            See the jobsite experience — camera capture and offline draft + sync.
          </span>
        </span>
        <span className="cta" style={{ background: "var(--bar)", color: "var(--bar-ink)" }}>Open field demo</span>
      </Link>
      <div className="eyebrow">Executive overview</div>
      <h1 className="title">Generic data center program</h1>
      <p className="sub">Three buildings · live roll-up from approved site reports</p>

      <div className="grid g4">
        <Link href="/insights" className="stat" style={{ display: "block" }}><div className="k">Program complete</div><div className="v mono">{r.pct}<small>%</small></div></Link>
        <Link href="/capacity" className="stat" style={{ display: "block" }}><div className="k">Buildings on track</div><div className="v mono">{r.tracked}<small> / {buildings.length}</small></div></Link>
        <Link href="/verify" className="stat" style={{ display: "block" }}><div className="k">Scopes behind (red)</div><div className="v mono">{r.reds}</div></Link>
        <a href="#alerts" className="stat" style={{ display: "block" }}><div className="k">Active agent alerts</div><div className="v mono">{alerts.length}</div></a>
      </div>

      <h2 className="sec">Progress by scope and building</h2>
      <HeatMap />

      <h2 className="sec" id="alerts">Agent alerts &amp; early warnings</h2>
      <div className="card">
        {alerts.map((a, i) => (
          <Link className="alert alertlink" key={i} href={a.href || "/"}>
            <span className={`ag s-${a.severity}`}>{a.agent}</span>
            <span className="at">{a.text}</span>
            <span className="alert-arrow">→</span>
          </Link>
        ))}
        <div className="notice" style={{ marginTop: 14 }}>
          AUGUR and SENTINEL surface ranked hypotheses with confidence and lag for a human to confirm.
          The underlying metrics are computed deterministically; agents narrate, they do not invent numbers.
        </div>
      </div>

      <h2 className="sec">Jump to a site</h2>
      <div className="grid g3">
        {buildings.map((b) => (
          <Link key={b.id} href={`/site/${b.id}`} className="card" style={{ display: "block" }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{b.name}</div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>{b.phase}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
