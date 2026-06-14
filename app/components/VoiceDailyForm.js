"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { buildings, scopes } from "../../lib/mock/data";
import { appendDailyReport } from "../../lib/store";
import { heraldParse } from "../../lib/herald";

const EVENTS = [
  { id: "safety", label: "Safety / near-miss" },
  { id: "ncr", label: "Quality NCR" },
  { id: "delay", label: "Delay / blocker" },
];
const CAUSES = ["RFI / design", "Material delivery", "Weather", "Manpower", "Access / sequencing", "Inspection hold"];
const KEY = "dcr_pending_drafts_v2";

const SYNC = {
  online: ["Online", "g"],
  offline: ["Offline · saved on device", "a"],
  savedOffline: ["Saved offline · syncs on reconnect", "a"],
  syncing: ["Syncing\u2026", "b"],
  synced: ["Submitted \u00b7 entry written to store", "g"],
};

const blank = {
  building: "", zone: "", scope: "", trade: "",
  pct: "", headcount: "", units: "", cause: "RFI / design", notes: "",
};

// Voice-first daily report. The CM talks; HERALD structures the transcript into the
// report fields; the CM confirms; submit writes a real atomic entry to the store,
// from which every downstream report derives. Falls back to fully manual entry when
// speech recognition isn't available (Safari/older browsers) — nothing is gated on voice.
export default function VoiceDailyForm() {
  const [f, setF] = useState(blank);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [mic, setMic] = useState("idle"); // idle | unsupported | blocked | live
  const [structuring, setStructuring] = useState(false);
  const [filled, setFilled] = useState([]);
  const [structured, setStructured] = useState(false);

  const [simOffline, setSimOffline] = useState(false);
  const [sync, setSync] = useState("online");
  const [mounted, setMounted] = useState(false);
  const [netOnline, setNetOnline] = useState(true);

  const recRef = useRef(null);
  const online = mounted ? netOnline && !simOffline : true;

  useEffect(() => {
    setMounted(true);
    setNetOnline(navigator.onLine);
    const on = () => setNetOnline(true);
    const off = () => setNetOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) setMic("unsupported");

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  useEffect(() => { setSync(online ? "online" : "offline"); }, [online]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (id) =>
    setEvents(events.includes(id) ? events.filter((x) => x !== id) : [...events, id]);

  // ---- Voice capture (Web Speech API) ----
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMic("unsupported"); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => { setListening(true); setMic("live"); };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setMic("blocked");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + " ";
        else interimText += chunk;
      }
      if (finalText) setTranscript((t) => (t + finalText).replace(/\s+/g, " "));
      setInterim(interimText);
    };
    recRef.current = rec;
    try { rec.start(); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    setInterim("");
  }, []);

  // ---- HERALD structuring ----
  const structure = useCallback(async () => {
    const text = (transcript + " " + interim).trim();
    if (!text) return;
    setStructuring(true);
    let result;
    try {
      const res = await fetch("/api/herald", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      result = await res.json();
    } catch {
      result = heraldParse(text); // client-side fallback if the route is unreachable
    }
    const s = result.structured || {};
    setF((prev) => ({
      ...prev,
      building: s.building || prev.building,
      zone: s.zone || prev.zone,
      scope: s.scope || prev.scope,
      trade: s.trade || prev.trade,
      pct: s.pct || prev.pct,
      headcount: s.headcount || prev.headcount,
      units: s.units || prev.units,
      cause: s.cause || prev.cause,
      notes: s.notes || text,
    }));
    if (Array.isArray(s.events)) setEvents(s.events);
    setFilled(result.filled || []);
    setStructured(true);
    setStructuring(false);
  }, [transcript, interim]);

  // ---- Photos ----
  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file), tag: "Field" }));
    setPhotos((p) => [...p, ...next]);
  };
  const removePhoto = (i) =>
    setPhotos((p) => { try { URL.revokeObjectURL(p[i].url); } catch {} return p.filter((_, j) => j !== i); });

  const reset = () => {
    photos.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch {} });
    setF(blank); setEvents([]); setPhotos([]);
    setTranscript(""); setInterim(""); setStructured(false); setFilled([]);
  };

  const canSubmit = f.building && f.scope && (f.pct !== "" || f.units !== "");

  const submit = () => {
    if (!canSubmit) return;
    const report = { ...f, events, photos };
    if (online) {
      setSync("syncing");
      setTimeout(() => {
        appendDailyReport(report); // writes the real atomic entry
        setSync("synced");
        setTimeout(reset, 1400);
      }, 700);
    } else {
      // Offline: hold in a device queue, then write on reconnect.
      try {
        const q = JSON.parse(localStorage.getItem(KEY) || "[]");
        q.push(report);
        localStorage.setItem(KEY, JSON.stringify(q));
      } catch {}
      setSync("savedOffline");
      setTimeout(reset, 1400);
    }
  };

  // Flush any offline queue when back online.
  useEffect(() => {
    if (!online) return;
    let q = [];
    try { q = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    if (q.length) {
      q.forEach((r) => appendDailyReport(r));
      try { localStorage.removeItem(KEY); } catch {}
    }
  }, [online]);

  const [label, tone] = SYNC[sync] || SYNC.online;
  const heard = (transcript + " " + interim).trim();
  const isFilled = (k) => filled.includes(k);

  return (
    <div className="field">
      <div className="field-top">
        <div className="field-title">Daily report</div>
        <span className={`pill s-${tone}`} style={{ fontSize: 11 }}>
          <span className={`dot d-${tone}`} />{label}
        </span>
      </div>

      <label className="simrow">
        <span>Simulate offline (demo)</span>
        <input type="checkbox" checked={simOffline} onChange={(e) => setSimOffline(e.target.checked)} />
      </label>

      {/* VOICE CAPTURE — the agent-native front door */}
      <div className="vcap">
        <button
          className={`vcap-mic ${listening ? "on" : ""}`}
          onClick={listening ? stopListening : startListening}
          disabled={mic === "unsupported"}
        >
          {listening ? <><span className="voice-dot" /> Listening — tap to stop</> : "\uD83C\uDF99 Tap and describe your day"}
        </button>
        {mic === "unsupported" && <div className="vcap-hint">Voice needs Chrome, Edge, or Safari. You can also type below.</div>}
        {mic === "blocked" && <div className="vcap-hint">Mic blocked — allow microphone in the address bar, then retry.</div>}

        {(heard || listening) && (
          <div className="vcap-transcript">
            {transcript}<span className="vcap-interim">{interim}</span>
            {!heard && <span className="vcap-placeholder">e.g. &ldquo;Building 17, data hall 2B, LV cabling at 41 percent, crew of 14, pulled 1180 meters. Delay on RFI for penetration details.&rdquo;</span>}
          </div>
        )}

        <div className="vcap-actions">
          <button className="btn" onClick={structure} disabled={!heard || structuring}>
            {structuring ? "HERALD structuring\u2026" : structured ? "Re-structure from voice" : "Structure with HERALD \u2192"}
          </button>
          {heard && <button className="link-btn" onClick={() => { setTranscript(""); setInterim(""); }}>Clear</button>}
        </div>
        {structured && (
          <div className="vcap-note">
            HERALD filled {filled.length} field{filled.length === 1 ? "" : "s"} from what you said. Confirm or correct below, then submit.
          </div>
        )}
      </div>

      <div className="vcap-divider"><span>or enter directly</span></div>

      <label className="f">Building {isFilled("building") && <em className="herald-tag">heard</em>}</label>
      <select value={f.building} onChange={set("building")} className={isFilled("building") ? "herald-fill" : ""}>
        <option value="">Select building\u2026</option>
        {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <label className="f">Zone / area {isFilled("zone") && <em className="herald-tag">heard</em>}</label>
      <input value={f.zone} onChange={set("zone")} placeholder="e.g. Data hall 2B" className={isFilled("zone") ? "herald-fill" : ""} />

      <label className="f">Scope {isFilled("scope") && <em className="herald-tag">heard</em>}</label>
      <select value={f.scope} onChange={set("scope")} className={isFilled("scope") ? "herald-fill" : ""}>
        <option value="">Select scope\u2026</option>
        {scopes.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>

      <label className="f">Trade / crew {isFilled("trade") && <em className="herald-tag">heard</em>}</label>
      <input value={f.trade} onChange={set("trade")} placeholder="e.g. LV / structured cabling" className={isFilled("trade") ? "herald-fill" : ""} />

      <div className="two">
        <div>
          <label className="f">% complete {isFilled("pct") && <em className="herald-tag">heard</em>}</label>
          <input className={`mono ${isFilled("pct") ? "herald-fill" : ""}`} value={f.pct} onChange={set("pct")} inputMode="numeric" placeholder="0\u2013100" />
        </div>
        <div>
          <label className="f">Headcount {isFilled("headcount") && <em className="herald-tag">heard</em>}</label>
          <input className={`mono ${isFilled("headcount") ? "herald-fill" : ""}`} value={f.headcount} onChange={set("headcount")} inputMode="numeric" placeholder="14" />
        </div>
      </div>

      <label className="f">Units installed today {isFilled("units") && <em className="herald-tag">heard</em>}</label>
      <input className={`mono ${isFilled("units") ? "herald-fill" : ""}`} value={f.units} onChange={set("units")} inputMode="numeric" placeholder="e.g. 1180" />

      <label className="f">Photos (camera) — feeds SCOUT</label>
      <div className="photos">
        <label className="photo-add">
          <span className="cam">+</span>
          <span style={{ fontSize: 12 }}>Capture</span>
          <input type="file" accept="image/*" capture="environment" multiple onChange={addPhotos} hidden />
        </label>
        {photos.map((p, i) => (
          <span key={i} className="thumb" onClick={() => removePhoto(i)} title="Tap to remove">
            <img src={p.url} alt={p.name} />
            <span className="x">\u00d7</span>
          </span>
        ))}
      </div>

      <label className="f">Events {isFilled("events") && <em className="herald-tag">heard</em>}</label>
      <div className="chips">
        {EVENTS.map((ev) => (
          <span key={ev.id} className={`chip ${events.includes(ev.id) ? "sel" : ""}`} onClick={() => toggle(ev.id)}>
            {ev.label}
          </span>
        ))}
      </div>

      {events.includes("delay") && (
        <>
          <label className="f">Delay cause code {isFilled("cause") && <em className="herald-tag">heard</em>}</label>
          <select value={f.cause} onChange={set("cause")} className={isFilled("cause") ? "herald-fill" : ""}>
            {CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </>
      )}

      <label className="f">Notes (read by HERALD)</label>
      <textarea value={f.notes} onChange={set("notes")} placeholder="What happened, constraints, what's needed tomorrow..." />

      <div className="field-actions">
        <button className="btn big" onClick={submit} disabled={!canSubmit}>
          {online ? "Submit report" : "Save draft (offline)"}
        </button>
      </div>
      <div className="field-foot">
        {!canSubmit
          ? "Building, scope, and a quantity (% or units) are needed to submit."
          : online
          ? "Submits and writes one atomic entry. Every downstream report derives from it."
          : "No signal — saved on this device, writes to the store automatically on reconnect."}
      </div>
    </div>
  );
}
