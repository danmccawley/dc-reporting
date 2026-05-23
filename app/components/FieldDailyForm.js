"use client";
import { useEffect, useState, useCallback } from "react";
import { buildings, scopes } from "../../lib/mock/data";

const EVENTS = [
  { id: "safety", label: "Safety / near-miss" },
  { id: "ncr", label: "Quality NCR" },
  { id: "delay", label: "Delay / blocker" },
];
const CAUSES = ["RFI / design", "Material delivery", "Weather", "Manpower", "Access / sequencing", "Inspection hold"];
const KEY = "dcr_pending_drafts";

const SYNC = {
  online: ["Online", "g"],
  offline: ["Offline · drafts saved on device", "a"],
  savedOffline: ["Saved offline · will sync on reconnect", "a"],
  syncing: ["Syncing\u2026", "b"],
  synced: ["Synced", "g"],
};

const blank = {
  building: "17", zone: "", scope: "lv-cabling", trade: "",
  pct: "", headcount: "", units: "", cause: "RFI / design", notes: "",
};

export default function FieldDailyForm() {
  const [f, setF] = useState(blank);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [simOffline, setSimOffline] = useState(false);
  const [pending, setPending] = useState([]);
  const [sync, setSync] = useState("online");
  const [mounted, setMounted] = useState(false);
  const [netOnline, setNetOnline] = useState(true);

  const online = mounted ? netOnline && !simOffline : true;

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPending(JSON.parse(raw));
    } catch {}
    setNetOnline(navigator.onLine);
    const on = () => setNetOnline(true);
    const off = () => setNetOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const persist = (q) => {
    try { localStorage.setItem(KEY, JSON.stringify(q)); } catch {}
  };
  useEffect(() => { if (online) setSync(pending.length ? "syncing" : "online"); else setSync("offline"); }, [online]); // eslint-disable-line

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (id) =>
    setEvents(events.includes(id) ? events.filter((x) => x !== id) : [...events, id]);

  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
  };
  const removePhoto = (i) =>
    setPhotos((p) => { try { URL.revokeObjectURL(p[i].url); } catch {} return p.filter((_, j) => j !== i); });

  const reset = () => {
    photos.forEach((p) => { try { URL.revokeObjectURL(p.url); } catch {} });
    setF(blank); setEvents([]); setPhotos([]);
  };

  const syncNow = useCallback(() => {
    if (!pending.length) return;
    setSync("syncing");
    setTimeout(() => { setPending([]); persist([]); setSync("synced"); }, 1100);
  }, [pending]);

  useEffect(() => { if (online && pending.length) syncNow(); }, [online]); // eslint-disable-line

  const submit = () => {
    const entry = { ...f, events, photos: photos.length, ts: Date.now() };
    if (online) {
      setSync("syncing");
      setTimeout(() => { setSync("synced"); reset(); }, 900);
    } else {
      const q = [...pending, entry];
      setPending(q); persist(q); setSync("savedOffline"); reset();
    }
  };

  const [label, tone] = SYNC[sync] || SYNC.online;

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

      {pending.length > 0 && (
        <div className="pendbar">
          {pending.length} draft{pending.length > 1 ? "s" : ""} waiting to sync
          {online && <button className="link-btn" onClick={syncNow}>Sync now</button>}
        </div>
      )}

      <label className="f">Building</label>
      <select value={f.building} onChange={set("building")}>
        {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <label className="f">Zone / area</label>
      <input value={f.zone} onChange={set("zone")} placeholder="e.g. Data hall 2B" />

      <label className="f">Scope</label>
      <select value={f.scope} onChange={set("scope")}>
        {scopes.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>

      <label className="f">Trade / crew</label>
      <input value={f.trade} onChange={set("trade")} placeholder="e.g. LV / structured cabling" />

      <div className="two">
        <div>
          <label className="f">% complete</label>
          <input className="mono" value={f.pct} onChange={set("pct")} inputMode="numeric" placeholder="0–100" />
        </div>
        <div>
          <label className="f">Headcount</label>
          <input className="mono" value={f.headcount} onChange={set("headcount")} inputMode="numeric" placeholder="14" />
        </div>
      </div>

      <label className="f">Units installed today</label>
      <input className="mono" value={f.units} onChange={set("units")} inputMode="numeric" placeholder="e.g. 1180 m" />

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
            <span className="x">×</span>
          </span>
        ))}
      </div>

      <label className="f">Events</label>
      <div className="chips">
        {EVENTS.map((ev) => (
          <span key={ev.id} className={`chip ${events.includes(ev.id) ? "sel" : ""}`} onClick={() => toggle(ev.id)}>
            {ev.label}
          </span>
        ))}
      </div>

      {events.includes("delay") && (
        <>
          <label className="f">Delay cause code</label>
          <select value={f.cause} onChange={set("cause")}>
            {CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </>
      )}

      <label className="f">Notes (read by HERALD)</label>
      <textarea value={f.notes} onChange={set("notes")} placeholder="What happened, constraints, what's needed tomorrow..." />

      <div className="field-actions">
        <button className="btn big" onClick={submit}>
          {online ? "Submit report" : "Save draft (offline)"}
        </button>
      </div>
      <div className="field-foot">
        {online
          ? "Submits and syncs immediately."
          : "No signal — saved on this device and synced automatically when you reconnect."}
      </div>
    </div>
  );
}
