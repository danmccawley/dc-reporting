# Data Center Multi-Site Reporting — Prototype

A clickable front-end prototype on **seeded sample data**, for stakeholder review. It demonstrates the
executive-to-daily drill-down, the Red/Amber/Green status system with the 4-week rolling-average trend wash,
the scope-by-building heat map, the **mobile-first field daily report** (camera capture + offline draft and
sync), and the weekly edit-and-approve flow.

No backend, no agents, no auth. All data lives in `lib/mock/data.js`. The UI is built to be the real
front end later: swap the mock module for an API behind the same shape and the screens keep working.

## Highlights to show stakeholders

- `/` executive dashboard with a callout to the field demo.
- `/field` — the **field experience in a phone frame**: one-handed mobile layout, native camera capture
  (opens the camera on a real phone), and offline behavior. Toggle "Simulate offline", submit a report, watch
  it save on the device and auto-sync on reconnect. Installs as a PWA ("Add to Home Screen").
- The same field form renders full-width on an actual phone at `/report/daily`.
- `/reports` — launchable report presentations (CANVAS-style). Each report opens summary-first, with clickable
  scope rows that jump to deep dives, and "view daily entries" links that drill all the way to the daily log.
  Printable to PDF.
- CONCIERGE — a floating "Ask" button on every page answers questions about the program and the platform.

## Enabling the CONCIERGE Q&A agent

Out of the box CONCIERGE answers the common demo questions from the live sample data (no setup needed).
To let it answer *any* open-ended question, set an OpenAI key as an environment variable:

- Local: create `.env.local` with `OPENAI_API_KEY=sk-...` (optionally `OPENAI_MODEL=gpt-4o-mini`).
- Vercel: Project → Settings → Environment Variables → add `OPENAI_API_KEY`, then redeploy.

With no key set, it falls back to the grounded canned answers so the demo never breaks.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel (live URL for stakeholders)

Option A — GitHub + Vercel dashboard (recommended)
1. Create a new GitHub repo and push this folder to it.
2. Go to vercel.com, **Add New → Project**, import the repo.
3. Framework preset auto-detects **Next.js**. Leave all defaults. **Deploy.**
4. You get a `https://<project>.vercel.app` URL to share.

Option B — Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the prompts; accept defaults.

## What's where

- `app/page.js` — executive dashboard (roll-up, heat map, agent alerts, field-demo callout)
- `app/field/page.js` — mobile field daily report shown in a phone frame (desktop demo)
- `app/report/daily/page.js` — the same field form, full-width for phone use
- `app/components/FieldDailyForm.js` — mobile-first daily report: camera capture, offline draft + sync
- `app/components/PhoneFrame.js` — device frame for the desktop demo
- `app/manifest.js` — PWA manifest (installable to home screen)
- `app/site/[id]/page.js` — site dashboard (scope progress + KPI tiles)
- `app/scope/[id]/page.js` — scope drill-down (by building → weekly → daily)
- `app/report/weekly/page.js` — weekly report with approve/lock (links to the launchable report)
- `app/reports/page.js` — index of generated reports
- `app/reports/[id]/page.js` — launchable report presentation (summary → deep dive → daily)
- `app/components/Concierge.js` + `app/api/concierge/route.js` — the Q&A agent (OpenAI-backed, local fallback)
- `lib/context.js` — grounding context (platform + live demo data) for CONCIERGE
- `lib/mock/data.js` — the single source of sample data (swap this for the real layer)
- `lib/rag.js` — RAG, trailing 4-week average, and trend logic (deterministic)

## Notes for the real build

- Trend wash stays neutral until a site has 4 full weeks of data (see Building 18).
- Every KPI declares `higherIsBetter` so "toward goal" is computed correctly (RFI days up = red; productivity up = green).
- RAG and rolling averages are computed in code. Agents narrate; they do not invent numbers.
- Field client: offline drafts persist on-device here; full background sync uses a service worker in
  production. Photos are in-memory in the prototype; production uploads them to feed SCOUT.
