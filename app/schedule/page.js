"use client";
import { useState } from "react";
import Link from "next/link";
import { buildings, schedule } from "../../lib/mock/data";
import { getActivities, scheduledIn, SCOPE_COLOR, DATA_DATE, dayToDate, dateToDay, fmtDate } from "../../lib/plan";

const WK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT = { foundation: "Found", "slab-on-grade": "Slab", "steel-erection": "Steel", "steel-decking": "Deck", "imp-envelope": "Env", electrical: "Elec", mechanical: "Mech", "lv-cabling": "LV", commissioning: "Cx" };
const RISK = { g: "#5a8a1f", a: "#b98900", r: "#A32D2D" };

export default function Schedule() {
  const [scope, setScope] = useState("17");
  const [month, setMonth] = useState(() => { const d = dayToDate(DATA_DATE); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selDay, setSelDay] = useState(DATA_DATE);

  const acts = scope === "all" ? buildings.flatMap((b) => getActivities(b.id)) : getActivities(scope);
  const milestoneDays = {};
  (scope === "all" ? buildings.map((b) => b.id) : [scope]).forEach((bid) => {
    const ba = getActivities(bid);
    [["foundation", "Foundations"], ["imp-envelope", "Dry-in"], ["electrical", "Energization"], ["commissioning", "Cx complete"]].forEach(([slug, name]) => {
      const a = ba.find((z) => z.slug === slug); if (a) { const d = Math.round(a.plannedFinish); milestoneDays[d] = (milestoneDays[d] || []).concat(`B${bid} ${name}`); }
    });
  });

  const year = month.getFullYear(), mon = month.getMonth();
  const blanks = new Date(year, mon, 1).getDay();
  const dim = new Date(year, mon + 1, 0).getDate();
  const cells = []; for (let i = 0; i < blanks; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);

  const dayTasks = (di) => acts.filter((a) => a.pct < 100 && di >= a.start && di <= Math.max(a.plannedFinish, a.forecastFinish));
  const selTasks = dayTasks(selDay);

  return (
    <div>
      <div className="eyebrow">PATHFINDER · schedule</div>
      <h1 className="title">Schedule</h1>
      <p className="sub">A working calendar of the build. Each day shows the scope work scheduled to be in progress; click a day to see the detail and open the reports. Milestones are marked with a diamond.</p>

      <div className="mapctrls" style={{ justifyContent: "space-between" }}>
        <div className="ctrlgroup"><span className="ctrllabel">Show</span>
          <button className={`seg ${scope === "all" ? "on" : ""}`} onClick={() => setScope("all")}>All buildings</button>
          {buildings.map((b) => <button key={b.id} className={`seg ${scope === b.id ? "on" : ""}`} onClick={() => setScope(b.id)}>{b.name}</button>)}
        </div>
        <div className="cal-head" style={{ margin: 0, gap: 12 }}>
          <button className="cal-nav" onClick={() => setMonth(new Date(year, mon - 1, 1))}>‹</button>
          <span className="cal-title">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <button className="cal-nav" onClick={() => setMonth(new Date(year, mon + 1, 1))}>›</button>
        </div>
      </div>

      <div className="card">
        <div className="schedcal">
          {WK.map((w) => <div key={w} className="scal-wd">{w}</div>)}
          {cells.map((d, i) => {
            if (d == null) return <div key={i} className="scell empty" />;
            const date = new Date(year, mon, d), di = dateToDay(date);
            const tasks = dayTasks(di);
            const today = di === DATA_DATE, sel = di === selDay, ms = milestoneDays[di];
            return (
              <div key={i} className={`scell ${sel ? "sel" : ""} ${today ? "today" : ""}`} onClick={() => setSelDay(di)}>
                <div className="scell-d">{d}{ms && <span className="scell-ms" title={ms.join(", ")}>◆</span>}</div>
                <div className="scell-chips">
                  {tasks.slice(0, 3).map((a) => <span key={a.id} className="schip" style={{ background: SCOPE_COLOR[a.slug] }}>{scope === "all" ? `${a.building}·` : ""}{SHORT[a.slug]}</span>)}
                  {tasks.length > 3 && <span className="schip more">+{tasks.length - 3}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h2 className="sec">{fmtDate(selDay)}{selDay === DATA_DATE ? " · today" : ""}</h2>
          <div className="card">
            {selTasks.length === 0 && <div className="notice">No scope work scheduled on this day for the current selection.</div>}
            {selTasks.map((a) => (
              <Link key={a.id} href={`/scope/${a.slug}/${a.building}?from=${selDay}&to=${selDay}`} className="worktile" style={{ textDecoration: "none", color: "inherit" }}>
                <span className="swatch" style={{ background: SCOPE_COLOR[a.slug] }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{a.name} {a.critical && <span className="crittag">critical</span>}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{buildings.find((b) => b.id === a.building)?.name} · {a.areaName} · {a.pct}%</div>
                </div>
                <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>reports →</span>
              </Link>
            ))}
            {milestoneDays[selDay] && <div className="notice" style={{ marginTop: 10 }}><strong>Milestone:</strong> {milestoneDays[selDay].join(", ")}.</div>}
          </div>
        </div>
        <div>
          <h2 className="sec">Risk &amp; confidence</h2>
          {schedule.filter((s) => scope === "all" || s.id === scope).map((s) => (
            <div key={s.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>{s.name}</span>
                <span className="mono" style={{ fontWeight: 700, color: RISK[s.confidence >= 75 ? "g" : s.confidence >= 50 ? "a" : "r"] }}>{s.confidence}% go-live confidence</span>
              </div>
              <div className="caprow"><span>P50 / P80 finish</span><span className="mono">{s.p50} / {s.p80}</span></div>
              <div className="caprow"><span>Critical path</span><span>{s.critical}</span></div>
              <div style={{ marginTop: 8, display: "flex", gap: 14 }}>
                <Link href={`/site/${s.id}`} className="scopelink">Open building →</Link>
                <Link href="/plan" className="scopelink">Build plan →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
