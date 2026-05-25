"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBernard } from "../components/Bernard";

const SUGGEST = [
  "What's behind schedule right now?",
  "Why is Building 17 electrical red?",
  "What's the switchgear procurement risk?",
  "How much extra crew does Building 17 need?",
  "What's the weather impact this week?",
  "How does the RAG trend work?",
];
const QUICK = [
  { label: "Look-ahead", href: "/lookahead" }, { label: "Manpower", href: "/manpower" },
  { label: "Procurement", href: "/procurement" }, { label: "Weather", href: "/weather" },
  { label: "Punchlist", href: "/punchlist" }, { label: "Report QA", href: "/quality" },
  { label: "Build plan", href: "/plan" }, { label: "Coach", href: "/coach" },
];

export default function Assistant() {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "I'm Bernard. I can answer anything about the program — schedule, cost, capacity, risks, the new field tools — and explain how the platform works. Ask me, or use a starter below." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const B = useBernard();
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, history: next.slice(1, -1) }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.answer || "Sorry, I couldn't answer that." }]);
    } catch { setMsgs((m) => [...m, { role: "assistant", content: "Network error reaching the assistant." }]); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="eyebrow">BERNARD · assistant</div>
      <h1 className="title">Assistant</h1>
      <p className="sub">CONCIERGE is the way to interact with the whole platform in plain language. It answers from the live program data and explains how anything works. Every answer is grounded in the same computed numbers the dashboards show.</p>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", height: 460, padding: 0, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
            {msgs.map((m, i) => (
              <div key={i}>
                <div className={`bubble ${m.role}`}>{m.content}</div>
                {m.role === "assistant" && i > 0 && (
                  <button className="chip" style={{ marginBottom: 10 }} onClick={() => B?.speak(m.content)}>▶ Bernard reads this</button>
                )}
              </div>
            ))}
            {busy && <div className="bubble assistant">…</div>}
            <div ref={endRef} />
          </div>
          <div className="concierge-input" style={{ borderTop: "1px solid #ececec" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about the program or the platform..." />
            <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
          </div>
        </div>
        <div>
          <h2 className="sec" style={{ marginTop: 0 }}>Starters</h2>
          <div className="card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGEST.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
            </div>
          </div>
          <h2 className="sec">Jump to a tool</h2>
          <div className="card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {QUICK.map((q) => <Link key={q.href} href={q.href} className="seg">{q.label}</Link>)}
            </div>
          </div>
        </div>
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        Key-free demo answers the common questions from the live data. With an API key set, CONCIERGE answers anything using the full program context. In production it runs against the organization&apos;s internal model endpoint, so no project data leaves the tenant. Press <strong>Bernard reads this</strong> on any answer for the narrated avatar version.
      </div>
    </div>
  );
}
