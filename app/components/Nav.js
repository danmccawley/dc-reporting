"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, RoleSwitcher } from "./RoleProvider";
import { can } from "../../lib/roles";

// The whole platform, grouped so it reads as a sitemap on one screen.
const GROUPS = [
  { title: "Overview", links: [
    { href: "/", label: "Executive" },
    { href: "/capacity", label: "Capacity" },
    { href: "/insights", label: "Business intelligence" },
    { href: "/maps", label: "Maps" },
    { href: "/drawings", label: "Drawings & models" },
  ] },
  { title: "Buildings", links: [
    { href: "/site/16", label: "Building 16" },
    { href: "/site/17", label: "Building 17" },
    { href: "/site/18", label: "Building 18" },
  ] },
  { title: "Schedule & plan", links: [
    { href: "/schedule", label: "Schedule" },
    { href: "/plan", label: "Build plan" },
    { href: "/lookahead", label: "Look-ahead" },
  ] },
  { title: "Field operations", links: [
    { href: "/voice-field", label: "Voice daily report" },
    { href: "/ops", label: "Operations hub" },
    { href: "/rfis", label: "RFIs & submittals" },
    { href: "/manpower", label: "Manpower" },
    { href: "/procurement", label: "Procurement" },
    { href: "/weather", label: "Weather" },
    { href: "/punchlist", label: "Punchlist" },
    { href: "/quality", label: "Report quality" },
  ] },
  { title: "Delivery", links: [
    { href: "/commissioning", label: "Commissioning" },
    { href: "/cost", label: "Cost" },
    { href: "/commitments", label: "Commitments" },
    { href: "/governance", label: "Governance" },
    { href: "/records", label: "Document control" },
    { href: "/verify", label: "SCOUT verify" },
  ] },
  { title: "Safety & compliance", links: [
    { href: "/compliance", label: "Compliance (PROVOST)" },
  ] },
  { title: "Reports", links: [
    { href: "/request", label: "Request a report" },
    { href: "/report/weekly", label: "Weekly report" },
    { href: "/reports", label: "All reports" },
  ] },
  { title: "Assistant & learning", links: [
    { href: "/assistant", label: "Assistant" },
    { href: "/coach", label: "Coach" },
  ] },
  { title: "Knowledge & solutions", links: [
    { href: "/library", label: "Knowledge base" },
    { href: "/forge", label: "Solutions factory" },
  ] },
  { title: "Tools & admin", links: [
    { href: "/providers", label: "Provider registry" },
    { href: "/preferences", label: "Preferences" },
    { href: "/analyze", label: "Documents", cap: "counsel" },
    { href: "/admin", label: "Admin", cap: "users" },
    { href: "/field", label: "Field (PWA)" },
    { href: "/mobile", label: "Mobile view" },
  ] },
];

const HIDE = ["/login", "/start", "/mobile"];

export default function Nav() {
  const path = usePathname();
  const { role } = useRole();
  const [open, setOpen] = useState(false);

  // Close on navigation and on Escape.
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (HIDE.includes(path)) return null;
  const isOn = (href) => (href === "/" ? path === "/" : path.startsWith(href));

  // Find a short label for the current screen, to show on the menu button.
  let current = "Menu";
  for (const g of GROUPS) {
    const hit = g.links.find((l) => isOn(l.href));
    if (hit) { current = hit.label; break; }
  }

  const groups = GROUPS.map((g) => ({ ...g, links: g.links.filter((l) => !l.cap || can(role, l.cap)) })).filter((g) => g.links.length);

  return (
    <div className="topbar">
      <div className="wrap">
        <button className="menubtn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Open menu">
          <span className="menubars">{open ? "✕" : "☰"}</span>
          <span className="menubtn-label">{open ? "Close" : current}</span>
        </button>
        <Link href="/" className="brand">
          GENERIC DC
          <small>Generic data center program</small>
        </Link>
        <span className="topspacer" />
        <RoleSwitcher />
        {can(role, "submit") && <Link href="/report/daily" className="cta">Submit daily report</Link>}
      </div>

      {open && (
        <>
          <div className="menu-scrim" onClick={() => setOpen(false)} />
          <div className="megamenu" role="navigation">
            <div className="megawrap">
              {groups.map((g) => (
                <div className="megagroup" key={g.title}>
                  <h4>{g.title}</h4>
                  {g.links.map((l) => (
                    <Link key={l.href} href={l.href} className={isOn(l.href) ? "on" : ""}>{l.label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
