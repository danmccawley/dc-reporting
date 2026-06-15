import { heraldParse } from "../../../lib/herald";
import { buildings, scopes } from "../../../lib/mock/data";

// HERALD intake endpoint. If OPENAI_API_KEY is set,
// the model does structured extraction; otherwise the deterministic local parser
// runs so the demo never breaks. Either way the output is the same structured shape
// and HERALD never invents a number that wasn't in what the CM said.

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const transcript = (body.transcript || "").toString().slice(0, 4000);

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const { structured, filled } = heraldParse(transcript);
    return Response.json({ structured, filled, source: "local" });
  }

  const scopeList = scopes.map((s) => `${s.slug} (${s.name})`).join(", ");
  const buildingList = buildings.map((b) => `${b.id} (${b.name})`).join(", ");

  const system =
    "You are HERALD, the intake-normalization agent for a data center construction reporting platform. " +
    "Convert the construction manager's spoken daily report into structured JSON. " +
    "CRITICAL RULE: never invent a value. Only extract what the CM actually said. Leave a field as an empty " +
    "string if it was not stated.\n\n" +
    `Valid building ids: ${buildingList}.\n` +
    `Valid scope slugs: ${scopeList}.\n` +
    "events is an array of any of: \"safety\", \"ncr\", \"delay\".\n" +
    "If events includes \"delay\", set cause to one of: RFI / design, Material delivery, Weather, Manpower, " +
    "Access / sequencing, Inspection hold.\n\n" +
    "Respond with ONLY a JSON object, no prose, no markdown fences, with keys: " +
    "building, zone, scope, trade, pct, headcount, units, cause, events, notes. " +
    "pct/headcount/units are strings of digits or empty. notes is a cleaned-up version of the full narrative.";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: transcript },
        ],
      }),
    });
    if (!res.ok) {
      const { structured, filled } = heraldParse(transcript);
      return Response.json({ structured, filled, source: "local-fallback" });
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let structured;
    try {
      structured = JSON.parse(cleaned);
    } catch {
      const fallback = heraldParse(transcript);
      return Response.json({ ...fallback, source: "local-fallback" });
    }
    const filled = Object.keys(structured).filter((k) => {
      const v = structured[k];
      return Array.isArray(v) ? v.length > 0 : v !== "" && v != null;
    });
    return Response.json({ structured, filled, source: "openai" });
  } catch {
    const { structured, filled } = heraldParse(transcript);
    return Response.json({ structured, filled, source: "local-fallback" });
  }
}
