# AGENTS.md — build conventions for DC Field Reporting

You are building **the best daily-reporting tool a data-center construction manager has ever used**, native to the OpenAI ecosystem (ChatGPT App + Codex). It is **not** a Procore/BIM replacement, **not** a multi-domain platform, **not** the old BERNARD/AIMUPS framing.

## Authorities (when in doubt, these win, in this order)
1. `schema.ts` — the data contract. Validate everything against it. Never persist a value that isn't in it.
2. `SPEC-RECONCILED-v2.md` — the decisions. If code and spec disagree, change the spec first, then build.
3. `fixtures.json` — validated sample data; mirror these shapes.

## Non-negotiable principles
- **Nothing derived is stored; everything is computed on read.** Reports, KPIs, RAG, rollups, "behind", commissioning rollups, narratives — all computed. The helpers in `schema.ts` (`tagForLevel`, `canAdvanceLevel`, `isBehind`, `isBehindCx`) express these; use them, don't store their outputs.
- **Agents narrate; they never invent numbers.** Every figure traces to a computed value over atomic entries. Extends to: report templates (learn the container, never the contents) and drawing/model rendering (color computed status, never invent geometry).
- **`key ? OpenAI : local fallback` on every AI seam.** With no `OPENAI_API_KEY`, a deterministic local path must keep the app working.
- **Synthetic data only until security review clears.** No real build data to any third party. External report distribution routes to a sandbox address until cleared.
- **CMs author only dailies.** Every other report derives and gates on CM approval (generate-and-hold; numbers locked, prose editable; snapshot-on-approval with provenance).

## Architecture
- **Surface:** ChatGPT App via the Apps SDK (MCP server renders the UI inside ChatGPT). ChatGPT itself is the conversational layer — do **not** build an in-app chatbot.
- **Data:** one swappable data-access seam (evolved from `lib/store.js`). Prototype store = Postgres (Neon via Vercel Marketplace) + Blob + pgvector; the seam must re-point to an in-house OpenAI store later without touching app logic. Scheduled report generation runs server-side (Vercel Cron).
- **Delivery spine:** the L1–L5 System Startup Matrix — `System` × `CommissioningRecord` × building. Each system advances L1→L5 independently; construction is the run-up to L1; a level cannot advance while a next-level `PunchItem` is open (`canAdvanceLevel`).
- **External systems are read-only signals** (Procore RFI/cost, P6 schedule imported as `ScheduleActivity`). Do not build native replacements for them.

## Lean function set (≈5 — do not reintroduce the 23-agent roster)
HERALD (intake normalize) · CHRONICLER (derive any cadence) · analytics engine (trend/anomaly/lagged-correlation/root-cause, dual framing, evidence links) · SCOUT (photo + drawing vision + clean-up) · WARDEN (daily-report quality). Names may appear as UI labels only.

## Build order (see SPEC §11 for acceptance criteria)
0. Clear the deck (remove BERNARD/23-agent narrative + in-app chatbot; reduce provider-registry to read-only signals).
1. **Annotation engine (lead):** Capture → ReferencePoint (drawing points titleblock-normalized) → Note (voice/text, attached or standalone) → atoms. Prereqs: offline drawing caching; Apps SDK packaging.
2. Data backbone (the seam + Postgres + Cron).
3. Delivery spine (SSM: systems × levels, punch-gated).
4. Planned & behind surface (words + infographics).
5. Scope-to-zone binding → behind-area highlighting on drawings (MEP discipline toggle) and the 3D massing view.
6. Reporting / approval / distribution.
7. Template-learning.
8. Drawings-as-canvas + SCOUT clean-up.
9. 3D massing reporting view (traced footprint + confirmed heights; isometric SVG first; never invent geometry).
10. Schedule recovery proposals (critical path + crew-to-recover).
11. Apps SDK packaging.

## Do NOT
- Reintroduce BERNARD/AIMUPS, the 23-agent roster, FORGE solutions-factory, or the in-app chatbot.
- Build native modules that replace Procore/ACC/Aconex/P6/Kahua.
- Store any derived value, invent any number, or invent any geometry.
- Send real data to any external service, or auto-deliver reports outside the sandbox, before security clearance.

## Stack
Next.js 14 (App Router) · Vercel · Zod (v4) · OpenAI APIs. Existing repo: `lib/store.js`, `lib/herald.js`, `lib/chronicler.js`, `lib/rag.js`, `lib/analytics.js`, `lib/features.js` are the keepers to build on.
