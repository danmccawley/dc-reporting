"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { personaFor, voiceFor } from "../../lib/presenter";

function AvatarHead({ hue, mouthOpen, blink, speaking }) {
  const mh = 6 + mouthOpen * 26, mw = 34 - mouthOpen * 6;
  return (
    <svg viewBox="0 0 220 220" style={{ width: "100%", height: "100%" }}>
      <defs><radialGradient id="bg" cx="50%" cy="38%" r="70%"><stop offset="0%" stopColor={hue} stopOpacity="0.18" /><stop offset="100%" stopColor={hue} stopOpacity="0.04" /></radialGradient></defs>
      <rect x="0" y="0" width="220" height="220" rx="16" fill="url(#bg)" />
      {speaking && <circle cx="110" cy="112" r="78" fill="none" stroke={hue} strokeOpacity="0.35" strokeWidth="2" />}
      <rect x="86" y="150" width="48" height="40" rx="14" fill="#d8c3a8" />
      <path d="M50 210 Q110 150 170 210 Z" fill={hue} opacity="0.9" />
      <ellipse cx="110" cy="100" rx="56" ry="62" fill="#e7cdb0" />
      <path d="M54 92 Q58 40 110 40 Q162 40 166 92 Q150 70 110 70 Q70 70 54 92 Z" fill="#3a2e25" />
      <ellipse cx="88" cy="96" rx="8" ry={blink ? 1.2 : 7} fill="#2b2722" />
      <ellipse cx="132" cy="96" rx="8" ry={blink ? 1.2 : 7} fill="#2b2722" />
      <rect x="79" y="80" width="18" height="3.5" rx="2" fill="#3a2e25" />
      <rect x="123" y="80" width="18" height="3.5" rx="2" fill="#3a2e25" />
      <path d="M110 100 L104 118 Q110 122 116 118 Z" fill="#d8b48f" />
      <ellipse cx="110" cy="134" rx={mw / 2} ry={mh / 2} fill="#7d3b3b" />
      {mouthOpen > 0.25 && <ellipse cx="110" cy={134 - mh / 6} rx={mw / 2.6} ry={mh / 5} fill="#fff" opacity="0.85" />}
    </svg>
  );
}

export default function Presenter({ mode = "class", deck = null, text = "", agent = "CONCIERGE", onClose }) {
  const persona = personaFor(agent);
  const isClass = mode === "class" && deck;
  const beats = isClass ? deck.beats : [];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mouth, setMouth] = useState(0);
  const [blink, setBlink] = useState(false);
  const [supported, setSupported] = useState(true);

  // conversation state (reply mode)
  const [live, setLive] = useState(text);
  const [lastUser, setLastUser] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mic, setMic] = useState("idle"); // idle|listening|blocked|unsupported|error
  const recRef = useRef(null);
  const mouthTimer = useRef(null), blinkTimer = useRef(null);
  const voice = voiceFor(isClass ? deck.persona : agent);

  useEffect(() => { blinkTimer.current = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 3800); return () => clearInterval(blinkTimer.current); }, []);
  const stopMouth = () => { clearInterval(mouthTimer.current); setMouth(0); };
  const startMouth = () => { clearInterval(mouthTimer.current); mouthTimer.current = setInterval(() => setMouth(0.2 + Math.random() * 0.8), 90); };

  const say = useCallback((line, onEnd) => {
    const synth = typeof window !== "undefined" && window.speechSynthesis;
    if (!synth) { setSupported(false); onEnd && onEnd(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.rate = voice.rate; u.pitch = voice.pitch;
    u.onstart = () => startMouth();
    u.onboundary = () => setMouth(0.3 + Math.random() * 0.7);
    u.onend = () => { stopMouth(); onEnd && onEnd(); };
    synth.speak(u);
  }, [voice]);

  // class mode: narrate current beat, auto-advance when playing
  useEffect(() => {
    if (!isClass || !playing) return;
    say(beats[idx]?.narration || "", () => { if (idx < beats.length - 1) setIdx(idx + 1); else setPlaying(false); });
    return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); stopMouth(); };
    // eslint-disable-next-line
  }, [playing, idx, isClass]);

  // reply mode: speak the opening line once
  useEffect(() => { if (!isClass) { setLive(text); say(text); } return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); stopMouth(); };
    // eslint-disable-next-line
  }, []);

  const ask = useCallback(async (q) => {
    const question = (q ?? input).trim(); if (!question || busy) return;
    setLastUser(question); setInput(""); setBusy(true); setLive("…");
    try {
      const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const data = await res.json();
      const a = data.answer || "Sorry, I couldn't answer that.";
      setLive(a); say(a);
    } catch { const e = "Network error reaching the assistant."; setLive(e); say(e); }
    finally { setBusy(false); }
  }, [input, busy, say]);

  // one-shot mic dictation with explicit permission + status
  const dictate = useCallback(async () => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setMic("unsupported"); return; }
    try { if (navigator.mediaDevices?.getUserMedia) { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); } }
    catch { setMic("blocked"); return; }
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => setMic("listening");
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setMic("idle"); ask(t); };
    rec.onerror = (e) => setMic(e.error === "not-allowed" || e.error === "service-not-allowed" ? "blocked" : "error");
    rec.onend = () => setMic((m) => (m === "listening" ? "idle" : m));
    recRef.current = rec; try { rec.start(); } catch { setMic("error"); }
  }, [ask]);

  const beat = isClass ? beats[idx] : null;
  const go = (n) => { const ni = Math.max(0, Math.min(beats.length - 1, n)); if (window.speechSynthesis) window.speechSynthesis.cancel(); stopMouth(); setIdx(ni); if (playing) say(beats[ni]?.narration || ""); };
  const toggle = () => { if (playing) { if (window.speechSynthesis) window.speechSynthesis.cancel(); stopMouth(); setPlaying(false); } else setPlaying(true); };
  const micLabel = { idle: "🎙 Talk", listening: "● Listening…", blocked: "🎙 Mic blocked", unsupported: "🎙 N/A", error: "🎙 Retry" }[mic];

  return (
    <div className="presenter-scrim" onClick={onClose}>
      <div className="presenter" onClick={(e) => e.stopPropagation()}>
        <div className="presenter-head">
          <span className="eyebrow" style={{ color: persona.hue }}>{persona.name} · {persona.role}</span>
          <button className="chip" onClick={onClose}>Close</button>
        </div>
        <div className="presenter-body">
          <div className="presenter-stage"><AvatarHead hue={persona.hue} mouthOpen={mouth} blink={blink} speaking={playing || busy || mouth > 0} /></div>
          <div className="presenter-content">
            {isClass && <div className="eyebrow">{beat.heading}</div>}
            {isClass && beat.points && beat.points.map((p, i) => <div key={i} style={{ fontSize: 16, fontWeight: 600, margin: "4px 0" }}>{p}</div>)}
            {!isClass && lastUser && <div style={{ fontSize: 12, color: "var(--muted)" }}>You asked: {lastUser}</div>}
            <div className="presenter-caption">{isClass ? beat.narration : live}</div>
            {isClass && beat.action && <Link href={beat.action.href} className="scopelink" onClick={onClose}>{beat.action.label} →</Link>}
            {!isClass && (
              <div className="presenter-reply">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Reply to Bernard…" />
                <button className={`voice-btn ${mic === "listening" ? "on" : ""}`} onClick={dictate} title="Talk">{micLabel}</button>
                <button className="btn" onClick={() => ask()} disabled={busy}>Send</button>
              </div>
            )}
            {!isClass && mic === "blocked" && <div className="voice-hint">Microphone is blocked. Click the lock icon in the address bar → allow microphone, then try again.</div>}
            {!isClass && mic === "unsupported" && <div className="voice-hint">This browser can't capture speech. Use Chrome or Edge, or type your reply.</div>}
          </div>
        </div>
        <div className="presenter-controls">
          {isClass && <>
            <button className="btn" onClick={toggle}>{playing ? "Pause" : "Play"}</button>
            <button className="seg" onClick={() => go(idx - 1)} disabled={idx === 0}>Prev</button>
            <button className="seg" onClick={() => go(idx + 1)} disabled={idx === beats.length - 1}>Next</button>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{idx + 1} / {beats.length}</span>
          </>}
          {!isClass && <>
            <button className="btn" onClick={() => say(live)}>Replay</button>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{busy ? "thinking…" : "ready"}</span>
          </>}
        </div>
        <div className="presenter-foot">
          In-tenant presenter (browser speech engine + mic). Production renders this as the NVIDIA ACE / Audio2Face avatar with Riva ASR on tenant GPUs — voice in and out stays in the tenant.{!supported && " Your browser has no speech engine; captions only."}
        </div>
      </div>
    </div>
  );
}
