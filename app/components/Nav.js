"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, RoleSwitcher } from "./RoleProvider";
import { can } from "../../lib/roles";

const baseLinks = [
  { href: "/", label: "Executive" },
  { href: "/site/16", label: "Building 16" },
  { href: "/site/17", label: "Building 17" },
  { href: "/site/18", label: "Building 18" },
  { href: "/capacity", label: "Capacity" },
  { href: "/verify", label: "SCOUT" },
  { href: "/schedule", label: "Schedule" },
  { href: "/plan", label: "Build plan" },
  { href: "/lookahead", label: "Look-ahead" },
  { href: "/ops", label: "Operations" },
  { href: "/commissioning", label: "Commissioning" },
  { href: "/cost", label: "Cost" },
  { href: "/report/weekly", label: "Weekly report" },
  { href: "/reports", label: "Reports" },
  { href: "/insights", label: "Insights" },
  { href: "/maps", label: "Maps" },
  { href: "/coach", label: "Coach" },
  { href: "/assistant", label: "Assistant" },
  { href: "/library", label: "Knowledge" },
  { href: "/forge", label: "Solutions" },
  { href: "/analyze", label: "Documents", cap: "counsel" },
  { href: "/admin", label: "Admin", cap: "users" },
  { href: "/field", label: "Field" },
  { href: "/mobile", label: "Mobile view" },
];

const HIDE = ["/login", "/start", "/mobile"];

export default function Nav() {
  const path = usePathname();
  const { role } = useRole();
  if (HIDE.includes(path)) return null;
  const isOn = (href) => (href === "/" ? path === "/" : path.startsWith(href));
  const links = baseLinks.filter((l) => !l.cap || can(role, l.cap));
  return (
    <div className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">
          GENERIC DC
          <small>Generic data center program</small>
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={isOn(l.href) ? "on" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="topspacer" />
        <RoleSwitcher />
        {can(role, "submit") && <Link href="/report/daily" className="cta">Submit daily report</Link>}
      </div>
    </div>
  );
}
