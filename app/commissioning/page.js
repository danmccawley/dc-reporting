import Link from "next/link";
import { commissioning } from "../../lib/mock/data";
import { ragFill, ragInk, ragLabel } from "../../lib/rag";

export default function Commissioning() {
  return (
    <div>
      <div className="eyebrow">KEYSTONE · commissioning</div>
      <h1 className="title">Commissioning readiness</h1>
      <p className="sub">Commissioning levels L1 through L5 by building — the path from factory acceptance to integrated systems test and turnover. The decisive stage for data center go-live.</p>

      <div className="grid g3">
        {commissioning.map((b) => (
          <Link href={`/site/${b.id}`} className="card" style={{ display: "block" }} key={b.id}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{b.name}</div>
            {b.levels.map((l, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                  <span>{l.lvl}</span>
                  <span className="mono" style={{ color: ragInk[l.status] }}>{l.status === "n" ? "—" : `${l.pct}%`}</span>
                </div>
                <div className="track"><span className="fill" style={{ width: `${l.pct}%`, background: ragFill[l.status] }} /></div>
              </div>
            ))}
            <div style={{ marginTop: 6, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Open building →</div>
          </Link>
        ))}
      </div>

      <div className="relnav">
        <span>Related:</span>
        <Link href="/capacity">Capacity</Link>
        <Link href="/schedule">Schedule</Link>
        <Link href="/cost">Cost</Link>
      </div>
      <div className="notice" style={{ marginTop: 14 }}>
        L5 integrated systems test is the gate to turnover and go-live. KEYSTONE tracks the scripts and issues; the owner&apos;s commissioning representative (CxOR) validates each level before energization and phased turnover.
      </div>
    </div>
  );
}
