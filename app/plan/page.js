"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getActivities, actStatus, isActiveOn, AREAS, SCOPE_COLOR, DATA_DATE, fmtDate } from "../../lib/plan";

const STATUS_COLOR = { done: "#5a8a1f", active: "#2f6d4f", late: "#A32D2D", ns: "#9a988f" };
const SITE_FOOT = [
  { id: "16", name: "Building 16", x: 30, y: 80, w: 120, h: 120 },
  { id: "17", name: "Building 17", x: 170, y: 80, w: 120, h: 120 },
  { id: "18", name: "Building 18", x: 310, y: 80, w: 140, h: 120 },
];

function PrereqBlock({ act, byId }) {
  if (!act) return null;
  const preds = act.pred.map((id) => byId(id)).filter(Boolean);
  if (!preds.length) return <div className="tip-none">No prerequisites — this work can proceed independently.</div>;
  return (
    <div>
      <div className="tip-graphic">
        <span className="tip-stack">
          {preds.map((p) => (
            <span key={p.id} className="tip-pre" style={{ borderColor: p.pct >= 100 ? "#5a8a1f" : p.id === act.gatingId ? "#A32D2D" : "#b98900" }}>
              {p.name} <span className="tip-pct">{p.pct >= 100 ? "✓" : `${p.pct}%`}</span>
            </span>
          ))}
        </span>
        <span className="tip-arrow">→</span>
        <span className="tip-this" style={{ background: SCOPE_COLOR[act.slug] }}>{act.name}</span>
      </div>
      <div className="tip-state"><strong>Must be underway before it can begin:</strong> {preds.map((p) => p.name).join(", ")}.</div>
      <div className="tip-state"><strong>Must be 100% complete before it can finish:</strong> {preds.map((p) => p.name).join(", ")}.</div>
      {act.gatingId && byId(act.gatingId) && <div className="tip-gate">Currently held back by {byId(act.gatingId).name} (forecast {fmtDate(byId(act.gatingId).forecastFinish)}).</div>}
    </div>
  );
}

export default function Plan() {
  const [building, setBuilding] = useState("17");
  const [from, setFrom] = useState(DATA_DATE);
  const [to, setTo] = useState(DATA_DATE);
  const [mapTab, setMapTab] = useState("floor");
  const [selId, setSelId] = useState(null);
  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);

  const acts = getActivities(building);
  const minDay = Math.min(...acts.map((a) => a.start));
  const maxDay = Math.max(...acts.map((a) => Math.max(a.plannedFinish, a.forecastFinish)));
  const x = (d) => Math.max(0, Math.min(100, ((d - minDay) / (maxDay - minDay)) * 100));
  const byId = (id) => acts.find((a) => a.id === id);
  const selected = byId(selId) || null;
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const inRange = (a) => a.pct < 100 && a.start <= hi && Math.max(a.plannedFinish, a.forecastFinish) >= lo;
  const rangeLabel = lo === hi ? fmtDate(lo) : `${fmtDate(lo)} – ${fmtDate(hi)}`;

  const milestones = [
    { name: "Foundations", a: "foundation" }, { name: "Dry-in", a: "imp-envelope" },
    { name: "Energization", a: "electrical" }, { name: "Cx complete", a: "commissioning" },
  ].map((m) => { const act = acts.find((z) => z.slug === m.a); return act ? { name: m.name, day: act.plannedFinish } : null; }).filter(Boolean);

  const switchB = (b) => { setBuilding(b); setSelId(null); setTip(null); };
  const areaActs = (areaId) => acts.filter((a) => a.area === areaId);
  const primaryFloor = (areaId) => { const a = areaActs(areaId); return a.filter(inRange).find((z) => z.critical) || a.filter(inRange)[0] || a.filter((z) => z.pct >= 100).sort((p, q) => q.plannedFinish - p.plannedFinish)[0] || a[0] || null; };
  const primaryBuilding = (bid) => { const ba = getActivities(bid); return ba.filter((a) => a.pct < 100 && a.start <= hi && Math.max(a.plannedFinish, a.forecastFinish) >= lo).find((z) => z.critical) || ba.filter((a) => a.pct < 100).find((z) => z.critical) || ba.find((a) => a.pct < 100) || ba[ba.length - 1]; };

  const move = (e) => { if (!wrapRef.current) return; const r = wrapRef.current.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e; setTip((t) => (t ? { ...t, x: pt.clientX - r.left, y: pt.clientY - r.top } : t)); };
  const enter = (key) => setTip((t) => ({ x: t ? t.x : 0, y: t ? t.y : 0, key }));

  let tipNode = null;
  if (tip) {
    if (mapTab === "floor") {
      const act = primaryFloor(tip.key);
      const activeNames = areaActs(tip.key).filter(inRange).map((a) => a.name);
      tipNode = (
        <div className="maptip" style={{ left: Math.min(tip.x + 14, 340), top: tip.y + 14 }}>
          <div className="tip-h">{AREAS.find((a) => a.id === tip.key)?.name}</div>
          <div className="tip-sub">Planned work · {rangeLabel}</div>
          <div className="tip-work">{activeNames.length ? activeNames.join(", ") : (act && act.pct >= 100 ? `${act.name} — complete` : "No scheduled work in this window")}</div>
          {act && <PrereqBlock act={act} byId={byId} />}
        </div>
      );
    } else {
      const bid = tip.key; const ba = getActivities(bid);
      const active = ba.filter((a) => a.pct < 100 && a.start <= hi && Math.max(a.plannedFinish, a.forecastFinish) >= lo);
      const act = primaryBuilding(bid);
      tipNode = (
        <div className="maptip" style={{ left: Math.min(tip.x + 14, 300), top: tip.y + 14 }}>
          <div className="tip-h">{buildings.find((b) => b.id === bid)?.name}</div>
          <div className="tip-sub">Active scopes · {rangeLabel}</div>
          <div className="tip-work">{active.length ? active.map((a) => a.name).join(", ") : "No active scopes in this window"}</div>
          {act && <div className="tip-sub" style={{ marginTop: 8 }}>Critical path now: <strong>{act.name}</strong></div>}
          {act && <PrereqBlock act={act} byId={(id) => ba.find((z) => z.id === id)} />}
        </div>
      );
    }
  }

  return (
    <div>
      <div className="eyebrow">PATHFINDER · interactive build plan</div>
      <h1 className="title">Build plan</h1>
      <p className="sub">Set a date or a date range. The schedule, milestones, and maps move together. Trace over any area on the maps to see the planned work and exactly what must finish before it can begin and before it can complete.</p>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Building</span>{buildings.map((b) => <button key={b.id} className={`seg ${building === b.id ? "on" : ""}`} onClick={() => switchB(b.id)}>{b.name}</button>)}</div></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontWeight: 700 }}>Date range</span><span className="mono" style={{ fontWeight: 700 }}>{rangeLabel}</span></div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}><span style={{ fontSize: 12, color: "var(--muted)", width: 36 }}>From</span><input type="range" min={minDay} max={maxDay} value={from} onChange={(e) => setFrom(Number(e.target.value))} style={{ flex: 1 }} /></div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 6 }}><span style={{ fontSize: 12, color: "var(--muted)", width: 36 }}>To</span><input type="range" min={minDay} max={maxDay} value={to} onChange={(e) => setTo(Number(e.target.value))} style={{ flex: 1 }} /></div>
        <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>Set From and To to the same point for a single day, or spread them for a window.</div>
      </div>

      <h2 className="sec">Schedule &amp; milestones — by scope &amp; location</h2>
      <div className="card">
        <div className="ms-ribbon">{milestones.map((m, i) => <span key={i} className="ms-mark" style={{ left: `${x(m.day)}%` }}><span className="ms-dia" /><span className="ms-name">{m.name}</span></span>)}</div>
        <div className="gantt">
          {acts.map((a) => {
            const late = a.forecastFinish > a.plannedFinish + 1;
            return (
              <div key={a.id} className={`grow ${selId === a.id ? "sel" : ""} ${a.critical ? "crit" : ""}`} onClick={() => setSelId(a.id)}>
                <span className="glabel"><span style={{ fontWeight: 600 }}>{a.name}{a.critical && <span className="crittag">critical</span>}</span><span className="gloc">{a.areaName}</span></span>
                <span className="gtrack">
                  <span className="grange" style={{ left: `${x(lo)}%`, width: `${x(hi) - x(lo)}%` }} />
                  <span className="gbar" style={{ left: `${x(a.start)}%`, width: `${x(a.plannedFinish) - x(a.start)}%`, background: SCOPE_COLOR[a.slug] }}><span className="gpct">{a.pct}%</span></span>
                  {late && <span className="gslip" style={{ left: `${x(a.plannedFinish)}%`, width: `${x(a.forecastFinish) - x(a.plannedFinish)}%` }} />}
                </span>
              </div>
            );
          })}
        </div>
        <div className="legend" style={{ marginTop: 10 }}>
          <span><span className="sw" style={{ background: "#3f6d7d" }} /> planned</span>
          <span><span className="sw" style={{ background: "#A32D2D", opacity: .5 }} /> forecast slip</span>
          <span><span className="sw" style={{ background: "transparent", border: "2px solid #A32D2D" }} /> critical path</span>
          <span><span className="ms-dia" style={{ position: "static", display: "inline-block" }} /> milestone</span>
          <span style={{ marginLeft: "auto", color: "var(--faint)" }}>Shaded band = selected range. Click an activity for detail.</span>
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2 className="sec" style={{ marginBottom: 0 }}>Map — {rangeLabel}</h2>
            <div className="maptabs" style={{ marginBottom: 0 }}>
              <button className={`tabbtn ${mapTab === "floor" ? "on" : ""}`} onClick={() => { setMapTab("floor"); setTip(null); }}>Construction drawing</button>
              <button className={`tabbtn ${mapTab === "site" ? "on" : ""}`} onClick={() => { setMapTab("site"); setTip(null); }}>Site map</button>
            </div>
          </div>
          <div className="card" style={{ padding: 12, marginTop: 10 }}>
            <div className="maphover" ref={wrapRef} style={{ position: "relative" }} onMouseMove={move} onMouseLeave={() => setTip(null)} onTouchMove={move}>
              {mapTab === "floor" ? (
                <svg viewBox="0 0 460 290" className="mapsvg">
                  <rect x="0" y="0" width="460" height="290" fill="var(--surface-2)" rx="8" />
                  {AREAS.map((ar) => {
                    const act = primaryFloor(ar.id); const active = (act && isActiveOn(act, hi)) || (act && inRange(act));
                    const fill = active ? SCOPE_COLOR[act.slug] : "#e7e4da"; const crit = active && act.critical; const sel = act && selId === act.id;
                    return (
                      <g key={ar.id} onMouseEnter={() => enter(ar.id)} onTouchStart={() => enter(ar.id)} onClick={() => act && setSelId(act.id)} style={{ cursor: act ? "pointer" : "default" }}>
                        <rect x={ar.x} y={ar.y} width={ar.w} height={ar.h} rx="6" fill={fill} fillOpacity={active ? 0.85 : 1} stroke={sel ? "#1b1c18" : crit ? "#A32D2D" : "#fff"} strokeWidth={sel ? 3 : crit ? 2.5 : 1.5} />
                        <text x={ar.x + ar.w / 2} y={ar.y + ar.h / 2 - 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={active ? "#fff" : "#4a4943"}>{ar.name}</text>
                        <text x={ar.x + ar.w / 2} y={ar.y + ar.h / 2 + 12} textAnchor="middle" fontSize="11" fill={active ? "#fff" : "#9a988f"}>{active ? "scheduled" : (act && act.pct >= 100 ? "complete" : "—")}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <svg viewBox="0 0 480 240" className="mapsvg">
                  <rect x="0" y="0" width="480" height="240" fill="var(--surface-2)" rx="8" />
                  <text x="240" y="30" textAnchor="middle" fontSize="12" fill="var(--faint)">Campus — hover a building</text>
                  {SITE_FOOT.map((b) => {
                    const ba = getActivities(b.id);
                    const active = ba.some((a) => a.pct < 100 && a.start <= hi && Math.max(a.plannedFinish, a.forecastFinish) >= lo);
                    const prim = primaryBuilding(b.id); const fill = active && prim ? SCOPE_COLOR[prim.slug] : "#e7e4da";
                    return (
                      <g key={b.id} onMouseEnter={() => enter(b.id)} onTouchStart={() => enter(b.id)} onClick={() => switchB(b.id)} style={{ cursor: "pointer" }}>
                        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill={fill} fillOpacity={active ? 0.82 : 1} stroke="#fff" strokeWidth="2" />
                        <text x={b.x + b.w / 2} y={b.y + b.h / 2} textAnchor="middle" fontSize="13" fontWeight="700" fill={active ? "#fff" : "#4a4943"}>{b.name}</text>
                      </g>
                    );
                  })}
                </svg>
              )}
              {tipNode}
            </div>
            <div className="legend"><span style={{ color: "var(--faint)" }}>Trace your cursor or finger over an area for planned work and its prerequisites. Click to pin the detail below.</span></div>
          </div>
        </div>

        <div>
          <h2 className="sec">Activity detail</h2>
          <div className="card">
            {!selected && <div className="notice">Select an activity from the schedule or a map area to see its dates, status, critical-path standing, and dependencies.</div>}
            {selected && (() => {
              const stt = actStatus(selected, hi); const slip = Math.round(selected.forecastFinish - selected.plannedFinish);
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
                  {gating && <div className="notice" style={{ marginTop: 12, borderColor: "#A32D2D", background: "rgba(163,45,45,.06)" }}><strong>Held back by {gating.name}</strong> — it must complete (forecast {fmtDate(gating.forecastFinish)}) before {selected.name} can finish.</div>}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <div className="dep-h">Must be complete before this can begin (predecessors)</div>
                    {selected.pred.length ? selected.pred.map((id) => { const p = byId(id); if (!p) return null; const g = id === selected.gatingId; return <button key={id} className={`depchip ${g ? "gate" : ""}`} onClick={() => setSelId(id)}>{p.name} <span className="depstate">{depState(p)}{g ? " · gating" : ""}</span></button>; }) : <span className="dep-none">None — this can start independently</span>}
                    <div className="dep-h" style={{ marginTop: 10 }}>Cannot start until this is complete (successors)</div>
                    {selected.succ.length ? selected.succ.map((id) => { const sc = byId(id); if (!sc) return null; const waiting = sc.gatingId === selected.id; return <button key={id} className={`depchip ${waiting ? "gate" : ""}`} onClick={() => setSelId(id)}>{sc.name}{waiting ? <span className="depstate"> · waiting on this</span> : ""}</button>; }) : <span className="dep-none">None — nothing downstream depends on this</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="notice" style={{ marginTop: 14 }}>Planned dates, milestones, and dependencies come from the master schedule (P6) as a versioned reference. Active status, the estimated actual completion, and the critical path are computed from atomic progress throughput. <Link href="/schedule" className="scopelink">Schedule risk &amp; milestones →</Link></div>
    </div>
  );
}
