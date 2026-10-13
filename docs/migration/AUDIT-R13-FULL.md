# R13 full audit against a local Docker backend (SCRUM-132)

Backend: `docker-compose.audit.yml` in book-club-be (branch `chore/SCRUM-132-local-audit-stack`), API on `127.0.0.1:8001` (8000 was taken by a local mock server). Throwaway secrets only; nothing ran against Render, Supabase or production.

## Setup actually used

- API: `AUDIT_API_BASE_URL=http://localhost:8001/api/v1 AUDIT_BASE_URL=http://localhost:3200 npm run audit:full:api`
- UI: `next dev -p 3200` of apps/web with `DISABLE_LEGACY_FALLBACK=1 BACKEND_ORIGIN=http://localhost:8001 VERCEL_ENV=preview`, then `npx playwright test --config=playwright.full-audit.config.ts e2e/ui`.
- A production build was not possible: `backendOrigin()` rejects an http origin when `NODE_ENV=production`.

## API specs

77 specs. First run: 73 passed, 4 failed.

| Spec | Cause | Class |
| --- | --- | --- |
| clubs.api:94, clubs.api:122, chat.api:38 (first run) | 429 `5 per 1 minute` on /auth/register, hardcoded limit, one client IP | environment |
| clubs.api:40 `GET /clubs/{id}/stats` | 500, repo filters `Event.status == "upcoming"`, not in the enum | app bug SCRUM-133 |
| chat.api:38 ban step | 500, FK violation banning a non-existent user | app bug SCRUM-134 |

After re-running the `clubs` and `chat` spec files separately with a 65s gap (rate limit respected): 75 of 77 pass, 2 fail (SCRUM-133, SCRUM-134).

## UI specs (next dev, local backend)

62 specs: 50 passed, 12 failed.

| Spec(s) | Cause | Class |
| --- | --- | --- |
| a11y /chats, chats.spec x2 | CSP `connect-src` allows only `wss://book-club-be.onrender.com`; a local `ws://` backend is blocked. `.room-row` also absent in React DOM | environment + selector drift, not proven either way |
| clubs.spec:73,78; quizzes.spec:51; events.spec:25 | member not redirected from organizer-only pages; event edit redirects to /clubs, not /events | app bug SCRUM-135 |
| clubs.spec:36 edit-club | backend saved the new name, detail page still shows the old one within 5s | app bug SCRUM-136 (triage on a prod build) |
| clubs.spec:23 create-club | React redirects an organizer that already owns a club to /clubs (`create-club.tsx`), spec expects the Angular error message | spec drift (intentional delta) |
| clubs.spec:45 manage page, quizzes.spec:12 (`#q-text`), quizzes.spec:56 | selectors written for the Angular DOM (`#q-text` does not exist in React), not triaged further | spec drift, unverified |

## Cookie-auth and the localStorage session

Verified with curl through the Next proxy on :3200: POST `/api/v1/auth/refresh` with `{refreshToken}` and `Origin: http://localhost:3200` returns `Set-Cookie: refresh_token` and `access_token`, and `GET /api/v1/users/me` with those cookies returns the user. This is the call `migrateLegacySession()` (`apps/web/src/lib/legacy-session.ts`) makes for `bc_refresh_token`, so the Next app accepts the audit's seeded session. The backend sets cookies only for a trusted Origin/Referer. Most authenticated UI specs passed (50 of 62), which agrees with this.

## Harness problems (not app bugs)

- `global-setup` opens `AUDIT_BASE_URL` even for API-only runs, so a frontend must be running.
- `next dev` needs `npm run build -w @book-club/i18n` first (otherwise 500 on `@book-club/i18n/uk.icu.json`).
- The register rate limit makes a single `audit:full` run fail on the disposable-organizer specs.
- CSP pins the WebSocket origin to production, so chat cannot be proven against a local backend.

## What this does not prove versus a flagged production build

Production bundling, ISR/caching, the production CSP and security headers, `NEXT_PUBLIC_WS_URL`/OAuth build checks, and the https-only backend origin are not exercised; `next dev` serves uncached pages (SCRUM-136 needs a recheck).
