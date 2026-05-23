"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Executive" },
  { href: "/site/16", label: "Building 16" },
  { href: "/site/17", label: "Building 17" },
  { href: "/site/18", label: "Building 18" },
  { href: "/report/weekly", label: "Weekly report" },
  { href: "/reports", label: "Reports" },
  { href: "/insights", label: "Insights" },
  { href: "/field", label: "Field" },
  { href: "/mobile", label: "Mobile view" },
];

const HIDE = ["/login", "/start", "/mobile"];

export default function Nav() {
  const path = usePathname();
  if (HIDE.includes(path)) return null;
  const isOn = (href) =>
    href === "/" ? path === "/" : path.startsWith(href);
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
        <span className="proto">Prototype · sample data</span>
        <Link href="/report/daily" className="cta">
          Submit daily report
        </Link>
      </div>
    </div>
  );
}
