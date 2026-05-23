import Link from "next/link";
import PhoneFrame from "../components/PhoneFrame";

export default function MobilePreview() {
  return (
    <div className="wrap" style={{ padding: "20px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <div>
          <div className="eyebrow">Mobile preview</div>
          <h1 className="title" style={{ marginBottom: 0 }}>The demo on a phone</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/start" className="btn ghost">Change view</Link>
          <Link href="/" className="btn">Desktop view</Link>
        </div>
      </div>
      <p className="sub">The full app in a phone-sized frame. Navigate inside it just like on a device. On an actual phone, open the demo URL directly for the same layout.</p>
      <PhoneFrame>
        <iframe src="/" title="Mobile preview" style={{ width: "100%", height: "720px", border: "none", display: "block", background: "var(--bg)" }} />
      </PhoneFrame>
    </div>
  );
}
