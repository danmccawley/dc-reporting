"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { lessonForRoute } from "../../lib/coach";

const HIDE = ["/login", "/start", "/mobile", "/coach", "/assistant"];

export default function CoachTip() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (HIDE.includes(path)) return null;
  const lesson = lessonForRoute(path);
  if (!lesson || dismissed) return null;

  return (
    <div className="coachtip">
      {open ? (
        <div className="coachcard">
          <div className="coachcard-head">
            <span>COACH · {lesson.minutes} min</span>
            <button onClick={() => setOpen(false)} aria-label="Collapse">×</button>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{lesson.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>{lesson.why}</div>
          <ol style={{ margin: "0 0 8px 16px", padding: 0 }}>
            {lesson.steps.slice(0, 3).map((s, i) => <li key={i} style={{ fontSize: 12.5, marginBottom: 5, lineHeight: 1.4 }}>{s}</li>)}
          </ol>
          <Link href="/coach" className="scopelink" style={{ fontSize: 13 }}>Open full lesson in Coach →</Link>
        </div>
      ) : (
        <button className="coachpill" onClick={() => setOpen(true)}>
          <span className="coachpill-dot" /> Coach: {lesson.title}
          <span className="coachpill-x" onClick={(e) => { e.stopPropagation(); setDismissed(true); }}>×</span>
        </button>
      )}
    </div>
  );
}
