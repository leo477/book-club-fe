# R7 parity report: `/`, `/events`, `/events/:id`

Run 2026-10-06, branch `feat/SCRUM-39-web-events` (base HEAD `a01d64b`), agent: react-tester. Jira SCRUM-39, round R7. Gate G1 skipped by user decision.

## Method and limits (read first)

| Thing | Value |
| --- | --- |
| Executed | `apps/web` Vitest (RTL + MSW, `onUnhandledRequest: error`), `tsc --noEmit`, `eslint .`, `next build` (with `LEGACY_ORIGIN` and `BACKEND_ORIGIN` set; the build refuses to start without them). |
| NOT executed | The Playwright parity harness (`e2e/parity`, `e2e/ui/events.spec.ts`) against Angular vs Next. `e2e/ui/events.spec.ts` needs seeded personas on a backend (refused for the production API, no local backend), and there is no R7 mock-backend/parity spec (R6 has `r6-*`); the legacy app can only be recorded with `bypassCSP`. P1/P2/P5/P6/P7/P8/P12 are therefore verified from code and unit tests only, not against a running Angular/Next pair. |
| `npm run size` | Started, did not finish within the time limit here (hangs in this environment); first-load JS for the events routes is NOT measured. |

Results: `npm test` 46 files, 407 tests passed before my change; after it, `src/features/events` 59 passed. `npm run typecheck` clean, `npm run lint` clean, `next build` OK (routes `/`, `/events`, `/events/[id]` dynamic).

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS (unit) / e2e NOT RUN | `src/app/page.test.tsx` redirect `/` to `/events`; `src/strangler/routes.test.ts` registers `/`, `/events`, `/events/:id`; `/events/:id/edit` is not in the manifest (stays legacy); organizer edit link goes to the legacy page (`event-detail.test.tsx` "links to the legacy edit page"). Angular `'' -> events` (`src/app/app.routes.ts:65`). Guard redirects: `require-auth.test.tsx` guest to `/login` with no returnUrl, plain user to `/clubs` with `ERRORS.organizers_only` toast, hard-replace fallback when `/clubs` is not Next-owned. Non-UUID id handing to legacy relies on the manifest (R6 proved the mechanism); not re-run. |
| P2 Data / HAR | NOT RUN | No R7 HAR spec. Code review: feed calls `events.list({skip:0,limit:50})` and `events.mine()` (`use-events.ts:16-17`), detail `events.get(id)`, maps key only on map mount; tests assert the first-50 query and a single key request (`event-map.test.tsx` "fetches the key only on mount", hits == 1). Extra network: RSVP success refetches `['events']` once after the last concurrent RSVP (`use-events.ts:78`). |
| P3 States | PASS | Feed: spinner, empty, "My events" empty, load error alert. Detail: busy skeleton, load error with way back (missing event), 400 closed-registration toast, other-error toast with backend detail, pending join request toast. Maps: 500 or empty key renders nothing. |
| P4 Auth | PASS (unit) | `RequireAuth` shows `aria-busy` placeholder while the session resolves and never flashes content; failing `/auth/me` is a guest; `RequireRole` organizer admits admin, admin gate admits only admin. Detail: no RSVP for guest (new test), none for cancelled; organizer controls hidden from others; cancel-event needs confirmation and dismissal does nothing. 401-refresh and CSRF are shared with R5 and not re-run. |
| P5 i18n | PASS (unit) | Tests use `messages.uk` keys; the EVENTS/events.rsvp keys resolve (no raw-key assertion fails). en/uk key parity is covered by `packages/i18n` tests, not re-run in a browser. |
| P6 SEO | PASS (unit) | `events/page.test.tsx`: title `TITLES.events`, not indexed, absolute canonical. Auth-only pages carry no server content by design. |
| P7 A11y | NOT RUN | axe not run (no running page). Code: RSVP button has an sr-only event label; spinner placeholder `aria-busy`. Contrast tokens carry the R6 finding. |
| P8 Visual | NOT RUN | No screenshots. |
| P9 Perf | NOT MEASURED | `npm run size` did not finish. Map is `lazy(() => import('./event-map'))` inside `<Suspense fallback={null}>` (`event-detail.tsx:19,286`), so `@vis.gl/react-google-maps` stays out of the events-feed bundle. Field metrics need a canary window. |
| P10 Analytics | BLOCKED | Needs canary. |
| P11 Errors | PASS (unit) | 0 unhandled requests in 407 tests; lint/typecheck clean. No browser console run. |
| P12 E2E | BLOCKED | `e2e/ui/events.spec.ts` needs seeded personas; not run on either target. |

## Acceptance items asked for

| Item | Verdict | Evidence |
| --- | --- | --- |
| Countdown fake timers, zero/negative diff | PASS | `countdown.test.tsx`: exact format, ticks each second, becomes empty exactly at 0 and stays empty, empty for a past event and for the exact present (`diff == 0`), empty for an unparsable date (`!(diff > 0)` handles NaN), follows a changed `eventDate`, interval cleared on unmount. Matches Angular (`event-countdown.component.ts:17`, `diff <= 0` to empty). |
| RSVP optimistic + rollback | PASS | Feed and detail: flips before the server answers, then refetch; rollback on 400 (registration-closed toast) and other errors (backend detail toast); cancel optimistic + restore; pending join request does not stay "attending" and shows the sent toast; concurrent RSVP rolls back only the failed row; list caches patched from detail and restored on failure. |
| Auth guard redirect parity | PASS (unit) | See P1/P4. Browser redirect on both targets NOT RUN. |
| Map does not block render, key only on mount | PASS | Lazy chunk + `Suspense fallback={null}`; EventMap renders null until `config.data`, key fetched once on mount, never when the event has no coordinates (`event-detail.test.tsx` "mounts the map only for events with coordinates"). Added test: with the key response delayed 150 ms, the sibling heading is present immediately and the map appears later (`event-map.test.tsx`). Key failure/empty key renders nothing, page unaffected. Demo map id fallback, route polyline, geocoding fallback, straight-line fallback covered. |
| Feed filters | PASS | City filter with transliteration merge, hidden with no cities, All vs My events with count badge, grouping by date oldest first, countdown only within 3 days, RSVP closed for started events, organizer CTA targeting. |
| Detail on/off states | PASS | Loading, error, no-coordinates (no map), book details toggle loads only once opened, cancelled (no RSVP, no organizer controls), scheduled (no badge), active/cancelled raw status badge (new), guest (no RSVP, new). |

## Tests added (commit `7274122`)

- `event-detail.test.tsx`: guest sees no RSVP; raw status badge for `active` and `cancelled`.
- `event-map.test.tsx`: pending maps key does not hold back siblings and the key is requested once.

## Bugs

None found in the code under test. Observations, not filed as bugs:

1. **Process gap, medium**: there is no R7 parity/e2e spec (`e2e/parity/r7-*`) or mock backend, and `e2e/ui/events.spec.ts` cannot run without seeded personas. P1/P2/P5/P7/P8/P12 for R7 stay unverified against a real Angular/Next pair. Suggest a follow-up task to add `r7-events.spec.ts` on the R6 `installApiMock` pattern.
2. **Tooling, low**: `npm run size` (`apps/web/scripts/check-first-load.mjs`) did not terminate here, so the 181 KB budget for the events routes is unverified; re-run in CI or locally.
3. **Delta to note, low**: Angular prints the raw status string (`active`) in the detail badge; Next now translates it like the card does (`EVENTS.status_*`, raw string when no key exists), so the legacy defect is not carried over.

## Accepted deltas

- Feed `now` is captured once at mount and never refreshed, so a long-open feed does not move events into the "started" state until reload (same as the Angular snapshot; accepted).
- Event-chat buttons and the "chat ready" toast on the detail page are absent until R12 (chat); documented delta, not a regression.
- Detail status badge: Angular shows the raw status string; Next shows the translated label and falls back to the raw string for statuses without a key (e.g. `held`).
