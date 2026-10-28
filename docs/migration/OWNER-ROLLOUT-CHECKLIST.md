# Rollout checklist for the owner (Edge Config flips)

Code for every manifest route (R5–R13) is merged. What is left is the traffic move and the R14 gate. Edge Config writes are owner-only (see "Token hygiene" in `RUNBOOK-STRANGLER.md`); this page is the order of work and the checks before each step. Command shapes are in the runbook and are not repeated here.

State to confirm first (the repo cannot see it):

```sh
vercel edge-config items book-club-strangler --key strangler
```

Record `version` and every route's `percent` in the log table at the bottom. As of the last log entry in the runbook, `/clubs` was at 10 % (2026-09-30) and the R5–R9 routes were added at 10 % (memory of 2026-10-09: version 9, 14 routes); R10–R13 routes and `shell.chatWidget` may not be in the item at all.

## 0. Preconditions before raising anything

1. Angular canary events (SCRUM-55: FE #188 Angular, #189 Next, #190 release) are in the production Angular build; confirm with a request to `/api/v1/analytics/event` from an Angular page so that `cohort`, `join_club` and `js_error` exist for both apps.
2. `docs/migration/CANARY-METRICS.md` SQL runs against the production database and returns rows for `app = 'angular'` and `app = 'next'`.
3. Speed Insights is enabled on `book-club-web` (runbook, security checklist item 2).
4. SCRUM-84 is closed: Google sign-in and the `oauth_failed` message on `/login?oauth=failed` were checked by hand on Next with `bc_bucket=5`.
5. Open items that change what users see: SCRUM-81 rollout (FE #254 live before the backend flag), SCRUM-172/173 fixes merged.

## 1. One step = one write

For each step: write the whole `routes` object (the item is replaced), bump `version`, wait 1–5 s for propagation, then check `GET /strangler.json` shows the new percent.

Order (each step needs the stop criteria below to hold for at least 72 h, the same window the `/clubs` canary used):

| Step | Routes | Percent | Notes |
| --- | --- | --- | --- |
| 1 | `/privacy`, `/terms`, `/clubs`, `/clubs/:id` | 10 → 50 → 100 | already at 10 %; raise `/clubs` and `/clubs/:id` together |
| 2 | `/`, `/events`, `/events/:id` | 10 → 50 → 100 | |
| 3 | `/profile`, `/support`, `/support/new` | 10 → 50 → 100 | |
| 4 | `/login`, `/register`, `/auth/callback` | 10 → 50 → 100 | one write for all three, same value, always |
| 5 | `/clubs/create`, `/clubs/:id/edit`, `/clubs/:id/events/create`, `/events/:id/edit`, `/clubs/:id/manage`, `/clubs/:id/randomizer` | 10 → 100 | organizer flows; low traffic, test with an organizer account first |
| 6 | the seven `/clubs/:id/quizzes…` routes | 10 → 100 | one write for the whole group |
| 7 | `/chats` then `shell.chatWidget` | 10 → 100 | `shell.chatWidget` is a flag key in the same `routes` object; `NEXT_PUBLIC_WS_URL` must be set in the build |

Rollback for any step is the same write with `{"target":"legacy","percent":0}` for the route (seconds), or the global kill (`enabled:false`).

## 2. Stop criteria (from the `/clubs` canary, `RUNBOOK-STRANGLER.md`)

Set the step's routes back to `legacy` if, against `BASELINE-2026-10.md`:

- JS error rate (`js_error / cohort`, SQL in `CANARY-METRICS.md`) is more than 10 % above baseline for that app and bucket;
- LCP p75 on mobile is above 2.5 s or worse than baseline (Speed Insights);
- join conversion (`join_club / cohort`) is more than 5 % below baseline. Since SCRUM-171, Next also emits `join_club` from the club detail page, so this comparison is like for like only after PR #251 is deployed.

Lighthouse (lab, guest) on 2026-10-19 gave `/clubs` Performance 70 on Angular and 69 on Next; they are within noise of each other, so use field data (Speed Insights), not Lighthouse, for the go/no-go.

## 3. Gate G1 and R14

- Fill `GATE-G1.md` after each step (it still has `TODO` for 50 %, 100 % and the 14-day soak).
- R14 (SCRUM-115) needs every manifest route at 100 % for at least 30 days and zero requests served by the legacy fallback for 7 days, evidenced by a Vercel logs query attached to SCRUM-115. The preparation is in `R14-DECOMMISSION-PREP.md`.
- Earliest possible R14 date = day the last route reaches 100 % + 30 days.

## Log

| Date | Edge Config version | Change | Metrics check | By |
| --- | --- | --- | --- | --- |
| 2026-10-27 | 10 -> 11 | wave 1 (`wave-1.json`): /privacy, /terms, /clubs, /clubs/:id, /, /events, /events/:id 10 -> 50 % | split verified: buckets 0-49 Next, 50-99 Angular; canary SQL and Speed Insights not yet checked | owner (CLI), checked by Claude |
| 2026-10-27 | 11 -> 12 | wave 2 (`wave-2.json`): public read routes 50 -> 100 %; /profile, /support, /support/new, /login, /register, /auth/callback 10 -> 50 % | split verified: public routes all buckets Next; the six wave-B routes buckets 0-49 Next, 50-99 Angular. Applied on the owner's instruction before the 72 h window; canary SQL, Speed Insights and the manual Google sign-in check (SCRUM-84) were still open. Render logs in the previous 20 min showed one Google exchange 200 and one 400 (sign-in started from a deployment URL outside the BE origin allowlist) | owner instruction, written and checked by Claude |
| 2026-10-28 | 12 -> 13 | wave 3 (`wave-3.json`): /profile, /support, /support/new, /login, /register, /auth/callback 50 -> 100 %; the six organizer routes and seven quiz routes 10 -> 50 % | split verified after propagation (about 20 s): the six wave-B routes Next for buckets 5 and 75; /clubs/create Next for bucket 5, Angular for bucket 75. Applied on the owner's instruction about 44 h after wave 2 (72 h window shortened). SCRUM-84 checked by hand by the owner (Google and email sign-in on Next fine). Canary SQL, Speed Insights and a baseline were still open; the stop criteria are judged from field data as they appear | owner instruction, written and checked by Claude |
