"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { getActivities, actStatus, SCOPE_COLOR, DATA_DATE, fmtDate, dayToDate, dateToDay, SHELL_SCOPES, scheduledIn, SITE_FEATURES, SITE_DEPS, siteStatus } from "../../lib/plan";

const STATUS_COLOR = { done: "#5a8a1f", active: "#2f6d4f", late: "#A32D2D", ns: "#9a988f" };
const WK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SITE_DEP_OF = {};
Object.entries(SITE_DEPS).forEach(([k, arr]) => arr.forEach((p) => { (SITE_DEP_OF[p] = SITE_DEP_OF[p] || []).push(k); }));
const featById = (id) => SITE_FEATURES.find((f) => f.id === id);

// CAD floor-plan room layout (Level 1 overall plan).
const CAD_ROOMS = [
  { id: "hall1", name: "DATA HALL 1", scope: "lv-cabling", x: 70, y: 70, w: 184, h: 122, num: "101", sf: "12,000 SF" },
  { id: "hall2", name: "DATA HALL 2", scope: "lv-cabling", x: 70, y: 198, w: 184, h: 118, num: "102", sf: "11,600 SF" },
  { id: "elec", name: "ELECTRICAL", scope: "electrical", x: 260, y: 70, w: 96, h: 122, num: "103", sf: "4,200 SF" },
  { id: "mmr", name: "MMR / MDF", scope: "commissioning", x: 260, y: 198, w: 96, h: 118, num: "104", sf: "3,800 SF" },
  { id: "mech", name: "MECHANICAL", scope: "mechanical", x: 362, y: 70, w: 104, h: 122, num: "105", sf: "5,100 SF" },
  { id: "noc", name: "NOC / ADMIN", scope: "commissioning", x: 362, y: 198, w: 104, h: 118, num: "106", sf: "4,000 SF" },
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

// Every-day schedule list.
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

// CAD-style construction drawing.
function CadFloorPlan({ acts, inRange, selId, enter, setSel, building, hi, shellActive }) {
  const stateOf = (scope) => { const act = acts.find((a) => a.slug === scope); return { act, active: act && inRange(act) }; };
  return (
    <svg viewBox="0 0 560 470" className="mapsvg cad">
      <rect x="0" y="0" width="560" height="470" fill="#fff" />
      <rect x="8" y="8" width="544" height="454" fill="none" stroke="#1b1c18" strokeWidth="2" />
      <rect x="14" y="14" width="532" height="442" fill="none" stroke="#1b1c18" strokeWidth="0.6" />
      {/* overall dimension strings */}
      <g stroke="#1b1c18" strokeWidth="0.6">
        <line x1="70" y1="44" x2="466" y2="44" /><line x1="70" y1="40" x2="70" y2="62" /><line x1="466" y1="40" x2="466" y2="62" />
        {[70, 254, 356, 466].map((gx, i) => <line key={i} x1={gx} y1="40" x2={gx + 6} y2="48" />)}
        <line x1="44" y1="70" x2="44" y2="316" /><line x1="40" y1="70" x2="62" y2="70" /><line x1="40" y1="316" x2="62" y2="316" />
      </g>
      <text x="268" y="38" textAnchor="middle" fontSize="9" fill="#1b1c18" className="cadtxt">400'-0"</text>
      <text x="34" y="195" textAnchor="middle" fontSize="9" fill="#1b1c18" transform="rotate(-90 34 195)" className="cadtxt">260'-0"</text>
      {/* column grid */}
      <g>
        {[70, 162, 254, 356, 466].map((gx, i) => <g key={`v${i}`}><line x1={gx} y1="56" x2={gx} y2="330" stroke="#9a988f" strokeWidth="0.5" strokeDasharray="2 3" /><circle cx={gx} cy="56" r="9" fill="#fff" stroke="#1b1c18" strokeWidth="0.7" /><text x={gx} y="59.5" textAnchor="middle" fontSize="8.5" className="cadtxt">{i + 1}</text></g>)}
        {[70, 198, 316].map((gy, i) => <g key={`h${i}`}><line x1="58" y1={gy} x2="478" y2={gy} stroke="#9a988f" strokeWidth="0.5" strokeDasharray="2 3" /><circle cx="56" cy={gy} r="9" fill="#fff" stroke="#1b1c18" strokeWidth="0.7" /><text x="56" y={gy + 3.5} textAnchor="middle" fontSize="8.5" className="cadtxt">{["A", "B", "C"][i]}</text></g>)}
      </g>
      {/* structure / slab hit + exterior wall */}
      <rect x="70" y="70" width="396" height="246" fill={shellActive ? SCOPE_COLOR[shellActive.slug] : "#fff"} fillOpacity={shellActive ? 0.12 : 0} stroke="none" onMouseEnter={() => enter("structure")} onTouchStart={() => enter("structure")} onClick={() => shellActive && setSel(shellActive.id)} style={{ cursor: "pointer" }} />
      <rect x="70" y="70" width="396" height="246" fill="none" stroke="#1b1c18" strokeWidth="4" pointerEvents="none" />
      <rect x="75" y="75" width="386" height="236" fill="none" stroke="#1b1c18" strokeWidth="1" pointerEvents="none" />
      {/* rooms */}
      {CAD_ROOMS.map((rm) => {
        const { act, active } = stateOf(rm.scope); const sel = act && selId === act.id; const crit = active && act.critical;
        return (
          <g key={rm.id} onMouseEnter={() => enter(rm.id)} onTouchStart={() => enter(rm.id)} onClick={() => act && setSel(act.id)} style={{ cursor: "pointer" }}>
            <rect x={rm.x} y={rm.y} width={rm.w} height={rm.h} fill={active ? SCOPE_COLOR[rm.scope] : "#fff"} fillOpacity={active ? 0.16 : 0} stroke={sel ? "#1b1c18" : crit ? "#A32D2D" : "#1b1c18"} strokeWidth={sel ? 2.4 : crit ? 1.8 : 0.9} />
            <text x={rm.x + rm.w / 2} y={rm.y + rm.h / 2 - 6} textAnchor="middle" fontSize="10.5" fontWeight="700" className="cadtxt">{rm.name}</text>
            <text x={rm.x + rm.w / 2} y={rm.y + rm.h / 2 + 7} textAnchor="middle" fontSize="8" fill="#5a594f" className="cadtxt">{rm.sf}</text>
            <rect x={rm.x + 5} y={rm.y + 5} width="20" height="12" fill="#1b1c18" /><text x={rm.x + 15} y={rm.y + 14} textAnchor="middle" fontSize="8" fill="#fff" className="cadtxt">{rm.num}</text>
            {active && <rect x={rm.x + rm.w - 16} y={rm.y + 5} width="11" height="11" fill={SCOPE_COLOR[rm.scope]} />}
          </g>
        );
      })}
      {/* CRAH units along hall walls + structural columns */}
      <g stroke="#1b1c18" strokeWidth="0.7" fill="none">
        {[0, 1, 2, 3].map((k) => <rect key={`c1${k}`} x={78 + k * 44} y={74} width="30" height="9" strokeDasharray="3 2" />)}
        {[0, 1, 2, 3].map((k) => <rect key={`c2${k}`} x={78 + k * 44} y={303} width="30" height="9" strokeDasharray="3 2" />)}
      </g>
      <g fill="#1b1c18">{[70, 162, 254, 356, 466].flatMap((gx) => [70, 198, 316].map((gy) => <rect key={`${gx}-${gy}`} x={gx - 3} y={gy - 3} width="6" height="6" />))}</g>
      {/* door swings */}
      <g stroke="#1b1c18" strokeWidth="0.7" fill="none"><path d="M254,150 A20,20 0 0,1 234,170" /><path d="M356,150 A20,20 0 0,0 376,170" /></g>
      {/* north arrow */}
      <g transform="translate(500,84)"><line x1="0" y1="14" x2="0" y2="-14" stroke="#1b1c18" strokeWidth="1.2" /><path d="M0,-14 L4,-4 L-4,-4 Z" fill="#1b1c18" /><text x="0" y="26" textAnchor="middle" fontSize="9" className="cadtxt">N</text></g>
      {/* title block */}
      <g stroke="#1b1c18" strokeWidth="1" fill="none"><rect x="14" y="356" width="532" height="100" />
        <line x1="360" y1="356" x2="360" y2="456" /><line x1="360" y1="386" x2="546" y2="386" /><line x1="360" y1="416" x2="546" y2="416" />
        <line x1="14" y1="386" x2="360" y2="386" /><line x1="14" y1="416" x2="360" y2="416" />
        <line x1="453" y1="386" x2="453" y2="456" />
      </g>
      <g className="cadtxt" fill="#1b1c18">
        <text x="24" y="375" fontSize="13" fontWeight="700">ORACLE DATA CENTER — ABILENE, TX</text>
        <text x="24" y="406" fontSize="11">LEVEL 1 — OVERALL FLOOR PLAN</text>
        <text x="24" y="438" fontSize="10" fill="#5a594f">CLIENT: ORACLE / DPR CONSTRUCTION</text>
        <text x="368" y="372" fontSize="8" fill="#5a594f">SHEET</text><text x="368" y="382" fontSize="13" fontWeight="700">A-101</text>
        <text x="368" y="402" fontSize="8" fill="#5a594f">SCALE</text><text x="368" y="412" fontSize="10">1/16" = 1'-0"</text>
        <text x="368" y="432" fontSize="8" fill="#5a594f">DATE</text><text x="368" y="448" fontSize="10">{fmtDate(hi)}</text>
        <text x="461" y="402" fontSize="8" fill="#5a594f">BLDG</text><text x="461" y="414" fontSize="13" fontWeight="700">{building}</text>
        <text x="461" y="438" fontSize="8" fill="#5a594f">REV 3 · ISSUED FOR CONSTRUCTION</text>
      </g>
    </svg>
  );
}

// Aerial-style overhead site map.
function SiteAerial({ featPct, featPlanned, hoveredKey, enter, switchB, setMapTab }) {
  const preHi = hoveredKey ? (SITE_DEPS[hoveredKey] || []) : [];
  const depHi = hoveredKey ? (SITE_DEP_OF[hoveredKey] || []) : [];
  const hiStroke = (id) => id === hoveredKey ? "#1b1c18" : preHi.includes(id) ? "#e0a500" : depHi.includes(id) ? "#2f6df0" : null;
  const Shadow = ({ x, y, w, h, r = 4 }) => <rect x={x + 4} y={y + 5} width={w} height={h} rx={r} fill="rgba(0,0,0,0.16)" />;
  return (
    <svg viewBox="0 0 720 440" className="mapsvg">
      <defs>
        <radialGradient id="sun" cx="30%" cy="20%" r="90%"><stop offset="0%" stopColor="#d8cba6" /><stop offset="100%" stopColor="#c2b389" /></radialGradient>
      </defs>
      <rect x="0" y="0" width="720" height="440" fill="url(#sun)" />
      {/* vegetation + fields */}
      <path d="M0,0 L220,0 L180,70 L60,90 L0,60 Z" fill="#aebd84" opacity="0.8" />
      <path d="M620,0 L720,0 L720,120 L640,90 Z" fill="#a6b87a" opacity="0.8" />
      <path d="M0,360 L120,330 L150,440 L0,440 Z" fill="#9fb172" opacity="0.85" />
      <ellipse cx="690" cy="400" rx="60" ry="40" fill="#9fb172" opacity="0.8" />
      {/* roads */}
      <path d="M360,440 L360,300 L640,300 L640,60" fill="none" stroke="#56554f" strokeWidth="20" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M60,300 L640,300" fill="none" stroke="#56554f" strokeWidth="16" strokeLinecap="round" />
      <path d="M360,440 L360,300" fill="none" stroke="#e8c24a" strokeWidth="1.5" strokeDasharray="10 9" />
      <path d="M60,300 L640,300" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="10 12" opacity="0.7" />
      {/* trees */}
      {[[30, 120], [44, 150], [22, 180], [700, 180], [690, 210], [120, 410], [150, 400]].map(([cx, cy], i) => <g key={i}><circle cx={cx + 2} cy={cy + 3} r="9" fill="rgba(0,0,0,0.15)" /><circle cx={cx} cy={cy} r="9" fill="#5f7e3e" /></g>)}
      {SITE_FEATURES.map((f) => {
        const pct = featPct(f), st = siteStatus(pct), isB = !!f.building, cx = f.x + f.w / 2;
        const sH = hiStroke(f.id);
        return (
          <g key={f.id} onMouseEnter={() => enter(f.id)} onTouchStart={() => enter(f.id)} onClick={() => { if (isB) { switchB(f.building); setMapTab("floor"); } }} style={{ cursor: isB ? "pointer" : "default" }}>
            <Shadow x={f.x} y={f.y} w={f.w} h={f.h} r={f.id === "waterpond" ? 30 : 4} />
            {isB && <>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="#cdd1d6" stroke="#9aa0a8" strokeWidth="1" />
              <rect x={f.x + 4} y={f.y + 4} width={f.w - 8} height={f.h - 8} fill="none" stroke="#b7bcc3" strokeWidth="1" />
              {Array.from({ length: 18 }).map((_, k) => { const c = k % 3, r = Math.floor(k / 3); return <g key={k}><rect x={f.x + 16 + c * ((f.w - 32) / 3) + 2} y={f.y + 18 + r * 21 + 1} width={(f.w - 32) / 3 - 6} height="13" fill="rgba(0,0,0,0.12)" /><rect x={f.x + 16 + c * ((f.w - 32) / 3)} y={f.y + 18 + r * 21} width={(f.w - 32) / 3 - 6} height="13" rx="1" fill="#b3b8bf" stroke="#9aa0a8" strokeWidth="0.5" /></g>; })}
              {pct < 30 && <g stroke="#c9442e" strokeWidth="2"><line x1={cx} y1={f.y - 26} x2={cx} y2={f.y + 10} /><line x1={cx - 30} y1={f.y - 26} x2={cx + 40} y2={f.y - 26} /><line x1={cx + 40} y1={f.y - 26} x2={cx + 40} y2={f.y - 14} /></g>}
              <rect x={f.x} y={f.y} width={f.w} height="6" fill={st.c} />
              <text x={cx} y={f.y + f.h + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2b2f36">{f.name}</text>
              <text x={cx} y={f.y + f.h + 29} textAnchor="middle" fontSize="10" fill="#5a594f">{pct}% · {st.k}</text>
            </>}
            {f.id === "substation" && <>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#c9bfa3" stroke="#9a9382" strokeWidth="1" strokeDasharray="4 3" />
              {[0, 1, 2].map((k) => <g key={k}><rect x={f.x + 14 + k * 36} y={f.y + 20} width="26" height="34" fill="#5a594f" /><line x1={f.x + 14 + k * 36} y1={f.y + 26} x2={f.x + 40 + k * 36} y2={f.y + 26} stroke="#8a887e" strokeWidth="0.6" /><line x1={f.x + 14 + k * 36} y1={f.y + 34} x2={f.x + 40 + k * 36} y2={f.y + 34} stroke="#8a887e" strokeWidth="0.6" /></g>)}
              <line x1={f.x + 14} y1={f.y + 62} x2={f.x + f.w - 14} y2={f.y + 62} stroke="#3a3933" strokeWidth="2" />
              <text x={cx} y={f.y + f.h + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2b2f36">Main substation</text>
            </>}
            {f.id === "genyard" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#c9bfa3" stroke="#9a9382" strokeWidth="1" />{[0, 1, 2, 3, 4].map((k) => <g key={k}><rect x={f.x + 10 + k * 23} y={f.y + 16} width="16" height="32" rx="1" fill="#76746c" /><circle cx={f.x + 18 + k * 23} cy={f.y + 14} r="2.5" fill="#4a4943" /></g>)}<text x={cx} y={f.y + f.h + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2b2f36">Generator plant</text></>}
            {f.id === "chiller" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#d3d6d0" stroke="#9a9382" strokeWidth="1" />{[0, 1, 2].map((k) => <g key={k}><circle cx={f.x + 32 + k * 50} cy={f.y + 34} r="17" fill="#9fb0b8" stroke="#7e8893" /><line x1={f.x + 15 + k * 50} y1={f.y + 34} x2={f.x + 49 + k * 50} y2={f.y + 34} stroke="#7e8893" strokeWidth="0.7" /><line x1={f.x + 32 + k * 50} y1={f.y + 17} x2={f.x + 32 + k * 50} y2={f.y + 51} stroke="#7e8893" strokeWidth="0.7" /></g>)}<text x={cx} y={f.y + f.h + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2b2f36">Central cooling plant</text></>}
            {f.id === "waterpond" && <><path d={`M${f.x + 8},${f.y + 40} Q${f.x},${f.y + 8} ${f.x + 50},${f.y + 10} Q${f.x + f.w},${f.y} ${f.x + f.w - 6},${f.y + 44} Q${f.x + f.w - 20},${f.y + f.h} ${f.x + 50},${f.y + f.h - 6} Q${f.x + 6},${f.y + f.h} ${f.x + 8},${f.y + 40} Z`} fill="#7fb1c9" stroke="#5f93ab" strokeWidth="1" /><path d={`M${f.x + 30},${f.y + 22} Q${f.x + 60},${f.y + 16} ${f.x + 80},${f.y + 26}`} fill="none" stroke="#a7d0e0" strokeWidth="2" /><text x={cx} y={f.y + f.h + 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2b2f36">Retention pond</text></>}
            {f.id === "parking" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#6f6e6a" />{Array.from({ length: 9 }).map((_, k) => <line key={k} x1={f.x + 8 + k * 11} y1={f.y + 6} x2={f.x + 8 + k * 11} y2={f.y + f.h - 22} stroke="#cfcabb" strokeWidth="1" />)}{[["#9a3b3b", 0], ["#3a5ca8", 2], ["#5a8a1f", 5]].map(([c, k], i) => <rect key={i} x={f.x + 9 + k * 11} y={f.y + 9} width="8" height="14" rx="1.5" fill={c} />)}<text x={cx} y={f.y + f.h + 12} textAnchor="middle" fontSize="10" fill="#5a594f">Parking</text></>}
            {f.id === "laydown" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#cdc3a6" stroke="#b0a784" strokeWidth="1" />{[[8, 12], [40, 16], [70, 10], [95, 18]].map(([ox, oy], i) => <rect key={i} x={f.x + ox} y={f.y + oy} width="22" height="16" fill="#9c8a5e" stroke="#7d6e49" strokeWidth="0.5" />)}<text x={cx} y={f.y + f.h + 12} textAnchor="middle" fontSize="10" fill="#5a594f">Laydown yard</text></>}
            {f.id === "gatehouse" && <><rect x={f.x} y={f.y} width={f.w} height={f.h} rx="2" fill="#cfcabb" stroke="#9a9382" /><line x1={f.x + f.w} y1={f.y + 15} x2={f.x + f.w + 22} y2={f.y + 15} stroke="#c9442e" strokeWidth="2" /></>}
            {sH && <rect x={f.x - 3} y={f.y - 3} width={f.w + 6} height={f.h + 6} rx={f.id === "waterpond" ? 30 : 5} fill="none" stroke={sH} strokeWidth="3.5" pointerEvents="none" />}
          </g>
        );
      })}
      {/* north + scale + sheet tag */}
      <g transform="translate(688,36)"><circle r="15" fill="#fff" stroke="#b9b6ac" /><path d="M0,-9 L4,6 L0,2 L-4,6 Z" fill="#3a3933" /><text x="0" y="-18" textAnchor="middle" fontSize="9" fill="#5a594f">N</text></g>
      <g transform="translate(24,408)"><rect x="0" y="0" width="26" height="5" fill="#3a3933" /><rect x="26" y="0" width="26" height="5" fill="#fff" stroke="#3a3933" /><rect x="52" y="0" width="26" height="5" fill="#3a3933" /><text x="0" y="-4" fontSize="9" fill="#3a3933">0</text><text x="64" y="-4" fontSize="9" fill="#3a3933">300 FT</text></g>
    </svg>
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
