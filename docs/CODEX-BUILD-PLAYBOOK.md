# DC Field Reporting — Codex Build Playbook

The operating manual for building the construction-manager reporting tool with OpenAI Codex.
Repo: **github.com/danmccawley/dc-reporting** · Surface target: **ChatGPT App (Apps SDK)** · Data: **synthetic only until security clears**.

---

## 0. What's already in the repo (the starting line)

Committed and pushed to `main`:

- `lib/schema.ts` — the complete, verified data contract (Zod, 17/17 checks). **The authority.**
- `AGENTS.md` — build conventions. **Codex reads this automatically.**
- `SPEC-RECONCILED-v2.md` — the decisions and the slice plan.
- `schema.json`, `fixtures.json` — JSON Schema export + validated sample data.
- `lib/herald.js`, `lib/store.js`, `lib/chronicler.js` + voice-field work — the existing engine.
- `docs/prototypes/annotation.html`, `docs/prototypes/ssm.html` — UX reference Codex can read in the sandbox.

Live prototypes (for *your* reference, not Codex's — the sandbox has no internet):
`https://oai-cm-reporting-tool.vercel.app`

---

## 1. How the loop works

Codex Cloud runs inside ChatGPT. You give it one scoped task in plain English; it clones the repo into an isolated sandbox, works, and hands back a **pull request** you review and merge. It is asynchronous and autonomous — **the PR review is your control point.**

The rule that governs this whole playbook: **one slice per task.** Run a task, wait for the PR, review it, merge it, then start the next. Never paste "build the whole app" — scoped tasks produce dramatically better results.

---

## 2. One-time setup (connect + environment)

1. Go to **chatgpt.com/codex** (or open the ChatGPT app and select **Codex** in the sidebar). Sign in on a plan that includes Codex.
2. Click **Connect to GitHub** → authorize OpenAI's GitHub app.
3. When prompted for repo access, choose **Only select repositories → danmccawley/dc-reporting** (keeps the scope tight).
4. Click **Create environment** → repo `dc-reporting`, branch `main`.
5. In the **setup script** field, enter:
   ```
   npm install
   ```
   (The sandbox has no internet at task time, so dependencies must install here.)
6. Leave **internet access OFF** (default). Save the environment.

You're now ready to assign tasks. To run any task below: select the **dc-reporting** environment, paste the task block, click **Code**.

---

## 3. Standing rules (true for every task)

Codex reads these from `AGENTS.md`, but keep them in mind when reviewing every PR:

- **Authorities, in order:** `lib/schema.ts` > `SPEC-RECONCILED-v2.md` > `fixtures.json`. When code disagrees with them, they win.
- **Nothing derived is stored; everything is computed on read.** Reports, KPIs, RAG, rollups, "behind", commissioning rollups, narratives — all computed.
- **Agents narrate; they never invent numbers.** Extends to: templates learn the container not the contents, and rendering colors status but never invents geometry.
- **`key ? OpenAI : local fallback` on every AI seam.** With no `OPENAI_API_KEY`, a deterministic local path keeps the app working.
- **Synthetic data only** until security review clears. No real data to any third party; external sends route to a sandbox address.
- **CMs author only dailies.** Everything else derives and gates on CM approval.
- **Do NOT:** reintroduce the legacy orchestrator/platform-suite framing, the 23-agent roster, or the in-app chatbot; build native replacements for Procore/ACC/P6; store derived values; invent numbers or geometry; send real data before clearance.

---

## 4. The build, slice by slice

Run these in order. Each block is the exact text to paste into Codex.

### Slice 0 — Clear the deck

**Goal:** strip the legacy framing so the codebase matches the v2 spec.

```
Execute Slice 0 only, per SPEC-RECONCILED-v2.md and AGENTS.md.

Goal: remove the legacy framing so the codebase matches the v2 spec.
- Remove the legacy orchestrator/platform-suite narrative and the 23-agent roster (largely in lib/context.js) and the in-app chatbot. ChatGPT is the conversational layer; there is no in-app chatbot.
- Reduce the agent/provider registry to the lean function set only: HERALD, CHRONICLER, analytics engine, SCOUT, WARDEN.
- Treat external systems (Procore/ACC/P6) as read-only signals — keep any scaffolding but remove anything that positions them as native replacements.

Constraints:
- Do NOT add new features in this task.
- Do NOT modify lib/schema.ts.
- Keep `npm run build` passing and existing pages working.

Open a PR summarizing exactly what was removed and why.
```

**Before you merge, check:** the legacy 23-agent narrative and in-app chatbot are gone; `lib/schema.ts` untouched; engine files (`herald.js`, `store.js`, `chronicler.js`) NOT deleted; build still green.

---

### Slice 1 — Field annotation engine (the lead feature)

**Goal:** Capture → ReferencePoint → Note, flowing into the daily report.

```
Execute Slice 1 (field annotation engine), per SPEC-RECONCILED-v2.md and lib/schema.ts.

Build Capture → ReferencePoint → Note:
- Open a drawing sheet or a site photo.
- Drop numbered reference points. Drawing-sheet points are stored titleblock-normalized (0–1) using the CoordSpace type in lib/schema.ts, so they survive sheet-revision swaps.
- Attach a voice or typed note to a point, or as a standalone note.
- Flow every capture/point/note into the daily report as atomic entries.

Use docs/prototypes/annotation.html as the exact UX and interaction reference.

Rules (from AGENTS.md):
- Validate ALL data against lib/schema.ts (Zod). Persist only atomic facts; nothing derived is stored.
- key ? OpenAI : local fallback for any AI (e.g. voice transcription) — it must fully work with no OPENAI_API_KEY set.
- Synthetic data only.

Open a PR with a short demo description of the new flow.
```

**Before you merge, check:** points stored normalized (0–1); notes attach-or-standalone; entries validate against the schema; works with no API key; UX matches the prototype.

---

### Slice 2 — Data backbone (the swappable seam)

**Goal:** one data-access seam, Postgres implementation, re-pointable later.

```
Execute Slice 2 (data backbone) per SPEC-RECONCILED-v2.md.

Replace the in-memory store behind ONE swappable data-access seam (evolve lib/store.js into a typed interface). Provide a Postgres implementation (Neon via Vercel Marketplace) plus Vercel Blob for captures/photos and pgvector for embeddings. The seam must let the store be re-pointed to a different (in-house) backend later by changing one module, with zero changes to app/feature code.

Add server-side scheduled report-generation scaffolding via Vercel Cron (no real sends yet).

Rules:
- All reads/writes go through the seam; no feature code talks to Postgres directly.
- Validate every record against lib/schema.ts on write.
- Nothing derived is stored. key ? OpenAI : local fallback preserved. Synthetic data only.
- Keep the in-memory implementation available as the no-credentials fallback.

Open a PR describing the seam interface and how to swap backends.
```

**Before you merge, check:** no feature code imports Postgres directly (only the seam does); in-memory fallback still works with no DB configured; writes validate against the schema.

---

### Slice 3 — Delivery spine (System Startup Matrix, L1–L5)

**Goal:** systems × buildings, tag colors, punch-gated advancement.

```
Execute Slice 3 (System Startup Matrix / L1–L5 delivery spine) per SPEC-RECONCILED-v2.md and lib/schema.ts.

Build the systems × buildings matrix: each System has a CommissioningRecord with current level (0=pre-L1 .. 5), tag color (red/yellow/green/blue/white via tagForLevel), and plannedLevelForPeriod. Show behind-plan cells (isBehindCx) and, on click, the PunchItems gating the next level — advancement blocked while a next-level punch is open (canAdvanceLevel; "fail on no").

Use docs/prototypes/ssm.html as the exact UX reference. Include the discipline filter (Electrical/Mechanical/Controls) to show "what MEP is behind."

Rules: validate against lib/schema.ts; status is computed (never stored); synthetic data only.

Open a PR.
```

**Before you merge, check:** tag color derives from level (uses `tagForLevel`); the punch gate actually blocks (uses `canAdvanceLevel`); behind cells use `isBehindCx`; matches the prototype.

---

### Slice 4 — Planned & behind surface

**Goal:** plain-language + infographic "what's behind and why."

```
Execute Slice 4 (planned & behind reporting surface) per SPEC-RECONCILED-v2.md.

For each building/scope, compute planned-vs-actual and surface what is behind, in plain narration plus simple infographics (variance bars). Drive it from ScheduleActivity (isBehind = forecast > planned) and the commissioning records from Slice 3. Agents narrate; every number traces to a computed value.

Rules: nothing stored that can be computed; key ? OpenAI : local fallback for narration; synthetic only.

Open a PR.
```

**Before you merge, check:** every figure traces to a computed value (no hard-coded numbers); narration degrades gracefully with no key.

---

### Slice 5 — Scope-to-zone binding + behind-area highlighting

**Goal:** color drawing zones by computed status, with an MEP toggle.

```
Execute Slice 5 (scope-to-zone binding + behind-area highlighting) per SPEC-RECONCILED-v2.md and lib/schema.ts.

Let a user bind a drawing zone (ZoneBinding: normalized box on a Capture) to a System. Then color those zones on the drawing by the system's computed status (on-track/at-risk/behind), with a discipline (MEP) toggle so the user can see "what MEP is behind." Geometry/zones are human-drawn; rendering only COLORS status, never invents geometry.

Rules: validate against lib/schema.ts; status computed; synthetic only.

Open a PR.
```

**Before you merge, check:** zones are human-drawn (not auto-detected); coloring is status only; MEP toggle works.

---

### Slice 6 — Reporting, approval, distribution

**Goal:** derive all cadences, lock numbers, snapshot on approval, sandbox sends.

```
Execute Slice 6 (reporting, approval, distribution) per SPEC-RECONCILED-v2.md and lib/schema.ts.

CMs author only dailies; CHRONICLER derives all other cadences (weekly/monthly/quarterly/owner) on demand — generate-and-hold, nothing sent unapproved. Review flow: numbers LOCKED, prose editable; a NumberOverride requires a reason and is flagged. On approval, write a DerivedReportSnapshot (frozen computedValues + sourceReportIds provenance + version). Distribution per DistributionConfig: per-type recipient lists + always-available manual forward, sandbox=true (route to a sandbox address) until security clears.

Rules: derived reports computed from atomic entries; never auto-send outside sandbox; synthetic only.

Open a PR.
```

**Before you merge, check:** numbers locked / prose editable; override requires a reason; snapshot carries provenance + version; nothing sends outside the sandbox.

---

### Slice 7 — Template-learning

**Goal:** learn a recipient's report *container*, never its contents.

```
Execute Slice 7 (template-learning) per SPEC-RECONCILED-v2.md and lib/schema.ts.

Let a user upload a recipient's example report; learn the CONTAINER (its slots/structure) into a ReportTemplate (source="learned") — never copy the example's CONTENTS. Map slots to data fields; an unmapped slot (dataField=null) is flagged and left empty, with a suggestion to add the field upstream. Templates are review-once (reviewedBy). Default output PDF, optional DOCX.

Rules: learn structure, never content; validate against lib/schema.ts; synthetic only.

Open a PR.
```

**Before you merge, check:** only structure is learned (no copied prose/numbers); unmapped slots flagged + empty; review-once gate present.

---

### Slice 8 — Drawings as canvas + SCOUT clean-up

**Goal:** annotate/markup; AI beautifies marks, never invents geometry.

```
Execute Slice 8 (drawings as canvas + SCOUT clean-up) per SPEC-RECONCILED-v2.md.

Make the drawing a communication canvas: annotate, color, mark up. SCOUT "clean-up" beautifies a hand markup (straightens, tidies) but NEVER invents or alters geometry/measurements. Clean-up is a visual aid on top of the human's marks, fully reversible.

Rules: never invent geometry; key ? OpenAI : local fallback (clean-up degrades to raw markup with no key); synthetic only.

Open a PR.
```

**Before you merge, check:** clean-up is reversible and sits on top of human marks; no geometry/measurements invented; raw markup works with no key.

---

### Slice 9 — 3D massing reporting view

**Goal:** honest massing from traced footprints + confirmed heights.

```
Execute Slice 9 (3D massing reporting view) per SPEC-RECONCILED-v2.md and lib/schema.ts.

Build an honest massing view from a MassingModel: human-traced level footprints + human-confirmed floor-to-floor heights (REQUIRED). This is a reporting view, NOT BIM reconstruction — no model is inferred. Render isometric SVG first; keep the model decoupled from the renderer. Color shell regions by computed status via StatusOverlay (on-track/at-risk/behind). Never invent geometry or heights.

Rules: geometry human-confirmed; status computed; validate against lib/schema.ts; synthetic only.

Open a PR.
```

**Before you merge, check:** footprints traced and heights confirmed by a human (required fields); model decoupled from renderer; status coloring only.

---

### Slice 10 — Schedule recovery proposals

**Goal:** advisory recovery options a human confirms.

```
Execute Slice 10 (schedule recovery proposals) per SPEC-RECONCILED-v2.md and lib/schema.ts.

From ScheduleActivity (critical path + behind items) and manpower, propose recovery options (e.g., crew-to-recover, resequencing) as ADVISORY suggestions a human confirms — never auto-applied. Show the basis (which activities, what lag). Agents narrate; numbers computed.

Rules: advisory only; never invent numbers; key ? OpenAI : local fallback; synthetic only.

Open a PR.
```

**Before you merge, check:** proposals are advisory (never auto-applied); each shows its basis; numbers computed, not invented.

---

### Slice 11 — ChatGPT Apps SDK packaging

**Goal:** ship as a ChatGPT App; ChatGPT is the conversation.

```
Execute Slice 11 (ChatGPT Apps SDK packaging) per SPEC-RECONCILED-v2.md.

Package the app as a ChatGPT App via the Apps SDK: an MCP server that renders the tool's UI inside ChatGPT and exposes read/derive actions. ChatGPT is the conversational layer — there is no in-app chatbot. Scheduled report generation runs server-side (Vercel Cron). Expose telemetry/read tools only; no AI-accessible write/actuation.

Rules: read-only AI surface; the per-tool scoped manifest is the security boundary; synthetic only until cleared.

Open a PR.
```

**Before you merge, check:** no in-app chatbot; AI surface is read-only (no write/actuation tools); manifest scopes are tight.

---

## 5. Review checklist (run on every PR before merging)

- [ ] **In scope** — did only the slice's work; no legacy 23-agent/chatbot framing reintroduced; no Procore-replacement built.
- [ ] **Schema respected** — `lib/schema.ts` unchanged (unless the task is about it); all new data validates against it.
- [ ] **Nothing derived stored; nothing invented** — no persisted rollups; no made-up numbers or geometry.
- [ ] **Fallback intact** — builds and runs with no `OPENAI_API_KEY`.
- [ ] **Build green** — `npm run build` passes; existing pages still work.
- [ ] **Synthetic only** — no real external sends; sandbox flags respected.

If a PR drifts, reply to Codex with the correction (or comment on the PR) and let it revise — don't merge a drifted PR and fix it later.

---

## 6. Environment notes & gotchas

- **No internet in the sandbox (default).** Dependencies install via the setup script (`npm install`). OpenAI API calls won't actually run there — Codex can only exercise the *local fallback* side. To test real OpenAI calls, flip internet access on for the environment **or** run the branch locally with your key.
- **One slice per task.** Merge before starting the next.
- **If Codex stalls or sprawls on a big slice, split it.** Example for Slice 2: first task "build only the seam interface + in-memory impl," second task "add the Postgres/Blob/pgvector implementation behind the seam."
- **You merge on GitHub.** Read the diff there; that's the control point.
- **Git line-ending warnings (LF→CRLF)** on Windows are cosmetic — ignore them.

---

## 7. After the build

- **Security review answer** → set the production data home; re-point the data seam (one module, by design). Until then, synthetic only.
- **Enterprise ChatGPT deployment** once the developer account is ready.
- **Parked:** reconcile the reconstructed base `schema.ts` if the original June-7 version resurfaces.

---

## Kickoff line (paste alongside your first task if you want to orient Codex explicitly)

> Read `AGENTS.md` first. Treat `lib/schema.ts` and `SPEC-RECONCILED-v2.md` as authoritative — when code disagrees with them, they win. Build one slice at a time, open a PR per slice, and stay strictly in scope. Start with Slice 0.

*Tip: commit this file to the repo as `docs/CODEX-BUILD-PLAYBOOK.md` so it travels with the project.*
