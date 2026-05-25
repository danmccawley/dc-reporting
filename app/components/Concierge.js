"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBernard } from "./Bernard";

const SUGGEST = ["Summarize this page", "What's behind schedule?", "Why is Building 17 electrical red?", "What does AUGUR do?"];
const HIDE = ["/login", "/start", "/mobile"];

export default function Concierge() {
  const B = useBernard();
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [B?.msgs, B?.panelOpen]);
  if (!B || HIDE.includes(B.path)) return null;

  const send = (q) => { const t = (q ?? input).trim(); if (!t) return; setInput(""); B.ask(t, false); };

  return (
    <>
      <button className="concierge-fab" onClick={() => B.setPanelOpen(!B.panelOpen)} aria-label="Ask Bernard">{B.panelOpen ? "\u00d7" : "Ask"}</button>
      {B.panelOpen && (
        <div className="concierge">
          <div className="concierge-head">
            <Link href="/assistant" className="concierge-title">Bernard <span style={{ fontSize: 11, fontWeight: 400, color: "var(--accent)" }}>open \u2197</span></Link>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>your assistant</span>
          </div>
          <div className="concierge-body">
            {B.msgs.map((m, i) => (
              <div key={i}>
                <div className={`bubble ${m.role}`}>{m.content}</div>
                {m.role === "assistant" && <div className="bubble-actions"><button className="chip" onClick={() => B.speak(m.content)}>\u25b6 Bernard reads this</button></div>}
              </div>
            ))}
            {B.busy && <div className="bubble assistant">\u2026</div>}
            <div ref={endRef} />
          </div>
          <div className="voice-row">
            <button className={`voice-btn ${B.voice ? "on" : ""}`} onClick={B.toggleVoice}>{B.voice ? <><span className="voice-dot" /> Listening… say “Bernard” once</> : "\ud83c\udf99 Voice mode"}</button>
            <button className="chip" onClick={() => B.summarize(false)}>Summarize this page</button>
            {B.nextLabel && <button className="chip" onClick={() => B.deeper(false)}>{B.nextLabel} →</button>}
            {B.mic === "unsupported" && <span className="voice-hint">Voice needs Chrome or Edge.</span>}
            {B.mic === "blocked" && <span className="voice-hint">Mic blocked — click the lock icon, allow microphone, retry.</span>}
            {B.voice && B.heard && <span className="voice-hint">heard: “{B.heard}”</span>}
          </div>
          {B.msgs.length <= 1 && (
            <div className="concierge-suggest">
              {SUGGEST.map((s) => <button key={s} className="chip" onClick={() => (s === "Summarize this page" ? B.summarize(false) : send(s))}>{s}</button>)}
            </div>
          )}
          <div className="concierge-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask Bernard…" />
            <button className="btn" onClick={() => send()} disabled={B.busy}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
