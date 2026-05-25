"use client";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePrefs } from "./Preferences";
import { pageSummary } from "../../lib/context";
import { biBrief, generateFindings, metricCards } from "../../lib/analytics";

const Ctx = createContext(null);
export function useBernard() { return useContext(Ctx); }

function focusBuilding(path) { const m = path && path.match(/\/(?:site|scope\/[^/]+)\/(1[678])/); return m ? m[1] : "17"; }
const LEVEL_LABEL = ["", "More detail", "See the findings", "Root-cause hypotheses", "Down to the entries"];

const INTRO = "I'm Bernard, your assistant. I can summarize any page, analyze the metrics, and speak for the other agents — so you only deal with one voice. Ask me, turn on voice and say \u201cBernard\u201d once to start, or tap a starter.";

export function BernardProvider({ children }) {
  const path = usePathname();
  const { prefs } = usePrefs();
  const [msgs, setMsgs] = useState([{ role: "assistant", content: INTRO }]);
  const [busy, setBusy] = useState(false);
  const [depth, setDepth] = useState(-1);
  const [voice, setVoice] = useState(false);
  const [mic, setMic] = useState("idle"); // idle|listening|blocked|unsupported
  const [heard, setHeard] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [speakItem, setSpeakItem] = useState(null); // {id, text}
  const voiceRef = useRef(false), armedRef = useRef(false), recRef = useRef(null);

  const pushUser = (t) => setMsgs((m) => [...m, { role: "user", content: t }]);
  const doSpeak = useCallback((t) => { setSpeakItem({ id: Date.now() + Math.random(), text: t }); setAvatarOpen(true); }, []);
  const pushAssistant = useCallback((t, speak) => { setMsgs((m) => [...m, { role: "assistant", content: t }]); if (speak) doSpeak(t); }, [doSpeak]);

  const biAtLevel = useCallback((lvl, b) => {
    if (lvl === 1) { const moving = metricCards(b).filter((c) => c.series.length >= 4 && Math.abs(c.trend.pct) >= 6).sort((x, y) => Math.abs(y.trend.pct) - Math.abs(x.trend.pct)).slice(0, 4); return "Key metrics: " + (moving.length ? moving.map((c) => `${c.name} ${c.trend.dir} ${c.trend.pct >= 0 ? "+" : ""}${c.trend.pct.toFixed(0)}% (4-wk avg ${c.avg.toFixed(2)})`).join("; ") : "all within band") + "."; }
    if (lvl === 2) return biBrief(b, 3);
    if (lvl === 3) { const rc = generateFindings(b).find((f) => f.type === "rootcause"); return rc ? (prefs.biFraming === "confident" ? rc.confident : rc.signal) : "No single root cause stands out; the strongest signals are correlations rather than a clear driver."; }
    return "The full detail is on the Business intelligence page, and every finding there drills to the weekly atomic entries it was computed from.";
  }, [prefs.biFraming]);

  const ask = useCallback(async (question, speak = false) => {
    const q = (question || "").trim(); if (!q || busy) return;
    pushUser(q); setBusy(true); setDepth(-1);
    try { const res = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) }); const data = await res.json(); pushAssistant(data.answer || "Sorry, I couldn't answer that.", speak); }
    catch { pushAssistant("Network error reaching the assistant.", speak); }
    finally { setBusy(false); }
  }, [busy, pushAssistant]);

  const summarize = useCallback((speak = false) => {
    const b = focusBuilding(path); const s = pageSummary(path); pushUser("Summarize this page");
    if (prefs.biDelivery === "findings") { const f = generateFindings(b); pushAssistant(s + (f.length ? "\n\nFindings: " + f.slice(0, 5).map((x) => (prefs.biFraming === "confident" ? x.confident : x.signal)).join(" ") : ""), speak); setDepth(99); }
    else if (prefs.biDelivery === "both") { pushAssistant(s + "\n\n" + biAtLevel(2, b), speak); setDepth(2); }
    else { pushAssistant(s + "\n\nWant more detail? I can go deeper — key metrics, then the findings, then root cause, then the entries.", speak); setDepth(0); }
  }, [path, prefs, biAtLevel, pushAssistant]);

  const deeper = useCallback((speak = false) => {
    const b = focusBuilding(path);
    setDepth((d) => { const lvl = Math.min(4, (d < 0 ? 0 : d) + 1); pushUser(LEVEL_LABEL[lvl] || "Go deeper"); pushAssistant(biAtLevel(lvl, b), speak); return lvl; });
  }, [path, biAtLevel, pushAssistant]);

  // route a spoken/typed command to the right action
  const route = useCallback((q, speak) => {
    if (/more detail|go deeper|deeper|tell me more|keep going|go on|continue/i.test(q)) return deeper(speak);
    if (/summari[sz]e|read (this|the) (page|screen)|what'?s on (this|the) (page|screen)|brief me/i.test(q)) return summarize(speak);
    if (/stop listening|stop voice|that'?s all|stand down|never mind/i.test(q)) return stopVoice();
    return ask(q, speak);
  }, [deeper, summarize, ask]);

  const handleHeard = useCallback((t) => {
    setHeard(t); const low = t.toLowerCase();
    if (!armedRef.current) { const i = low.indexOf("bernard"); if (i === -1) return; armedRef.current = true; const rest = t.slice(i + 7).replace(/^[,\s]+/, "").trim(); if (rest) route(rest, true); return; }
    let q = t; const i = low.indexOf("bernard"); if (i !== -1) q = t.slice(i + 7).replace(/^[,\s]+/, "").trim() || t;
    route(q, true);
  }, [route]);

  const stopVoice = useCallback(() => { voiceRef.current = false; armedRef.current = false; setVoice(false); setMic("idle"); try { recRef.current && recRef.current.stop(); } catch {} }, []);
  const startVoice = useCallback(async () => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setMic("unsupported"); return; }
    try { if (navigator.mediaDevices?.getUserMedia) { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((x) => x.stop()); } } catch { setMic("blocked"); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = false; rec.lang = "en-US";
    rec.onstart = () => setMic("listening");
    rec.onresult = (e) => { const r = e.results[e.results.length - 1]; if (r && r[0]) handleHeard(r[0].transcript.trim()); };
    rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { setMic("blocked"); stopVoice(); } };
    rec.onend = () => { if (voiceRef.current) { try { rec.start(); } catch {} } };
    recRef.current = rec; voiceRef.current = true; armedRef.current = false; setVoice(true); setPanelOpen(true);
    try { rec.start(); } catch {}
  }, [handleHeard, stopVoice]);
  const toggleVoice = useCallback(() => { if (voiceRef.current) stopVoice(); else startVoice(); }, [startVoice, stopVoice]);

  useEffect(() => () => { voiceRef.current = false; try { recRef.current && recRef.current.stop(); } catch {} }, []);

  const value = {
    msgs, busy, depth, voice, mic, heard, panelOpen, avatarOpen, speakItem, path,
    setPanelOpen, setAvatarOpen,
    ask, summarize, deeper, route, toggleVoice, stopVoice,
    speak: (t) => doSpeak(t),
    nextLabel: depth >= 0 && depth <= 3 ? (LEVEL_LABEL[depth + 1] || "Go deeper") : null,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
