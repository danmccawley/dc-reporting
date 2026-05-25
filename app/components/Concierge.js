"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Presenter from "./Presenter";
import { pageSummary } from "../../lib/context";
import { biBrief, generateFindings, metricCards } from "../../lib/analytics";
import { usePrefs } from "./Preferences";

// Pull the building in focus from the path (default the program's at-risk one).
function focusBuilding(path) { const m = path && path.match(/\/(?:site|scope\/[^/]+)\/(1[678])/); return m ? m[1] : "17"; }

const SUGGEST = [
  "Summarize this page",
  "What's behind schedule?",
  "Why is Building 17 electrical red?",
  "What does AUGUR do?",
];
const HIDE = ["/login", "/start", "/mobile"];

export default function Concierge() {
  const path = usePathname();
  const { prefs } = usePrefs();
  const [open, setOpen] = useState(false);
  const [depth, setDepth] = useState(0);
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "I'm Bernard, your assistant. I can summarize any page, answer anything about the program, and speak for the other agents — so you only deal with one voice. Ask me, or turn on voice and just say “Bernard…”." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speak, setSpeak] = useState(null);
  const [voice, setVoice] = useState(false);
  const [heard, setHeard] = useState("");
  const [voiceOk, setVoiceOk] = useState(true);
  const endRef = useRef(null);
  const recogRef = useRef(null);
  const voiceRef = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = useCallback(async (text, autospeak = false) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, history: next.slice(1, -1) }) });
      const data = await res.json();
      const answer = data.answer || "Sorry, I couldn't answer that.";
      setMsgs((m) => [...m, { role: "assistant", content: answer }]);
      if (autospeak || voiceRef.current) setSpeak(answer);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network error reaching the assistant." }]);
    } finally { setBusy(false); }
  }, [input, busy, msgs]);

  // Tiered business-intelligence drill. Level 1 = page summary, then key metrics,
  // findings, root cause, raw entries. Honors the delivery preference.
  const LEVEL_LABEL = ["", "More detail", "See the findings", "Root-cause hypotheses", "Down to the entries"];
  const biAtLevel = (lvl, b) => {
    if (lvl === 1) {
      const cards = metricCards(b).filter((c) => c.series.length >= 4);
      const moving = cards.filter((c) => Math.abs(c.trend.pct) >= 6).sort((x, y) => Math.abs(y.trend.pct) - Math.abs(x.trend.pct)).slice(0, 4);
      return "Key metrics: " + (moving.length ? moving.map((c) => `${c.name} ${c.trend.dir} ${c.trend.pct >= 0 ? "+" : ""}${c.trend.pct.toFixed(0)}% (4-wk avg ${c.avg.toFixed(2)})`).join("; ") : "all within band") + ".";
    }
    if (lvl === 2) return biBrief(b, 3);
    if (lvl === 3) { const rc = generateFindings(b).find((f) => f.type === "rootcause"); return rc ? (prefs.biFraming === "confident" ? rc.confident : rc.signal) : "No single root cause stands out; the strongest signals are correlations rather than a clear driver."; }
    return "The full detail lives on the Business intelligence page, and every finding there drills to the weekly atomic entries it was computed from.";
  };

  const pushAssistant = (content, speakToo) => { setMsgs((m) => [...m, { role: "assistant", content }]); if (speakToo || voiceRef.current) setSpeak(content); };

  const summarize = () => {
    const b = focusBuilding(path);
    const s = pageSummary(path);
    setMsgs((m) => [...m, { role: "user", content: "Summarize this page" }]);
    if (prefs.biDelivery === "findings") {
      const f = generateFindings(b);
      pushAssistant(s + (f.length ? "\n\nFindings: " + f.slice(0, 5).map((x) => (prefs.biFraming === "confident" ? x.confident : x.signal)).join(" ") : ""));
      setDepth(99);
    } else if (prefs.biDelivery === "both") {
      pushAssistant(s + "\n\n" + biAtLevel(2, b));
      setDepth(2);
    } else {
      pushAssistant(s + "\n\nWant more detail? I can go deeper — key metrics, then the BI findings, then root cause, then the entries.");
      setDepth(0);
    }
  };

  const deeper = () => {
    const b = focusBuilding(path);
    const lvl = Math.min(4, depth + 1);
    setMsgs((m) => [...m, { role: "user", content: LEVEL_LABEL[lvl] || "Go deeper" }]);
    pushAssistant(biAtLevel(lvl, b));
    setDepth(lvl);
  };

  // Hands-free wake-word voice mode (say "Bernard ...").
  const handleHeard = useCallback((t) => {
    setHeard(t);
    const low = t.toLowerCase();
    const i = low.indexOf("bernard");
    if (i === -1) return; // require the wake word
    let q = t.slice(i + "bernard".length).replace(/^[,\s]+/, "").trim();
    if (/more detail|go deeper|deeper|tell me more|go on/i.test(q)) { deeper(); return; }
    if (/summari[sz]e|read this page|what'?s on (this|the) (page|screen)/i.test(q) || !q) { summarize(); return; }
    setOpen(true);
    send(q, true);
  }, [send, path]);

  const stopVoice = useCallback(() => {
    voiceRef.current = false; setVoice(false);
    try { recogRef.current && recogRef.current.stop(); } catch {}
  }, []);

  const startVoice = useCallback(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setVoiceOk(false); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = (e) => { const r = e.results[e.results.length - 1]; if (r && r[0]) handleHeard(r[0].transcript.trim()); };
    rec.onerror = () => {};
    rec.onend = () => { if (voiceRef.current) { try { rec.start(); } catch {} } };
    recogRef.current = rec;
    voiceRef.current = true; setVoice(true); setOpen(true);
    try { rec.start(); } catch {}
  }, [handleHeard]);

  useEffect(() => () => { voiceRef.current = false; try { recogRef.current && recogRef.current.stop(); } catch {} }, []);

  if (HIDE.includes(path)) return null;

  return (
    <>
      <button className="concierge-fab" onClick={() => setOpen(!open)} aria-label="Ask Bernard">{open ? "×" : "Ask"}</button>
      {open && (
        <div className="concierge">
          <div className="concierge-head">
            <Link href="/assistant" className="concierge-title">Bernard <span style={{ fontSize: 11, fontWeight: 400, color: "var(--accent)" }}>open ↗</span></Link>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>your assistant</span>
          </div>
          <div className="concierge-body">
            {msgs.map((m, i) => (
              <div key={i}>
                <div className={`bubble ${m.role}`}>{m.content}</div>
                {m.role === "assistant" && (
                  <div className="bubble-actions"><button className="chip" onClick={() => setSpeak(m.content)}>▶ Bernard reads this</button></div>
                )}
              </div>
            ))}
            {busy && <div className="bubble assistant">…</div>}
            <div ref={endRef} />
          </div>
          <div className="voice-row">
            <button className={`voice-btn ${voice ? "on" : ""}`} onClick={() => (voice ? stopVoice() : startVoice())}>
              {voice ? <><span className="voice-dot" /> Listening… say “Bernard”</> : "🎙 Voice mode"}
            </button>
            <button className="chip" onClick={summarize}>Summarize this page</button>
            {depth >= 0 && depth <= 3 && <button className="chip" onClick={deeper}>{LEVEL_LABEL[depth + 1] || "Go deeper"} →</button>}
            {!voiceOk && <span className="voice-hint">Voice input isn't supported in this browser.</span>}
            {voice && heard && <span className="voice-hint">heard: “{heard}”</span>}
          </div>
          {msgs.length <= 1 && (
            <div className="concierge-suggest">
              {SUGGEST.map((s) => <button key={s} className="chip" onClick={() => (s === "Summarize this page" ? summarize() : send(s))}>{s}</button>)}
            </div>
          )}
          <div className="concierge-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask Bernard…" />
            <button className="btn" onClick={() => send()} disabled={busy}>Send</button>
          </div>
        </div>
      )}
      {speak && <Presenter mode="reply" text={speak} agent="BERNARD" onClose={() => setSpeak(null)} />}
    </>
  );
}
