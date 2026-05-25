"use client";
import Link from "next/link";
import { usePrefs, BI_DELIVERY, BI_FRAMING } from "../components/Preferences";

export default function PreferencesPage() {
  const { prefs, setPref } = usePrefs();
  return (
    <div>
      <div className="eyebrow">Profile · preferences</div>
      <h1 className="title">Your preferences</h1>
      <p className="sub">How Bernard and the analytics surface present intelligence to you. In the full platform these live on your profile and travel with your account; here they are saved in this browser. The prototype defaults to a tiered drill with cautious framing.</p>

      <h2 className="sec">How Bernard delivers business intelligence</h2>
      <div className="card">
        {BI_DELIVERY.map((o) => (
          <label key={o.key} className="caprow" style={{ cursor: "pointer", alignItems: "baseline" }}>
            <span><input type="radio" name="bid" checked={prefs.biDelivery === o.key} onChange={() => setPref("biDelivery", o.key)} style={{ marginRight: 10 }} />{o.label}<div style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: 26 }}>{o.desc}</div></span>
          </label>
        ))}
      </div>

      <h2 className="sec">How findings are framed</h2>
      <div className="card">
        {BI_FRAMING.map((o) => (
          <label key={o.key} className="caprow" style={{ cursor: "pointer", alignItems: "baseline" }}>
            <span><input type="radio" name="bif" checked={prefs.biFraming === o.key} onChange={() => setPref("biFraming", o.key)} style={{ marginRight: 10 }} />{o.label}<div style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: 26 }}>{o.desc}</div></span>
          </label>
        ))}
      </div>

      <div className="relnav"><span>Related:</span><Link href="/insights">Business intelligence</Link><Link href="/assistant">Assistant</Link><Link href="/admin">Admin</Link></div>
      <div className="notice" style={{ marginTop: 14 }}>
        Bernard reads these settings: with <strong>tiered</strong> delivery he gives a one-line read and asks before going deeper; with <strong>findings</strong> he lists everything; <strong>both</strong> does both. Framing controls whether correlation and root-cause results are stated as signals to investigate or as confident calls (or both).
      </div>
    </div>
  );
}
