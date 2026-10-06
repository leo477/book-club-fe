# R7 parity report: `/`, `/events`, `/events/:id`

Run 2026-10-06, branch `feat/SCRUM-39-web-events` (base HEAD `a01d64b`), agent: react-tester. Jira SCRUM-39, round R7. Gate G1 skipped by user decision.

## Method and limits (read first)

| Thing | Value |
| --- | --- |
| Executed | `apps/web` Vitest (RTL + MSW, `onUnhandledRequest: error`), `tsc --noEmit`, `eslint .`, `next build` (with `LEGACY_ORIGIN` and `BACKEND_ORIGIN` set; the build refuses to start without them). |
| Round 2 executed | `e2e/parity/r7-events.spec.ts` (+ `e2e/parity/r7/fixtures.ts`) against **Next only**: `next dev -p 3100` (no `LEGACY_ORIGIN`, so the proxy serves Next in dev), every `/api/v1` call fulfilled by `page.route`, no backend, no personas. 25 tests, 25 passed, 3 consecutive runs. Against Angular only the guest-redirect test was run (deployed `https://book-club-planer.vercel.app`, `PARITY_LEGACY_BYPASS_CSP=1`): passed; the other 24 are next-only (they use Next `data-testid`s) and are skipped, so Angular-vs-Next behavioural parity is NOT verified. Production build + `npm run size` equivalent also run (see P9). |
| Not executed in round 1 (still true for Angular) | The Playwright parity harness (`e2e/parity`, `e2e/ui/events.spec.ts`) against Angular vs Next. `e2e/ui/events.spec.ts` needs seeded personas on a backend (refused for the production API, no local backend), and there is no R7 mock-backend/parity spec (R6 has `r6-*`); the legacy app can only be recorded with `bypassCSP`. P1/P2/P5/P6/P7/P8/P12 are therefore verified from code and unit tests only, not against a running Angular/Next pair. |
| `npm run size` | Started, did not finish within the time limit here (hangs in this environment); first-load JS for the events routes is NOT measured. |

Results: `npm test` 46 files, 407 tests passed before my change; after it, `src/features/events` 59 passed. `npm run typecheck` clean, `npm run lint` clean, `next build` OK (routes `/`, `/events`, `/events/[id]` dynamic).

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS (unit) / e2e NOT RUN | `src/app/page.test.tsx` redirect `/` to `/events`; `src/strangler/routes.test.ts` registers `/`, `/events`, `/events/:id`; `/events/:id/edit` is not in the manifest (stays legacy); organizer edit link goes to the legacy page (`event-detail.test.tsx` "links to the legacy edit page"). Angular `'' -> events` (`src/app/app.routes.ts:65`). Guard redirects: `require-auth.test.tsx` guest to `/login` with no returnUrl, plain user to `/clubs` with `ERRORS.organizers_only` toast, hard-replace fallback when `/clubs` is not Next-owned. Non-UUID id handing to legacy relies on the manifest (R6 proved the mechanism); not re-run. |
| P2 Data / HAR | PASS (Next side, mock) / HAR diff vs Angular NOT RUN | `r7-events.spec.ts` asserts the Next request set: feed = `GET /events?skip=0&limit=50` + `GET /events/my` (+ session probe), detail = exactly one `GET /events/:id` (upper-case id is lower-cased), one `POST /events/:id/attend` per RSVP, one `DELETE` per cancel, `GET /config/maps-key` exactly once and only for events with coordinates, no events call for a guest. No dual-target HAR diff (no Angular DOM contract recorded), so the Angular request parity stays code-review only. |
| P3 States | PASS | Feed: spinner, empty, "My events" empty, load error alert. Detail: busy skeleton, load error with way back (missing event), 400 closed-registration toast, other-error toast with backend detail, pending join request toast. Maps: 500 or empty key renders nothing. |
| P4 Auth | PASS (unit) | `RequireAuth` shows `aria-busy` placeholder while the session resolves and never flashes content; failing `/auth/me` is a guest; `RequireRole` organizer admits admin, admin gate admits only admin. Detail: no RSVP for guest (new test), none for cancelled; organizer controls hidden from others; cancel-event needs confirmation and dismissal does nothing. 401-refresh and CSRF are shared with R5 and not re-run. |
| P5 i18n | PASS (unit) | Tests use `messages.uk` keys; the EVENTS/events.rsvp keys resolve (no raw-key assertion fails). en/uk key parity is covered by `packages/i18n` tests, not re-run in a browser. |
| P6 SEO | PASS (unit) | `events/page.test.tsx`: title `TITLES.events`, not indexed, absolute canonical. Auth-only pages carry no server content by design. |
| P7 A11y | PARTIAL: 0 critical/serious structural violations; `color-contrast` FAILS (serious) | axe `wcag2a,wcag2aa,wcag22aa`, `/events` and `/events/:id`, uk/en x light/dark = 8 runs, all pass the structural gate (no non-contrast serious/critical, incl. tabs/tabpanel/aria-controls/timer/label rules). Contrast, real Chromium, measured by axe: feed light (uk, en) 8 nodes: club link `#b5720a` on `#ede0c0` **2.98:1**, countdown timer `.font-mono` `#ef4343` on `#ede0c0` **2.88:1**, RSVP button `#fff` on `#b5720a` **3.9:1**; feed dark (uk, en) 3 nodes, RSVP button 3.9:1; detail light 2 nodes: `.text-primary-600` `#b5720a` on `#fff` and RSVP button 3.9:1; detail dark 1 node: RSVP button 3.9:1 (AA needs 4.5:1 for this text size). Same primary-600 token as R5/R6. Screenshots: `playwright-report/parity/r7/axe-*.png` (not committed). Not run on Angular, so no node-count parity. |
| P8 Visual | NOT RUN (blocked) | Screenshots were taken for axe only (no baseline). A visual diff needs an Angular baseline of `/events` with the same mocked data and a deterministic clock (the mocked dates are relative to now and the legacy DOM was not recorded); no committed baselines exist. |
| P9 Perf | FAIL vs 181 KB budget; under 250 KB ceiling by 0.2 KB | `next build` OK (under 5 min). Patched `check-first-load` (see below), real gzip-9 first-load JS of the served HTML: `/events` **249.8 KB** (16 scripts, raw 836.7 KB), `/events/:id` **249.8 KB** (17 scripts), `/clubs` **248.2 KB**. Budget 181 KB: over by about 69 KB; ceiling 250 KB: margin 0.2 KB. R6 recorded `/clubs` 174.7-176.4 KB, so the shared tree grew about 72 KB since R6 (the events routes are not the cause: `/clubs` grew identically). Needs a bundle analysis; field metrics still need a canary. |
| P10 Analytics | BLOCKED | Needs canary. |
| P11 Errors | PASS (unit) | 0 unhandled requests in 407 tests; lint/typecheck clean. No browser console run. |
| P12 E2E | PARTIAL | Mock-backed e2e on Next passes (25/25): guard redirect, feed, tabs keyboard (ArrowRight/Left wrap, Home, End, roving tabindex, one selected tab, tabpanel named by the tab), countdown only inside 3 days (1 timer of 4 cards, text ticks), started event disabled, optimistic RSVP (count 2 to 3 and `aria-busy` before the server answers, one POST, then cancel back to 2), rollback on 400 (count restored, registration-closed toast, other card untouched), My events badge, detail loading/error/organizer/member, upper-case id, map: no coords no key request, key 404 and blocked Maps script both render nothing with no console error. `e2e/ui/events.spec.ts` (seeded personas) still not run. Angular side not run. |

## Acceptance items asked for

| Item | Verdict | Evidence |
| --- | --- | --- |
| Countdown fake timers, zero/negative diff | PASS | `countdown.test.tsx`: exact format, ticks each second, becomes empty exactly at 0 and stays empty, empty for a past event and for the exact present (`diff == 0`), empty for an unparsable date (`!(diff > 0)` handles NaN), follows a changed `eventDate`, interval cleared on unmount. Matches Angular (`event-countdown.component.ts:17`, `diff <= 0` to empty). |
| RSVP optimistic + rollback | PASS | Feed and detail: flips before the server answers, then refetch; rollback on 400 (registration-closed toast) and other errors (backend detail toast); cancel optimistic + restore; pending join request does not stay "attending" and shows the sent toast; concurrent RSVP rolls back only the failed row; list caches patched from detail and restored on failure. |
| Auth guard redirect parity | PASS (unit) | See P1/P4. Browser redirect on both targets NOT RUN. |
| Map does not block render, key only on mount | PASS | Lazy chunk + `Suspense fallback={null}`; EventMap renders null until `config.data`, key fetched once on mount, never when the event has no coordinates (`event-detail.test.tsx` "mounts the map only for events with coordinates"). Added test: with the key response delayed 150 ms, the sibling heading is present immediately and the map appears later (`event-map.test.tsx`). Key failure/empty key renders nothing, page unaffected. Demo map id fallback, route polyline, geocoding fallback, straight-line fallback covered. |
| Feed filters | PASS | City filter with transliteration merge, hidden with no cities, All vs My events with count badge, grouping by date oldest first, countdown only within 3 days, RSVP closed for started events, organizer CTA targeting. |
| Detail on/off states | PASS | Loading, error, no-coordinates (no map), book details toggle loads only once opened, cancelled (no RSVP, no organizer controls), scheduled (no badge), active/cancelled raw status badge (new), guest (no RSVP, new). |

## Round 2: reproduce (no backend, no personas)

```
cd apps/web && BACKEND_ORIGIN=https://localhost:9922 npx next dev -p 3100      # no LEGACY_ORIGIN: dev proxy serves Next
cd ../.. && PARITY_NEXT_URL=http://localhost:3100 npx playwright test --config=playwright.parity.config.ts e2e/parity/r7-events.spec.ts --project=next
# Angular (guard test only, others are next-only):
PARITY_LEGACY_URL=https://book-club-planer.vercel.app PARITY_LEGACY_BYPASS_CSP=1 npx playwright test --config=playwright.parity.config.ts e2e/parity/r7-events.spec.ts --project=legacy
```

Finding while writing the harness: the shared `routeWebSocket(/.*/)` stub from R6 also kills the Next dev HMR socket and leaves the page un-hydrated (spinner for ever); the R7 fixture excludes `_next`. Production builds are unaffected.

SCRUM-70 (Angular-vs-Next verification gap): closed only for the Next side (mock-backed e2e + axe + size). It stays open for Angular behavioural parity, the HAR diff and the visual baseline.

## Tests added (commit `7274122`)

- `event-detail.test.tsx`: guest sees no RSVP; raw status badge for `active` and `cancelled`.
- `event-map.test.tsx`: pending maps key does not hold back siblings and the key is requested once.

## Bugs

None found in the code under test. Observations, not filed as bugs:

1. **Process gap, medium**: there is no R7 parity/e2e spec (`e2e/parity/r7-*`) or mock backend, and `e2e/ui/events.spec.ts` cannot run without seeded personas. P1/P2/P5/P7/P8/P12 for R7 stay unverified against a real Angular/Next pair. Suggest a follow-up task to add `r7-events.spec.ts` on the R6 `installApiMock` pattern.
2. **Tooling, medium (cause found)**: `npm run size` hangs for two independent reasons in `apps/web/scripts/check-first-load.mjs`. (a) `@vercel/edge-config` (`node_modules/@vercel/edge-config/dist/index.js:124`) only accepts `edge-config.vercel.com` connection strings, so the script's local `http://127.0.0.1:<port>/ecfg_local` stub is rejected; the proxy reads no config, rewrites `/privacy` to `LEGACY_ORIGIN` (`legacy.invalid`) and answers 500 for ever. (b) the readiness probe is hard-coded to `/privacy`, which is not flagged when `--routes` omits it. On failure `process.exit(2)` runs `stop()`, which only kills the `npx` wrapper; the orphaned `next-server` keeps the inherited stderr pipe open, so a caller piping the output (`| tail`, npm, CI) never sees EOF: that is the hang. It needs a built `.next` (`.next/BUILD_ID`, else it exits 2 at once). Patch (tested, prints sizes in about 20 s, exit 0, no orphan): `docs/migration/R7-size-script.patch` (preload that answers the edge-config host in the child, `detached` + group kill, 10 s fetch timeout, probe the first requested route). App source not changed. Command: `cd apps/web && LEGACY_ORIGIN=https://legacy.invalid npm run build && node scripts/check-first-load.mjs --routes /events,/events/:id=/events/<uuid>`.
4. **Perf, medium**: first-load JS is 249.8 KB gzip-9 on `/events` and `/events/:id` (248.2 KB on `/clubs`), against the 181 KB budget; R6 measured about 176 KB for `/clubs`. See P9.
3. **Delta to note, low**: Angular prints the raw status string (`active`) in the detail badge; Next now translates it like the card does (`EVENTS.status_*`, raw string when no key exists), so the legacy defect is not carried over.

## Accepted deltas

- Feed `now` is captured once at mount and never refreshed, so a long-open feed does not move events into the "started" state until reload (same as the Angular snapshot; accepted).
- Event-chat buttons and the "chat ready" toast on the detail page are absent until R12 (chat); documented delta, not a regression.
- Detail status badge: Angular shows the raw status string; Next shows the translated label and falls back to the raw string for statuses without a key (e.g. `held`).
