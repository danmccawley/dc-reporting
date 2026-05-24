"use client";
import { useState } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getLookahead } from "../../lib/features";

export default function Lookahead() {
  const [bid, setBid] = useState("17");
  const la = getLookahead(bid);

  return (
    <div>
      <div className="eyebrow">MARSHAL · field look-ahead</div>
      <h1 className="title">3-week look-ahead</h1>
      <p className="sub">Built straight from the live schedule so the field plan and the program never drift apart. Each activity carries its constraints — the gating predecessor, any forecast slip, and weather exposure — so they get resolved in week one instead of becoming next week&apos;s slip. Designed to read on a phone in the daily huddle.</p>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Building</span>
        {buildings.map((b) => <button key={b.id} className={`seg ${bid === b.id ? "on" : ""}`} onClick={() => setBid(b.id)}>{b.name}</button>)}
      </div></div>

      <div className="grid g3" style={{ alignItems: "start" }}>
        {la.weeks.map((w) => (
          <div key={w.week}>
            <h2 className="sec">Week {w.week}<span style={{ fontWeight: 400, fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>{w.label.replace(/, 2026/g, "")}</span></h2>
            <div className="card" style={{ minHeight: 80 }}>
              {w.items.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13 }}>No scheduled scope activity.</div>}
              {w.items.map((it) => (
                <Link key={it.id} href={`/scope/${it.slug}/${bid}`} style={{ display: "block", textDecoration: "none", color: "inherit", padding: "10px 0", borderTop: "1px solid #ececec" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: "inline-block" }} />
                    {it.name} {it.critical && <span className="crittag">critical</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{it.area} · {it.crew} crew · {it.status}</div>
                  {it.constraints.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#A32D2D", marginTop: 3 }}>▲ {c}</div>
                  ))}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/plan">Build plan</Link><Link href="/manpower">Manpower</Link><Link href="/weather">Weather</Link><Link href="/field">Field</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Constraints are read live from the schedule engine: the gating predecessor is the specific incomplete work holding an activity back, forecast slip is the days the throughput forecast runs past plan, and weather-exposed marks the outdoor scopes SENTINEL is watching.
      </div>
    </div>
  );
}
