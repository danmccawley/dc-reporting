"use client";
import { useState } from "react";
import { SAMPLE_CONTRACT } from "../../lib/counsel";

const SEVLABEL = { r: "High exposure", a: "Watch", g: "Acceptable" };

export default function Analyze() {
  const [tab, setTab] = useState("paste");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imgName, setImgName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const [qa, setQa] = useState([]);
  const [qaInput, setQaInput] = useState("");
  const [qaBusy, setQaBusy] = useState(false);

  const ask = async (q) => {
    const question = (q ?? qaInput).trim();
    if (!question || qaBusy || (!text && !image)) return;
    const next = [...qa, { role: "user", content: question }];
    setQa(next); setQaInput(""); setQaBusy(true);
    try {
      const res = await fetch("/api/doc-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image, question, history: qa }),
      });
      const data = await res.json();
      setQa((m) => [...m, { role: "assistant", content: data.answer || "No answer." }]);
    } catch {
      setQa((m) => [...m, { role: "assistant", content: "Couldn't reach the analyzer." }]);
    } finally { setQaBusy(false); }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgName(file.name);
    if (file.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = () => { setImage(r.result); setText(""); };
      r.readAsDataURL(file);
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const r = new FileReader();
      r.onload = () => { setText(String(r.result)); setImage(null); };
      r.readAsText(file);
    } else {
      setNote("For PDFs, paste the text or scan/photograph the pages — image and text are analyzed directly.");
    }
  };

  const analyze = async () => {
    if (busy || (!text && !image)) return;
    setBusy(true); setResult(null); setNote("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image }),
      });
      const data = await res.json();
      setResult(data);
      if (data.source === "local") setNote("Showing a sample analysis. Set OPENAI_API_KEY in the environment for live review of your own document.");
    } catch {
      setNote("Could not reach the analyzer.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setText(""); setImage(null); setImgName(""); setResult(null); setNote(""); setQa([]); };

  const QA_SUGGEST = ["Summarize the payment terms", "What do the liquidated damages say?", "Explain the indemnification clause", "What does the termination clause say?"];
  const hasDoc = !!(text || image);

  return (
    <div>
      <div className="eyebrow">COUNSEL · document review</div>
      <h1 className="title">Document analyzer</h1>
      <p className="sub">Upload, scan, or paste a proposal or contract for AI-assisted review. COUNSEL flags commercial risk by exposure. This is commercial analysis, not legal advice.</p>

      <div className="maptabs">
        <button className={`tabbtn ${tab === "paste" ? "on" : ""}`} onClick={() => setTab("paste")}>Paste text</button>
        <button className={`tabbtn ${tab === "upload" ? "on" : ""}`} onClick={() => setTab("upload")}>Upload</button>
        <button className={`tabbtn ${tab === "scan" ? "on" : ""}`} onClick={() => setTab("scan")}>Scan with camera</button>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        {tab === "paste" && (
          <>
            <textarea value={text} onChange={(e) => { setText(e.target.value); setImage(null); }} placeholder="Paste the contract or proposal text here..." style={{ minHeight: 180 }} />
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setText(SAMPLE_CONTRACT)}>Load a sample contract</button>
          </>
        )}
        {tab === "upload" && (
          <>
            <label className="f">Upload an image or .txt file</label>
            <input type="file" accept="image/*,.txt" onChange={onFile} />
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>PDF? Paste its text or scan the pages — images and text are analyzed directly.</div>
          </>
        )}
        {tab === "scan" && (
          <>
            <label className="f">Photograph the document</label>
            <input type="file" accept="image/*" capture="environment" onChange={onFile} />
          </>
        )}

        {image && (
          <div style={{ marginTop: 12 }}>
            <img src={image} alt={imgName || "document"} style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, border: "1px solid var(--line)" }} />
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>{imgName}</div>
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button className="btn" onClick={analyze} disabled={busy || (!text && !image)}>
            {busy ? "Analyzing…" : "Analyze document"}
          </button>
          {(text || image || result) && <button className="btn ghost" onClick={reset}>Clear</button>}
        </div>
        {note && <div className="notice" style={{ marginTop: 12 }}>{note}</div>}
      </div>

      {result && (
        <>
          <h2 className="sec">Summary</h2>
          <div className="card"><p style={{ margin: 0 }}>{result.summary}</p>
            <div className="notice" style={{ marginTop: 12 }}>COUNSEL provides commercial analysis, not legal advice. Route items flagged high-exposure or ambiguous to a licensed attorney.</div>
          </div>

          <h2 className="sec">Findings <span className="hint">— ranked by exposure</span></h2>
          <div className="card">
            {result.findings && result.findings.length > 0 ? result.findings.map((f, i) => (
              <div key={i} className="finding">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span className={`pill s-${f.severity}`}><span className={`dot d-${f.severity}`} />{SEVLABEL[f.severity] || "Note"}</span>
                  <span style={{ fontWeight: 700 }}>{f.title}</span>
                  <span style={{ color: "var(--faint)", fontSize: 12 }}>{f.category}</span>
                </div>
                {f.detail && <div style={{ fontSize: 14, color: "#33332e", marginTop: 6 }}>{f.detail}</div>}
                {f.recommendation && <div style={{ fontSize: 14, color: "var(--accent)", marginTop: 4 }}><strong>Recommendation:</strong> {f.recommendation}</div>}
              </div>
            )) : <div className="notice">No structured findings returned.</div>}
          </div>
        </>
      )}

      <h2 className="sec">Ask about this document</h2>
      <div className="card">
        {!hasDoc && <div className="notice">Add a document above (paste, upload, or scan) to ask specific questions about it.</div>}
        {hasDoc && (
          <>
            {qa.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {qa.map((m, i) => (
                  <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
                ))}
                {qaBusy && <div className="bubble assistant">…</div>}
              </div>
            )}
            {qa.length === 0 && (
              <div className="chips" style={{ marginBottom: 12 }}>
                {QA_SUGGEST.map((s) => (
                  <span key={s} className="chip" onClick={() => ask(s)}>{s}</span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input value={qaInput} onChange={(e) => setQaInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Ask a specific question about this document..." />
              <button className="btn" onClick={() => ask()} disabled={qaBusy}>Ask</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
