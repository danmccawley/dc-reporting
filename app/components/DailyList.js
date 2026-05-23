"use client";
import { useState } from "react";
import Photos from "./Photos";

export default function DailyList({ entries }) {
  const [open, setOpen] = useState(null);
  if (!entries.length) {
    return <div className="notice">This scope has not started at this building, so there are no daily reports yet.</div>;
  }
  return (
    <div>
      {entries.map((d, i) => (
        <div key={i} className="dr-item">
          <button className="dr-row" onClick={() => setOpen(open === i ? null : i)}>
            <span>
              <span style={{ fontWeight: 600 }}>{d.date}</span>
              <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 13 }}>{d.zone}</span>
            </span>
            <span style={{ flex: 1 }} />
            {d.photos && d.photos.length > 0 && (
              <span className="photochip">{"\u25C9"} {d.photos.length}</span>
            )}
            <span className="mono" style={{ color: "var(--muted)", fontSize: 13, margin: "0 10px" }}>{d.pct}% · {d.headcount} crew</span>
            <span className="arrow mono" style={{ color: "var(--faint)" }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="dr-detail">
              <div style={{ fontSize: 14, color: "#33332e", marginBottom: 8 }}>{d.note}</div>
              {d.events && d.events.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  {d.events.map((e, j) => (
                    <span key={j} className="pill s-a" style={{ marginRight: 6, fontSize: 12 }}>{e}</span>
                  ))}
                </div>
              )}
              {d.photos && d.photos.length > 0 && (
                <>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, margin: "4px 0 6px" }}>
                    PHOTOS — tap to enlarge
                  </div>
                  <Photos photos={d.photos} />
                </>
              )}
              <div className="mono" style={{ fontSize: 12, color: "var(--faint)", marginTop: 8 }}>
                Reported by {d.author} · % complete {d.pct} · headcount {d.headcount}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
