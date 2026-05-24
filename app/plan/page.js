"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getActivities, actStatus, AREAS, SCOPE_COLOR, DATA_DATE, fmtDate, dayToDate, dateToDay, ROOMS, SLAB, SHELL_SCOPES, scheduledIn, SITE_FEATURES, SITE_DEPS, siteStatus } from "../../lib/plan";

const STATUS_COLOR = { done: "#5a8a1f", active: "#2f6d4f", late: "#A32D2D", ns: "#9a988f" };
const WK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SITE_DEP_OF = {};
Object.entries(SITE_DEPS).forEach(([k, arr]) => arr.forEach((p) => { (SITE_DEP_OF[p] = SITE_DEP_OF[p] || []).push(k); }));
const featById = (id) => SITE_FEATURES.find((f) => f.id === id);

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
  const [month, setMonth] = useState(() => { const d = dayToDate(DATA_DATE); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const wrapRef = useRef(null);

  const acts = getActivities(building);
  const minDay = Math.min(...acts.map((a) => a.start));
  const maxDay = Math.max(...acts.map((a) => Math.max(a.plannedFinish, a.forecastFinish)));
  const x = (d) => Math.max(0, Math.min(100, ((d - minDay) / (maxDay - minDay)) * 100));
  const byId = (id) => acts.find((a) => a.id === id);
  const selected = byId(selId) || null;
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const rangeLabel = lo === hi ? fmtDate(lo) : `${fmtDate(lo)} – ${fmtDate(hi)}`;
  const inRange = (a) => scheduledIn(a, lo, hi);
  const pickDay = (di) => { setFrom(di); setTo(di); };

  const milestones = [
    { name: "Foundations", a: "foundation" }, { name: "Dry-in", a: "imp-envelope" },
    { name: "Energization", a: "electrical" }, { name: "Cx complete", a: "commissioning" },
  ].map((m) => { const act = acts.find((z) => z.slug === m.a); return act ? { name: m.name, day: act.plannedFinish } : null; }).filter(Boolean);

  const roomFor = (slug) => { const r = ROOMS.find((z) => z.scope === slug); return r ? r.name : SHELL_SCOPES.includes(slug) ? "Structure / shell" : "Building-wide"; };
  const switchB = (b) => { setBuilding(b); setSelId(null); setTip(null); };

  // Calendar cells
  const year = month.getFullYear(), mon = month.getMonth();
  const first = new Date(year, mon, 1);
  const blanks = first.getDay();
  const dim = new Date(year, mon + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const shellActive = acts.filter((a) => SHELL_SCOPES.includes(a.slug)).find((a) => inRange(a));
  const bpct = (bid) => { const ba = getActivities(bid); return Math.round(ba.reduce((s, a) => s + a.pct, 0) / ba.length); };
  const featPct = (f) => (f.building ? bpct(f.building) : (f.pct || 0));
  const featPlanned = (f) => (f.building ? Math.max(...getActivities(f.building).map((a) => a.plannedFinish)) : f.planned);

  const move = (e) => { if (!wrapRef.current) return; const r = wrapRef.current.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e; setTip((t) => (t ? { ...t, x: pt.clientX - r.left, y: pt.clientY - r.top } : t)); };
  const enter = (key) => setTip((t) => ({ x: t ? t.x : 0, y: t ? t.y : 0, key }));

  let tipNode = null;
  if (tip) {
    if (mapTab === "floor") {
      let act, name;
      if (tip.key === "structure") { act = shellActive || acts.filter((a) => SHELL_SCOPES.includes(a.slug)).slice(-1)[0]; name = "Structure / shell"; }
      else { const room = ROOMS.find((r) => r.id === tip.key); name = room?.name; act = acts.find((a) => a.slug === room?.scope); }
      tipNode = (
        <div className="maptip" style={{ left: Math.min(tip.x + 14, 320), top: tip.y + 14 }}>
          <div className="tip-h">{name}</div>
          <div className="tip-sub">Planned work · {rangeLabel}</div>
          <div className="tip-work">{act ? (act.pct >= 100 ? `${act.name} — complete` : `${act.name} — ${act.pct}%`) : "No scheduled work"}</div>
          {act && <PrereqBlock act={act} byId={byId} />}
        </div>
      );
    } else {
      const f = featById(tip.key);
      const pct = featPct(f); const st = siteStatus(pct);
      const preds = (SITE_DEPS[f.id] || []).map(featById).filter(Boolean);
      const deps = (SITE_DEP_OF[f.id] || []).map(featById).filter(Boolean);
      tipNode = (
        <div className="maptip" style={{ left: Math.min(tip.x + 14, 440), top: tip.y + 14 }}>
          <div className="tip-h">{f.name}</div>
          <div className="tip-sub">{f.kind}{f.static ? "" : ` · planned ready ${fmtDate(featPlanned(f))}`}</div>
          {!f.static && <div className="tip-work">{pct}% complete · <span style={{ color: st.c }}>{st.k}</span></div>}
          {preds.length > 0 && (
            <div>
              <div className="dep-h" style={{ marginTop: 8 }}>Must be ready before this (prerequisite)</div>
              {preds.map((p) => { const ps = siteStatus(featPct(p)); return <div key={p.id} className="tip-state"><span style={{ color: "#b98900", fontWeight: 700 }}>■</span> {p.name} — {featPct(p)}% · <span style={{ color: ps.c }}>{ps.k}</span></div>; })}
              <div className="tip-state"><strong>Cannot energize or commission until:</strong> {preds.map((p) => p.name).join(", ")} are complete. <span style={{ color: "#b98900" }}>Highlighted in amber on the map.</span></div>
            </div>
          )}
          {deps.length > 0 && (
            <div>
              <div className="dep-h" style={{ marginTop: 8 }}>Reliant on this (dependent)</div>
              {deps.map((d) => <div key={d.id} className="tip-state"><span style={{ color: "#3a5ca8", fontWeight: 700 }}>■</span> {d.name}</div>)}
              <div className="tip-state"><strong>These cannot complete until this is finished:</strong> {deps.map((d) => d.name).join(", ")}. <span style={{ color: "#3a5ca8" }}>Highlighted in blue on the map.</span></div>
            </div>
          )}
          {preds.length === 0 && deps.length === 0 && <div className="tip-none">Site support feature — no scheduling dependencies.</div>}
        </div>
      );
    }
  }

  const dayList = acts.filter((a) => inRange(a));

  return (
    <div>
      <div className="eyebrow">PATHFINDER · interactive build plan</div>
      <h1 className="title">Build plan</h1>
      <p className="sub">Click a day on the calendar to track the build scope by scope and location for that date. The calendar, schedule, and construction drawing all move together. Trace over any room to see its planned work and what must finish before it can begin and complete.</p>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Building</span>{buildings.map((b) => <button key={b.id} className={`seg ${building === b.id ? "on" : ""}`} onClick={() => switchB(b.id)}>{b.name}</button>)}</div></div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h2 className="sec">Calendar — click a day</h2>
          <div className="card">
            <div className="cal-head">
              <button className="cal-nav" onClick={() => setMonth(new Date(year, mon - 1, 1))}>‹</button>
              <span className="cal-title">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <button className="cal-nav" onClick={() => setMonth(new Date(year, mon + 1, 1))}>›</button>
            </div>
            <div className="cal-grid">
              {WK.map((w) => <div key={w} className="cal-wd">{w}</div>)}
              {cells.map((d, i) => {
                if (d == null) return <div key={i} className="cal-cell empty" />;
                const date = new Date(year, mon, d); const di = dateToDay(date);
                const act = acts.filter((a) => scheduledIn(a, di, di));
                const today = di === DATA_DATE; const sel = di >= lo && di <= hi;
                const ms = milestones.some((m) => Math.round(m.day) === di);
                return (
                  <div key={i} className={`cal-cell ${sel ? "sel" : ""} ${today ? "today" : ""}`} onClick={() => pickDay(di)}>
                    <span className="cal-d">{d}{ms && <span className="cal-ms">◆</span>}</span>
                    <span className="cal-dots">{act.slice(0, 4).map((a) => <span key={a.id} className="cal-dot" style={{ background: SCOPE_COLOR[a.slug] }} />)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12 }}><span style={{ fontSize: 12, color: "var(--muted)", width: 64 }}>Widen to</span><input type="range" min={minDay} max={maxDay} value={to} onChange={(e) => setTo(Number(e.target.value))} style={{ flex: 1 }} /></div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>Click a day to select it, then drag this to extend the window. Dots show scopes scheduled that day; ◆ marks a milestone.</div>
          </div>
        </div>

        <div>
          <h2 className="sec">Scheduled work · {rangeLabel}</h2>
          <div className="card">
            {dayList.length === 0 && <div className="notice">No scope work is scheduled in this window for {buildings.find((b) => b.id === building)?.name}. Try another day or a wider range.</div>}
            {dayList.map((a) => {
              const stt = actStatus(a, hi); const g = a.gatingId ? byId(a.gatingId) : null;
              return (
                <div key={a.id} className={`worktile ${selId === a.id ? "sel" : ""}`} onClick={() => setSelId(a.id)}>
                  <span className="swatch" style={{ background: SCOPE_COLOR[a.slug] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.name} {a.critical && <span className="crittag">critical</span>}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{roomFor(a.slug)} · {a.pct}% · {g ? `held back by ${g.name}` : `float ${a.critical ? 0 : a.float}d`}</div>
                  </div>
                  <span className="pill" style={{ background: STATUS_COLOR[stt.key], color: "#fff" }}>{stt.label.replace("Active — ", "")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h2 className="sec">Schedule &amp; milestones</h2>
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
          <span style={{ marginLeft: "auto", color: "var(--faint)" }}>Shaded band = selected range.</span>
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2 className="sec" style={{ marginBottom: 0 }}>Construction drawing</h2>
            <div className="maptabs" style={{ marginBottom: 0 }}>
              <button className={`tabbtn ${mapTab === "floor" ? "on" : ""}`} onClick={() => { setMapTab("floor"); setTip(null); }}>Floor plan</button>
              <button className={`tabbtn ${mapTab === "site" ? "on" : ""}`} onClick={() => { setMapTab("site"); setTip(null); }}>Site map</button>
            </div>
          </div>
          <div className="card" style={{ padding: 12, marginTop: 10 }}>
            <div className="maphover" ref={wrapRef} style={{ position: "relative" }} onMouseMove={move} onMouseLeave={() => setTip(null)} onTouchMove={move}>
              {mapTab === "floor" ? (
                <svg viewBox="0 0 560 400" className="mapsvg">
                  <rect x="0" y="0" width="560" height="400" fill="#fbfaf6" rx="8" />
                  {/* column grid */}
                  {[60, 248, 368, 500].map((gx, i) => (<g key={`v${i}`}><line x1={gx} y1="40" x2={gx} y2="332" stroke="#d9d6cc" strokeWidth="1" strokeDasharray="3 4" /><circle cx={gx} cy="34" r="9" fill="#fff" stroke="#b9b6ac" /><text x={gx} y="38" textAnchor="middle" fontSize="10" fill="#7c7b74">{i + 1}</text></g>))}
                  {[70, 196, 312].map((gy, i) => (<g key={`h${i}`}><line x1="40" y1={gy} x2="520" y2={gy} stroke="#d9d6cc" strokeWidth="1" strokeDasharray="3 4" /><circle cx="22" cy={gy} r="9" fill="#fff" stroke="#b9b6ac" /><text x="22" y={gy + 4} textAnchor="middle" fontSize="10" fill="#7c7b74">{["A", "B", "C"][i]}</text></g>))}
                  {/* slab / structure (hoverable) */}
                  <rect x={SLAB.x} y={SLAB.y} width={SLAB.w} height={SLAB.h} fill={shellActive ? SCOPE_COLOR[shellActive.slug] : "#f1efe7"} fillOpacity={shellActive ? 0.18 : 1} stroke="#3a3933" strokeWidth="3" onMouseEnter={() => enter("structure")} onTouchStart={() => enter("structure")} onClick={() => shellActive && setSelId(shellActive.id)} style={{ cursor: "pointer" }} />
                  <rect x={SLAB.x + 4} y={SLAB.y + 4} width={SLAB.w - 8} height={SLAB.h - 8} fill="none" stroke="#3a3933" strokeWidth="1" pointerEvents="none" />
                  {/* rooms */}
                  {ROOMS.map((rm) => {
                    const act = acts.find((a) => a.slug === rm.scope); const active = act && inRange(act);
                    const fill = active ? SCOPE_COLOR[act.slug] : "#fff"; const crit = active && act.critical; const sel = act && selId === act.id;
                    return (
                      <g key={rm.id} onMouseEnter={() => enter(rm.id)} onTouchStart={() => enter(rm.id)} onClick={() => act && setSelId(act.id)} style={{ cursor: "pointer" }}>
                        <rect x={rm.x} y={rm.y} width={rm.w} height={rm.h} rx="2" fill={fill} fillOpacity={active ? 0.82 : 1} stroke={sel ? "#1b1c18" : crit ? "#A32D2D" : "#6b6a63"} strokeWidth={sel ? 3 : crit ? 2.5 : 1.5} />
                        <text x={rm.x + rm.w / 2} y={rm.y + rm.h / 2 - 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={active ? "#fff" : "#3a3933"}>{rm.name}</text>
                        <text x={rm.x + rm.w / 2} y={rm.y + rm.h / 2 + 12} textAnchor="middle" fontSize="10" fill={active ? "#fff" : "#9a988f"}>{active ? `${act.pct}% · scheduled` : act && act.pct >= 100 ? "complete" : "—"}</text>
                      </g>
                    );
                  })}
                  {/* north arrow */}
                  <g transform="translate(532,28)"><circle r="15" fill="#fff" stroke="#b9b6ac" /><path d="M0,-9 L4,6 L0,2 L-4,6 Z" fill="#3a3933" /><text x="0" y="-18" textAnchor="middle" fontSize="9" fill="#7c7b74">N</text></g>
                  {/* scale bar */}
                  <g transform="translate(40,352)"><rect x="0" y="0" width="20" height="6" fill="#3a3933" /><rect x="20" y="0" width="20" height="6" fill="#fff" stroke="#3a3933" /><rect x="40" y="0" width="20" height="6" fill="#3a3933" /><text x="0" y="20" fontSize="9" fill="#7c7b74">0</text><text x="60" y="20" fontSize="9" fill="#7c7b74">100 FT</text></g>
                  {/* title block */}
                  <g><rect x="350" y="344" width="170" height="50" fill="#fff" stroke="#3a3933" strokeWidth="1.2" /><line x1="350" y1="362" x2="520" y2="362" stroke="#cfccc2" /><line x1="350" y1="378" x2="520" y2="378" stroke="#cfccc2" /><text x="357" y="357" fontSize="9" fontWeight="700" fill="#3a3933">ORACLE DC · ABILENE</text><text x="357" y="374" fontSize="9" fill="#5a594f">BUILDING {building} · L1 OVERALL PLAN</text><text x="357" y="390" fontSize="9" fill="#5a594f">SHEET A-101 · {fmtDate(hi)}</text></g>
                </svg>
              ) : (() => {
                const hk = tip && mapTab === "site" ? tip.key : null;
                const preHi = hk ? (SITE_DEPS[hk] || []) : [];
                const depHi = hk ? (SITE_DEP_OF[hk] || []) : [];
                const hiStroke = (id) => id === hk ? "#1b1c18" : preHi.includes(id) ? "#b98900" : depHi.includes(id) ? "#3a5ca8" : null;
                const hiW = (id) => id === hk ? 3.5 : (preHi.includes(id) || depHi.includes(id)) ? 3 : 0;
                return (
                <svg viewBox="0 0 680 380" className="mapsvg">
                  <rect x="0" y="0" width="680" height="380" fill="#dfe6cf" rx="8" />
                  <rect x="6" y="6" width="668" height="368" fill="#e9e3d4" rx="6" />
                  {/* fence line */}
                  <rect x="14" y="14" width="652" height="352" fill="none" stroke="#a59f8c" strokeWidth="1.4" strokeDasharray="2 5" rx="4" />
                  {/* access + ring roads */}
                  <path d="M14,300 L520,300" stroke="#cfcabb" strokeWidth="16" fill="none" />
                  <path d="M520,55 L520,340" stroke="#cfcabb" strokeWidth="16" fill="none" />
                  <path d="M40,55 L520,55" stroke="#cfcabb" strokeWidth="12" fill="none" />
                  <line x1="14" y1="300" x2="520" y2="300" stroke="#fff" strokeWidth="1" strokeDasharray="8 8" />
                  {SITE_FEATURES.map((f) => {
                    const pct = featPct(f); const st = siteStatus(pct); const isB = !!f.building;
                    const sH = hiStroke(f.id); const sW = hiW(f.id);
                    const cx = f.x + f.w / 2;
                    return (
                      <g key={f.id} onMouseEnter={() => enter(f.id)} onTouchStart={() => enter(f.id)} onClick={() => { if (isB) { switchB(f.building); setMapTab("floor"); } }} style={{ cursor: isB ? "pointer" : "default" }}>
                        {f.kind === "Data center" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="#c7cdd6" stroke="#7e8893" strokeWidth="1.5" />
                          <rect x={f.x} y={f.y} width={f.w} height="7" fill={st.c} />
                          {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={f.x + 14 + (k % 4) * ((f.w - 28) / 4)} y={f.y + 22 + Math.floor(k / 4) * 34} width={(f.w - 28) / 4 - 8} height="22" rx="2" fill="#aab2bd" />)}
                          <text x={cx} y={f.y + f.h - 22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#2b2f36">{f.name}</text>
                          <text x={cx} y={f.y + f.h - 8} textAnchor="middle" fontSize="10" fill="#5a594f">{pct}% · {st.k}</text>
                        </>}
                        {f.id === "substation" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#ded8c8" stroke="#9a9382" strokeWidth="1.2" strokeDasharray="3 3" />
                          {[0, 1, 2].map((k) => <rect key={k} x={f.x + 14 + k * 34} y={f.y + 22} width="24" height="30" fill="#6b6a63" />)}
                          <line x1={f.x + 14} y1={f.y + 60} x2={f.x + f.w - 14} y2={f.y + 60} stroke="#6b6a63" strokeWidth="2" />
                          <text x={cx} y={f.y + f.h - 8} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#3a3933">Main substation</text>
                        </>}
                        {f.id === "genyard" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#ded8c8" stroke="#9a9382" strokeWidth="1.2" />
                          {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={f.x + 10 + k * 23} y={f.y + 16} width="16" height="28" rx="1" fill="#7a7870" />)}
                          <text x={cx} y={f.y + f.h - 8} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#3a3933">Generator plant</text>
                        </>}
                        {f.id === "chiller" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#dfe1dc" stroke="#9a9382" strokeWidth="1.2" />
                          {[0, 1, 2].map((k) => <circle key={k} cx={f.x + 30 + k * 50} cy={f.y + 32} r="16" fill="#9fb0b8" stroke="#7e8893" />)}
                          <text x={cx} y={f.y + f.h - 8} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#3a3933">Cooling plant</text>
                        </>}
                        {f.id === "waterpond" && <>
                          <ellipse cx={cx} cy={f.y + f.h / 2 - 6} rx={f.w / 2 - 6} ry={f.h / 2 - 14} fill="#9ec6d8" stroke="#6f9bb0" strokeWidth="1.2" />
                          <text x={cx} y={f.y + f.h - 6} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#3a3933">Retention pond</text>
                        </>}
                        {f.id === "parking" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#d9d4c6" stroke="#b9b3a2" strokeWidth="1" />
                          {Array.from({ length: 8 }).map((_, k) => <line key={k} x1={f.x + 10 + k * 12} y1={f.y + 8} x2={f.x + 10 + k * 12} y2={f.y + f.h - 18} stroke="#fff" strokeWidth="1" />)}
                          <text x={cx} y={f.y + f.h - 6} textAnchor="middle" fontSize="10.5" fill="#5a594f">Parking</text>
                        </>}
                        {f.id === "laydown" && <>
                          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#e3dcc9" stroke="#b9b3a2" strokeWidth="1" />
                          {Array.from({ length: 6 }).map((_, k) => <line key={k} x1={f.x + k * 22} y1={f.y + f.h} x2={f.x + k * 22 + f.h} y2={f.y} stroke="#cdc6b2" strokeWidth="1" />)}
                          <text x={cx} y={f.y + f.h / 2} textAnchor="middle" fontSize="10.5" fill="#5a594f">Laydown yard</text>
                        </>}
                        {f.id === "gatehouse" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#cfcabb" stroke="#9a9382" /><text x={cx} y={f.y + f.h + 11} textAnchor="middle" fontSize="9" fill="#7c7b74">Gate</text></>}
                        <rect x={f.x - 2} y={f.y - 2} width={f.w + 4} height={f.h + 4} rx="4" fill="transparent" stroke={sH || "transparent"} strokeWidth={sW} pointerEvents="none" />
                      </g>
                    );
                  })}
                  {/* north arrow + scale + title block */}
                  <g transform="translate(650,30)"><circle r="14" fill="#fff" stroke="#b9b6ac" /><path d="M0,-8 L4,6 L0,2 L-4,6 Z" fill="#3a3933" /><text x="0" y="-16" textAnchor="middle" fontSize="9" fill="#7c7b74">N</text></g>
                  <g transform="translate(24,344)"><rect x="0" y="0" width="24" height="5" fill="#3a3933" /><rect x="24" y="0" width="24" height="5" fill="#fff" stroke="#3a3933" /><rect x="48" y="0" width="24" height="5" fill="#3a3933" /><text x="0" y="-4" fontSize="9" fill="#5a594f">0</text><text x="60" y="-4" fontSize="9" fill="#5a594f">300 FT</text></g>
                  <g><rect x="500" y="338" width="166" height="34" fill="#fff" stroke="#3a3933" strokeWidth="1.1" /><text x="507" y="352" fontSize="9" fontWeight="700" fill="#3a3933">ORACLE DC · ABILENE</text><text x="507" y="366" fontSize="9" fill="#5a594f">OVERALL SITE PLAN · SHEET C-100</text></g>
                </svg>
                ); })()}
              {tipNode}
            </div>
            <div className="legend"><span style={{ color: "var(--faint)" }}>Trace your cursor or finger over a room for planned work and prerequisites. Click to pin the detail below.</span></div>
          </div>
        </div>

        <div>
          <h2 className="sec">Activity detail</h2>
          <div className="card">
            {!selected && <div className="notice">Select work from the calendar list, the schedule, or a room on the drawing to see its dates, critical-path standing, and dependencies.</div>}
            {selected && (() => {
              const stt = actStatus(selected, hi); const slip = Math.round(selected.forecastFinish - selected.plannedFinish);
              const gating = selected.gatingId ? byId(selected.gatingId) : null;
              const depState = (p) => p.pct >= 100 ? "✓ complete" : `forecast ${fmtDate(p.forecastFinish)}`;
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span className="swatch" style={{ background: SCOPE_COLOR[selected.slug] }} />
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{roomFor(selected.slug)}</span>
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
