"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getActivities, actStatus, SCOPE_COLOR, DATA_DATE, fmtDate, dayToDate, dateToDay, SHELL_SCOPES, scheduledIn, SITE_FEATURES, SITE_DEPS, siteStatus } from "../../lib/plan";
import { PrereqBlock, CadFloorPlan, SiteAerial, CAD_ROOMS, SITE_DEP_OF, featById, STATUS_COLOR } from "../components/Drawings";

const WK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function DailySchedule({ acts, minDay, maxDay, lo, hi, onPick }) {
  const days = []; for (let d = Math.round(minDay); d <= Math.round(maxDay); d++) days.push(d);
  return (
    <div className="daysched">
      {days.map((d) => {
        const date = dayToDate(d);
        const tasks = acts.filter((a) => a.pct < 100 && d >= a.start && d <= Math.max(a.plannedFinish, a.forecastFinish));
        const today = d === DATA_DATE, sel = d >= lo && d <= hi, sun = date.getDay() === 0;
        return (
          <div key={d} className={`dsrow ${sel ? "sel" : ""} ${today ? "today" : ""} ${sun ? "sun" : ""}`} onClick={() => onPick(d)}>
            <span className="dsdate"><span className="dsdow">{date.toLocaleDateString("en-US", { weekday: "short" })}</span><b>{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</b></span>
            <span className="dstasks">
              {tasks.length === 0 ? <span className="dsnone">no scheduled work</span> : tasks.map((a) => {
                const start = Math.round(a.start) === d, fin = Math.round(a.plannedFinish) === d;
                return <span key={a.id} className="dschip" style={{ borderColor: SCOPE_COLOR[a.slug] }}><span className="dsdot" style={{ background: SCOPE_COLOR[a.slug] }} />{a.name}{start ? " · start" : fin ? " · finish" : ""}</span>;
              })}
            </span>
          </div>
        );
      })}
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

  const roomFor = (slug) => { const r = CAD_ROOMS.find((z) => z.scope === slug); return r ? r.name : SHELL_SCOPES.includes(slug) ? "Structure / shell" : "Building-wide"; };
  const switchB = (b) => { setBuilding(b); setSelId(null); setTip(null); };
  const shellActive = acts.filter((a) => SHELL_SCOPES.includes(a.slug)).find((a) => inRange(a));
  const bpct = (bid) => { const ba = getActivities(bid); return Math.round(ba.reduce((s, a) => s + a.pct, 0) / ba.length); };
  const featPct = (f) => (f.building ? bpct(f.building) : (f.pct || 0));
  const featPlanned = (f) => (f.building ? Math.max(...getActivities(f.building).map((a) => a.plannedFinish)) : f.planned);

  const year = month.getFullYear(), mon = month.getMonth();
  const blanks = new Date(year, mon, 1).getDay();
  const dim = new Date(year, mon + 1, 0).getDate();
  const cells = []; for (let i = 0; i < blanks; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);

  const move = (e) => { if (!wrapRef.current) return; const r = wrapRef.current.getBoundingClientRect(); const pt = e.touches ? e.touches[0] : e; setTip((t) => (t ? { ...t, x: pt.clientX - r.left, y: pt.clientY - r.top } : t)); };
  const enter = (key) => setTip((t) => ({ x: t ? t.x : 0, y: t ? t.y : 0, key }));

  let tipNode = null;
  if (tip && mapTab === "floor") {
    let act, name;
    if (tip.key === "structure") { act = shellActive || acts.filter((a) => SHELL_SCOPES.includes(a.slug)).slice(-1)[0]; name = "Structure / shell"; }
    else { const room = CAD_ROOMS.find((r) => r.id === tip.key); name = room?.name; act = acts.find((a) => a.slug === room?.scope); }
    tipNode = (
      <div className="maptip" style={{ left: Math.min(tip.x + 14, 320), top: tip.y + 14 }}>
        <div className="tip-h">{name}</div>
        <div className="tip-sub">Planned work · {rangeLabel}</div>
        <div className="tip-work">{act ? (act.pct >= 100 ? `${act.name} — complete` : `${act.name} — ${act.pct}%`) : "No scheduled work"}</div>
        {act && <PrereqBlock act={act} byId={byId} />}
      </div>
    );
  } else if (tip && mapTab === "site") {
    const f = featById(tip.key); const pct = featPct(f), st = siteStatus(pct);
    const preds = (SITE_DEPS[f.id] || []).map(featById).filter(Boolean);
    const deps = (SITE_DEP_OF[f.id] || []).map(featById).filter(Boolean);
    tipNode = (
      <div className="maptip" style={{ left: Math.min(tip.x + 14, 440), top: tip.y + 14 }}>
        <div className="tip-h">{f.name}</div>
        <div className="tip-sub">{f.kind}{f.static ? "" : ` · planned ready ${fmtDate(featPlanned(f))}`}</div>
        {!f.static && <div className="tip-work">{pct}% complete · <span style={{ color: st.c }}>{st.k}</span></div>}
        {preds.length > 0 && <div><div className="dep-h" style={{ marginTop: 8 }}>Must be ready before this (prerequisite)</div>{preds.map((p) => { const ps = siteStatus(featPct(p)); return <div key={p.id} className="tip-state"><span style={{ color: "#e0a500", fontWeight: 700 }}>■</span> {p.name} — {featPct(p)}% · <span style={{ color: ps.c }}>{ps.k}</span></div>; })}<div className="tip-state"><strong>Cannot energize or commission until:</strong> {preds.map((p) => p.name).join(", ")} are complete. <span style={{ color: "#b98900" }}>(amber on map)</span></div></div>}
        {deps.length > 0 && <div><div className="dep-h" style={{ marginTop: 8 }}>Reliant on this (dependent)</div>{deps.map((d) => <div key={d.id} className="tip-state"><span style={{ color: "#2f6df0", fontWeight: 700 }}>■</span> {d.name}</div>)}<div className="tip-state"><strong>These cannot complete until this is finished:</strong> {deps.map((d) => d.name).join(", ")}. <span style={{ color: "#2f6df0" }}>(blue on map)</span></div></div>}
        {preds.length === 0 && deps.length === 0 && <div className="tip-none">Site support feature — no scheduling dependencies.</div>}
      </div>
    );
  }
  const hoveredKey = tip && mapTab === "site" ? tip.key : null;

  return (
    <div>
      <div className="eyebrow">PATHFINDER · interactive build plan</div>
      <h1 className="title">Build plan</h1>
      <p className="sub">Click a day on the calendar or in the day-by-day schedule to track build scope by location. Open the construction drawing for the floor plan or the site map for the campus, and trace over any area to see its planned work and what must finish before it can begin and complete.</p>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Building</span>{buildings.map((b) => <button key={b.id} className={`seg ${building === b.id ? "on" : ""}`} onClick={() => switchB(b.id)}>{b.name}</button>)}</div></div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h2 className="sec">Calendar</h2>
          <div className="card">
            <div className="cal-head"><button className="cal-nav" onClick={() => setMonth(new Date(year, mon - 1, 1))}>‹</button><span className="cal-title">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span><button className="cal-nav" onClick={() => setMonth(new Date(year, mon + 1, 1))}>›</button></div>
            <div className="cal-grid">
              {WK.map((w) => <div key={w} className="cal-wd">{w}</div>)}
              {cells.map((d, i) => {
                if (d == null) return <div key={i} className="cal-cell empty" />;
                const date = new Date(year, mon, d), di = dateToDay(date);
                const act = acts.filter((a) => scheduledIn(a, di, di));
                const today = di === DATA_DATE, sel = di >= lo && di <= hi, ms = milestones.some((m) => Math.round(m.day) === di);
                return (
                  <div key={i} className={`cal-cell ${sel ? "sel" : ""} ${today ? "today" : ""}`} onClick={() => pickDay(di)}>
                    <span className="cal-d">{d}{ms && <span className="cal-ms">◆</span>}</span>
                    <span className="cal-dots">{act.slice(0, 4).map((a) => <span key={a.id} className="cal-dot" style={{ background: SCOPE_COLOR[a.slug] }} />)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12 }}><span style={{ fontSize: 12, color: "var(--muted)", width: 64 }}>Widen to</span><input type="range" min={minDay} max={maxDay} value={to} onChange={(e) => setTo(Number(e.target.value))} style={{ flex: 1 }} /></div>
          </div>
        </div>
        <div>
          <h2 className="sec">Day-by-day schedule</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <DailySchedule acts={acts} minDay={minDay} maxDay={maxDay} lo={lo} hi={hi} onPick={pickDay} />
          </div>
        </div>
      </div>

      <h2 className="sec">Schedule overview &amp; milestones</h2>
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
            <h2 className="sec" style={{ marginBottom: 0 }}>{mapTab === "floor" ? "Construction drawing" : "Site map"}</h2>
            <div className="maptabs" style={{ marginBottom: 0 }}>
              <button className={`tabbtn ${mapTab === "floor" ? "on" : ""}`} onClick={() => { setMapTab("floor"); setTip(null); }}>Construction drawing</button>
              <button className={`tabbtn ${mapTab === "site" ? "on" : ""}`} onClick={() => { setMapTab("site"); setTip(null); }}>Site map</button>
            </div>
          </div>
          <div className="card" style={{ padding: 12, marginTop: 10 }}>
            <div className="maphover" ref={wrapRef} style={{ position: "relative" }} onMouseMove={move} onMouseLeave={() => setTip(null)} onTouchMove={move}>
              {mapTab === "floor"
                ? <CadFloorPlan acts={acts} inRange={inRange} selId={selId} enter={enter} setSel={setSelId} building={building} hi={hi} shellActive={shellActive} />
                : <SiteAerial featPct={featPct} featPlanned={featPlanned} hoveredKey={hoveredKey} enter={enter} switchB={switchB} setMapTab={setMapTab} />}
              {tipNode}
            </div>
            <div className="legend"><span style={{ color: "var(--faint)" }}>{mapTab === "floor" ? "Trace over a room for planned work and prerequisites; click to pin detail." : "Trace over a feature for schedule info; prerequisites highlight amber, dependents blue. Click a building to open its drawing."}</span></div>
          </div>
        </div>

        <div>
          <h2 className="sec">Activity detail</h2>
          <div className="card">
            {!selected && <div className="notice">Select work from the day-by-day schedule, the overview, or a room on the drawing to see its dates, critical-path standing, and dependencies.</div>}
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
