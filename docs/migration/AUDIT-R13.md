# R13.4 audit: whole app on Next, legacy fallback off (SCRUM-113)

Date: 2026-10-13. Branch `feat/SCRUM-113-audit-fallback-off` (base c500644).

## Setup
- Local production build: `DISABLE_LEGACY_FALLBACK=1 VERCEL_ENV=preview NEXT_PUBLIC_OAUTH_BASE_URL=... NEXT_PUBLIC_WS_URL=... next build`, served with `next start -p 3200`. No Vercel preview was used; nothing deployed, Edge Config untouched.
- `npm run route-coverage`: 28/28 Angular routes covered, 0 gaps.

## What was NOT run: `npm run audit:full`
- `global-setup` registers users and seeds a club/event/quiz through `AUDIT_API_BASE_URL`. The only backend on this machine is `mock-server/index.js` (port 8000), which is not a real API, so the API specs and the seeded UI specs would be meaningless.
- The real backend needs Supabase auth (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, DB password); none are available locally, and a local Postgres alone is not enough. Seeding the shared Render backend needs an explicit `ALLOW_PROD_SEED` decision, so it was not done.
- A production Next build only accepts an https `BACKEND_ORIGIN`, so `/api` of the local build proxies to the shared Render backend, not the mock.
- The storageState written by `global-setup` is Angular's localStorage tokens (`bc_refresh_token`); whether the cookie-auth Next app accepts it (`src/lib/legacy-session.ts`) is unverified.
- Needed to run it: a real backend (or `ALLOW_PROD_SEED=<host>` approval), then `AUDIT_BASE_URL=<flagged preview> AUDIT_API_BASE_URL=<api> npm run audit:full`.

## What was checked (unauthenticated, curl against the flagged build)
Status/title for every manifest route plus unknown paths and legacy static files. All 28 routes answer on Next (auth-gated pages render the client-gated placeholder, `/` 307 to `/events` like Angular, `/events/` 308 to `/events`). `/clubs/{uuid}` for a nonexistent club is 404. Security headers, CSP and the `bc_bucket` cookie are present.

## Gaps vs Angular
| Bug | Gap |
|---|---|
| SCRUM-129 | `/favicon.ico`, `/favicon.svg`, `/og-image.png`, `/googleea44a5e89a1de9d7.html` are 404 (only legacy serves them; Next already emits `og:image` pointing at `/og-image.png`). Related SCRUM-119. |
| SCRUM-130 | Next head lacks `google-site-verification`, `link rel=icon`, `theme-color`, `keywords`, `mobile-web-app-capable` from `src/index.html`. |
| SCRUM-131 | Unknown URLs get the root 404 without the shell; shell 404s (`/clubs/not-uuid`, `/clubs/not-uuid/manage`, missing club) have title `Book Club` instead of `TITLES.not_found`. Documented in RUNBOOK-STRANGLER.md; related SCRUM-128. |

Not a gap: unknown-path HTTP status (Angular answered 200 as a SPA; Next correctly returns 404).
