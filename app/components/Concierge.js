"use client";
import { useState, useRef, useEffect } from "react";

const SUGGEST = [
  "What's behind schedule?",
  "Why is Building 17 electrical red?",
  "What does AUGUR do?",
  "How does the RAG trend work?",
];

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "I'm CONCIERGE. Ask me anything about the program or how this platform works." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: next.slice(1, -1) }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.answer || "Sorry, I couldn't answer that." }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network error reaching the assistant." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="concierge-fab" onClick={() => setOpen(!open)} aria-label="Ask CONCIERGE">
        {open ? "×" : "Ask"}
      </button>
      {open && (
        <div className="concierge">
          <div className="concierge-head">
            <span style={{ fontWeight: 700 }}>CONCIERGE</span>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>Q&amp;A · demo data</span>
          </div>
          <div className="concierge-body">
            {msgs.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
            ))}
            {busy && <div className="bubble assistant">…</div>}
            <div ref={endRef} />
          </div>
          {msgs.length <= 1 && (
            <div className="concierge-suggest">
              {SUGGEST.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
          <div className="concierge-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question..."
            />
            <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
