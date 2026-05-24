"use client";
import { useState } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getActivities, actStatus, isActiveOn, AREAS, SCOPE_COLOR, DATA_DATE, fmtDate } from "../../lib/plan";

const STATUS_COLOR = { done: "#5a8a1f", active: "#2f6d4f", late: "#A32D2D", ns: "#9a988f" };

export default function Plan() {
  const [building, setBuilding] = useState("17");
  const [day, setDay] = useState(DATA_DATE);
  const [selId, setSelId] = useState(null);

  const acts = getActivities(building);
  const minDay = Math.min(...acts.map((a) => a.start));
  const maxDay = Math.max(...acts.map((a) => Math.max(a.plannedFinish, a.forecastFinish)));
  const x = (d) => Math.max(0, Math.min(100, ((d - minDay) / (maxDay - minDay)) * 100));
  const selected = acts.find((a) => a.id === selId) || null;
  const byId = (id) => acts.find((a) => a.id === id);

  const switchB = (b) => { setBuilding(b); setSelId(null); };

  const areaActivity = (areaId) => {
    const inArea = acts.filter((a) => a.area === areaId);
    return inArea.find((a) => isActiveOn(a, day)) || inArea.filter((a) => day >= a.start).sort((a, b) => b.start - a.start)[0] || inArea[0] || null;
  };

  return (
    <div>
      <div className="eyebrow">PATHFINDER · interactive build plan</div>
      <h1 className="title">Build plan</h1>
      <p className="sub">Move the date to see scheduled work by scope and location. The schedule and the floor-plan map are linked: planned bars carry a throughput-based forecast, and every activity shows its prerequisites and what depends on it.</p>

      <div className="mapctrls">
        <div className="ctrlgroup">
          <span className="ctrllabel">Building</span>
          {buildings.map((b) => <button key={b.id} className={`seg ${building === b.id ? "on" : ""}`} onClick={() => switchB(b.id)}>{b.name}</button>)}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700 }}>Date</span>
          <span className="mono" style={{ fontWeight: 700 }}>{fmtDate(day)}{Math.round(day) === DATA_DATE ? " · today" : ""}</span>
        </div>
        <input type="range" min={minDay} max={maxDay} value={day} onChange={(e) => setDay(Number(e.target.value))} style={{ width: "100%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--faint)" }}><span>{fmtDate(minDay)}</span><span>{fmtDate(maxDay)}</span></div>
      </div>

      <h2 className="sec">Schedule — by scope &amp; location</h2>
      <div className="card">
        <div className="gantt">
          {acts.map((a) => {
            const stt = actStatus(a, day);
            const late = a.forecastFinish > a.plannedFinish + 1;
            return (
              <div key={a.id} className={`grow ${selId === a.id ? "sel" : ""} ${a.critical ? "crit" : ""}`} onClick={() => setSelId(a.id)}>
                <span className="glabel"><span style={{ fontWeight: 600 }}>{a.name}{a.critical && <span className="crittag">critical</span>}</span><span className="gloc">{a.areaName}</span></span>
                <span className="gtrack">
                  <span className="gbar" style={{ left: `${x(a.start)}%`, width: `${x(a.plannedFinish) - x(a.start)}%`, background: SCOPE_COLOR[a.slug] }}>
                    <span className="gpct">{a.pct}%</span>
                  </span>
                  {late && <span className="gslip" style={{ left: `${x(a.plannedFinish)}%`, width: `${x(a.forecastFinish) - x(a.plannedFinish)}%` }} />}
                  <span className="gday" style={{ left: `${x(day)}%` }} />
                </span>
              </div>
            );
          })}
        </div>
        <div className="legend" style={{ marginTop: 10 }}>
          <span><span className="sw" style={{ background: "#3f6d7d" }} /> planned</span>
          <span><span className="sw" style={{ background: "#A32D2D", opacity: .5 }} /> forecast slip</span>
          <span><span className="sw" style={{ background: "transparent", border: "2px solid #A32D2D" }} /> critical path</span>
          <span style={{ marginLeft: "auto", color: "var(--faint)" }}>Vertical line is the selected date. Click an activity for detail.</span>
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h2 className="sec">Map — scheduled work on {fmtDate(day)}</h2>
          <div className="card" style={{ padding: 12 }}>
            <svg viewBox="0 0 460 290" className="mapsvg">
              <rect x="0" y="0" width="460" height="290" fill="var(--surface-2)" rx="8" />
              {AREAS.map((ar) => {
                const act = areaActivity(ar.id);
                const active = act && isActiveOn(act, day);
                const fill = active ? SCOPE_COLOR[act.slug] : "#e7e4da";
                const sel = act && selId === act.id;
                const crit = active && act.critical;
                return (
                  <g key={ar.id} onClick={() => act && setSelId(act.id)} style={{ cursor: act ? "pointer" : "default" }}>
                    <rect x={ar.x} y={ar.y} width={ar.w} height={ar.h} rx="6" fill={fill} fillOpacity={active ? 0.85 : 1} stroke={sel ? "#1b1c18" : crit ? "#A32D2D" : "#fff"} strokeWidth={sel ? 3 : crit ? 2.5 : 1.5} />
                    <text x={ar.x + ar.w / 2} y={ar.y + ar.h / 2 - 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={active ? "#fff" : "#4a4943"}>{ar.name}</text>
                    <text x={ar.x + ar.w / 2} y={ar.y + ar.h / 2 + 12} textAnchor="middle" fontSize="11" fill={active ? "#fff" : "#9a988f"}>{active ? `${act.name} · active` : (act && act.pct >= 100 ? "complete" : "—")}</text>
                  </g>
                );
              })}
            </svg>
            <div className="legend"><span style={{ color: "var(--faint)" }}>Highlighted areas have work scheduled active on the selected date, colored by scope. Click one for detail.</span></div>
          </div>
        </div>

        <div>
          <h2 className="sec">Activity detail</h2>
          <div className="card">
            {!selected && <div className="notice">Select an activity from the schedule or the map to see its dates, status, and dependencies.</div>}
            {selected && (() => {
              const stt = actStatus(selected, day);
              const slip = Math.round(selected.forecastFinish - selected.plannedFinish);
              const gating = selected.gatingId ? byId(selected.gatingId) : null;
              const depState = (p) => p.pct >= 100 ? "✓ complete" : `forecast ${fmtDate(p.forecastFinish)}`;
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span className="swatch" style={{ background: SCOPE_COLOR[selected.slug] }} />
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{selected.areaName}</span>
                    <span className="pill" style={{ background: STATUS_COLOR[stt.key], color: "#fff" }}>{stt.label}</span>
                    {selected.critical && <span className="pill" style={{ background: "#A32D2D", color: "#fff" }}>Critical path</span>}
                  </div>
                  <div className="caprow"><span>Start</span><span className="mono">{fmtDate(selected.start)}</span></div>
                  <div className="caprow"><span>Planned completion</span><span className="mono">{fmtDate(selected.plannedFinish)}</span></div>
                  <div className="caprow"><span>Est. actual completion <span style={{ color: "var(--faint)" }}>(throughput)</span></span><span className="mono" style={{ color: slip > 1 ? "#A32D2D" : "#5a8a1f" }}>{fmtDate(selected.forecastFinish)}{slip > 1 ? ` · +${slip}d` : ""}</span></div>
                  <div className="caprow"><span>Percent complete</span><span className="mono">{selected.pct}%</span></div>
                  <div className="caprow"><span>Total float</span><span className="mono">{selected.critical ? "0 d (critical)" : `${selected.float} d`}</span></div>

                  {gating && (
                    <div className="notice" style={{ marginTop: 12, borderColor: "#A32D2D", background: "rgba(163,45,45,.06)" }}>
                      <strong>Held back by {gating.name}</strong> — it must complete (forecast {fmtDate(gating.forecastFinish)}) before {selected.name} can finish.
                    </div>
                  )}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <div className="dep-h">Must be complete before this can begin (predecessors)</div>
                    {selected.pred.length ? selected.pred.map((id) => { const p = byId(id); if (!p) return null; const g = id === selected.gatingId; return (
                      <button key={id} className={`depchip ${g ? "gate" : ""}`} onClick={() => setSelId(id)}>{p.name} <span className="depstate">{depState(p)}{g ? " · gating" : ""}</span></button>
                    ); }) : <span className="dep-none">None — this can start independently</span>}

                    <div className="dep-h" style={{ marginTop: 10 }}>Cannot start until this is complete (successors)</div>
                    {selected.succ.length ? selected.succ.map((id) => { const sc = byId(id); if (!sc) return null; const waiting = sc.gatingId === selected.id; return (
                      <button key={id} className={`depchip ${waiting ? "gate" : ""}`} onClick={() => setSelId(id)}>{sc.name}{waiting ? <span className="depstate"> · waiting on this</span> : ""}</button>
                    ); }) : <span className="dep-none">None — nothing downstream depends on this</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="notice" style={{ marginTop: 14 }}>
        Planned dates and dependencies come from the master schedule (P6) as a versioned reference. Active status and the estimated actual completion are computed from the atomic progress throughput — change the field data and the forecast moves. <Link href="/schedule" className="scopelink">Schedule risk &amp; milestones →</Link>
      </div>
    </div>
  );
}
