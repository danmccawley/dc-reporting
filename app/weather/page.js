"use client";
import { useState } from "react";
import Link from "next/link";
import { getWeatherForecast, getWeatherImpact } from "../../lib/features";
import { weatherSources, tierFor } from "../../lib/library";

const SEV = { ok: { c: "#5a8a1f", l: "OK to work" }, watch: { c: "#b98900", l: "Watch" }, severe: { c: "#A32D2D", l: "Severe" } };

export default function Weather() {
  const fc = getWeatherForecast();
  const impact = getWeatherImpact();
  const sources = weatherSources();
  const primary = sources[0];
  const [sel, setSel] = useState(null);

  // What a given day affects: the exposed, in-progress scopes and the marginal slip it adds.
  const dayEffect = (d) => {
    const add = d.sev === "severe" ? 1.0 : d.sev === "watch" ? 0.5 : 0;
    const windAdd = d.wind >= 25 ? 1.0 : 0;
    const rows = [];
    impact.forEach((b) => b.impacted.forEach((s) => {
      const v = add + (s.windSensitive ? windAdd : 0);
      if (v > 0) rows.push({ building: b.name, scope: s.name, slug: s.slug, bid: b.id, add: Math.round(v * 10) / 10, wind: s.windSensitive });
    }));
    return rows;
  };

  return (
    <div>
      <div className="eyebrow">SENTINEL + PATHFINDER · weather &amp; delay</div>
      <h1 className="title">Weather &amp; delay forecast</h1>
      <p className="sub">SENTINEL pulls the 10-day forecast from LIBRARIAN-vetted sources; PATHFINDER converts severe and high-wind days into predicted slip on the weather-exposed scopes. <strong>Click any day</strong> to see what it affects and to open the reporting source.</p>

      <h2 className="sec">10-day outlook <span style={{ fontWeight: 400, fontSize: 13, color: "var(--muted)" }}>· tap a day</span></h2>
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, minWidth: 760 }}>
          {fc.map((d) => (
            <button key={d.offset} onClick={() => setSel(sel === d.offset ? null : d.offset)}
              style={{ flex: 1, minWidth: 70, textAlign: "center", padding: "10px 6px", borderRadius: 9, cursor: "pointer",
                background: d.sev === "ok" ? "#f4f6ee" : d.sev === "watch" ? "#fbf3df" : "#fbe9e9",
                border: sel === d.offset ? `2px solid ${SEV[d.sev].c}` : `1px solid ${SEV[d.sev].c}33` }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.date.replace(", 2026", "")}</div>
              <div style={{ fontSize: 26, margin: "2px 0" }}>{d.ic}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{d.hi}°</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.wind} mph</div>
              <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: SEV[d.sev].c }}>{SEV[d.sev].l}</div>
            </button>
          ))}
        </div>
      </div>

      {sel !== null && (() => {
        const d = fc[sel]; const rows = dayEffect(d);
        return (
          <div className="card" style={{ marginTop: 12, borderLeft: `4px solid ${SEV[d.sev].c}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700 }}>{d.date} · {d.label} · {d.wind} mph wind</span>
              <button className="chip" onClick={() => setSel(null)}>Close</button>
            </div>
            <div style={{ fontSize: 13.5, color: "#2b2f2e", margin: "8px 0" }}>
              {rows.length === 0
                ? "An OK-to-work day. No predicted impact on the exposed scopes."
                : `This ${d.sev === "severe" ? "severe-weather" : d.sev === "watch" ? "watch"+(d.wind>=25?"/high-wind":"") : ""} day is expected to affect ${new Set(rows.map((r) => r.scope + r.building)).size} active outdoor scope window(s), adding predicted slip below.`}
            </div>
            {rows.map((r, i) => (
              <Link key={i} href={`/scope/${r.slug}/${r.bid}`} className="caprow" style={{ textDecoration: "none", color: "inherit" }}>
                <span>{r.building} · {r.scope}{r.wind ? " · wind-sensitive" : ""}</span>
                <span className="mono">+{r.add}d</span>
              </Link>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #ececec", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>Reported by</span>
              <a href={primary.url} target="_blank" rel="noreferrer" className="scopelink">{primary.name} →</a>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: tierFor(primary.credibility).c }} />
                LIBRARIAN-vetted · {tierFor(primary.credibility).k} · {primary.credibility}/100
              </span>
              <Link href="/library" className="scopelink">How LIBRARIAN vets sources →</Link>
            </div>
          </div>
        );
      })()}

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

      <h2 className="sec">Sources behind this forecast</h2>
      <div className="card">
        {sources.map((s) => (
          <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="caprow" style={{ textDecoration: "none", color: "inherit", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: tierFor(s.credibility).c }} />{s.name}
            </span>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{tierFor(s.credibility).k} · {s.credibility}/100 →</span>
          </a>
        ))}
        <div style={{ marginTop: 8 }}><Link href="/library" className="scopelink">Open the LIBRARIAN knowledge base →</Link></div>
      </div>

      <div className="relnav"><span>Related:</span><Link href="/lookahead">Look-ahead</Link><Link href="/plan">Build plan</Link><Link href="/library">Knowledge base</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Two severe storm days and a high-wind advisory fall inside the window. Every reading traces to a source LIBRARIAN has screened for reliability — the National Weather Service is the authoritative primary, and lower-tier feeds are used only where they corroborate it.
      </div>
    </div>
  );
}
