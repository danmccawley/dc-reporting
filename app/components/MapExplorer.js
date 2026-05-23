"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ragFill, ragInk, ragLabel } from "../../lib/rag";

const INTERVALS = ["Daily", "Weekly", "Monthly", "Quarterly", "Semi-annual", "Annual"];

function intervalVals(base) {
  return INTERVALS.map((_, i) => {
    if (base === 0) return [0, "n"];
    const pct = Math.max(0, Math.min(100, base - (5 - i) * 3));
    const st = pct >= 90 ? "g" : pct >= 55 ? "a" : "r";
    return [pct, st];
  });
}

// One large 1,000+ acre campus: rows of data halls, a power plant, a cement
// factory, and admin trailers. (Schematic stand-in for the real site plan.)
const DH_BASE = [
  [96, 92, 88, 80, 72],
  [58, 50, 44, 30, 22],
  [12, 6, 0, 0, 0],
];
const SITE = (() => {
  const arr = [];
  const x0 = 40, y0 = 120, w = 122, h = 50, gx = 12, gy = 22;
  let n = 1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      arr.push({ id: `dh${n}`, name: `Data Hall ${n}`, short: `DH ${n}`, x: x0 + c * (w + gx), y: y0 + r * (h + gy), w, h, vals: intervalVals(DH_BASE[r][c]) });
      n++;
    }
  }
  arr.push({ id: "power", name: "Power plant", short: "Power plant", x: 40, y: 24, w: 200, h: 74, vals: intervalVals(70) });
  arr.push({ id: "admin", name: "Admin trailers", short: "Admin trailers", x: 280, y: 24, w: 160, h: 74, vals: intervalVals(100) });
  arr.push({ id: "cement", name: "Cement factory", short: "Cement factory", x: 498, y: 24, w: 182, h: 74, vals: intervalVals(88) });
  return arr;
})();

const DRAW = [
  { id: "dh1", name: "Data Hall 1", short: "Data Hall 1", x: 40, y: 40, w: 210, h: 130, vals: intervalVals(62) },
  { id: "dh2", name: "Data Hall 2", short: "Data Hall 2", x: 270, y: 40, w: 210, h: 130, vals: intervalVals(38) },
  { id: "mmr", name: "MMR / Telco", short: "MMR", x: 500, y: 40, w: 60, h: 130, vals: intervalVals(45) },
  { id: "elec", name: "Electrical Room", short: "Electrical", x: 40, y: 190, w: 160, h: 70, vals: intervalVals(33) },
  { id: "mech", name: "Mechanical / Cooling", short: "Mechanical", x: 220, y: 190, w: 180, h: 70, vals: intervalVals(28) },
  { id: "noc", name: "Admin / NOC", short: "Admin / NOC", x: 420, y: 190, w: 140, h: 70, vals: intervalVals(70) },
];

export default function MapExplorer() {
  const [tab, setTab] = useState("site");
  const [mode, setMode] = useState("point");
  const [iv, setIv] = useState(1);
  const [sel, setSel] = useState([]);
  const [band, setBand] = useState(null);
  const drag = useRef(null);
  const svgRef = useRef(null);

  const areas = tab === "site" ? SITE : DRAW;
  const VB = tab === "site" ? { w: 720, h: 380 } : { w: 600, h: 300 };

  const toSvg = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VB.w, y: ((e.clientY - r.top) / r.height) * VB.h };
  };
  const down = (e) => { if (mode !== "area") return; const p = toSvg(e); drag.current = p; setBand({ x: p.x, y: p.y, w: 0, h: 0 }); };
  const move = (e) => {
    if (mode !== "area" || !drag.current) return;
    const p = toSvg(e), s = drag.current;
    setBand({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const up = () => {
    if (mode !== "area" || !drag.current || !band) { drag.current = null; return; }
    const hit = areas.filter((a) => !(a.x > band.x + band.w || a.x + a.w < band.x || a.y > band.y + band.h || a.y + a.h < band.y)).map((a) => a.id);
    setSel(hit); drag.current = null; setBand(null);
  };
  const clickArea = (id) => { if (mode === "point") setSel([id]); };
  const selected = areas.filter((a) => sel.includes(a.id));

  return (
    <div>
      <div className="maptabs">
        <button className={`tabbtn ${tab === "site" ? "on" : ""}`} onClick={() => { setTab("site"); setSel([]); setBand(null); }}>Site map</button>
        <button className={`tabbtn ${tab === "drawing" ? "on" : ""}`} onClick={() => { setTab("drawing"); setSel([]); setBand(null); }}>Construction drawing</button>
      </div>

      <div className="mapctrls">
        <div className="ctrlgroup">
          <span className="ctrllabel">Select by</span>
          <button className={`seg ${mode === "point" ? "on" : ""}`} onClick={() => { setMode("point"); setBand(null); }}>Point</button>
          <button className={`seg ${mode === "area" ? "on" : ""}`} onClick={() => setMode("area")}>Area</button>
        </div>
        <div className="ctrlgroup">
          <span className="ctrllabel">Interval</span>
          {INTERVALS.map((label, i) => (
            <button key={label} className={`seg ${iv === i ? "on" : ""}`} onClick={() => setIv(i)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className="mapsvg"
          style={{ cursor: mode === "area" ? "crosshair" : "default" }}
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}>
          <rect x="0" y="0" width={VB.w} height={VB.h} fill="var(--surface-2)" rx="8" />
          {tab === "site" && <text x={VB.w / 2} y={VB.h - 8} textAnchor="middle" fontSize="12" fill="var(--faint)">1,000+ acre campus — schematic</text>}
          {areas.map((a) => {
            const [pct, st] = a.vals[iv];
            const isSel = sel.includes(a.id);
            const small = a.h < 60;
            return (
              <g key={a.id} onClick={() => clickArea(a.id)} style={{ cursor: mode === "point" ? "pointer" : "crosshair" }}>
                <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="6" fill={ragFill[st]} stroke={isSel ? "#1b1c18" : "#ffffff"} strokeWidth={isSel ? 3 : 1.5} />
                <text x={a.x + a.w / 2} y={a.y + a.h / 2 - (small ? 3 : 6)} textAnchor="middle" fontSize={small ? 11 : 13} fontWeight="600" fill={ragInk[st]}>{a.short}</text>
                <text x={a.x + a.w / 2} y={a.y + a.h / 2 + (small ? 12 : 12)} textAnchor="middle" fontSize={small ? 11 : 13} fill={ragInk[st]} fontFamily="monospace">{st === "n" ? "—" : pct + "%"}</text>
              </g>
            );
          })}
          {band && <rect x={band.x} y={band.y} width={band.w} height={band.h} fill="rgba(47,72,88,.12)" stroke="#2f4858" strokeDasharray="5 4" />}
        </svg>
        <div className="legend">
          <span><span className="sw" style={{ background: ragFill.g }} /> On track</span>
          <span><span className="sw" style={{ background: ragFill.a }} /> Watch</span>
          <span><span className="sw" style={{ background: ragFill.r }} /> Behind</span>
          <span><span className="sw" style={{ background: ragFill.n }} /> Not started</span>
          <span style={{ marginLeft: "auto", color: "var(--faint)" }}>
            {mode === "point" ? "Click an area to select it." : "Drag a box across areas (e.g. a row of data halls) to select them."}
          </span>
        </div>
      </div>

      <h2 className="sec">{selected.length ? `Status — ${INTERVALS[iv]} report` : "Select an area"}</h2>
      <div className="card">
        {selected.length === 0 && (
          <div className="notice">Use Point to click a single location, or Area to drag a box around several (handy for a whole row of data halls). The panel shows each area&apos;s status for the selected interval, with a link to the matching report.</div>
        )}
        {selected.map((a) => {
          const [pct, st] = a.vals[iv];
          return (
            <div key={a.id} className="linkrow" style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 600, width: 200 }}>{a.name}</span>
              <span className={`pill s-${st}`}><span className={`dot d-${st}`} />{ragLabel[st]}</span>
              <span className="mono" style={{ marginLeft: 12, color: "var(--muted)" }}>{st === "n" ? "—" : pct + "%"}</span>
              <span style={{ flex: 1 }} />
              <Link href="/reports" className="scopelink">Open {INTERVALS[iv]} report →</Link>
            </div>
          );
        })}
        {selected.length > 0 && <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setSel([])}>Clear selection</button>}
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Prototype note: schematic stand-in. In production the site map is your real 1,000+ acre site plan and the drawing is the actual CAD floor plan, with true area polygons; selecting an area links to its report for the chosen interval.
      </div>
    </div>
  );
}
