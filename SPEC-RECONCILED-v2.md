# DC Field Reporting — Reconciled Spec & Build Plan · v2
### Supersedes v1. Adds the L1–L5 delivery spine, the data backbone, the planned/behind surface, and behind-area highlighting on drawings and the 3D model.

> Where this conflicts with older docs or the in-code `context.js` platform narrative, **this wins.** Change the spec first, then let Codex build against it.

---

## 0. Scope lock (carried from v1)
One product: the best daily-reporting tool a data-center construction manager has ever used, native to the OpenAI ecosystem (ChatGPT App + Codex). **Not** a Procore/BIM replacement, **not** a multi-domain platform, **not** the legacy orchestrator/platform-suite framing. A construction-manager reporting ecosystem — rich, but focused on capture → synthesis → reporting.

Core promise: **the CM authors one daily report; everything else derives and waits for approval.**

---

## 1. Principles (carried)
1. Nothing derived is stored; everything is computed.
2. Agents narrate; they never invent numbers. Extends to: report-template learning (learn the container, never the contents) and drawing/model rendering (color computed status, never invent geometry).
3. `key ? OpenAI : local fallback` on every AI seam.
4. Synthetic data only until security review clears — see §4.
5. CMs author only dailies; all cadences derive and gate on approval.

---

## 2. Delivery model — THE SPINE (new, central)

Tracking runs on **three nested dimensions**, all user-selectable: **building × system/scope × commissioning level (L1–L5)**. This is the System Startup Matrix model: each system progresses through the five levels independently, per building.

### 2.1 The five levels (per system, per building)
| Level | Tag | Meaning | Gate to advance |
|---|---|---|---|
| L1 | Red | Factory testing complete (FAT, QA/QC) | factory tests signed off |
| L2 | Yellow | Installation & pre-startup complete | install verified vs spec; static/pre-startup tests done |
| L3 | Green | Systems start-up complete | energized, configured, startup issues resolved |
| L4 | Blue | Functional testing complete | sequences/failover verified; staff trained |
| L5 | White | Integrated system testing complete | integrated load + failure scenarios validated; docs/training delivered |

Each level-tag carries: level, equipment/system ID, test date, responsible sign-offs.

### 2.2 Run-up and tail (bracket the five)
- **Design & planning** (pre-L1): Cx team, design package, standards — modeled as the run-up that gets a system to L1-ready.
- **Construction** (structure, envelope, MEP rough-in): tracked as progress toward L1-ready per system. This is where the CM spends most of the project; it feeds the spine, it isn't outside it.
- **Closeout & handover** (post-L5): as-builts, manuals, warranties, walkthroughs, lessons learned.

### 2.3 Punch-gated advancement (the discipline worth stealing)
A system **cannot** advance a level while punch items or gate checklists for that level are open ("fail on no / punch on fail"). This is the same approval-and-lock pattern as the report flow, applied to commissioning. KEYSTONE's existing punchlist (open/closed by system) feeds the gate.

### 2.4 The matrix view (SSM)
Primary status surface: **systems (rows) × buildings**, each cell showing current level (with tag color), planned level for the period, open punches, and behind/at-risk status. Selectable to drill by building, by system, by level, or by area/zone.

---

## 3. Architecture after the review (condensed from v1)

- **KEEP — the reporting core:** `store` → `herald` → `chronicler` → `rag`; `analytics.js` (the BI engine — trend, anomaly, lagged correlation, root-cause hypotheses, dual framing, evidence links); the `features.js` derivations (weather→delay, manpower forecast, procurement risk, look-ahead, punchlist, report-quality); voice daily form; SCOUT vision; COACH JIT training (13 lessons). **Most of the requested feature set already exists here.**
- **REFRAME — consume, don't replace:** external systems (Procore/ACC/P6) are read-only signals feeding reports, not native replacements. Drop the "native module replacement / provider registry" framing.
- **CUT/PARK:** legacy orchestration narrative + 23-agent roster as architecture; FORGE solutions-factory, LIBRARIAN tiers, PROVOST register; the in-app chatbot.
- **SURFACE:** ChatGPT App (Apps SDK) — the rich UI renders inside ChatGPT via an MCP server; **ChatGPT itself is the conversational layer** (no in-app chatbot). Server-side store + scheduler for the real build.
- **Lean function set (≈5, not 23):** intake/normalize (HERALD) · derive/cascade (CHRONICLER) · analyze/narrate (analytics engine) · vision + drawing clean-up (SCOUT) · report quality (WARDEN). Named personas may persist as cosmetic UI labels; they are not orchestrated agents.

---

## 4. Data backbone (new) — the central repository

Data is three shapes; conflating them is the usual mistake.

| Shape | Examples | Store |
|---|---|---|
| Structured atoms | daily reports, reference points, notes, schedule activities, KPI readings, risks, commissioning level/tag records, punch items | **Relational DB (Postgres)** — single source of truth; everything computed on read |
| Files / blobs | photos, drawings, generated report PDFs | **Blob storage** |
| Retrieval corpus | knowledge base for "ask AI" | **Vector store** (pgvector in the same Postgres to start) |

### 4.1 The swappable seam (the load-bearing decision)
All three sit behind **one data-access module** (the evolution of `store.js`) and, for the OpenAI surface, behind the **MCP server**. App logic and the entire computed-derivation layer talk only to the seam — never directly to a vendor.

### 4.2 Data-home contract — synthetic now, in-house later
- **Now (synthetic only):** Postgres on **Neon via the Vercel Marketplace** (one-click, billed through Vercel, moves with the project on team transfer) + **Vercel Blob** + **pgvector**. Plain Postgres chosen over an all-in-one (Supabase) specifically for clean portability.
- **Production (TBD — open dependency):** assume OpenAI will require data-center build data to live **in-house, in OpenAI's approved environment**, not on Vercel/Neon. On clearance, the seam re-points to the approved Postgres-compatible in-house store. **One-file change, no rebuild.** No real build data touches any third-party (Vercel, Neon, OpenAI API surfaces) until each is explicitly cleared.
- **Action:** confirm the approved in-house data environment with OpenAI security (Dan, next week). Until then the spec specifies the seam, not the destination.

### 4.3 Scheduling & ingest
- Scheduled report generation runs as a **Vercel Cron** job server-side (impossible under the current client-side store).
- **P6 schedule** imported (XER/XML) as schedule-activity atoms feeding the existing CPM engine (`plan.js`).
- **Procore** consumed as read-only tagged signals (e.g., open-RFI aging as a leading indicator).

---

## 5. Field capture & annotation engine — LEAD BUILD (from v1, extended)

The reference-point/annotation engine remains the first feature slice. Data model: **Capture** (`site_photo` | `drawing_sheet`) → **ReferencePoint** (drawing points stored **titleblock-normalized 0–1** to survive revision swaps) → **Note** (voice or text; attached to a point or standalone). All append as atoms.

**New — scope/system-to-zone binding:** a zone on a drawing (the existing `.imgwrap`/`.zone` engine) binds to a system/scope. This binding is what lets schedule/commissioning status flow into zone color (§6, §7). Sequence: zones/points exist → scope binds to zone → status drives color.

**Prerequisites (called out):** (1) offline drawing caching — sheets a CM will annotate must be on the device before going to the field; (2) ChatGPT App (Apps SDK) packaging + enterprise-ChatGPT permission.

---

## 6. Drawings-as-canvas, clean-up, 3D model — behind-area highlighting (extended)

The tool consumes a drawing as a **communication canvas**, not a system of record.

### 6.1 Pipeline
Capture (download from source **or** scan a hard copy, SCOUT dewarp/deskew) → place on a report → annotate / drop points → color-code zones → optional SCOUT **clean-up** → embed.

### 6.2 Behind-area highlighting (the convergence)
The behind/late status per system (the planned-vs-forecast variance, §7) and the per-system commissioning level (§2) are the **same data that colors a zone**:
- **On the drawing:** a system behind plan paints its bound zone in its status color (RAG / commissioning tag). Because sheets carry discipline (Architectural / Structural / Mechanical / Electrical / Low-voltage in `drawings.js`), the **discipline/layer toggle** answers "what MEP is behind" — light up only the mechanical or electrical zones on the relevant sheet. (This closes the Procore layer-toggle gap.)
- **On the 3D model:** the human-confirmed **massing shell** (traced footprints + confirmed floor-to-floor heights) is colored by the same status — "MEP behind on level 2" renders as a red region on the level. Geometry is confirmed-massing; coloring is computed status; nothing invented; raw drawing one tap away.

### 6.3 Clean-up guardrail
SCOUT may straighten, vectorize, normalize colors/labels, lay out cleanly. It must **not** add/move/infer geometry. Clean-up is a rendering of what's there, with provenance to the raw capture.

### 6.4 3D = massing reporting view, not BIM
No authoritative model is reconstructed (no model exists). Footprint traced (SCOUT-assisted, human owns it); floor-to-floor height required + human-confirmed; model decoupled from renderer; **isometric SVG first** (prints into PDF, works offline), interactive WebGL later. Both renderers are pure functions of the same massing model.

---

## 7. Planned & behind surface (new)

Shows, **in words and infographics**, planned work and work that is late/behind — expressible per **phase/level, system, building, and zone**.

- **Words:** CHRONICLER narrates the status from computed numbers ("Building 17 has three systems behind plan; electrical fit-out at 33% is forecast ~9 days late, gated by switchgear delivery"). Never invented.
- **Infographics:** variance bars (% complete, days late, gating reason), the planned-next-3-weeks list (color-coded by risk), and the same status rendered spatially as colored zones on the drawing and regions on the 3D model (§6.2).
- **Lands in three places:** the executive dashboard, an auto-included section in the derived reports, and the drawing/model highlighting.
- **Mostly presentation:** `plan.js` already holds planned vs forecast finish; `getLookahead` already produces the planned list; `analytics.js` has the variance math. Net-new is the narrated/visual surface + the scope-to-zone binding driving the spatial view.
- **Recovery (next step up):** each behind row gains "propose recovery plan" — combining the critical path (`plan.js`) with MUSTER's crew-to-recover math (`features.js`).

---

## 8. Reporting / approval / distribution (carried from v1)
- CMs author only dailies; all cadences derive via `chronicler.deriveReport({ building, system, level, cadence, period })` (now phase/level-aware).
- Triggers: scheduled (Vercel Cron) + on-demand (incl. via ChatGPT). **Generate-and-hold** — generation notifies the CM; nothing leaves until approval.
- Review: narrative editable; **computed numbers locked** (override = flagged + required reason).
- Approval: snapshot + version + provenance (immutable).
- Distribution: always-available manual save/forward; per-report-type default recipient list with auto-deliver on approval (CM override per instance); routed to a **sandbox address until security clears**.

---

## 9. Template-learning engine (carried from v1)
Upload a recipient's example report → AI learns the **container (slots/structure), never the contents** → emits a named reusable `ReportTemplate` → canonical report object renders through it → CM reviews once → silent after. Unmappable slots flagged for manual bind. Gap slots: **flag-and-empty + suggest adding the field upstream**. Default PDF + optional DOCX. `key?OpenAI:local`.

---

## 10. Data-contract additions (extend `schema.ts`, Zod strict)
- `Capture`, `ReferencePoint`, `Note` (§5)
- `ZoneBinding` — `{ id, zoneId, captureId, system, building, normalizedBox }`
- `System` — `{ id, name, discipline, building }`
- `CommissioningRecord` — `{ id, systemId, building, level: 1..5, tag: "red"|"yellow"|"green"|"blue"|"white", plannedLevelForPeriod, testDate, signoffs[], openPunchIds[] }`
- `PunchItem` — `{ id, systemId, level, status: "open"|"closed", description }` (gates level advancement)
- `ScheduleActivity` — `{ id, system, building, plannedFinish, forecastFinish, pct, critical, gatingId }` (P6-imported)
- `MassingModel` — `{ id, building, levels:[{ footprint, floorToFloor, confirmedBy }], statusOverlays[] }`
- `ReportTemplate`, `DerivedReportSnapshot`, `DistributionConfig` (§8–9)

---

## 11. Build plan (re-sequenced, Codex-ready)

| Slice | Build | Acceptance criteria |
|---|---|---|
| **0 — Clear the deck** | Prune to scope | Legacy orchestrator/23-agent narrative + in-app chatbot removed; provider-registry "replacement" reduced to read-only signal; app still builds; reporting core untouched. |
| **1 — Annotation engine (LEAD)** | Reference points + notes on captures | Point on photo or cached drawing; drawing points titleblock-normalized; note attached or standalone; voice + text; all append as atoms; survives a revision swap. |
| **2 — Data backbone** | The swappable seam + Postgres | `store.js` → Neon Postgres + Blob + pgvector behind one data-access module; append/read shapes unchanged; Vercel Cron runs a scheduled job; seam documented as re-pointable to in-house store. |
| **3 — Delivery spine (SSM)** | L1–L5 per system | `System` + `CommissioningRecord` + `PunchItem`; SSM matrix (systems × buildings) with tag colors; punch-gated advancement enforced in the store; construction tracked as progress-to-L1. |
| **4 — Planned & behind surface** | Words + infographics | Variance bars + narrated status per phase/system/building; planned-next-3-weeks; on dashboard and auto-included in reports. |
| **5 — Scope-to-zone binding + behind highlighting** | Spatial status | Zone binds to system; schedule/level status colors the zone on the drawing; discipline toggle filters "what MEP is behind." |
| **6 — Reporting / approval / distribution** | Governed cascade | Generate-and-hold; numbers locked / prose editable; snapshot-on-approval; per-type distribution to sandbox. |
| **7 — Template-learning** | Format from uploaded example | Learn slots not values; review-once; gap = flag-and-empty + suggest upstream; PDF + optional DOCX. |
| **8 — Drawings-as-canvas + clean-up** | Capture → annotate → color → clean-up → embed | Download + scan ingest; SCOUT clean-up beautifies only, provenance to raw. |
| **9 — 3D massing reporting view** | Massing from confirmed inputs | Traced footprint + confirmed heights; isometric SVG render; status overlays (behind systems/levels) on the shell; no invented geometry. |
| **10 — Schedule recovery proposals** | Recover a date | "Propose recovery plan" per behind item: critical path + MUSTER crew-to-recover; narrated, numbers computed. |
| **11 — Apps SDK packaging** | ChatGPT App surface | MCP server exposes tools (read tools `readOnlyHint`); rich UI renders inside ChatGPT; ChatGPT drives ask/generate; app gates on approval. |

---

## 12. Open dependencies
1. **Production data home** — confirm OpenAI's approved in-house environment (Dan, next week). Spec specifies the seam; destination TBD.
2. **Delivery-spine confirmation** — built as L1–L5 *per system* (SSM), construction as run-up to L1. Flag if the program instead tracks a single whole-building progression.
3. **Apps SDK / enterprise-ChatGPT permission** for the app surface.

---

## 13. Unchanged from prior packages
`key ? OpenAI : local` · snapshot-on-approval with provenance · synthetic-only until cleared · atomic store discipline · change-the-spec-first-then-build.
