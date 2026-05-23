import Link from "next/link";
import { notFound } from "next/navigation";
import { scopes, scopeMatrix, buildings, getScope } from "../../../lib/mock/data";
import { ragFill, ragInk, ragLabel } from "../../../lib/rag";

export function generateStaticParams() {
  return scopes.map((s) => ({ id: s.slug }));
}

export default function ScopePage({ params }) {
  const s = getScope(params.id);
  if (!s) return notFound();
  const row = scopeMatrix[s.slug];

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/">Executive</Link> / Scope / {s.name}
      </div>
      <div className="eyebrow">{s.group} scope</div>
      <h1 className="title">{s.name}</h1>
      <p className="sub">Roll-up across all buildings. Pick a building to see its summary and individual daily reports.</p>

      <h2 className="sec">Status by building <span className="hint">— click a building to drill in</span></h2>
      <div className="grid g3">
        {buildings.map((b) => {
          const [pct, st] = row[b.id];
          return (
            <Link key={b.id} href={`/scope/${s.slug}/${b.id}`} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{b.name}</span>
                <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{ragLabel[st]}</span>
              </div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 4px", color: ragInk[st] }}>
                {st === "n" ? "—" : `${pct}%`}
              </div>
              <div className="track"><span className="fill" style={{ width: `${pct}%`, background: ragFill[st] }} /></div>
              <div style={{ marginTop: 10, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>View daily reports →</div>
            </Link>
          );
        })}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Each building rolls up from its own daily reports. This page is the cross-building view; drill into a building for the scope summary and the individual daily reports underneath it.
      </div>
    </div>
  );
}
