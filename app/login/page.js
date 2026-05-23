"use client";
import { useState } from "react";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!pw || busy) return;
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        window.location.href = "/start";
      } else {
        setErr(true);
        setBusy(false);
      }
    } catch {
      setErr(true);
      setBusy(false);
    }
  };

  return (
    <div className="gate">
      <div className="gate-card">
        <div className="eyebrow">Generic DC · reporting</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 4px" }}>Demo access</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 0 }}>Enter the access password to view the prototype.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          autoFocus
        />
        {err && <div style={{ color: "var(--r)", fontSize: 13, marginTop: 8 }}>Incorrect password. Try again.</div>}
        <button className="btn big" style={{ marginTop: 14 }} onClick={submit} disabled={busy}>
          {busy ? "Checking…" : "Enter"}
        </button>
      </div>
    </div>
  );
}
