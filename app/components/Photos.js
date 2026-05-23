"use client";
import { useState } from "react";

const TAGCOLOR = { Progress: "#2f4858", "As-built": "#3B6D11", Constraint: "#A32D2D", Photo: "#6c6b62" };

function Thumb({ photo, onClick, big }) {
  const c = TAGCOLOR[photo.tag] || "#6c6b62";
  return (
    <div className={big ? "photo-big" : "thumbph"} onClick={onClick} title={photo.caption}>
      <div className="ph-frame" style={{ borderColor: c }}>
        <span className="ph-cam" style={{ color: c }}>◙</span>
        <span className="ph-tag" style={{ background: c }}>{photo.tag}</span>
      </div>
      {big && (
        <div className="ph-meta">
          <div style={{ fontWeight: 600 }}>{photo.caption}</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>{photo.date} · {photo.tag} photo (sample placeholder)</div>
        </div>
      )}
    </div>
  );
}

export default function Photos({ photos, compact }) {
  const [active, setActive] = useState(null);
  if (!photos || !photos.length) return null;
  return (
    <div>
      <div className={compact ? "photostrip compact" : "photostrip"}>
        {photos.map((p, i) => (
          <Thumb key={p.id || i} photo={p} onClick={() => setActive(i)} />
        ))}
      </div>
      {active != null && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-x" onClick={() => setActive(null)}>×</button>
            <Thumb photo={photos[active]} big onClick={() => {}} />
            {photos.length > 1 && (
              <div className="lightbox-nav">
                <button className="btn ghost" onClick={() => setActive((active - 1 + photos.length) % photos.length)}>‹ Prev</button>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{active + 1} / {photos.length}</span>
                <button className="btn ghost" onClick={() => setActive((active + 1) % photos.length)}>Next ›</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
