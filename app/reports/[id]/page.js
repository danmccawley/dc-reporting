import Link from "next/link";
import { notFound } from "next/navigation";
import KpiTile from "../../components/KpiTile";
import PrintButton from "../../components/PrintButton";
import Photos from "../../components/Photos";
import {
  reports, scopes, scopeMatrix, kpis, buildings, getReport, getBuilding, getReportPhotosByDay,
} from "../../../lib/mock/data";
import { ragFill, ragLabel } from "../../../lib/rag";

export function generateStaticParams() {
  return reports.map((r) => ({ id: r.id }));
}

export default function ReportPresentation({ params }) {
  const r = getReport(params.id);
  if (!r) return notFound();
  const isProgram = r.building === "program";
  const b = isProgram ? null : getBuilding(r.building);
  const st = r.status === "approved" ? "g" : "a";
  const cols = isProgram ? buildings : [b];
  const photoDays = getReportPhotosByDay(r.building);

  return (
    <div className="report">
      <div className="breadcrumb"><Link href="/reports">Reports</Link> / {r.cadence} · {isProgram ? "Program" : b.name}</div>

      <div className="report-head">
        <div>
          <div className="eyebrow">{r.cadence} report</div>
          <h1 className="title" style={{ marginBottom: 2 }}>{isProgram ? "Program-wide" : b.name}</h1>
          <p className="sub" style={{ marginBottom: 0 }}>{r.period}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{r.status === "approved" ? "Approved & locked" : "Draft"}</span>
          <PrintButton />
        </div>
      </div>

      <h2 className="sec">Executive summary</h2>
      <div className="card"><p style={{ margin: 0 }}>{r.summary}</p>
        <div className="notice" style={{ marginTop: 12 }}>Narrative by CHRONICLER from approved entries. Metrics below are computed deterministically. Click any line to drill in.</div>
      </div>

      {!isProgram && (
        <>
          <h2 className="sec">Headline KPIs <span className="hint">— tiles drill to the site dashboard</span></h2>
          <div className="grid g3">
            {kpis.map((k) => (
              <Link key={k.id} href={`/site/${b.id}`} style={{ display: "block" }}>
                <KpiTile kpi={k} buildingId={b.id} />
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="sec">Scope summary <span className="hint">— click a scope to jump to its deep dive</span></h2>
      <div className="card">
        <table className="rtable">
          <thead>
            <tr><th>Scope</th>{cols.map((c) => <th key={c.id}>{isProgram ? c.name.replace("Building ", "B") : "% complete"}</th>)}</tr>
          </thead>
          <tbody>
            {scopes.map((s) => (
              <tr key={s.slug}>
                <td><a href={`#s-${s.slug}`} className="scopelink">{s.name}</a></td>
                {cols.map((c) => {
                  const [pct, cst] = scopeMatrix[s.slug][c.id];
                  return <td key={c.id} className="mono"><span className="cellpill" style={{ background: ragFill[cst] }}>{cst === "n" ? "—" : `${pct}%`}</span></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="sec">Site photos by day <span className="hint">— captured in the field, grouped by date taken</span></h2>
      <div className="card">
        {photoDays.map((pd) => (
          <div key={pd.date} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{pd.date}</div>
            <Photos photos={pd.photos} compact />
          </div>
        ))}
      </div>

      <h2 className="sec">Deep dives</h2>
      {scopes.map((s) => (
        <div key={s.slug} id={`s-${s.slug}`} className="card deepdive">
          <div className="dd-head">
            <span style={{ fontWeight: 700 }}>{s.name}</span>
            <span style={{ color: "var(--faint)", fontSize: 12 }}>{s.group}</span>
          </div>
          <div className="grid g3" style={{ marginTop: 8 }}>
            {cols.map((c) => {
              const [pct, cst] = scopeMatrix[s.slug][c.id];
              return (
                <div key={c.id} className="ddcell">
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{isProgram ? c.name : "Status"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{cst === "n" ? "—" : `${pct}%`}</span>
                    <span className={`pill s-${cst}`}><span className={`dot d-${cst}`} />{ragLabel[cst]}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}>
            <Link href={isProgram ? `/scope/${s.slug}` : `/scope/${s.slug}/${b.id}`} className="scopelink">View summary &amp; individual daily reports →</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
