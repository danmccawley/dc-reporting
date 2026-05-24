import Link from "next/link";
import { getWeatherForecast, getWeatherImpact } from "../../lib/features";

const SEV = { ok: { c: "#5a8a1f", l: "OK to work" }, watch: { c: "#b98900", l: "Watch" }, severe: { c: "#A32D2D", l: "Severe" } };

export default function Weather() {
  const fc = getWeatherForecast();
  const impact = getWeatherImpact();

  return (
    <div>
      <div className="eyebrow">SENTINEL + PATHFINDER · weather &amp; delay</div>
      <h1 className="title">Weather &amp; delay forecast</h1>
      <p className="sub">SENTINEL pulls the 10-day forecast; PATHFINDER converts severe and high-wind days into predicted slip on the weather-exposed scopes (concrete, steel, and envelope). Crane and lift work is the most wind-sensitive.</p>

      <h2 className="sec">10-day outlook</h2>
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, minWidth: 760 }}>
          {fc.map((d) => (
            <div key={d.offset} style={{ flex: 1, minWidth: 70, textAlign: "center", padding: "10px 6px", borderRadius: 9, background: d.sev === "ok" ? "#f4f6ee" : d.sev === "watch" ? "#fbf3df" : "#fbe9e9", border: `1px solid ${SEV[d.sev].c}33` }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.date.replace(", 2026", "")}</div>
              <div style={{ fontSize: 26, margin: "2px 0" }}>{d.ic}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{d.hi}°</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.wind} mph</div>
              <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: SEV[d.sev].c }}>{SEV[d.sev].l}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="sec">Predicted schedule impact</h2>
      <div className="grid g3">
        {impact.map((b) => (
          <div key={b.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700 }}>{b.name}</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 20, color: b.slip >= 2 ? "#A32D2D" : b.slip > 0 ? "#b98900" : "#5a8a1f" }}>{b.slip}d</span>
            </div>
            <div className="cap-label" style={{ marginTop: -4 }}>Predicted slip on exposed scopes</div>
            {b.impacted.length === 0 && <div className="notice" style={{ marginTop: 10 }}>No weather-exposed scopes active in the next 10 days.</div>}
            {b.impacted.map((a) => (
              <Link key={a.id} href={`/scope/${a.slug}/${b.id}`} className="caprow" style={{ textDecoration: "none", color: "inherit" }}>
                <span>{a.name}{a.windSensitive ? " · wind-sensitive" : ""}</span>
                <span className="mono">{a.slip}d</span>
              </Link>
            ))}
            <div style={{ marginTop: 10 }}><Link href="/plan" className="scopelink">See it on the build plan →</Link></div>
          </div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/lookahead">Look-ahead</Link><Link href="/plan">Build plan</Link><Link href="/schedule">Schedule</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Two severe storm days and one high-wind advisory fall inside the next ten days. PATHFINDER attributes the largest exposure to Building 18 (foundations, slab, and steel are outdoors) and to Building 17 steel and envelope. Building 16 is in interior fit-out, so weather impact is minimal.
      </div>
    </div>
  );
}
