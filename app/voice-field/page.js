import PhoneFrame from "../components/PhoneFrame";
import VoiceDailyForm from "../components/VoiceDailyForm";
import Link from "next/link";

export const metadata = { title: "Voice-first field report" };

// Flagship demo: voice-first capture in a phone frame, with the cascade explained.
// Sits alongside the original /field demo (which is preserved unchanged).
export default function VoiceFieldDemo() {
  return (
    <div>
      <div className="eyebrow">Field experience \u00b7 voice-first</div>
      <h1 className="title">Talk your daily report</h1>
      <p className="sub">
        The CM taps the mic and describes the day. HERALD structures what was said into the report fields;
        the CM confirms and submits. That single daily entry becomes the source every weekly, monthly, and
        program report derives from \u2014{" "}
        <Link href="/request" style={{ color: "var(--accent)", fontWeight: 600 }}>request a report \u2192</Link>
      </p>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <PhoneFrame>
          <VoiceDailyForm />
        </PhoneFrame>

        <div className="card">
          <h2 className="sec" style={{ marginTop: 0 }}>How the cascade works</h2>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14, color: "#33332e" }}>
            <li><strong>Speak.</strong> Web Speech transcribes on-device; nothing is gated on voice \u2014 typing works too.</li>
            <li><strong>HERALD structures.</strong> The transcript maps to building, scope, %, headcount, quantity, events. It only fills what you actually said \u2014 never invents a number.</li>
            <li><strong>Confirm &amp; submit.</strong> Submitting writes one atomic entry to the store.</li>
            <li><strong>Everything derives.</strong> Weekly, monthly, and program reports compute from those entries on request. No re-authoring.</li>
          </ol>
          <div className="notice" style={{ marginTop: 14 }}>
            Voice mode runs in Chrome, Edge, and Safari. With an OpenAI key set, HERALD uses the model for
            richer extraction; with no key, a deterministic local parser runs so the demo never breaks \u2014
            the same fallback pattern used across AI-assisted seams.
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/request" className="btn">Request a report</Link>
            <Link href="/field" className="btn ghost">Original field form</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
