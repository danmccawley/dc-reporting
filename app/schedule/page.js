import { schedule } from "../../lib/mock/data";
import { ragFill, ragInk } from "../../lib/rag";

export default function Schedule() {
  return (
    <div>
      <div className="eyebrow">PATHFINDER · schedule</div>
      <h1 className="title">Schedule &amp; risk</h1>
      <p className="sub">Milestones on the program timeline with probabilistic completion. PATHFINDER ingests the master schedule (P6) and adds confidence and critical-path risk.</p>

      {schedule.map((b) => (
        <div key={b.id}>
          <h2 className="sec">{b.name}</h2>
          <div className="card">
            <div className="grid g3" style={{ marginBottom: 16 }}>
              <div><div className="cap-label">Go-live confidence</div><div className="kpi-cap" style={{ color: b.confidence >= 80 ? "#5a8a1f" : b.confidence >= 55 ? "#b98900" : "#A32D2D" }}>{b.confidence}%</div></div>
              <div><div className="cap-label">P50 / P80 finish</div><div className="kpi-cap" style={{ fontSize: 20 }}>{b.p50} <span className="cap-unit">/ {b.p80}</span></div></div>
              <div><div className="cap-label">Critical path</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{b.critical}</div></div>
            </div>
            <div className="timeline">
              <div className="tl-axis" />
              {b.milestones.map((m, i) => (
                <div key={i} className="tl-mark" style={{ left: `${m.t}%` }}>
                  <span className="tl-dot" style={{ background: ragFill[m.status], borderColor: ragInk[m.status] }} />
                  <span className="tl-name">{m.name}</span>
                  <span className="tl-when">{m.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="notice" style={{ marginTop: 14 }}>
        Confidence and P50/P80 are derived from schedule progress and long-lead risk (AUGUR + SENTINEL). In production PATHFINDER runs the probabilistic analysis over the imported P6 network.
      </div>
    </div>
  );
}
