import { DOCQA_SYSTEM, localDocAnswer } from "../../../lib/counsel";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const text = (body.text || "").toString().slice(0, 16000);
  const image = body.image || null;
  const question = (body.question || "").toString().slice(0, 1000);
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!question) return Response.json({ answer: "Ask a question about the document." });

  const key = process.env.OPENAI_API_KEY;
  if (!key || (!text && !image)) {
    return Response.json({ answer: localDocAnswer(text, question), source: "local" });
  }

  const content = [
    { type: "text", text: text ? `Document:\n${text}\n\nQuestion: ${question}` : `Question about the document image: ${question}` },
  ];
  if (image) content.push({ type: "image_url", image_url: { url: image } });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        temperature: 0.2,
        messages: [
          { role: "system", content: DOCQA_SYSTEM },
          ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content || "").slice(0, 1500) })),
          { role: "user", content },
        ],
      }),
    });
    if (!res.ok) return Response.json({ answer: localDocAnswer(text, question), source: "local-fallback" });
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || localDocAnswer(text, question);
    return Response.json({ answer, source: "openai" });
  } catch {
    return Response.json({ answer: localDocAnswer(text, question), source: "local-fallback" });
  }
}
