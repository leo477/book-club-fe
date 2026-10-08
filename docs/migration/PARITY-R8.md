# R8 parity report: `/profile`, `/support`, `/support/new`

Run 2026-10-08, branch `feat/SCRUM-40-web-profile-support` (HEAD before this work `2c6a76e`), agent: react-tester. Jira SCRUM-40, round R8.

## Method and limits (read first)

| Thing | Value |
| --- | --- |
| New spec | `e2e/parity/r8-profile-support.spec.ts` + `e2e/parity/r8/fixtures.ts`: 78 tests per target, **the same spec runs on both Angular and Next** (shared locators: `data-testid`s present in both DOMs, roles, labels, uk/en text). Every `/api/v1` call is fulfilled by `page.route` (mutable user and submissions), no backend, no personas. |
| Next target | `cd apps/web && BACKEND_ORIGIN=https://localhost:9922 npx next dev -p 3100` (dev server, no `LEGACY_ORIGIN`, no Edge Config). Not a production build, so perf/hydration/CSP behaviour of a prod build is not covered. |
| Angular target | deployed `https://book-club-planer.vercel.app` (frozen Angular for these routes) with `PARITY_LEGACY_BYPASS_CSP=1`; its API calls are intercepted, so the production backend is never reached. |
| Commands | `PARITY_NEXT_URL=http://localhost:3100 npx playwright test --config=playwright.parity.config.ts e2e/parity/r8-profile-support.spec.ts --project=next` and `PARITY_LEGACY_URL=https://book-club-planer.vercel.app PARITY_LEGACY_BYPASS_CSP=1 npx playwright test --config=playwright.parity.config.ts e2e/parity/r8-profile-support.spec.ts --project=legacy` |
| Results | Next: 78/78 passed. Angular: 78/78 passed on the last full run; **one earlier full Angular run had 1 failure** (test not identified, transient against the deployed site; the following full run and two single reruns were green). Also `apps/web` Vitest for profile/support: 5 files, 64 tests passed; `packages/i18n` 2 files, 40 tests passed. |
| NOT run | `e2e/ui/support-profile.spec.ts`: needs seeded personas (`e2e/.auth/member.json` from `global-setup` against a real backend; absent here, production API refused). No Lighthouse/Speed Insights, no canary, no production `next build`/`next start`, no Vercel preview. |
| Environment caveat | Without Edge Config no route is Next-owned, so `usePush`/`AppLink` hard-navigate between `/support` and `/support/new`. This is an artefact of `next dev` here, not a defect (see P2/P3). |

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS (both targets, mock) | Guest on `/profile`, `/support`, `/support/new` ends on `/login` on Angular and Next with zero `/users*` or `/support*` calls (3 tests x 2 targets). Submit success lands on `/support`; cancel lands on `/support`; support board link `href="/support/new"`. Not checked: trailing slash, 404 pages (no `:id` in these routes). |
| P2 Data / HAR | PASS with listed deltas | Journeys dumped to `playwright-report/parity/r8/har-{legacy,next}-{profile,support}.txt` (not committed) and diffed. **Mutation payloads identical** on both targets: `PATCH /users/me {"displayName"}`, `PATCH /users/me/role {"role":"organizer"}`, `PATCH /users/me/socials {"telegram","github"}` (empty fields omitted), `PATCH /users/me/socials-visibility {"socialsPublic":true}`; `POST /support` trimmed payload, `POST/DELETE /support/:id/like`, `PATCH /support/:id/status {"status"}`. Stats: exactly one `GET /users/me/stats` on load on both. Deltas: (1) Next sends **`GET /auth/me` after every profile save** (name, role, socials, visibility; known, session invalidation); Angular instead re-fetches `GET /users/me/stats` and `GET /clubs/:id/chat/rooms` after each save (chat-widget refresh) and calls `GET /config/maps-key`, `GET /clubs/my`, `POST /auth/refresh` at bootstrap (shell). (2) In the support journey Next repeats `GET /auth/session-status` + `GET /auth/me` + analytics `cohort` event twice, because the dev server hard-navigates (environment, see caveat); re-verify on a preview with flags on. (3) `POST /analytics/event` (cohort) differs by design (`app: next` vs `angular`) and is 404 in the mock. |
| P3 States | PASS (both) | Stats failure shows zeros plus no-statistics hint; name save 422 and role change 422 show the save-error toast and keep the old value; like 422 rolls back (count and `aria-pressed`, POST confirmed attempted); submit 422 shows inline `role=alert` with the input kept and button re-enabled; empty board shows three empty states; double-click on submit sends one POST and the button is disabled while sending (700 ms latency). Not run: 503 cold-start retry and 15/30 s timeout journeys. |
| P4 Auth | PASS (mock) | Guest guard (P1). Plain user and organizer: no approve/reject/advance controls. Admin: approve/reject only on pending (1 each), advance on approved and in-progress (2: "Start work", "Mark done"), none on done/rejected; approve moves the card and shows the status toast; reject and advance send correct payloads. Admin profile: neither role card pressed on both targets. 401-refresh and CSRF not re-run (shared with R5). |
| P5 i18n | PASS (mock, both) | Every behavioural test runs in uk and en with the same assertions (labels, validation messages, toasts, status labels). Key parity: `public/i18n` PROFILE/SUPPORT/SECURITY/common have identical key sets in uk and en; `packages/i18n` tests 40/40. Language persistence across the Angular/Next boundary NOT run. |
| P6 SEO | NOT RUN | Authenticated pages; no server content by design. Titles not asserted here. |
| P7 A11y | PASS on Next (0 violations incl. contrast); Angular reference has contrast failures | axe `wcag2a,wcag2aa,wcag22aa`, 3 pages x uk/en x light/dark = 12 runs per target. **Next: no violations at all (12/12), incl. `color-contrast`** (dev server; the contrast failures of R5-R7 did not reproduce on these pages). **Angular: 0 structural serious/critical; `color-contrast` (serious) on `/support` (4 nodes: approve/advance buttons) and `/support/new` (1 node `.bg-primary-600`), all four lang/theme combos**. Field a11y: display name `aria-invalid="true"` on errors (both); `aria-describedby` set on Next, **empty on the deployed Angular** (Next better); create form `aria-invalid` on title and body (both). Not run: keyboard order/focus-return journeys beyond what Playwright clicks. |
| P8 Visual | PARTIAL (screenshots taken, manually reviewed 3 of 36; no automated diff) | 36 PNGs (2 targets x 3 pages x 375/768/1280 x light/dark, uk) in `playwright-report/parity/r8/` (not committed), each asserting no horizontal page scroll (all 36 pass). Reviewed by eye: `/support` 1280 dark (near identical; header nav centred differently = shell delta), `/profile` 375 light. Deltas seen, see D-1 and D-2 below. No cross-target pixel baseline (DOMs differ by design). |
| P9 Perf | NOT RUN | Needs production build and preview; dev server numbers are meaningless. Commit `2c6a76e` claims the lazy-load split; not measured here. |
| P10 Analytics | NOT RUN | Needs canary. |
| P11 Errors | PASS (mock) | `watchConsole` (console errors and `pageerror`, excluding deliberate 4xx/5xx "Failed to load resource") is empty on profile render and support board render on both targets; 0 unhandled-request failures in the 64 Vitest tests. No `error.tsx` journey. |
| P12 E2E | PARTIAL | Same mock-backed spec green on both targets (above). `e2e/ui/support-profile.spec.ts` NOT RUN (personas/backend unavailable). |

## Defects and deltas

| ID | Severity | Finding |
| --- | --- | --- |
| D-1 | low (visual) | Next renders profile section headings ("Ваша роль", "Статистика", "Соціальні мережі") and the stat numbers in the sans UI font; Angular uses the display serif (`heading-display`). Hero card background is also darker/tan on Next vs cream on Angular (`/profile` 375 light). Needs a design call or a fix in the `heading-display` font wiring in `apps/web`. |
| D-2 | low | Emoji glyphs (role cards, support headings) render as tofu boxes in this Chromium on both targets (font environment); not an app difference. |
| D-3 | info, accepted | Next sends `GET /auth/me` after each profile save (known); Angular instead refreshes stats and chat rooms. |
| D-4 | info | `aria-describedby` on the display-name input: Next wired, deployed Angular empty. Improvement. |
| D-5 | info, needs re-check | Create-submission success toast is lost when the navigation to `/support` is a hard navigation (route not Next-owned). Observed only on `next dev` without flags; with `/support` enabled `router.push` keeps the queued toast (the spec asserts the toast whenever the navigation stays in the SPA). Re-verify on a preview with the flags on, and for a flag mix (`/support/new` on, `/support` off). |
| D-6 | info | Next hard-navigates the `/support` -> `/support/new` link in dev for the same reason (extra bootstrap calls in P2). |

No functional defect found in the code under test. No non-test source was modified.

## Tests added

- `e2e/parity/r8/fixtures.ts`: mutable user and submissions mock (`installProfileMock`), failure injection, latency.
- `e2e/parity/r8-profile-support.spec.ts` (78 tests/target): guards (3), profile uk/en (display name rules incl. XSS characters and 51 chars, save, save failure, role change and failure, socials omit-empty, visibility, stats, stats failure), admin profile (1), support uk/en (render, likes, like rollback, admin vs user vs organizer, approve/reject/advance, empty board), create uk/en (empty, min/max, success trimmed payload, double click, failure, cancel), axe x12, screenshots x18 per target set (3 pages x 3 widths x 2 themes), P2 journeys (2).
