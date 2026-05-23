import Link from "next/link";
import { notFound } from "next/navigation";
import {
  scopes, scopeMatrix, buildings, dailyEntries, getScope,
} from "../../../lib/mock/data";
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
      <p className="sub">Roll-up across all sites. Drill into weekly, then daily.</p>

      <h2 className="sec">Status by building</h2>
      <div className="grid g3">
        {buildings.map((b) => {
          const [pct, st] = row[b.id];
          return (
            <Link key={b.id} href={`/site/${b.id}`} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{b.name}</span>
                <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{ragLabel[st]}</span>
              </div>
              <div className="mono" style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 4px", color: ragInk[st] }}>
                {st === "n" ? "—" : `${pct}%`}
              </div>
              <div className="track"><span className="fill" style={{ width: `${pct}%`, background: ragFill[st] }} /></div>
            </Link>
          );
        })}
      </div>

      <h2 className="sec">Weekly summary · Building 17 · Week 21</h2>
      <div className="card">
        <p style={{ margin: "0 0 6px" }}>
          {s.name} advanced in data hall 2B this week with backbone pulls resuming after RFI-driven downtime midweek.
          Productivity recovered toward target; two penetration-detail RFIs remain open and are the active constraint.
        </p>
        <div className="notice">Synthesized by CHRONICLER from the approved daily entries below.</div>
      </div>

      <h2 className="sec">Daily entries</h2>
      <div className="card">
        {dailyEntries.map((d, i) => (
          <div key={i} className="linkrow" style={{ display: "block", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>{d.date} · {d.zone}</span>
              <span className="mono" style={{ color: "var(--muted)", fontSize: 13 }}>
                {d.pct}% · {d.headcount} crew
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#33332e", marginTop: 3 }}>{d.note}</div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 3 }}>{d.author}</div>
          </div>
        ))}
        <div className="notice" style={{ marginTop: 6 }}>
          Daily → weekly → monthly roll up automatically. This page is the drill-down in reverse.
        </div>
      </div>
    </div>
  );
}
