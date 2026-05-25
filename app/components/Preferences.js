"use client";
import { createContext, useContext, useEffect, useState } from "react";

const DEFAULTS = { biDelivery: "tiered", biFraming: "signals" }; // prototype defaults
const PrefCtx = createContext({ prefs: DEFAULTS, setPref: () => {} });

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  useEffect(() => { try { const r = localStorage.getItem("dcr_prefs"); if (r) setPrefs({ ...DEFAULTS, ...JSON.parse(r) }); } catch {} }, []);
  const setPref = (k, v) => setPrefs((p) => { const n = { ...p, [k]: v }; try { localStorage.setItem("dcr_prefs", JSON.stringify(n)); } catch {} return n; });
  return <PrefCtx.Provider value={{ prefs, setPref }}>{children}</PrefCtx.Provider>;
}
export function usePrefs() { return useContext(PrefCtx); }

export const BI_DELIVERY = [
  { key: "tiered", label: "Tiered drill", desc: "Summary first, then ask before going deeper." },
  { key: "findings", label: "Findings list", desc: "Show all findings at once." },
  { key: "both", label: "Both", desc: "Summary plus the findings list together." },
];
export const BI_FRAMING = [
  { key: "signals", label: "Signals to investigate", desc: "Cautious; evidence attached, no causal claims." },
  { key: "confident", label: "Confident calls", desc: "Direct reads where the data supports them." },
  { key: "both", label: "Both framings", desc: "Show the cautious and the confident read." },
];
