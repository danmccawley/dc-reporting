"use client";
import { useState } from "react";
import { useRole } from "../components/RoleProvider";
import { ROLES, ROLE_LABEL, CAPS } from "../../lib/roles";
import { users as seedUsers, integrations, atomicStats, workedExample } from "../../lib/mock/data";

export default function Admin() {
  const { role } = useRole();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(seedUsers);

  if (role !== "ADMIN") {
    return (
      <div>
        <div className="eyebrow">Administration</div>
        <h1 className="title">Admin console</h1>
        <div className="notice">Access restricted. Only the Platform Administrator can manage users, roles, and integrations. Switch the role in the top bar to Platform Administrator to view this in the demo.</div>
      </div>
    );
  }

  const setUserRole = (email, r) => setUsers((u) => u.map((x) => (x.email === email ? { ...x, role: r } : x)));

  return (
    <div>
      <div className="eyebrow">Administration</div>
      <h1 className="title">Admin console</h1>
      <p className="sub">Assign profiles and roles, review what each role can do, and manage the data-source integrations that feed the platform.</p>

      <div className="maptabs">
        <button className={`tabbtn ${tab === "users" ? "on" : ""}`} onClick={() => setTab("users")}>Users &amp; roles</button>
        <button className={`tabbtn ${tab === "perms" ? "on" : ""}`} onClick={() => setTab("perms")}>Permissions</button>
        <button className={`tabbtn ${tab === "integ" ? "on" : ""}`} onClick={() => setTab("integ")}>Integrations</button>
        <button className={`tabbtn ${tab === "model" ? "on" : ""}`} onClick={() => setTab("model")}>Data model</button>
      </div>

      {tab === "users" && (
        <div className="card">
          <div className="vhead"><span style={{ flex: 2 }}>User</span><span style={{ flex: 2 }}>Assigned role / profile</span></div>
          {users.map((u) => (
            <div key={u.email} className="vrow">
              <span style={{ flex: 2 }}><span style={{ fontWeight: 600 }}>{u.name}</span><span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 8 }}>@{u.email}</span></span>
              <span style={{ flex: 2 }}>
                <select value={u.role} onChange={(e) => setUserRole(u.email, e.target.value)} style={{ maxWidth: 320 }}>
                  {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </span>
            </div>
          ))}
          <div className="notice" style={{ marginTop: 12 }}>Changing a role here updates that user&apos;s permissions immediately (simulated in the prototype). In production this is backed by enterprise SSO group mapping.</div>
        </div>
      )}

      {tab === "perms" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="permtable">
            <thead>
              <tr><th>Capability</th>{ROLES.map((r) => <th key={r.key}>{r.label}</th>)}</tr>
            </thead>
            <tbody>
              {CAPS.map((c) => (
                <tr key={c.key}>
                  <td>{c.label}</td>
                  {ROLES.map((r) => <td key={r.key} style={{ textAlign: "center" }}>{c.roles[r.key] ? <span style={{ color: "#5a8a1f", fontWeight: 700 }}>●</span> : <span style={{ color: "var(--faint)" }}>—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "integ" && (
        <div className="card">
          <div className="notice" style={{ marginBottom: 12 }}>The platform sits above the field-execution tools and ingests from them — it does not replace them. The web app stays the owner&apos;s system of record.</div>
          {integrations.map((it) => (
            <div key={it.name} className="vrow">
              <span style={{ flex: 2 }}><span style={{ fontWeight: 600 }}>{it.name}</span><span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 8 }}>{it.kind}</span></span>
              <span style={{ flex: 3, color: "var(--muted)", fontSize: 13 }}>{it.ingests}</span>
              <span style={{ width: 110, textAlign: "right" }}>
                {it.status === "Connected"
                  ? <span className="pill s-g"><span className="dot d-g" />Connected</span>
                  : <span className="pill s-a"><span className="dot d-a" />Available</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "model" && (() => {
        const st = atomicStats();
        const ex = workedExample();
        const m = (x) => `$${x.toFixed(2)}M`;
        return (
          <div>
            <div className="notice" style={{ marginBottom: 12 }}>One atomic store of dated, tagged entries is the single source of truth. Progress, cost, capacity, commissioning, and KPIs are all computed from it — nothing derived is stored.</div>
            <div className="grid g4" style={{ marginBottom: 16 }}>
              <div className="card"><div className="cap-label">Atomic entries</div><div className="kpi-cap">{st.total}</div></div>
              <div className="card"><div className="cap-label">Progress + labor</div><div className="kpi-cap">{st.progress}</div></div>
              <div className="card"><div className="cap-label">KPI readings</div><div className="kpi-cap">{st.kpi}</div></div>
              <div className="card"><div className="cap-label">Capacity + Cx events</div><div className="kpi-cap">{st.capacity + st.cx}</div></div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Worked example — {ex.label}</div>
              <div className="vhead"><span style={{ flex: 2 }}>Entry (by day)</span><span className="vcol">Installed</span><span className="vcol">Labor</span></div>
              {ex.rows.map((r, i) => (
                <div key={i} className="vrow">
                  <span style={{ flex: 2 }}>{r.date}{r.baseline ? <span style={{ color: "var(--faint)", fontSize: 12, marginLeft: 8 }}>baseline</span> : ""}</span>
                  <span className="vcol mono">{r.installed} pts</span>
                  <span className="vcol mono">{m(r.labor)}</span>
                </div>
              ))}
              <div className="notice" style={{ marginTop: 12 }}>
                Summed: percent complete = <strong>{ex.pct}%</strong> → earned value = budget {m(ex.bac)} × {ex.pct}% = <strong>{m(ex.ev)}</strong>; actual = summed labor = <strong>{m(ex.ac)}</strong>; CPI = earned ÷ actual = <strong>{ex.cpi.toFixed(2)}</strong>. Change any entry and the heat map, cost, and rollups all move together.
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
