import Link from "next/link";

export default function Start() {
  return (
    <div className="gate">
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div className="eyebrow" style={{ textAlign: "center" }}>Generic DC · reporting prototype</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", margin: "6px 0 4px" }}>How would you like to view the demo?</h1>
        <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 0 }}>Both run the same app on the same sample data.</p>
        <div className="grid g2" style={{ marginTop: 22 }}>
          <Link href="/" className="choose">
            <div className="choose-icon">🖥️</div>
            <div className="choose-title">Desktop / laptop</div>
            <div className="choose-sub">Full dashboards, heat maps, reports, and drill-downs at full width.</div>
          </Link>
          <Link href="/mobile" className="choose">
            <div className="choose-icon">📱</div>
            <div className="choose-title">Mobile</div>
            <div className="choose-sub">The field experience in a phone frame — daily report, camera, offline sync.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
