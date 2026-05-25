"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useBernard } from "./Bernard";
import { voiceFor } from "../../lib/presenter";

function AvatarHead({ hue, mouthOpen, blink, speaking }) {
  const mh = 6 + mouthOpen * 26, mw = 34 - mouthOpen * 6;
  return (
    <svg viewBox="0 0 220 220" style={{ width: "100%", height: "100%" }}>
      <defs><radialGradient id="bgA" cx="50%" cy="38%" r="70%"><stop offset="0%" stopColor={hue} stopOpacity="0.18" /><stop offset="100%" stopColor={hue} stopOpacity="0.04" /></radialGradient></defs>
      <rect x="0" y="0" width="220" height="220" rx="16" fill="url(#bgA)" />
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

export default function BernardAvatar() {
  const B = useBernard();
  const [mouth, setMouth] = useState(0);
  const [blink, setBlink] = useState(false);
  const [input, setInput] = useState("");
  const [micS, setMicS] = useState("idle");
  const mouthTimer = useRef(null), blinkTimer = useRef(null), recRef = useRef(null);
  const voice = voiceFor("BERNARD");
  const hue = "#2f4858";

  useEffect(() => { blinkTimer.current = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 3800); return () => clearInterval(blinkTimer.current); }, []);
  const stopMouth = () => { clearInterval(mouthTimer.current); setMouth(0); };
  const startMouth = () => { clearInterval(mouthTimer.current); mouthTimer.current = setInterval(() => setMouth(0.2 + Math.random() * 0.8), 90); };

  const say = useCallback((line) => {
    const synth = typeof window !== "undefined" && window.speechSynthesis; if (!synth || !line) return;
    synth.cancel(); const u = new SpeechSynthesisUtterance(line); u.rate = voice.rate; u.pitch = voice.pitch;
    u.onstart = () => startMouth(); u.onboundary = () => setMouth(0.3 + Math.random() * 0.7); u.onend = () => stopMouth();
    synth.speak(u);
  }, [voice]);

  // speak whenever the provider posts a new speak item
  useEffect(() => { if (B?.avatarOpen && B?.speakItem) say(B.speakItem.text); return () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); stopMouth(); };
    // eslint-disable-next-line
  }, [B?.speakItem?.id, B?.avatarOpen]);

  if (!B || !B.avatarOpen) return null;
  const lastAssistant = [...B.msgs].reverse().find((m) => m.role === "assistant");
  const lastUser = [...B.msgs].reverse().find((m) => m.role === "user");
  const caption = B.speakItem?.text || (lastAssistant && lastAssistant.content) || "";

  const send = (q) => { const t = (q ?? input).trim(); if (!t) return; setInput(""); B.route(t, true); };
  const dictate = async () => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setMicS("unsupported"); return; }
    try { if (navigator.mediaDevices?.getUserMedia) { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); } } catch { setMicS("blocked"); return; }
    const rec = new SR(); rec.lang = "en-US"; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => setMicS("listening");
    rec.onresult = (e) => { setMicS("idle"); send(e.results[0][0].transcript); };
    rec.onerror = (e) => setMicS(e.error === "not-allowed" ? "blocked" : "error");
    rec.onend = () => setMicS((m) => (m === "listening" ? "idle" : m));
    recRef.current = rec; try { rec.start(); } catch { setMicS("error"); }
  };
  const micLabel = { idle: "\ud83c\udf99 Talk", listening: "\u25cf Listening\u2026", blocked: "\ud83c\udf99 Blocked", unsupported: "\ud83c\udf99 N/A", error: "\ud83c\udf99 Retry" }[micS];
  const close = () => { if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); B.setAvatarOpen(false); };

  return (
    <div className="presenter-scrim" onClick={close}>
      <div className="presenter" onClick={(e) => e.stopPropagation()}>
        <div className="presenter-head">
          <span className="eyebrow" style={{ color: hue }}>Bernard · assistant · speaks for every agent</span>
          <button className="chip" onClick={close}>Close</button>
        </div>
        <div className="presenter-body">
          <div className="presenter-stage"><AvatarHead hue={hue} mouthOpen={mouth} blink={blink} speaking={mouth > 0 || B.busy} /></div>
          <div className="presenter-content">
            {lastUser && <div style={{ fontSize: 12, color: "var(--muted)" }}>You: {lastUser.content}</div>}
            <div className="presenter-caption">{B.busy ? "…" : caption}</div>
            <div className="presenter-reply">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to Bernard…" />
              <button className={`voice-btn ${micS === "listening" ? "on" : ""}`} onClick={dictate} title="Talk">{micLabel}</button>
              <button className="btn" onClick={() => send()} disabled={B.busy}>Send</button>
            </div>
            {B.nextLabel && <button className="chip" style={{ marginTop: 8 }} onClick={() => B.deeper(true)}>{B.nextLabel} →</button>}
            {micS === "blocked" && <div className="voice-hint">Mic blocked. Click the lock icon in the address bar, allow microphone, then try again.</div>}
            {micS === "unsupported" && <div className="voice-hint">This browser can't capture speech — use Chrome or Edge, or type.</div>}
          </div>
        </div>
        <div className="presenter-controls">
          <button className="btn" onClick={() => say(caption)}>Replay</button>
          <button className={`voice-btn ${B.voice ? "on" : ""}`} onClick={B.toggleVoice}>{B.voice ? "● Voice on — say anything" : "\ud83c\udf99 Hands-free voice"}</button>
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{B.busy ? "thinking…" : "ready"}</span>
        </div>
        <div className="presenter-foot">In-tenant presenter (browser speech + mic). Production renders this as the NVIDIA ACE / Audio2Face avatar with Riva ASR on tenant GPUs — voice in and out stays in the tenant. One Bernard across the panel, this window, and voice.</div>
      </div>
    </div>
  );
}
