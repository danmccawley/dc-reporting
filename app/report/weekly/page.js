"use client";
import { useState } from "react";
import Link from "next/link";
import { weeklyReport } from "../../../lib/mock/data";

export default function WeeklyReport() {
  const [narrative, setNarrative] = useState(weeklyReport.narrative);
  const [status, setStatus] = useState("draft");
  const [stamp, setStamp] = useState(null);
  const approved = status === "approved";

  const approve = () => {
    setStatus("approved");
    setStamp(new Date().toLocaleString());
  };

  return (
    <div>
      <div className="eyebrow">Weekly report · {weeklyReport.week}</div>
      <h1 className="title">Building 17 — weekly</h1>
      <p className="sub">
        Drafted by CHRONICLER from approved daily entries. Edit, then approve to lock and feed the monthly roll-up.
        {" "}<Link href="/reports/wk-17" style={{ color: "var(--accent)", fontWeight: 600 }}>Open as launchable report →</Link>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span className={`pill ${approved ? "s-g" : "s-a"}`}>
          <span className={`dot ${approved ? "d-g" : "d-a"}`} />
          {approved ? "Approved & locked" : "Draft — awaiting CM/PM approval"}
        </span>
        {approved && stamp && (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Locked {stamp} · versioned in audit trail (NOTARY)
          </span>
        )}
      </div>

      <h2 className="sec">Headline metrics</h2>
      <div className="grid g4">
        {weeklyReport.metrics.map((m) => (
          <div key={m.label} className="stat">
            <div className="k">{m.label}</div>
            <div className="v mono">{m.value}</div>
            <span className={`pill s-${m.status}`} style={{ marginTop: 6 }}>
              <span className={`dot d-${m.status}`} />
              {m.status === "r" ? "Behind" : m.status === "a" ? "Watch" : "On track"}
            </span>
          </div>
        ))}
      </div>

      <h2 className="sec">Narrative</h2>
      <div className="card">
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          disabled={approved}
          style={{ minHeight: 150 }}
        />
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button className="btn" onClick={approve} disabled={approved}>
            {approved ? "Locked" : "Approve & lock"}
          </button>
          {!approved && (
            <button className="btn ghost" onClick={() => setNarrative(weeklyReport.narrative)}>
              Reset to draft
            </button>
          )}
        </div>
        <div className="notice" style={{ marginTop: 14 }}>
          Once approved, the weekly locks and becomes the validated input to the monthly report.
          Edits after approval create a new version rather than overwriting.
        </div>
      </div>
    </div>
  );
}
