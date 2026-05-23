import FieldDailyForm from "../../components/FieldDailyForm";

export default function DailyReport() {
  return (
    <div>
      <div className="eyebrow">Daily report · mobile-first</div>
      <h1 className="title">Submit daily report</h1>
      <p className="sub">Renders full-width on a phone. Structured fields capture the numbers; HERALD reads the notes.</p>
      <div style={{ maxWidth: 480 }}>
        <FieldDailyForm />
      </div>
    </div>
  );
}
