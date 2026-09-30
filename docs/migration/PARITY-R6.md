# R6 parity report: `/clubs/:id` (club detail)

Run 2026-09-30, branch `feat/web-club-detail` (HEAD `6a81888`, on top of `feat/web-pilot-clubs`), agent: react-tester.

Follow-up run 2026-10-01 (react-dev), branch `feat/web-club-detail` HEAD `d9b175f`: R6.1 private-club stub, finding 1 fixed, findings 2 and 3 analysed (see "Follow-up" at the end). Same method as above (production build, R6 mock backend, local Edge Config stub, legacy recorded with `bypassCSP`).

## Method and limits (read first)

| Thing | Value |
| --- | --- |
| Next under test | production build (`next build` + `next start -p 3100`, Turbopack) of HEAD, local Edge Config stub (`/clubs`, `/clubs/:id`, `/privacy`, `/terms` = next 100 %). No Vercel preview was used: nothing was pushed or deployed, Edge Config untouched. |
| Legacy under test | the deployed Angular app (`book-club-fe` production), recorded with `bypassCSP` because its enforced Trusted Types CSP stops the Angular bootstrap in Chromium (known N-1; see PARITY-R5). |
| Backend for Next (SSR/ISR) | **R6 mock backend** `e2e/parity/r6/mock-backend.ts` (https on `localhost:9922`, throwaway self-signed cert, because a production build refuses an http `BACKEND_ORIGIN`). It serves deterministic clubs: public, private, hostile text, bare (no cover/description/city/tags), broken (503), missing (404), plus `POST /__mutate` for the revalidation test. |
| Backend for browser calls | every `/api/v1` request of both targets is fulfilled from `e2e/parity/r6/fixtures.ts` through `page.route` (`installApiMock`). Nothing signed-in ever reaches a real backend; WebSockets are closed. Identical data on both sides. |
| Real backend | only read-only guest checks in `e2e/parity/r6-real-backend.spec.ts` (`PARITY_R6_REAL=1`, Next built against `book-club-be.onrender.com`). The production DB has exactly one public club (`TestClubIcon`, no events, no cover). |
| Roles | guest, member, pending, organizer and (for the shell only) admin are simulated by the mock session; no seeded personas, no writes to any real backend. |

Reproduce (from the repo root, three terminals or background jobs):

```
# 1. mock backend
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON e2e/parity/r6/mock-backend.ts 9922
# 2. Next against it
cd apps/web && LEGACY_ORIGIN=<legacy origin> BACKEND_ORIGIN=https://localhost:9922 NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build
EDGE_CONFIG='http://127.0.0.1:9911/ecfg_local?token=t' REVALIDATE_SECRET=parity-secret LEGACY_ORIGIN=<legacy origin> \
  BACKEND_ORIGIN=https://localhost:9922 NODE_TLS_REJECT_UNAUTHORIZED=0 npx next start -p 3100   # Edge Config stub: see R5 report
# 3. specs
PARITY_NEXT_URL=http://localhost:3100 PARITY_LEGACY_URL=<legacy origin> PARITY_LEGACY_BYPASS_CSP=1 \
  npx playwright test --config=playwright.parity.config.ts e2e/parity/r6-club-detail.spec.ts e2e/parity/r6-dual.spec.ts
# visual: baselines from legacy, compare on next (baselines are not committed, as in R5)
... r6-visual.spec.ts --project=legacy --update-snapshots=all   then   --project=next
```

Specs added (all under `e2e/parity/`):

| File | What |
| --- | --- |
| `r6-club-detail.spec.ts` | P1 status codes and legacy hand-off, P6 raw-HTML SEO, hydration/timezone/theme, roles, join/leave/vote, tabs, focus, axe, states, revalidate hook. Tests without a "next" marker run against **both** targets with the same assertions. |
| `r6-dual.spec.ts` | request-set (HAR-style) diffs for 6 journeys with allowlists, rendered-head parity, date-timezone evidence, axe node-count parity. |
| `r6-visual.spec.ts` | 18 screenshots (guest/member/organizer x light/dark x 375/768/1280), legacy baseline, 0.02 tolerance. |
| `r6-real-backend.spec.ts` | real-backend guest checks. |
| `r6/fixtures.ts`, `r6/helpers.ts`, `r6/mock-backend.ts`, `allowlists/r6-*.json` | shared data, API mock, backend mock, documented request deltas. |
| `har-signature.ts` | the pure signature/diff helpers moved out of `har-diff.ts` (which uses `import.meta` and so cannot be imported by a Playwright spec). `har-diff.ts` re-exports them; behaviour unchanged. |

Results of the final run at HEAD `6a81888`: `r6-club-detail.spec.ts` + `r6-dual.spec.ts` **88 passed, 36 skipped** (skips are next-only tests on the legacy project), 0 failed. `r6-real-backend.spec.ts` 5 passed. `r6-visual.spec.ts` **0/18 within 0.02** (see P8). `npm run size` (first-load JS, real-backend build): `/clubs/:id` **175.4 KB gzip-9** (budget 181, ceiling 250), `/clubs` 174.7 KB.

Follow-up result at HEAD `d9b175f`: `r6-club-detail.spec.ts` + `r6-dual.spec.ts` **89 passed, 37 skipped, 0 failed** (one new next-only test for the private stub and its upgrade); `r6-visual.spec.ts` **18/18 within 0.02**; `npm run size` for `/clubs/:id` **176.4 KB gzip-9** (budget 181; was 175.4 before, +1.0 KB for the stub gate). `r6-real-backend.spec.ts` was not re-run (it needs a build against the production backend).

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS (two documented deltas) | `/clubs/<id>/` answers 308 to the slash-less URL and `?utm_source=x&tab=history` has a query-free canonical. Non-UUID ids (`/clubs/create`, `/clubs/not-a-uuid`) and `/clubs/<id>/manage` are served by legacy on both targets (200 and `<app-root`), so the UUID constraint in the manifest works. Missing UUID: Next **404** (mock and real backend), Angular 200 with its "not found" panel. A backend failure (503) on Next is a 5xx, not a 404, and is refetched on the next request (not cached as "missing"). Deltas: see below. |
| P2 Data / HAR | PASS (documented deltas only) | `r6-dual.spec.ts` "HAR diff" for `guest-view`, `guest-history-tab`, `member-vote`, `join`, `leave`, `organizer-view`: **no un-allowlisted difference and no stale allowlist entry**, and every difference is "Next does less". Same methods/paths/bodies for `POST /clubs/:id/join` (`{}`), `DELETE /clubs/:id/leave`, `POST|DELETE /clubs/:id/book-vote/options/:opt/vote`, `GET my-membership`, `GET members`, `GET book-vote/round`, `GET events?include_past`. Request lists: `playwright-report/parity/r6/r6-*.json` (not kept). Allowlisted (Next does less): `GET /clubs/:id` and first `GET events` (server-side), `config/maps-key`, `chat/rooms` (chat widget not ported), `users/me/stats`, `POST auth/refresh`, `GET bans` (dropped on purpose), second `GET clubs/my` after leave. |
| P3 States | PASS | Join 503: both targets retry once after about 5 s and then show an error alert; page stays (2 POSTs on both). Book vote 503 on Next: optimistic count shows within 800 ms, then after the retry the count rolls back and an error toast appears. `my-membership` 503 + `members` 403 and `session-status` 503 leave the page usable (guest view). Backend 503 on the server fetch gives a 5xx page. Not verified: cold-start timeout of the server fetch (3 s `SERVER_TIMEOUT_MS`) against a slow real backend. |
| P4 Auth / roles | PASS (mocked), two improvements | Guest: login CTA to `/login`, members hidden, no write or membership calls. Member: leave button, chat entry, member list. Organizer: manage link to legacy `/clubs/:id/manage`, create-event entry, owner controls in the vote (close round, add book), no leave. Pending: disabled pending button, no join call. Join: `POST /clubs/:id/join` `{}`; `pending` flips to the pending button. Leave: `DELETE`, then the join CTA returns. Improvement on Next: after an **immediate** join (`status: member`) Angular keeps showing the join CTA until a reload, Next switches to the leave button. Admin: no admin-only UI on this page. 401-refresh-replay and CSRF Origin are covered by unit tests, not re-run. |
| P5 i18n | PASS | uk (default) and en: `html lang`, title, description fallback, event dates (`1 січня 2027` / `January 1, 2027`). Vote plurals identical to Angular (`2 голоси`, `1 голос`, `5 голосів`, `21 голос`). Angular to Next language persistence depends on the legacy deploy of the lang cookie shim, exactly as in PARITY-R5 (P5b), not re-tested here. |
| P6 SEO | PASS (documented deltas) | Raw HTML without JS, public club: `<title>Нічні читачі \| Book Club</title>`, description = club description, absolute canonical `https://book-club-planer.vercel.app/clubs/<id>`, og:title/url/image = cover (`og:image` is the cover, legacy keeps the site default), twitter:image = cover, `robots index,follow`, h1/about/events/venue present without JS. JSON-LD is one `@graph` with `Organization` (fields equal to Angular's single Organization: name, description, url, image, address, foundingDate, keywords, plus `@id`) and one `Event` per upcoming (scheduled/active) event (startDate, eventStatus, attendance mode, location Place/PostalAddress, organizer `@id` back-reference, unique `@id`s); the held event is excluded. Club without cover/description/city/tags: absolute https fallback image, non-empty description, no empty JSON-LD fields, no Event nodes. Private club: `noindex, follow`, no club JSON-LD, and (commit `5f4cac7`) generic title/og/description and default og:image, nothing of the club in any `<meta>`. Hostile name/description (`</script>`, U+2028, `<img onerror>`): JSON-LD escaped (`<`), `window.__pwn` never set, no console error. Real backend: `TestClubIcon` SSR 200 with name, canonical, https og:image, valid `@graph` (Organization only), missing UUID 404. `sitemap.xml` lists `/clubs/<id>` of public clubs only. Rich Results (external validator) not run, see "Not verifiable". |
| P7 A11y | FAIL on the absolute bar (`0 serious`), PASS on parity | Tabs (events): focus enters the tablist, ArrowRight/ArrowLeft/Home/End move focus **and** selection, one `tabpanel`, `aria-controls` points to a `tabpanel` (Radix roving tabindex on Next, Spartan on Angular; both satisfy the pattern). History tab loads `events?include_past=true`. Keyboard: the Tab order of the page content is the same sequence on both targets (back link, leave, four vote buttons, chat entry, Upcoming tab, sort chips, event links and RSVP buttons, footer); Next adds the floating chat link (documented delta). Every focused control on Next has a visible focus style; the only exception, on **both** targets, is the scrollable events container that Chrome makes focusable (div, no ring). axe wcag2a/aa (guest/member/organizer x light/dark x 375/1280): the only serious rule is `color-contrast`, on Next **and** on legacy, and Next never has more nodes than legacy (guest light 12 vs 13, dark 3 vs 4; member light 19 vs 25, dark 11 vs 11; organizer light 23 vs 30, dark 8 vs 10). Offenders include the uppercase section headings (`h2/h3` in `.parchment-card-sunken` and `.glass-card-subtle`) and gray helper text in light, the primary-600 surfaces in dark. Same token problem as R5 P7; not a regression but the plan's "0 serious/critical" is not met. Follow-up: still FAIL on the absolute bar, now with measured ratios and token options in "Finding 2 follow-up" below; node counts unchanged (Next never above legacy). |
| P8 Visual | PASS (after the follow-up fix) | **18/18 within 0.02**, all page heights equal to Angular's (was 0/18, ratios 0.02 to 0.06, heights -21..+22 px). Exact ratios (tolerance 0, pixels different / pixels): guest 0.0047 to 0.0070, member 0.0079 to 0.0193, organizer 0.0077 to 0.0135 (worst: member 375 light/dark 0.019, member 768 0.011 to 0.012). Cause fixed: Next cards lacked the Spartan `hlmCard` base (`flex flex-col gap-6 text-sm`), see finding 1. Computed-style probe of every `.parchment-card*` / `.glass-card*` block and heading at 1280 (guest, member, organizer): heights, display, gap, padding, font-size and line-height equal to Angular within 1 px; the only remaining deltas are 1 px text widths of the emoji headings, the raw key `BOOK_STORES.unavailable` that legacy prints (Next prints the translated text) and finding 4 (shell nav offset). What is left in the 0.005 to 0.019 is that nav offset, emoji glyph rendering (boxes on both sides in this environment) and the book-stores text. Baselines are still the untracked legacy snapshots. |
| P9 Perf | PASS for first-load JS, field metrics BLOCKED | `/clubs/:id` 175.4 KB gzip-9 (budget 181). LCP/INP/CLS p75 need a canary window with Speed Insights. |
| P10 Analytics | BLOCKED | Needs a canary window (one page view per navigation). |
| P11 Errors | PASS | Guest, member, organizer, join, leave, vote, tabs, hostile club, 12 hydration runs: 0 `console.error`, 0 `pageerror` (the local-only `/_vercel/*` script MIME lines and deliberate 4xx/5xx "Failed to load resource" lines are excluded). Error boundary on the backend-5xx page confirmed by status. |
| P12 E2E | BLOCKED (seeded `e2e/ui/*`) / covered by mocked parity specs | `e2e/ui/clubs.spec.ts` and `a11y-authenticated.spec.ts` need seeded personas on a backend; refused for the production API and no local backend is available here. The equivalent assertions ran in `r6-club-detail.spec.ts` against both targets (same spec, both green). |

## Hydration, timezone, theme, no-JS (extra checks requested)

- 12 runs (`Europe/Kyiv`, `America/Los_Angeles`, `Pacific/Kiritimati`, `UTC` x uk/dark and en/light, browser `prefers-color-scheme` set to the opposite of the cookie theme): no hydration warning or error, SSR text equals hydrated text, `html.dark` follows the `theme` cookie on the server HTML and after hydration, `html lang` follows the `lang` cookie. The event at `2026-12-31T22:30Z` reads `1 січня 2027` in every zone on Next; on Angular it reads `1 січня 2027` in Kyiv but `31 грудня 2026` in `America/Los_Angeles` (`playwright-report/parity/r6/date-timezone.json`).
- JavaScript disabled: the Next page shows name, description, both events, venue and cover from the server HTML; Angular renders an empty shell.

## Classification of the developer's known deltas

| Delta | Verdict | Evidence / note |
| --- | --- | --- |
| Missing club: real 404 vs Angular 200 | Documented delta (improvement) | Real backend and mock. The 404 response carries `noindex`. See finding 3: the not-found panel is rendered on the client only. |
| Private clubs: `noindex`, no JSON-LD | Documented delta (improvement) | Verified, plus generic title/og (commit `5f4cac7`). Angular puts the private club's name in the title. The backend exposure (finding 5) is closed by book-club-be PR #242 (stub for non-viewers) and handled on the FE since `bbd1fe4`: see "R6.1" below. |
| Dates fixed to Europe/Kyiv | Documented delta | Evidence above. Differs from Angular only for viewers outside UTC+2/+3. |
| Guests make no browser calls | Documented delta, **statement is inexact** | Guests make no club/events/membership/members call, but the browser still calls `GET /auth/session-status` and `GET /books/stores` (the latter also on Angular). |
| Bans call dropped | Documented delta | Organizer journey: Angular `GET /clubs/:id/bans` 1, Next 0. The kick/ban controls on the member list are present for the organizer on Next; how the banned state is shown without the bans list was not verified. |
| Chat button links to legacy `/chats` | Documented delta | Member view: `main a[href="/chats"]` on Next, in-page club chat button on Angular; plus the fixed floating link (R5 delta). Chat-rooms preload is not made on Next. |
| JSON-LD has an Event graph | Documented delta (improvement) | `@graph` Organization + Event nodes vs Angular's single Organization. Organization fields identical. |
| club-info / book-intro / social-badges not ported | Confirmed, not a gap | `app-club-info`, `app-book-intro` are not used by the Angular club-detail template (and `app-book-intro` nowhere else); `app-social-badges` is used on login/register/profile only. |

## Product findings (for react-dev / security)

1. **Visual, medium. FIXED** (`ead2508`): Next cards did not carry the Spartan `hlmCard` base. Angular `hlmCard` = `flex flex-col gap-6 text-sm`; Next rendered plain `div`/`section`. Added `text-sm` (and `flex flex-col gap-6` on `GuestMembers`) to About, NowReading, AfterMeetingVenue, OrganizerCard, ManagePanel, member list card and skeletons, the events frame and the guest members card. Result in P8. Original symptoms:
   - `apps/web/src/features/club-detail/sections.tsx:60` (About): `<p>` inherits 16px/26px, Angular shows 14px/22.75px (card 120 px vs 117 px high).
   - `apps/web/src/features/club-detail/members.tsx` `GuestMembers`: `display:block` and 98 px high, Angular `display:flex; gap:24px` and 122 px high.
   - Probably the same base is missing on the other `parchment-card*` blocks (vote, events, member list); that explains the member/organizer height deltas (+15..+22 px).
   - Repro: `r6-visual.spec.ts` (legacy baseline, then next), or compare computed styles of `h2` "Про клуб" `parentElement > p` on both targets.
2. **A11y, medium (pre-existing, shared with legacy). OPEN, needs a design decision**: `color-contrast` serious on uppercase card headings and gray helper text (light) and primary-600 surfaces (dark), 3 to 23 nodes per state, see P7. Fix in the shared tokens (`packages/config/tailwind-theme.css`) and mirror in Angular, as done for R5.
3. **SEO / robustness, low. NOT FIXABLE with `notFound()` in this Next version; root cause differs from the hypothesis** (details in "Finding 3 follow-up"). The 404 response body is Next's `__next_error__` recovery shell and the "Клуб не знайдено" panel exists only in the RSC payload, so a no-JS client sees a blank 404 page. Status 404 and `noindex` are correct. Repro: `curl -i localhost:3100/clubs/a1b2c3d4-0000-4000-8000-000000000099`.
4. **Shell, low**: the header nav sits about 116 px (guest) to 121 px (member) further left on Angular than on Next at 1280 (x=382 vs 498). Present in every R6 screenshot and on `/clubs` as well; it was inside the R5 tolerance there.
5. **Security / backend, to review (not a Next bug)**: `GET /api/v1/clubs/{id}` returns a private club's full record to anonymous callers (`app/routers/clubs.py: get_club` only requires an optional user). Both targets therefore render a private club to anyone with the link, and Next puts that response into the ISR cache (tag `club:{id}`). The noindex and generic metadata hide it from crawlers and unfurlers, but not from a direct visit. Plan item R6 asks `security` to check "no personal data in the ISR cache"; this is the place to look. **Resolved for the backend half** by book-club-be PR #242 (private club is a four-key stub for non-viewers; `/events` of a private club is `[]`; `/members` is 403; global `/events` and `/events/{id}` hide it). The FE half is R6.1 below; the ISR cache now only ever holds the stub for a private club.
6. **Legacy defects seen (not regressions)**: stale join CTA after an immediate join (P4), raw key `BOOK_STORES.unavailable` (P8).

## Not verifiable here

- Seeded end-to-end (`e2e/ui/clubs.spec.ts`, `a11y-authenticated.spec.ts`) and any signed-in behaviour against a real backend, real cookie auth, CSRF Origin and 401-refresh-replay on this page.
- A club with events, cover, book vote and members on the real backend (production has one empty public club): all those paths were exercised against the mock only. ISR behaviour on Vercel (as opposed to `next start`) and the real `revalidate` call from the backend (R6 optional BE task is not in this repo).
- Field performance (LCP/INP/CLS), analytics, Search Console, Rich Results test, cold-start behaviour of the real backend for the 3 s server timeout.
- Headers of a deployed preview (CSP nonce, HSTS) were only spot-checked locally (CSP `img-src` allows `https://*.supabase.co` only, identical to legacy, so cover images from any other host are blocked on both targets).
- Edge Config propagation and rollback for `/clubs/:id` (devops).
- Revalidation hook verified locally: 401 without or with a wrong secret, 400 for bad tags, 405 for GET, not shadowed by the `/api` rewrite; a backend edit stays invisible (600 s cache) until `POST /_internal/revalidate` with the secret, then appears on the next request.

## Follow-up 2026-10-01

### R6.1 private-club stub (commits `bbd1fe4`, `d9b175f`)

- Contract: `packages/contracts` `clubStub` (`id`, `name`, `isPublic: false`, `memberCount`; `organizerId` must be absent), `clubOrStub = z.union([club, clubStub])` (full club tried first, so a full private club is never taken for a stub and a malformed full club is not accepted as a stub) and `isClubStub`. `api.clubs.get` parses `clubOrStub`. Tests: contracts (stub, union, full private club, malformed full club, public stub, `organizerId: null`), api-client (stub through MSW).
- Server page: `loadClub` stays cookie-free and ISR-cached (600 s, tag `club:{id}`); a stub gives `noindex`, the generic clubs title/description/og (same branch as before, now driven by the stub), no JSON-LD and a minimal server-rendered view (`PrivateStub`): name, "private" badge, the note (`CLUB_DETAIL.private_stub_title|desc|members`, added to `packages/i18n/overrides` en and uk), and the existing join flow (`JoinCta`: login CTA for guests, join request and pending state for signed-in viewers).
- Upgrade: a small client gate (`PrivateClubGate`) asks `GET /clubs/{id}` again **with the viewer's credentials** when a session exists (`skipAuthRedirect`, `suppressErrorToast`, no retry, no refetch on focus). If the answer is a full club it lazy-loads `ClubView` (the same component the server uses for visible clubs) and swaps to it without a reload; events, membership, votes and members then load through the usual authed queries. A stub answer, 403, 404 or 5xx keeps the stub: no toast, no redirect, no retry loop. Members 403 (`skipAuthRedirect` was already set) gives an empty list, no toast, no redirect.
- Bundle: importing the client stub view from the page cost about 14 KB gzip in every club page (190.2 KB); the stub view is a server component now and only the gate is client code: `/clubs/:id` 176.4 KB (budget 181).
- Tests: `page.test.tsx` (RTL + MSW) covers anonymous, signed-in non-member (refetch, join request, pending, no members call), failing refetch (500 and 403: no toast, no navigation, no loop), member, organizer and admin upgrades, members 403 after the upgrade, stub metadata and stub server HTML without structured data. `r6-club-detail.spec.ts` has the raw-HTML stub assertions and a browser journey (guest, non-member join, member/organizer/admin upgrade). The R6 mock backend and browser mock now return the stub to non-viewers of the private fixture.
- Not verifiable here: behaviour against the deployed backend (PR #242 was not exercised against a real private club), and whether the ISR copy of a private club cached *before* the backend deploy still holds the full record (it expires after 600 s or on `POST /_internal/revalidate` with tag `club:{id}`).

### Finding 3 follow-up: why the 404 body is blank

The hypothesis (`notFound()` from `generateMetadata`) is wrong. Moving the check into the page (metadata returns the generic noindex tags, the page calls `notFound()`) gives the same response, and so does a bare page that only calls `notFound()` with a trivial `not-found.tsx` at the segment or at `(shell)` level: `html id="__next_error__"`, empty body, panel only in the flight payload. The Next 16.3.6 source (`app-render.js`, `getErrorRSCPayload`) explains it: when a non-streamed render throws an HTTP access error, the status is set to 404 and the server renders the recovery shell (`<html id="__next_error__"><body/>`), and the client renders the not-found UI from the flight data. The docs say the same in other words: a 404 status means a non-streamed shell error, and a streamed page that finds out inside `<Suspense>` renders the panel in the HTML but answers 200. So "404 status + panel in the initial HTML" is not reachable with `notFound()`. No code change was made for this finding. Options:

1. Keep it (recommended): Googlebot runs JS and sees 404 + `noindex`; only no-JS clients see a blank page, and the panel appears after hydration.
2. Stream it: check inside `<Suspense>` so the panel is in the HTML, at the price of a 200 status (soft 404) with `noindex`; the Angular behaviour (200 + panel) but loses the real 404 that P1 lists as an improvement.
3. Decide in `proxy` (Next documents this for a real status): the proxy would need a cached existence lookup per request, extra latency on every club view and a second place that knows the backend. Not worth it for this finding.

### Finding 2 follow-up: contrast, measured, not changed

The offenders are Tailwind default grays and brand amber used as text or surface colour, not the parchment tokens in `packages/config/tailwind-theme.css` (`--color-ink-muted` already passes). No token change keeps the Spartan look, because lifting the grays to 4.5:1 on the parchment surfaces means three text levels collapse into two. So this needs a design decision; nothing was changed. Measured with axe (1280 px, colours from axe `data`, fixture club):

| Where (light unless noted) | Class / colour | Ratio now | Option and resulting ratio |
| --- | --- | --- | --- |
| Uppercase `h3` in sunken/subtle cards, role labels | `text-gray-400` `#99a1af` on `#ddd0a8` / `#ede0c0` | 1.69 / 1.98 | gray-600 `#4a5565` 4.92 / 5.77, or `--color-ink-muted` `#6b4c2a` 5.07 / 5.95 |
| Uppercase `h2`, helper text, event meta | `text-gray-500` `#6a7282` on `#ddd0a8` / `#ede0c0` | 3.14 / 3.69 | same two options (gray-600 or ink-muted), both >= 4.9 |
| Inactive tab (History) | `#6e5c4f` on `#dfd3c3` | 4.31 | `#5e4c40` 5.51 |
| Organizer label text | `--color-primary-600` `#b5720a` on `#ede0c0` | 2.98 | primary-700 `#92400e` 5.41 |
| Pressed sort chip (light and dark) | white on primary-600 `#b5720a` | 3.91 | `#9f6509` 4.84 or `#b45309` 5.02 (`#a66a09` gives 4.48, not enough) |
| Dark: uppercase `h3`, role labels | `text-gray-500` `#6a7282` on `#0d0905` / `#1e1509` | 4.10 / 3.72 | `#838b99` 5.78 / 5.25 (4.92 on `#261b0c`); a dark-only, barely visible lift |
| Dark: RSVP button | white on `#d88e0e` | 2.69 | dark text `#1c0a00` 7.13 |
| Organizer kick / ban buttons | light `#ef4343` on `#edd0b4` 2.57, `#f54900` on `#ede0c0` 2.75; dark `#ed5e5e` on `#47241a` 4.15 | see left | light `#991b1b` 5.65 or `#b91c1c` (4.40 on `#edd0b4`, 4.94 on `#ede0c0`); dark `#f87171` 4.95 |

Decisions needed from design: (a) accept gray-600 / ink-muted for all light secondary text (two levels instead of three), (b) darken the brand amber used as text and button surface (primary-600 to about `#9f6509`, or primary-700 for text), (c) whether Angular gets the same change (this report only changes or proposes `apps/web`; a Next-only change makes the two targets differ in the parity screenshots by roughly the text pixels). A dark-only lift of gray-500 to `#838b99` is the one change that is nearly invisible, but it alone fixes 2 to 7 of the 3 to 11 dark-mode nodes (guest 2 of 3, organizer 4 of 8, member 7 of 11) and leaves every state failing, so it was not applied.

## Repo hygiene notes

- Commit `5f4cac7` (made by a parallel agent in this worktree) accidentally included my scratch probe `e2e/parity/_probe.mjs`; it is deleted in the commit that adds these specs.
- `repomix-output.md` shows unstaged changes produced by other commits/hooks; it is not part of this change.
- Follow-up commits also carry a one-line `repomix-output.md` change each: the husky/lint-staged hook stages it.
- Scratch probes (`_probe.spec.ts`, `_axe.spec.ts`, an exact-tolerance Playwright config) were used to get the exact visual ratios and axe details and deleted again.
