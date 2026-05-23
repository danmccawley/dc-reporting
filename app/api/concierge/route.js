import { buildContext, localAnswer } from "../../../lib/context";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const question = (body.question || "").toString().slice(0, 2000);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json({ answer: localAnswer(question), source: "local" });
  }

  const system =
    "You are CONCIERGE, the assistant for a multi-site data center construction reporting platform demo. " +
    "Answer questions about the program data and about how the platform works, using the context below. " +
    "Be concise, accurate, and concrete. Quote the actual demo numbers when relevant. If a question is " +
    "outside the data, answer helpfully from the platform overview. The data is simulated for the demo.\n\n" +
    buildContext();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content || "").slice(0, 2000) })),
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) {
      return Response.json({ answer: localAnswer(question), source: "local-fallback" });
    }
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || localAnswer(question);
    return Response.json({ answer, source: "openai" });
  } catch {
    return Response.json({ answer: localAnswer(question), source: "local-fallback" });
  }
}
