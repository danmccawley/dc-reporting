// FORGE — the agentic solutions factory. When a challenge appears that no
// standing specialist fully covers, FORGE designs a purpose-built solution by
// composing existing agents, tools, and data into a new micro-agent, workflow,
// or playbook; a human approves it; FORGE deploys it and then either folds the
// pattern into the permanent roster or retires it. This is the platform's answer
// to the unforeseen — the rest of the suite handles the known, FORGE handles the new.

export const STAGES = [
  { key: "designing", label: "Designing", c: "#b98900" },
  { key: "assembled", label: "Assembled", c: "#2f6d7d" },
  { key: "deployed", label: "Deployed", c: "#5a8a1f" },
  { key: "folded", label: "Folded into roster", c: "#3a5ca8" },
  { key: "retired", label: "Retired", c: "#8a8a82" },
];
export function stageFor(key) { return STAGES.find((s) => s.key === key) || STAGES[0]; }

export const CHALLENGES = [
  {
    id: "switchgear-reroute", title: "Long-lead switchgear exposed by a typhoon, no standing playbook",
    trigger: "SENTINEL flagged the Building 17 switchgear lot at delivery risk; QUARTERMASTER had no pre-built reroute response.",
    detectedBy: "SENTINEL", owner: "Project Manager", stage: "deployed",
    solution: { name: "LONG-LEAD REROUTE", type: "Cross-agent workflow", composes: ["QUARTERMASTER", "SENTINEL", "PATHFINDER", "DIPLOMAT"], data: ["procurement", "schedule", "vetted supplier feed"], outcome: "Surfaced two alternate factory slots and the schedule impact of each; reroute decision package sent to the PM." },
  },
  {
    id: "cure-watch", title: "Concrete cure quality at risk in a heat wave",
    trigger: "No agent was tracking cure conditions against pour logs during sustained high temperatures at Building 18.",
    detectedBy: "MUSTER", owner: "Construction Manager", stage: "deployed",
    solution: { name: "CURE-WATCH", type: "Micro-agent", composes: ["SENTINEL", "WARDEN", "GUARDIAN"], data: ["weather", "pour logs", "daily reports"], outcome: "Flags pours whose cure window overlaps a heat or storm day and prompts the crew to log cylinder breaks." },
  },
  {
    id: "rfi-expediter", title: "RFI aging is gating critical-path work",
    trigger: "AUGUR linked the RFI backlog to the LV cabling productivity dip; no standing process prioritized RFIs by schedule impact.",
    detectedBy: "AUGUR", owner: "Construction Manager", stage: "folded",
    solution: { name: "RFI-EXPEDITER", type: "Playbook", composes: ["PATHFINDER", "MARSHAL", "DIPLOMAT"], data: ["RFI log", "critical path"], outcome: "Ranks open RFIs by the float they consume and drafts the escalation. Folded into the permanent look-ahead flow." },
  },
  {
    id: "capacity-replan", title: "Owner pulled the compute go-live date forward",
    trigger: "The compute-infrastructure team moved a deployment milestone in; the standing schedule view did not express the new readiness gap.",
    detectedBy: "WARDEN", owner: "Project Manager", stage: "assembled",
    solution: { name: "CAPACITY-REPLAN", type: "Cross-agent workflow", composes: ["PATHFINDER", "KEYSTONE", "AUGUR", "COMPTROLLER"], data: ["schedule", "commissioning", "capacity"], outcome: "Re-derives go-live confidence under the new date and prices the acceleration options. Awaiting PM sign-off to deploy." },
  },
  {
    id: "multi-vendor-cabling", title: "Multi-vendor cabling reconciliation",
    trigger: "Three cabling vendors report quantities in different units; WARDEN saw inconsistent entries it could not reconcile alone.",
    detectedBy: "WARDEN", owner: "Construction Manager", stage: "designing",
    solution: { name: "CABLE-RECONCILE", type: "Micro-agent", composes: ["HERALD", "WARDEN", "SCOUT"], data: ["daily reports", "as-built photos"], outcome: "Normalizes vendor units into atomic install quantities and verifies against SCOUT counts. In design." },
  },
];

export function getChallenges() { return CHALLENGES; }
export function getChallenge(id) { return CHALLENGES.find((c) => c.id === id) || null; }
export function forgeStats() {
  const by = (k) => CHALLENGES.filter((c) => c.stage === k).length;
  return { total: CHALLENGES.length, active: CHALLENGES.filter((c) => ["designing", "assembled", "deployed"].includes(c.stage)).length, deployed: by("deployed"), folded: by("folded") };
}
