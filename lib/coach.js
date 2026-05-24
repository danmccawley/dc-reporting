// COACH — just-in-time training. A library of short, role-aware micro-lessons
// that build the critical skills a CM/PM/field user needs to read and act on the
// platform. COACH surfaces the right lesson at the right moment (by screen,
// by role, and by an observed skill gap), so people learn in the flow of work.

export const SKILLS = [
  { key: "critical-path", label: "Reading the critical path & float" },
  { key: "earned-value", label: "Earned value (CPI / EAC)" },
  { key: "rag-trend", label: "RAG status & trend" },
  { key: "commissioning", label: "Commissioning levels (L1–L5)" },
  { key: "rfi", label: "RFI turnaround management" },
  { key: "report-quality", label: "Writing a high-quality daily report" },
  { key: "manpower", label: "Manpower loading to hold a date" },
  { key: "procurement", label: "Long-lead procurement risk" },
  { key: "capacity", label: "Capacity & go-live readiness" },
  { key: "lookahead", label: "Running a 3-week look-ahead" },
];

export const LESSONS = [
  { id: "critical-path", skill: "critical-path", title: "What the critical path actually tells you", minutes: 4, levels: ["CM", "PM"],
    why: "You opened the build plan. The red chain is the critical path — the only activities where a day lost is a day lost on go-live.",
    steps: [
      "Total float is the slack an activity has before it delays the project. Float ≤ 0 means it is critical.",
      "A non-critical activity can slip by its float without moving the finish; a critical one cannot.",
      "The forecast finish moves with field progress — if percent-complete lags the expected curve, the date slips.",
      "Always act on the gating predecessor first: it is the specific incomplete work holding the next activity back.",
    ],
    tryIt: { label: "Open the build plan and find the gating predecessor", href: "/plan" } },
  { id: "earned-value", skill: "earned-value", title: "CPI and EAC without the jargon", minutes: 5, levels: ["CM", "PM"],
    why: "The cost view shows CPI and EAC. These tell you whether you are buying the progress you planned to buy.",
    steps: [
      "Earned value = budget × percent-complete. It is the value of work actually in place.",
      "Actual cost = what you have spent (summed from labor entries here).",
      "CPI = earned ÷ actual. Above 1.0 is under budget for the work done; below 1.0 is over.",
      "EAC = budget ÷ CPI estimates the final cost if today's efficiency holds. A 0.94 CPI forecasts a ~6% overrun.",
    ],
    tryIt: { label: "See CPI and EAC on the cost view", href: "/cost" } },
  { id: "rag-trend", skill: "rag-trend", title: "Why a green metric can still be a problem", minutes: 3, levels: ["CM", "PM", "CIM"],
    why: "Status and trend are two different things. A metric on target but deteriorating is shown amber/red on purpose.",
    steps: [
      "Status RAG compares the current value to target, honoring whether higher or lower is better.",
      "Trend uses a 4-week trailing average (current week excluded) to see the direction.",
      "The platform shows the worse of the two, so a sliding metric is never hidden by a good headline number.",
      "A brand-new building stays neutral until four weeks of data exist (see Building 18).",
    ],
    tryIt: { label: "Read the trend logic on Insights", href: "/insights" } },
  { id: "commissioning", skill: "commissioning", title: "Commissioning levels L1 through L5", minutes: 4, levels: ["CM", "PM", "CIM"],
    why: "Capacity and go-live hinge on commissioning. The five levels are a gated sequence, not a single percentage.",
    steps: [
      "L1 factory / component → L2 site acceptance → L3 pre-functional → L4 functional → L5 integrated systems test.",
      "Each level gates the next; L4 functional scripts can be blocked by an energization milestone.",
      "A building can look structurally done and still be far from go-live if the Cx tail is open.",
      "The punchlist closeout percentage is the practical measure of how much tail remains.",
    ],
    tryIt: { label: "Open the commissioning view", href: "/commissioning" } },
  { id: "rfi", skill: "rfi", title: "Why RFI turnaround is a leading indicator", minutes: 3, levels: ["CM", "PM"],
    why: "Building 17 RFI turnaround climbed to 9.2 days. Slow answers stall the field before the schedule shows it.",
    steps: [
      "RFI turnaround is days from question to answer. Lower is better; target here is ~6 days.",
      "It leads schedule slip: crews idle or rework while waiting, which shows up in productivity a week or two later.",
      "AUGUR looks for lagged correlations — here, RFI delay precedes the LV cabling productivity dip.",
      "Action: clear the oldest RFIs first and escalate the ones gating critical-path work.",
    ],
    tryIt: { label: "See the RFI trend on Building 17", href: "/site/17" } },
  { id: "report-quality", skill: "report-quality", title: "What makes a daily report you can trust", minutes: 3, levels: ["CM", "PM"],
    why: "WARDEN scores every daily report. A complete report is what makes every rolled-up number defensible.",
    steps: [
      "Log installed quantities, not just a percent — quantities are what the rollups sum.",
      "Write what advanced and what blocked, specifically; one line of substance beats a paragraph of filler.",
      "Attach at least two photos so SCOUT can verify reported vs observed progress.",
      "Confirm crew headcount and that safety/quality events were captured (or explicitly none).",
    ],
    tryIt: { label: "Open the daily report form", href: "/report/daily" } },
  { id: "manpower", skill: "manpower", title: "Loading crew to hold a date", minutes: 4, levels: ["CM"],
    why: "MUSTER projects the crew needed to pull a forecast finish back to the planned date.",
    steps: [
      "Remaining work ÷ days remaining sets the rate you must hold.",
      "If the forecast runs later than plan, you need more crew to compress it back into the window.",
      "The gap (required minus current) is your hiring or shift-add target for that scope.",
      "Load the critical-path scopes first — adding crew off the critical path will not move go-live.",
    ],
    tryIt: { label: "Open the manpower forecast", href: "/manpower" } },
  { id: "procurement", skill: "procurement", title: "When a delivery becomes a schedule risk", minutes: 3, levels: ["CM", "PM"],
    why: "A long-lead item is only a problem when it arrives after the activity that needs it. QUARTERMASTER ties the two together.",
    steps: [
      "Required-on-site date comes from the activity start, not a procurement calendar in isolation.",
      "Slack = required-on-site minus ETA. Negative slack means the delivery gates the work.",
      "Switchgear for Building 17 has negative slack, so it gates electrical fit-out and cascades to Cx.",
      "Act early: expedite, re-sequence, or find an alternate before the negative slack reaches the field.",
    ],
    tryIt: { label: "Open the procurement tracker", href: "/procurement" } },
  { id: "capacity", skill: "capacity", title: "Megawatts, halls, and go-live confidence", minutes: 3, levels: ["PM", "CIM"],
    why: "Owners plan in capacity, not construction percent. This is the language the compute-infrastructure team uses.",
    steps: [
      "Commissioned MW and energized halls are the real delivery, summed from capacity events.",
      "Go-live confidence blends schedule forecast, commissioning, and long-lead risk.",
      "A building can be high on construction percent but low on capacity if the Cx tail is open.",
      "Watch first-power and go-live dates against the owner's compute deployment plan.",
    ],
    tryIt: { label: "Open the capacity view", href: "/capacity" } },
  { id: "lookahead", skill: "lookahead", title: "Running a useful 3-week look-ahead", minutes: 4, levels: ["CM"],
    why: "MARSHAL builds the look-ahead from the live schedule so the field plan and the program never drift apart.",
    steps: [
      "The next three weeks come straight from the CPM engine, not a separate spreadsheet.",
      "Each activity carries its constraints: gating predecessor, forecast slip, and weather exposure.",
      "Resolve constraints in week one before they become next week's slip.",
      "Use it in the daily huddle; it is built to read on a phone in the field.",
    ],
    tryIt: { label: "Open the 3-week look-ahead", href: "/lookahead" } },
];

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

// JIT mapping: which lesson is most relevant on a given screen.
const ROUTE_LESSON = [
  [/^\/plan/, "critical-path"], [/^\/schedule/, "lookahead"], [/^\/cost/, "earned-value"],
  [/^\/commissioning/, "commissioning"], [/^\/capacity/, "capacity"], [/^\/insights/, "rag-trend"],
  [/^\/manpower/, "manpower"], [/^\/procurement/, "procurement"], [/^\/lookahead/, "lookahead"],
  [/^\/quality/, "report-quality"], [/^\/report/, "report-quality"], [/^\/field/, "report-quality"],
  [/^\/verify/, "report-quality"], [/^\/site/, "rfi"], [/^\/weather/, "lookahead"], [/^\/punchlist/, "commissioning"],
];
export function lessonForRoute(path) {
  const hit = ROUTE_LESSON.find(([re]) => re.test(path || ""));
  return hit ? LESSON_BY_ID[hit[1]] : null;
}

// Role-based skill priorities — a simple "gap" model for the demo. In production
// COACH would weight this by what the user has actually viewed and acted on.
const ROLE_GAPS = {
  CM: ["critical-path", "report-quality", "manpower", "lookahead", "rfi", "earned-value"],
  PM: ["earned-value", "procurement", "capacity", "rag-trend", "commissioning", "critical-path"],
  CIM: ["capacity", "commissioning", "rag-trend"],
  ADMIN: ["rag-trend", "earned-value", "critical-path", "report-quality"],
};
export function recommendForRole(role) {
  const order = ROLE_GAPS[role] || ROLE_GAPS.CM;
  return order.map((id) => LESSON_BY_ID[id]).filter(Boolean);
}
