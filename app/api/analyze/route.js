import { COUNSEL_SYSTEM, cannedAnalysis } from "../../../lib/counsel";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const text = (body.text || "").toString().slice(0, 16000);
  const image = body.image || null;

  const key = process.env.OPENAI_API_KEY;
  if (!key || (!text && !image)) {
    return Response.json({ ...cannedAnalysis(), source: key ? "no-input" : "local" });
  }

  const content = [
    { type: "text", text: text ? `Review this document and return the JSON:\n\n${text}` : "Review the document shown in this image and return the JSON." },
  ];
  if (image) content.push({ type: "image_url", image_url: { url: image } });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: COUNSEL_SYSTEM },
          { role: "user", content },
        ],
      }),
    });
    if (!res.ok) return Response.json({ ...cannedAnalysis(), source: "local-fallback" });
    const data = await res.json();
    let raw = (data.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { summary: raw.slice(0, 600) || "Analysis complete.", findings: [] }; }
    return Response.json({ summary: parsed.summary || "", findings: Array.isArray(parsed.findings) ? parsed.findings : [], source: "openai" });
  } catch {
    return Response.json({ ...cannedAnalysis(), source: "local-fallback" });
  }
}
