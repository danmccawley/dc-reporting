"use client";
import { useState } from "react";
import Link from "next/link";
import { DISCIPLINES, SETS, MODELS, COORDINATION, SHEET_STATUS, COORD_STATUS, sheetsByDiscipline, bimStats } from "../../lib/drawings";

export default function Drawings() {
  const groups = sheetsByDiscipline();
  const st = bimStats();
  const [disc, setDisc] = useState("all");
  const [open, setOpen] = useState(null);
  const shown = disc === "all" ? groups : groups.filter((g) => g.discipline === disc);

  return (
    <div>
      <div className="eyebrow">ARTIFICER + LIBRARIAN · native drawings &amp; models</div>
      <h1 className="title">Drawings &amp; models</h1>
      <p className="sub">The native drawing/sheet/version register and coordination tracker — built in instead of an Autodesk ACC integration. This manages the sheet set, issuances, versions, and model-coordination status, and pairs with <Link href="/records" className="scopelink">document control</Link> (the controlled record) and the <Link href="/maps" className="scopelink">maps</Link> (spatial placement). It is a sheet/version register and coordination tracker, not a model-authoring tool. This is the <strong>native</strong> provider for the BIM domain. <strong>Click a sheet</strong> for its revision, set, record, and where it appears.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{st.current}</div><div className="cap-label">Current sheets</div></div>
        <div className="card"><div className="kpi-cap">{st.sets}</div><div className="cap-label">Drawing sets</div></div>
        <div className="card"><div className="kpi-cap">{st.models}</div><div className="cap-label">Federated models</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: st.openClashes ? "#b98900" : "#5a8a1f" }}>{st.openClashes}</div><div className="cap-label">Open coordination items</div></div>
      </div>

      <div className="mapctrls"><div className="ctrlgroup"><span className="ctrllabel">Discipline</span>
        <button className={`seg ${disc === "all" ? "on" : ""}`} onClick={() => setDisc("all")}>All</button>
        {DISCIPLINES.map((d) => <button key={d} className={`seg ${disc === d ? "on" : ""}`} onClick={() => setDisc(d)}>{d}</button>)}
      </div></div>

      <h2 className="sec">Sheet index</h2>
      {shown.map((g) => (
        <div key={g.discipline} style={{ marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>{g.discipline}</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {g.sheets.map((s, i) => {
              const isOpen = open === s.number + s.building;
              return (
                <div key={s.number + s.building} style={{ borderTop: i ? "1px solid #ececec" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "12px 16px", cursor: "pointer", background: isOpen ? "#f7f6f0" : "transparent" }} onClick={() => setOpen(isOpen ? null : s.number + s.building)}>
                    <span style={{ fontWeight: 700 }}><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{s.number}</span>{s.title} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12 }}>· B{s.building}</span></span>
                    <span style={{ display: "flex", gap: 12, alignItems: "baseline", whiteSpace: "nowrap" }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>Rev {s.rev}</span>
                      <span className="mono" style={{ fontSize: 12, color: SHEET_STATUS[s.status] || "#6c6b62", fontWeight: 700 }}>{s.status}</span>
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 16px 14px" }}>
                      <div style={{ fontSize: 13, color: "#2b2f2e", marginBottom: 8 }}>{s.note}</div>
                      <div className="caprow"><span>Drawing set</span><span className="mono">{s.set}</span></div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                        {s.record && <Link href="/records" className="scopelink">Controlled record {s.record} →</Link>}
                        {s.onMap && <Link href="/maps" className="scopelink">Show on map →</Link>}
                        <Link href={`/scope/${s.scope}/${s.building}`} className="scopelink">Governs: {s.scope} · B{s.building} →</Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <h2 className="sec">Drawing sets</h2>
      <div className="card">
        {SETS.map((s) => (
          <div key={s.id} className="caprow" style={{ alignItems: "baseline" }}>
            <span><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{s.id}</span>{s.name}<div style={{ fontSize: 12, color: "var(--muted)" }}>{s.note}</div></span>
            <span className="mono" style={{ fontSize: 12 }}>{s.sheets} sheets · {s.status} · {s.date}</span>
          </div>
        ))}
      </div>

      <h2 className="sec">Models &amp; coordination</h2>
      <div className="card">
        {MODELS.map((m) => (
          <div key={m.id} className="caprow"><span>{m.name} <span style={{ color: "var(--muted)", fontSize: 12 }}>({m.disciplines})</span></span><span className="mono" style={{ fontSize: 12 }}>{m.status} · {m.clashes} clash{m.clashes === 1 ? "" : "es"} · fed. {m.federated}</span></div>
        ))}
        <div style={{ borderTop: "1px solid #ececec", marginTop: 6, paddingTop: 6 }} />
        {COORDINATION.map((c) => (
          <div key={c.id} className="caprow" style={{ alignItems: "baseline" }}>
            <span><span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginRight: 8 }}>{c.id}</span>{c.between}<div style={{ fontSize: 12, color: "var(--muted)" }}>{c.note}</div></span>
            <span style={{ display: "flex", gap: 10, alignItems: "baseline", whiteSpace: "nowrap" }}>
              {c.rfi && <Link href="/rfis" className="scopelink" style={{ fontSize: 12 }}>{c.rfi} →</Link>}
              <span className="mono" style={{ fontSize: 12, color: COORD_STATUS[c.status] }}>{c.status}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/records">Document control</Link><Link href="/maps">Maps</Link><Link href="/rfis">RFIs</Link><Link href="/providers">Provider registry</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Native drawings &amp; models: the sheet register tracks the current revision of every sheet and ties each to its controlled record and its place on the map, and open coordination items link to the RFIs resolving them (e.g., the CRAH-vs-cable-tray clash is RFI-119). This is a sheet/version and coordination register that pairs with document control and the maps — model authoring stays in the design tools.
      </div>
    </div>
  );
}
