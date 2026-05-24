"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ROLES } from "../../lib/roles";

const RoleContext = createContext({ role: "ADMIN", setRole: () => {} });

export function RoleProvider({ children }) {
  const [role, setRole] = useState("ADMIN");
  useEffect(() => {
    try { const r = localStorage.getItem("dcr_role"); if (r) setRole(r); } catch {}
  }, []);
  const update = (r) => { setRole(r); try { localStorage.setItem("dcr_role", r); } catch {} };
  return <RoleContext.Provider value={{ role, setRole: update }}>{children}</RoleContext.Provider>;
}

export function useRole() { return useContext(RoleContext); }

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <span className="roleswitch">
      <span className="rs-label">Viewing as</span>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
      </select>
    </span>
  );
}
