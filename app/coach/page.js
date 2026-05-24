"use client";
import { useState } from "react";
import Link from "next/link";
import { useRole } from "../components/RoleProvider";
import { ROLE_LABEL } from "../../lib/roles";
import { SKILLS, recommendForRole } from "../../lib/coach";

export default function Coach() {
  const { role } = useRole();
  const [known, setKnown] = useState({});
  const [open, setOpen] = useState(null);
  const toggle = (k) => setKnown((m) => ({ ...m, [k]: !m[k] }));

  const all = recommendForRole(role);
  const recommended = all.filter((l) => !known[l.skill]);
  const mastered = all.filter((l) => known[l.skill]);

  const Lesson = ({ l }) => (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor: "pointer" }} onClick={() => setOpen(open === l.id ? null : l.id)}>
        <span style={{ fontWeight: 700 }}>{l.title}</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{l.minutes} min</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>{l.why}</div>
      {open === l.id && (
        <div style={{ marginTop: 12 }}>
          <ol style={{ margin: "0 0 0 18px", padding: 0 }}>
            {l.steps.map((s, i) => <li key={i} style={{ fontSize: 13.5, color: "#2b2f2e", marginBottom: 7, lineHeight: 1.45 }}>{s}</li>)}
          </ol>
          <Link href={l.tryIt.href} className="scopelink" style={{ display: "inline-block", marginTop: 8 }}>{l.tryIt.label} →</Link>
        </div>
      )}
      {open !== l.id && <div style={{ marginTop: 8 }}><button className="chip" onClick={() => setOpen(l.id)}>Show the 60-second lesson</button></div>}
    </div>
  );

  return (
    <div>
      <div className="eyebrow">COACH · just-in-time training</div>
      <h1 className="title">Coach</h1>
      <p className="sub">COACH builds the critical skills you need to read and act on the platform, and serves them in the flow of work — the right short lesson on the right screen at the right moment. These are prioritized for your role: <strong>{ROLE_LABEL[role]}</strong>.</p>

      <h2 className="sec">Mark what you already know</h2>
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SKILLS.map((s) => (
            <button key={s.key} className={`seg ${known[s.key] ? "on" : ""}`} onClick={() => toggle(s.key)}>{known[s.key] ? "✓ " : ""}{s.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>COACH drops anything you mark as known and surfaces the rest. In the full platform this is inferred from what you have actually viewed and acted on, not a self-report.</div>
      </div>

      <h2 className="sec">Recommended for you{recommended.length ? ` (${recommended.length})` : ""}</h2>
      {recommended.length === 0 && <div className="card"><div className="notice">You have marked every recommended skill as known. Nice. COACH will still pop a lesson in context if it sees a gap.</div></div>}
      {recommended.map((l) => <Lesson key={l.id} l={l} />)}

      {mastered.length > 0 && (
        <>
          <h2 className="sec">Marked as known</h2>
          {mastered.map((l) => <Lesson key={l.id} l={l} />)}
        </>
      )}

      <div className="relnav"><span>Related:</span><Link href="/assistant">Assistant</Link><Link href="/quality">Report quality</Link><Link href="/plan">Build plan</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        COACH also appears as a small prompt on individual screens (look for the Coach pill near the assistant). Each lesson ends with a concrete action so you practice the skill on real program data, not a sandbox.
      </div>
    </div>
  );
}
