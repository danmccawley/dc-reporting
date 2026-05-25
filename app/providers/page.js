"use client";
import { useState } from "react";
import Link from "next/link";
import { DOMAINS, REGISTRY, MATURITY, providerStats } from "../../lib/providers";

export default function Providers() {
  const [registry, setRegistry] = useState(REGISTRY);
  const native = Object.values(registry).filter((v) => v === "native").length;
  const integrated = DOMAINS.length - native;
  const set = (key, mode) => setRegistry((r) => ({ ...r, [key]: mode }));

  const NATIVE_ROUTE = { records: "/records", schedule: "/plan", cost: "/commitments", field: "/rfis", bim: "/drawings", presenter: "/coach", governance: "/governance" };

  return (
    <div>
      <div className="eyebrow">Platform · provider registry</div>
      <h1 className="title">Integrate or replace — per domain</h1>
      <p className="sub">Every external capability is a swappable provider. Each domain can be served by an <strong>integration</strong> adapter (the tool your teams already use) or by a <strong>native</strong> module built into the platform — chosen per customer and per site. The atomic store and every derivation are provider-agnostic, so switching a domain changes only where records originate, never how anything is computed. Records carry their source provider for full provenance. <strong>Try the toggles</strong> — in production this is an admin setting.</p>

      <div className="grid g3">
        <div className="card"><div className="kpi-cap">{DOMAINS.length}</div><div className="cap-label">Capability domains</div></div>
        <div className="card"><div className="kpi-cap" style={{ color: "#2f6d7d" }}>{native}</div><div className="cap-label">Served natively</div></div>
        <div className="card"><div className="kpi-cap">{integrated}</div><div className="cap-label">Served by integration</div></div>
      </div>

      <h2 className="sec">Domains</h2>
      <div className="grid g2" style={{ alignItems: "start" }}>
        {DOMAINS.map((d) => {
          const mode = registry[d.key]; const m = MATURITY[d.nativeMaturity];
          return (
            <div key={d.key} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>{d.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.c }}>native: {m.label}</span>
              </div>
              <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
                <button className={`seg ${mode === "integration" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => set(d.key, "integration")}>Integrate · {d.incumbent}</button>
                <button className={`seg ${mode === "native" ? "on" : ""}`} style={{ flex: 1 }} onClick={() => set(d.key, "native")} disabled={d.nativeMaturity === "planned"}>Native · {d.native}{d.nativeMaturity === "planned" ? " (planned)" : ""}</button>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{d.note}</div>
              <div style={{ marginTop: 8, fontSize: 12.5 }}>
                <span style={{ color: "var(--muted)" }}>Active provider: </span>
                <span style={{ fontWeight: 600, color: mode === "native" ? "var(--accent)" : "inherit" }}>{mode === "native" ? d.native : d.incumbent}</span>
                <span style={{ color: "var(--muted)" }}> · records tagged </span><span className="mono">{mode === "native" ? "Native" : d.incumbent}</span>
                {mode === "native" && NATIVE_ROUTE[d.key] && <Link href={NATIVE_ROUTE[d.key]} className="scopelink" style={{ marginLeft: 8 }}>open module →</Link>}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="sec">How it works</h2>
      <div className="card">
        <div className="caprow"><span>One provider interface per domain (a contract: what a schedule source, a document source, a cost source must provide)</span><span className="mono">contract</span></div>
        <div className="caprow"><span>Two interchangeable implementations behind it: an integration adapter and a native module</span><span className="mono">adapter | native</span></div>
        <div className="caprow"><span>The core talks only to the interface and never knows which is plugged in</span><span className="mono">agnostic</span></div>
        <div className="caprow"><span>Every record is tagged with the provider that supplied it</span><span className="mono">provenance</span></div>
        <div className="caprow"><span>Choice is per customer, per site, per domain — mixed mode is the default</span><span className="mono">mixed</span></div>
      </div>

      <div className="relnav"><span>Related:</span><Link href="/records">Document control (native)</Link><Link href="/plan">Schedule (native CPM)</Link><Link href="/admin">Admin</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        The native modules are built where the platform has a genuine edge — the live, field-tied CPM schedule and the atomic project record — and integrate with incumbents elsewhere, then flip per domain as each native module matures. Document control is GA today; schedule and cost are native; field and BIM are native-in-progress with adapters available; governance integrates until its native module ships.
      </div>
    </div>
  );
}
