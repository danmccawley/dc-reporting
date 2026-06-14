"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { buildings } from "../../lib/mock/data";
import { deriveReport } from "../../lib/chronicler";
import { subscribe, appendedEntries } from "../../lib/store";

const CADENCES = ["Weekly", "Monthly", "Quarterly", "Daily roll-up"];
const STATUS_WORD = { g: "On track", a: "Watch", r: "Behind", n: "Not started" };

// Report-request surface. The CM picks a building and cadence and the system DERIVES
// the report from the live atomic store on demand — including any daily reports
// submitted through voice capture. This is the cascade: one daily entry, every
// downstream report populated from it, no separate authoring.
export default function RequestReport() {
  const [building, setBuilding] = useState("17");
  const [cadence, setCadence] = useState("Weekly");
  const [report, setReport] = useState(null);
  const [fieldCount, setFieldCount] = useState(0);

  const refreshCount = () => { try { setFieldCount(appendedEntries().length); } catch {} };
  useEffect(() => { refreshCount(); return subscribe(refreshCount); }, []);

  const generate = () => setReport(deriveReport({ building, cadence }));

  return (
    <div>
      <div className="eyebrow">Reporting</div>
      <h1 className="title">Request a report</h1>
      <p className="sub">
        Pick a building and cadence — CHRONICLER derives the report live from the atomic store, including
        every daily report submitted in the field. No separate authoring; the daily entries are the source.
      </p>

      {fieldCount > 0 && (
        <div className="banner" style={{ background: "#eef6ec", borderColor: "var(--g-bg)", color: "var(--g-ink)" }}>
          {fieldCount} field report{fieldCount === 1 ? "" : "s"} from this device are in the store and will be included.
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="grid g2" style={{ alignItems: "end" }}>
          <div>
            <label className="f" style={{ marginTop: 0 }}>Building</label>
            <select value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="program">Program-wide (all buildings)</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="f" style={{ marginTop: 0 }}>Cadence</label>
            <select value={cadence} onChange={(e) => setCadence(e.target.value)}>
              {CADENCES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button className="btn" onClick={generate}>Generate report</button>
          <Link href="/mobile" className="btn ghost">Submit a daily report first \u2192</Link>
        </div>
      </div>

      {report && (
        <div className="card">
          <div className="report-head">
            <div>
              <div className="eyebrow">{report.cadence} report \u00b7 {report.period}</div>
              <h2 className="title" style={{ fontSize: 22 }}>{report.scope}</h2>
            </div>
            <span className="pill s-a"><span className="dot d-a" />Draft \u2014 awaiting approval</span>
          </div>

          <div className="notice" style={{ margin: "10px 0 18px" }}>
            Derived {report.generatedAt} from the live store. Numbers are computed; narrative assembled from
            computed facts. Approve to lock and version (NOTARY), exactly like the weekly flow.
          </div>

          <h3 className="sec" style={{ marginTop: 0 }}>Narrative</h3>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>{report.narrative}</p>

          {report.sections.map((sec) => (
            <div key={sec.building} style={{ marginTop: 22 }}>
              <h3 className="sec">{sec.name} \u00b7 {sec.avg}% avg</h3>
              <table className="rtable">
                <thead>
                  <tr><th>Scope</th><th>Zone</th><th style={{ textAlign: "right" }}>% complete</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {sec.rows.length === 0 && (
                    <tr><td colSpan={4} style={{ color: "var(--muted)" }}>No reported progress yet for this building.</td></tr>
                  )}
                  {sec.rows.map((r) => (
                    <tr key={r.slug}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: "var(--muted)" }}>{r.zone || "\u2014"}</td>
                      <td style={{ textAlign: "right" }} className="mono">{r.pct}%</td>
                      <td>
                        <span className={`cellpill s-${r.status}`}>{STATUS_WORD[r.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sec.appended > 0 && (
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                  Includes {sec.appended} field report{sec.appended === 1 ? "" : "s"} submitted this period.
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button className="btn">Approve &amp; lock</button>
            <button className="btn ghost" onClick={generate}>Re-derive from store</button>
          </div>
        </div>
      )}
    </div>
  );
}
