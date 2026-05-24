import Link from "next/link";
import { getProcurement } from "../../lib/features";

const RC = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

export default function Procurement() {
  const rows = getProcurement();
  const gating = rows.filter((r) => r.gating);

  return (
    <div>
      <div className="eyebrow">QUARTERMASTER · procurement &amp; long-lead</div>
      <h1 className="title">Procurement &amp; long-lead</h1>
      <p className="sub">QUARTERMASTER ties material readiness to the activity that needs it. Required-on-site comes from the activity start in the schedule; when the ETA lands after that date the slack goes negative and the delivery becomes a gating schedule risk.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap">{rows.length}</div><div className="cap-label">Tracked packages</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: gating.length ? "#A32D2D" : "#5a8a1f" }}>{gating.length}</div><div className="cap-label">Gating a scheduled activity</div></div>
        <div className="card"><div className="kpi-cap">{rows.filter((r) => r.status === "Delivered").length}</div><div className="cap-label">Delivered to site</div></div>
      </div>

      <h2 className="sec">Packages</h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <Link key={i} href={`/scope/${r.scope}/${r.building}`} style={{ display: "block", textDecoration: "none", color: "inherit", padding: "14px 18px", borderTop: i ? "1px solid var(--line, #ececec)" : "none", background: r.gating ? "#fbe9e9" : "transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontWeight: 700 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: RC[r.risk], display: "inline-block", marginRight: 8 }} />{r.item}</span>
              <span className="mono" style={{ fontSize: 13, color: RC[r.risk], fontWeight: 700 }}>{r.status}</span>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
              <span>Building {r.building} · {r.scopeName}</span>
              <span>Lead {r.leadWeeks} wk</span>
              <span>Need by <span className="mono">{r.requiredOnSite.replace(", 2026", "")}</span></span>
              <span>ETA <span className="mono">{r.eta.replace(", 2026", "")}</span></span>
              <span style={{ color: r.slackDays < 0 ? "#A32D2D" : "var(--muted)" }}>{r.slackDays < 0 ? `${-r.slackDays}d late → ~${r.slipWeeks} wk slip` : `${r.slackDays}d slack`}</span>
            </div>
            {r.note && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>{r.note}</div>}
          </Link>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/weather">Weather</Link><Link href="/plan">Build plan</Link><Link href="/commissioning">Commissioning</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        The medium-voltage switchgear lineup for Building 17 is the binding constraint: SENTINEL has it at risk and its ETA lands after the electrical fit-out needs it, so QUARTERMASTER shows it gating electrical and cascading into commissioning.
      </div>
    </div>
  );
}
