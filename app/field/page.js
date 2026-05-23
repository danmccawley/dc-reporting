import PhoneFrame from "../components/PhoneFrame";
import FieldDailyForm from "../components/FieldDailyForm";

export default function FieldDemo() {
  return (
    <div>
      <div className="eyebrow">Field experience</div>
      <h1 className="title">Mobile-first daily report</h1>
      <p className="sub">
        What an owner&apos;s rep, CM, or PM uses on the jobsite. One-handed, camera capture, and
        offline-tolerant. Flip &ldquo;Simulate offline&rdquo; to see a report save on the device and sync on reconnect.
      </p>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <PhoneFrame>
          <FieldDailyForm />
        </PhoneFrame>

        <div className="card">
          <h2 className="sec" style={{ marginTop: 0 }}>Why this matters in the field</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14, color: "#33332e" }}>
            <li>Single-column, large tap targets, 16px inputs so iOS never zooms.</li>
            <li>Native camera capture (opens the camera on a phone); photos feed SCOUT.</li>
            <li>Drafts save on the device when there&apos;s no signal and sync automatically on reconnect.</li>
            <li>Clear sync status: Online, Offline, Syncing, Synced.</li>
            <li>Installs to the home screen as a PWA, so it opens like an app.</li>
          </ul>
          <div className="notice" style={{ marginTop: 14 }}>
            Prototype note: offline drafts persist on this device; full background sync uses a service worker in
            the production build. The same form renders full-width on a real phone at /report/daily.
          </div>
        </div>
      </div>
    </div>
  );
}
