import Link from "next/link";
import { reports, getBuilding } from "../../lib/mock/data";

export default function ReportsIndex() {
  return (
    <div>
      <div className="eyebrow">Reports</div>
      <h1 className="title">Generated reports</h1>
      <p className="sub">CANVAS assembles each report from approved entries. Open one to launch the presentation — summary first, drill into deep dives and daily entries on demand.</p>

      <div className="card">
        {reports.map((r) => {
          const b = r.building === "program" ? null : getBuilding(r.building);
          const st = r.status === "approved" ? "g" : "a";
          return (
            <Link key={r.id} href={`/reports/${r.id}`} className="linkrow" style={{ display: "flex", alignItems: "center" }}>
              <span>
                <span style={{ fontWeight: 600 }}>{r.cadence} · {b ? b.name : "Program-wide"}</span>
                <span style={{ display: "block", color: "var(--muted)", fontSize: 13 }}>{r.period}</span>
              </span>
              <span style={{ flex: 1 }} />
              <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{r.status === "approved" ? "Approved" : "Draft"}</span>
              <span style={{ marginLeft: 14, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Launch →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
