import Link from "next/link";
import { notFound } from "next/navigation";
import DailyList from "../../../components/DailyList";
import {
  scopes, buildings, scopeMatrix, getScope, getBuilding, getDailyEntries, getScopeCost,
} from "../../../../lib/mock/data";
import { ragFill, ragInk, ragLabel } from "../../../../lib/rag";
import { fmtDate } from "../../../../lib/plan";

export function generateStaticParams() {
  const out = [];
  scopes.forEach((s) => buildings.forEach((b) => out.push({ id: s.slug, building: b.id })));
  return out;
}

export default function ScopeBuildingPage({ params, searchParams }) {
  const s = getScope(params.id);
  const b = getBuilding(params.building);
  if (!s || !b) return notFound();
  const [pct, st] = scopeMatrix[s.slug][b.id];
  const entries = getDailyEntries(s.slug, b.id);
  const cost = getScopeCost(s.slug, b.id);
  const m = (x) => `$${x.toFixed(1)}M`;
  const fromD = searchParams?.from != null ? Number(searchParams.from) : null;
  const toD = searchParams?.to != null ? Number(searchParams.to) : null;
  const windowLabel = fromD != null && toD != null ? (fromD === toD ? fmtDate(fromD) : `${fmtDate(fromD)} – ${fmtDate(toD)}`) : null;

  const summary =
    st === "n"
      ? `${s.name} has not started at ${b.name}. It is sequenced after the scopes currently in progress.`
      : `${s.name} at ${b.name} is ${pct}% complete and currently ${ragLabel[st].toLowerCase()}. The summary below is rolled up from the ${entries.length} most recent daily reports; expand any one to read the individual report.`;

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/">Executive</Link> / <Link href={`/site/${b.id}`}>{b.name}</Link> / {s.name}
      </div>
      <div className="eyebrow">{s.group} scope · {b.name}</div>
      <h1 className="title">{s.name}</h1>
      <p className="sub">Scope summary for this building. Drill into the individual daily reports below.</p>
      {windowLabel && <div className="notice" style={{ marginBottom: 14 }}>Opened from the build plan for the selected window: <strong>{windowLabel}</strong>. The daily reports for {s.name} at {b.name} are below.</div>}

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>Status</span>
            <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{ragLabel[st]}</span>
          </div>
          <div className="mono" style={{ fontSize: 34, fontWeight: 700, margin: "8px 0 6px", color: ragInk[st] }}>
            {st === "n" ? "—" : `${pct}%`}
          </div>
          <div className="track"><span className="fill" style={{ width: `${pct}%`, background: ragFill[st] }} /></div>
        </div>
        <div className="card">
          <span style={{ fontWeight: 700 }}>Summary</span>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>{summary}</p>
          <div className="notice" style={{ marginTop: 10 }}>Synthesized by CHRONICLER from the daily reports. Metrics are computed deterministically.</div>
        </div>
      </div>

      <h2 className="sec">Cost (earned value)</h2>
      <div className="card">
        <div className="grid g4">
          <div><div className="cap-label">Budget</div><div className="kpi-cap" style={{ fontSize: 22 }}>{m(cost.bac)}</div></div>
          <div><div className="cap-label">Earned / actual</div><div className="kpi-cap" style={{ fontSize: 22 }}>{m(cost.ev)} <span className="cap-unit">/ {m(cost.ac)}</span></div></div>
          <div><div className="cap-label">Forecast (EAC)</div><div className="kpi-cap" style={{ fontSize: 22, color: cost.eac <= cost.bac ? "#5a8a1f" : "#A32D2D" }}>{m(cost.eac)}</div></div>
          <div><div className="cap-label">CPI</div><div className="kpi-cap" style={{ fontSize: 22, color: cost.cpi >= 1 ? "#5a8a1f" : cost.cpi >= 0.95 ? "#b98900" : "#A32D2D" }}>{st === "n" ? "—" : cost.cpi.toFixed(2)}</div></div>
        </div>
        <div className="notice" style={{ marginTop: 12 }}>Earned value is budget × percent complete. Actual is built from the daily labor and installed-quantity entries below. <Link href={`/cost/${b.id}`} className="scopelink">All scopes at {b.name} →</Link></div>
      </div>

      <h2 className="sec">Individual daily reports <span className="hint">— click one to read it</span></h2>
      <div className="card">
        <DailyList entries={entries} />
      </div>

      <h2 className="sec">Related</h2>
      <div className="card">
        <Link href={`/scope/${s.slug}`} className="linkrow" style={{ display: "flex" }}>
          <span>This scope across all buildings</span><span style={{ flex: 1 }} /><span style={{ color: "var(--accent)", fontWeight: 600 }}>→</span>
        </Link>
        <Link href={`/site/${b.id}`} className="linkrow" style={{ display: "flex" }}>
          <span>All scopes at {b.name}</span><span style={{ flex: 1 }} /><span style={{ color: "var(--accent)", fontWeight: 600 }}>→</span>
        </Link>
      </div>
    </div>
  );
}
