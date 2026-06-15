"use client";
import { useState } from "react";
import Link from "next/link";
import { getChallenges, forgeStats, STAGES, stageFor } from "../../lib/forge";

export default function Forge() {
  const challenges = getChallenges();
  const st = forgeStats();
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div className="eyebrow">FORGE · agentic solutions factory</div>
      <h1 className="title">Solutions factory</h1>
      <p className="sub">The rest of the suite handles the known; FORGE handles the new. When a challenge appears that no standing specialist fully covers, FORGE designs a purpose-built solution by composing existing agents, tools, and data, a human approves it, FORGE deploys it, and then either folds the pattern into the permanent roster or retires it. Click a challenge to see the assembled solution.</p>

      <div className="grid g4">
        <div className="card"><div className="kpi-cap">{st.total}</div><div className="cap-label">Challenges handled</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#b98900" }}>{st.active}</div><div className="cap-label">Active in the factory</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#5a8a1f" }}>{st.deployed}</div><div className="cap-label">Deployed</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#3a5ca8" }}>{st.folded}</div><div className="cap-label">Folded into roster</div></div>
      </div>

      <h2 className="sec">How the factory works</h2>
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 13.5 }}>
          {["Detect the unforeseen", "Design a solution", "Assemble from existing agents + tools", "Human approves", "Deploy", "Fold into roster or retire"].map((s, i, arr) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--surface-2, #f1efe7)", borderRadius: 7, padding: "6px 10px", fontWeight: 600 }}>{s}</span>
              {i < arr.length - 1 && <span style={{ color: "var(--muted)" }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <h2 className="sec">Challenges &amp; solutions</h2>
      {challenges.map((c) => {
        const s = stageFor(c.stage); const isOpen = open === c.id;
        return (
          <div key={c.id} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${s.c}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, cursor: "pointer" }} onClick={() => setOpen(isOpen ? null : c.id)}>
              <span style={{ fontWeight: 700 }}>{c.title}</span>
              <span className="mono" style={{ fontSize: 12, color: s.c, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{c.trigger}</div>
            {!isOpen && <div style={{ marginTop: 8 }}><button className="chip" onClick={() => setOpen(c.id)}>See the assembled solution</button></div>}
            {isOpen && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #ececec" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700 }}>{c.solution.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{c.solution.type}</span>
                </div>
                <div className="caprow"><span>Detected by</span><span className="mono">{c.detectedBy}</span></div>
                <div className="caprow"><span>Composes agents</span><span className="mono">{c.solution.composes.join(", ")}</span></div>
                <div className="caprow"><span>Reads data</span><span className="mono">{c.solution.data.join(", ")}</span></div>
                <div className="caprow"><span>Human owner</span><span className="mono">{c.owner}</span></div>
                <div style={{ fontSize: 13.5, color: "#2b2f2e", marginTop: 8 }}>{c.solution.outcome}</div>
              </div>
            )}
          </div>
        );
      })}

      <div className="relnav"><span>Related:</span><Link href="/library">Knowledge base</Link><Link href="/insights">Insights</Link><Link href="/plan">Build plan</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        FORGE never deploys autonomously — a human owner approves every solution before it goes live, and NOTARY records what was built, from what, and why. Patterns that prove durable (like RFI-EXPEDITER) are folded into the permanent roster; one-off responses are retired once the challenge clears.
      </div>
    </div>
  );
}
