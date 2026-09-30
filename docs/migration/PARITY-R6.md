# R6 parity report: `/clubs/:id` (club detail)

Run 2026-09-30, branch `feat/web-club-detail` (HEAD `6a81888`, on top of `feat/web-pilot-clubs`), agent: react-tester.

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

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS (two documented deltas) | `/clubs/<id>/` answers 308 to the slash-less URL and `?utm_source=x&tab=history` has a query-free canonical. Non-UUID ids (`/clubs/create`, `/clubs/not-a-uuid`) and `/clubs/<id>/manage` are served by legacy on both targets (200 and `<app-root`), so the UUID constraint in the manifest works. Missing UUID: Next **404** (mock and real backend), Angular 200 with its "not found" panel. A backend failure (503) on Next is a 5xx, not a 404, and is refetched on the next request (not cached as "missing"). Deltas: see below. |
| P2 Data / HAR | PASS (documented deltas only) | `r6-dual.spec.ts` "HAR diff" for `guest-view`, `guest-history-tab`, `member-vote`, `join`, `leave`, `organizer-view`: **no un-allowlisted difference and no stale allowlist entry**, and every difference is "Next does less". Same methods/paths/bodies for `POST /clubs/:id/join` (`{}`), `DELETE /clubs/:id/leave`, `POST|DELETE /clubs/:id/book-vote/options/:opt/vote`, `GET my-membership`, `GET members`, `GET book-vote/round`, `GET events?include_past`. Request lists: `playwright-report/parity/r6/r6-*.json` (not kept). Allowlisted (Next does less): `GET /clubs/:id` and first `GET events` (server-side), `config/maps-key`, `chat/rooms` (chat widget not ported), `users/me/stats`, `POST auth/refresh`, `GET bans` (dropped on purpose), second `GET clubs/my` after leave. |
| P3 States | PASS | Join 503: both targets retry once after about 5 s and then show an error alert; page stays (2 POSTs on both). Book vote 503 on Next: optimistic count shows within 800 ms, then after the retry the count rolls back and an error toast appears. `my-membership` 503 + `members` 403 and `session-status` 503 leave the page usable (guest view). Backend 503 on the server fetch gives a 5xx page. Not verified: cold-start timeout of the server fetch (3 s `SERVER_TIMEOUT_MS`) against a slow real backend. |
| P4 Auth / roles | PASS (mocked), two improvements | Guest: login CTA to `/login`, members hidden, no write or membership calls. Member: leave button, chat entry, member list. Organizer: manage link to legacy `/clubs/:id/manage`, create-event entry, owner controls in the vote (close round, add book), no leave. Pending: disabled pending button, no join call. Join: `POST /clubs/:id/join` `{}`; `pending` flips to the pending button. Leave: `DELETE`, then the join CTA returns. Improvement on Next: after an **immediate** join (`status: member`) Angular keeps showing the join CTA until a reload, Next switches to the leave button. Admin: no admin-only UI on this page. 401-refresh-replay and CSRF Origin are covered by unit tests, not re-run. |
| P5 i18n | PASS | uk (default) and en: `html lang`, title, description fallback, event dates (`1 січня 2027` / `January 1, 2027`). Vote plurals identical to Angular (`2 голоси`, `1 голос`, `5 голосів`, `21 голос`). Angular to Next language persistence depends on the legacy deploy of the lang cookie shim, exactly as in PARITY-R5 (P5b), not re-tested here. |
| P6 SEO | PASS (documented deltas) | Raw HTML without JS, public club: `<title>Нічні читачі \| Book Club</title>`, description = club description, absolute canonical `https://book-club-planer.vercel.app/clubs/<id>`, og:title/url/image = cover (`og:image` is the cover, legacy keeps the site default), twitter:image = cover, `robots index,follow`, h1/about/events/venue present without JS. JSON-LD is one `@graph` with `Organization` (fields equal to Angular's single Organization: name, description, url, image, address, foundingDate, keywords, plus `@id`) and one `Event` per upcoming (scheduled/active) event (startDate, eventStatus, attendance mode, location Place/PostalAddress, organizer `@id` back-reference, unique `@id`s); the held event is excluded. Club without cover/description/city/tags: absolute https fallback image, non-empty description, no empty JSON-LD fields, no Event nodes. Private club: `noindex, follow`, no club JSON-LD, and (commit `5f4cac7`) generic title/og/description and default og:image, nothing of the club in any `<meta>`. Hostile name/description (`</script>`, U+2028, `<img onerror>`): JSON-LD escaped (`<`), `window.__pwn` never set, no console error. Real backend: `TestClubIcon` SSR 200 with name, canonical, https og:image, valid `@graph` (Organization only), missing UUID 404. `sitemap.xml` lists `/clubs/<id>` of public clubs only. Rich Results (external validator) not run, see "Not verifiable". |
| P7 A11y | FAIL on the absolute bar (`0 serious`), PASS on parity | Tabs (events): focus enters the tablist, ArrowRight/ArrowLeft/Home/End move focus **and** selection, one `tabpanel`, `aria-controls` points to a `tabpanel` (Radix roving tabindex on Next, Spartan on Angular; both satisfy the pattern). History tab loads `events?include_past=true`. Keyboard: the Tab order of the page content is the same sequence on both targets (back link, leave, four vote buttons, chat entry, Upcoming tab, sort chips, event links and RSVP buttons, footer); Next adds the floating chat link (documented delta). Every focused control on Next has a visible focus style; the only exception, on **both** targets, is the scrollable events container that Chrome makes focusable (div, no ring). axe wcag2a/aa (guest/member/organizer x light/dark x 375/1280): the only serious rule is `color-contrast`, on Next **and** on legacy, and Next never has more nodes than legacy (guest light 12 vs 13, dark 3 vs 4; member light 19 vs 25, dark 11 vs 11; organizer light 23 vs 30, dark 8 vs 10). Offenders include the uppercase section headings (`h2/h3` in `.parchment-card-sunken` and `.glass-card-subtle`) and gray helper text in light, the primary-600 surfaces in dark. Same token problem as R5 P7; not a regression but the plan's "0 serious/critical" is not met. |
| P8 Visual | FAIL | 0/18 within 0.02 (ratios 0.03 to 0.07, page height -21..+22 px). Causes found with computed styles, see "Product findings" 1: Next cards miss the Spartan `hlmCard` base (`flex flex-col gap-6 text-sm`), so the About text is 16px/26px instead of 14px/22.75px and the guest members card is 98 px instead of 122 px high; plus a shell nav offset. Emoji glyphs render as boxes on both sides in this environment (same font gap, no effect on the verdict). Legacy prints the raw key `BOOK_STORES.unavailable` in the book-stores block, Next prints the translated text (legacy bug). Baselines are the untracked `e2e/parity/__snapshots__/r6-visual.spec.ts/` (not committed, as in R5). |
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
| Private clubs: `noindex`, no JSON-LD | Documented delta (improvement) | Verified, plus generic title/og (commit `5f4cac7`). Angular puts the private club's name in the title. The backend still returns the private club to anonymous callers, see finding 5. |
| Dates fixed to Europe/Kyiv | Documented delta | Evidence above. Differs from Angular only for viewers outside UTC+2/+3. |
| Guests make no browser calls | Documented delta, **statement is inexact** | Guests make no club/events/membership/members call, but the browser still calls `GET /auth/session-status` and `GET /books/stores` (the latter also on Angular). |
| Bans call dropped | Documented delta | Organizer journey: Angular `GET /clubs/:id/bans` 1, Next 0. The kick/ban controls on the member list are present for the organizer on Next; how the banned state is shown without the bans list was not verified. |
| Chat button links to legacy `/chats` | Documented delta | Member view: `main a[href="/chats"]` on Next, in-page club chat button on Angular; plus the fixed floating link (R5 delta). Chat-rooms preload is not made on Next. |
| JSON-LD has an Event graph | Documented delta (improvement) | `@graph` Organization + Event nodes vs Angular's single Organization. Organization fields identical. |
| club-info / book-intro / social-badges not ported | Confirmed, not a gap | `app-club-info`, `app-book-intro` are not used by the Angular club-detail template (and `app-book-intro` nowhere else); `app-social-badges` is used on login/register/profile only. |

## Product findings (for react-dev / security)

1. **Visual, medium**: Next cards do not carry the Spartan `hlmCard` base. Angular `hlmCard` = `flex flex-col gap-6 text-sm`; Next renders plain `div`/`section`.
   - `apps/web/src/features/club-detail/sections.tsx:60` (About): `<p>` inherits 16px/26px, Angular shows 14px/22.75px (card 120 px vs 117 px high).
   - `apps/web/src/features/club-detail/members.tsx` `GuestMembers`: `display:block` and 98 px high, Angular `display:flex; gap:24px` and 122 px high.
   - Probably the same base is missing on the other `parchment-card*` blocks (vote, events, member list); that explains the member/organizer height deltas (+15..+22 px).
   - Repro: `r6-visual.spec.ts` (legacy baseline, then next), or compare computed styles of `h2` "Про клуб" `parentElement > p` on both targets.
2. **A11y, medium (pre-existing, shared with legacy)**: `color-contrast` serious on uppercase card headings and gray helper text (light) and primary-600 surfaces (dark), 3 to 23 nodes per state, see P7. Fix in the shared tokens (`packages/config/tailwind-theme.css`) and mirror in Angular, as done for R5.
3. **SEO / robustness, low**: the 404 response body is Next's `__next_error__` shell; the "Клуб не знайдено" panel exists only in the RSC payload and is painted after hydration, so a no-JS client sees a blank 404 page. Status 404 and `noindex` are correct. Repro: `curl -i localhost:3100/clubs/a1b2c3d4-0000-4000-8000-000000000099`. Likely cause: `notFound()` thrown from `generateMetadata` (via `loadClub`) rather than from the page.
4. **Shell, low**: the header nav sits about 116 px (guest) to 121 px (member) further left on Angular than on Next at 1280 (x=382 vs 498). Present in every R6 screenshot and on `/clubs` as well; it was inside the R5 tolerance there.
5. **Security / backend, to review (not a Next bug)**: `GET /api/v1/clubs/{id}` returns a private club's full record to anonymous callers (`app/routers/clubs.py: get_club` only requires an optional user). Both targets therefore render a private club to anyone with the link, and Next puts that response into the ISR cache (tag `club:{id}`). The noindex and generic metadata hide it from crawlers and unfurlers, but not from a direct visit. Plan item R6 asks `security` to check "no personal data in the ISR cache"; this is the place to look.
6. **Legacy defects seen (not regressions)**: stale join CTA after an immediate join (P4), raw key `BOOK_STORES.unavailable` (P8).

## Not verifiable here

- Seeded end-to-end (`e2e/ui/clubs.spec.ts`, `a11y-authenticated.spec.ts`) and any signed-in behaviour against a real backend, real cookie auth, CSRF Origin and 401-refresh-replay on this page.
- A club with events, cover, book vote and members on the real backend (production has one empty public club): all those paths were exercised against the mock only. ISR behaviour on Vercel (as opposed to `next start`) and the real `revalidate` call from the backend (R6 optional BE task is not in this repo).
- Field performance (LCP/INP/CLS), analytics, Search Console, Rich Results test, cold-start behaviour of the real backend for the 3 s server timeout.
- Headers of a deployed preview (CSP nonce, HSTS) were only spot-checked locally (CSP `img-src` allows `https://*.supabase.co` only, identical to legacy, so cover images from any other host are blocked on both targets).
- Edge Config propagation and rollback for `/clubs/:id` (devops).
- Revalidation hook verified locally: 401 without or with a wrong secret, 400 for bad tags, 405 for GET, not shadowed by the `/api` rewrite; a backend edit stays invisible (600 s cache) until `POST /_internal/revalidate` with the secret, then appears on the next request.

## Repo hygiene notes

- Commit `5f4cac7` (made by a parallel agent in this worktree) accidentally included my scratch probe `e2e/parity/_probe.mjs`; it is deleted in the commit that adds these specs.
- `repomix-output.md` shows unstaged changes produced by other commits/hooks; it is not part of this change.
