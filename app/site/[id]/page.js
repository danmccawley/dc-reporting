import Link from "next/link";
import { notFound } from "next/navigation";
import KpiTile from "../../components/KpiTile";
import {
  buildings, scopes, scopeMatrix, kpis, getBuilding,
} from "../../../lib/mock/data";
import { ragFill } from "../../../lib/rag";

export function generateStaticParams() {
  return buildings.map((b) => ({ id: b.id }));
}

export default function SitePage({ params }) {
  const b = getBuilding(params.id);
  if (!b) return notFound();

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/">Executive</Link> / {b.name}
      </div>
      <div className="eyebrow">Site dashboard</div>
      <h1 className="title">{b.name}</h1>
      <p className="sub">{b.phase}</p>

      <h2 className="sec">Scope progress</h2>
      <div className="card">
        {scopes.map((s) => {
          const [pct, st] = scopeMatrix[s.slug][b.id];
          return (
            <Link key={s.slug} href={`/scope/${s.slug}`} className="prow" style={{ display: "flex" }}>
              <span className="pn">{s.name}</span>
              <span className="track">
                <span className="fill" style={{ width: `${pct}%`, background: ragFill[st] }} />
              </span>
              <span className="pv mono">{st === "n" ? "—" : `${pct}%`}</span>
            </Link>
          );
        })}
      </div>

      <h2 className="sec">Key performance indicators</h2>
      <div className="grid g3">
        {kpis.map((k) => (
          <KpiTile key={k.id} kpi={k} buildingId={b.id} />
        ))}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Each tile shows the current week, the trailing 4-week rolling average, and the trend wash.
        Trend stays neutral until a site has four full weeks of data (see Building 18).
      </div>
    </div>
  );
}
