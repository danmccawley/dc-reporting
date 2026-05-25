// PRESENTER / AVATAR LAYER — turns agent content into a narrated, avatar-led
// experience. Two modes: a pre-rendered narrated CLASS (script + visuals, for
// COACH lessons) and a live CONVERSATION reply (any agent speaks its answer).
//
// In production this is the in-tenant NVIDIA ACE stack — Riva (ASR/TTS),
// Audio2Face (lip-sync/expression), Audio2Gesture, Omniverse RTX rendering — on
// the tenant's own GPUs, so no project data leaves the tenant. The prototype
// demonstrates the same flow with a stylized in-browser avatar driven by the
// browser speech engine (also fully client-side / zero egress).

// Each user-facing agent has a presenter persona.
export const PERSONAS = {
  COACH: { name: "Coach", role: "Just-in-time training", hue: "#7a3b8a", voiceHint: "instructive" },
  CONCIERGE: { name: "Bernard", role: "Your assistant", hue: "#2f6d7d", voiceHint: "conversational" },
  BERNARD: { name: "Bernard", role: "Assistant · speaks for every agent", hue: "#2f4858", voiceHint: "measured" },
  PROVOST: { name: "Provost", role: "Compliance", hue: "#8a5a2b", voiceHint: "precise" },
};

export function personaFor(agent) {
  return PERSONAS[agent] || PERSONAS.CONCIERGE;
}

// Build a narrated class (a short slide deck with a spoken script) from a COACH
// lesson. Each beat has a heading, on-screen points, and the narration line.
export function buildClass(lesson) {
  const beats = [];
  beats.push({
    kind: "title", heading: lesson.title, points: [`${lesson.minutes}-minute lesson`, "Narrated by Coach"],
    narration: `${lesson.title}. ${lesson.why}`,
  });
  lesson.steps.forEach((s, i) => {
    beats.push({ kind: "point", heading: `Key idea ${i + 1}`, points: [s], narration: s });
  });
  beats.push({
    kind: "action", heading: "Now try it", points: [lesson.tryIt.label],
    narration: `Now put it to work. ${lesson.tryIt.label}.`, action: lesson.tryIt,
  });
  return { id: lesson.id, title: lesson.title, persona: "COACH", beats };
}

// Voice settings tuned per persona (used with the browser speech engine in the
// prototype; maps to a Riva voice in production).
export function voiceFor(personaKey) {
  switch (personaKey) {
    case "COACH": return { rate: 0.98, pitch: 1.0 };
    case "CONCIERGE": return { rate: 1.02, pitch: 1.0 };
    case "BERNARD": return { rate: 1.0, pitch: 0.98 };
    case "PROVOST": return { rate: 0.96, pitch: 0.96 };
    default: return { rate: 1.0, pitch: 1.0 };
  }
}
