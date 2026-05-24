import Link from "next/link";
import { getWeatherImpact, getManpowerProgram, getProcurement, getPunchlist, getLookahead, getReportQuality } from "../../lib/features";

export default function Ops() {
  const wx = getWeatherImpact();
  const wxSlip = Math.max(...wx.map((w) => w.slip));
  const mp = getManpowerProgram();
  const gap = mp.reduce((a, b) => a + b.gap, 0);
  const proc = getProcurement();
  const atRisk = proc.filter((p) => p.risk === "r").length;
  const punch = getPunchlist("16");
  const la = getLookahead("17");
  const laCount = la.weeks.reduce((a, w) => a + w.items.length, 0);
  const q = getReportQuality();

  const tiles = [
    { href: "/lookahead", agent: "MARSHAL", title: "3-week look-ahead", stat: `${laCount} activities`, desc: "The next three weeks from the live schedule, with constraints, built to read in the field." },
    { href: "/manpower", agent: "MUSTER", title: "Manpower forecast", stat: gap > 0 ? `+${gap} crew needed` : "Crew on plan", desc: "Crew required per scope to hold the planned finish, with shortfalls flagged.", risk: gap > 0 ? "a" : "g" },
    { href: "/procurement", agent: "QUARTERMASTER", title: "Procurement & long-lead", stat: `${atRisk} gating risk${atRisk === 1 ? "" : "s"}`, desc: "Material readiness tied to the activity that needs it; late delivery becomes a schedule risk.", risk: atRisk ? "r" : "g" },
    { href: "/weather", agent: "SENTINEL + PATHFINDER", title: "Weather & delay", stat: `${wxSlip}d predicted slip`, desc: "A 10-day forecast turned into predicted slip on the weather-exposed scopes.", risk: wxSlip >= 2 ? "r" : wxSlip > 0 ? "a" : "g" },
    { href: "/punchlist", agent: "KEYSTONE", title: "Punchlist & closeout", stat: `${punch.open} open · ${punch.closeoutPct}% closed`, desc: "The commissioning tail by system, so closeout does not surprise go-live.", risk: punch.closeoutPct < 70 ? "a" : "g" },
    { href: "/quality", agent: "WARDEN", title: "Report quality", stat: `${q.avg}/100 avg`, desc: "Every daily report scored for completeness, with nudges to the crew.", risk: q.avg < 80 ? "a" : "g" },
  ];
  const dot = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

  return (
    <div>
      <div className="eyebrow">Operations</div>
      <h1 className="title">Field operations</h1>
      <p className="sub">The day-to-day tools that turn the data core into action: look-ahead planning, crew loading, procurement, weather, closeout, and report quality. Each is computed from the same atomic store and schedule engine.</p>
      <div className="grid g3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700 }}>{t.title}</span>
              {t.risk && <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot[t.risk], display: "inline-block" }} />}
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 2px", color: "#1b1c18" }}>{t.stat}</div>
            <div style={{ fontSize: 11, letterSpacing: ".05em", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase" }}>{t.agent}</div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{t.desc}</p>
            <div style={{ marginTop: 8, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Open →</div>
          </Link>
        ))}
      </div>
      <div className="notice" style={{ marginTop: 16 }}>
        These tools share the platform&apos;s core rule: numbers are computed from the atomic store and the CPM engine, and the agents (MARSHAL, MUSTER, QUARTERMASTER, SENTINEL, KEYSTONE, WARDEN) narrate and forecast — they never invent a figure.
      </div>
    </div>
  );
}
