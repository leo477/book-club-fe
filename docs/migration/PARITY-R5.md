# R5 parity report: `/clubs` + shell (with `/privacy`, `/terms`)

Run 2026-09-29, branch `feat/web-pilot-clubs` (HEAD `5b94cff`), agent: react-tester + devops.

| Thing | Value |
| --- | --- |
| Next preview (book-club-web, not `--prod`) | `https://book-club-3mv4gx5er-dmytros-projects-ad22eb22.vercel.app` |
| Legacy target | `https://book-club-fe-dmytros-projects-ad22eb22.vercel.app` (book-club-fe production, Angular) |
| Backend behind both | PRODUCTION (`book-club-be.onrender.com`). Guest/read-only only; every signed-in journey used `page.route` mocks; every non-GET reaching `/api/v1` in the ad-hoc specs is mocked or aborted (`guardApi` in `e2e/parity/r5-clubs.spec.ts`). |
| Edge Config flip | `/clubs`, `/privacy`, `/terms` set to `next` 100 % for the run, restored to `legacy` 0 % (see Propagation). |

Verdict: **not ready for canary as-is**. PASS: P1, P3, P4, P6 (`/clubs`; JSON-LD gap on `/privacy`, `/terms`), P11. FAIL: P2 (strict allowlist), P5 (Angular to Next), P7 (light contrast, same as legacy), P8, P9 (first-load JS). BLOCKED: P10, P12 (seeded specs; `public-pages` ran). Details and fixes below.

## P1 to P12

| # | Verdict | Evidence |
|---|---|---|
| P1 URLs | PASS | `seo.spec.ts` guest redirects `/`, `/events`, `/support` to `/login` pass on both targets. `r5-clubs.spec.ts` "P1": `/clubs/` answers 308 to `/clubs`; `/clubs?city=Kyiv&utm_source=x` is 200 with canonical `https://book-club-planer.vercel.app/clubs` (no query). Invalid `:id` 404 is N/A until R6 (`/clubs/:id` not on Next). |
| P2 Data / HAR | FAIL (strict), all diffs are Next doing less except the prefetches | See "HAR-diff" below. The two allowed deltas are confirmed (server-side `GET /clubs`; extra `GET /clubs/my` after join). Un-allowlisted: RSC prefetch requests on Next (`GET /privacy?_rsc`, `/terms?_rsc`, `/clubs?_rsc`) and the missing Maps/maps-key calls. |
| P3 States | PASS | Mocked: 503 on `session-status` renders the guest list + "log in to join"; 503 on `/clubs/my` shows the error banner + toast (screenshot `playwright-report/parity/r5/my-503.png`); a hung `/clubs/my` surfaces the error toast after the 15 s client timeout (measured 14.8 s and 18.2 s); join 503 shows an error toast and stays on `/clubs`. Observation: on the `/clubs/my` error the "no clubs found" empty state is shown below the error banner (misleading, check what Angular does). |
| P4 Auth | PASS (mocked) | Mocked session via `/auth/session-status`, `/auth/me`, `/clubs/my`: tabs appear for signed-in only; member and organizer (mine contains the club, `organizerId` = user or other) show no join button and list the club in "my" (screenshots `member-my-tab.png`, `organizer-my-tab.png`). Join POST is `POST /clubs/:uuid/join`, body `{}`, JSON content type. Admin role not exercised (no admin-only UI on `/clubs`). 401-refresh-replay and CSRF Origin are covered by unit tests, not re-run here (would need the real backend). |
| P5 i18n | FAIL (P5b) / PASS (P5a) | uk and en raw HTML both correct (title, description, `html lang`). P5a Next to Angular passes. **P5b Angular to Next fails**: the deployed legacy build (book-club-fe production) does not write the `lang` cookie (it only sets `localStorage.lang`), because commit `10e2b8a` (strangler shims, lang/theme cookies) is on `feat/strangler-shims` and not deployed to legacy. After switching to English in Angular the log shows `localStorage.lang=en cookie.lang=undefined` and Next `/clubs` stays `uk`. Fix: deploy the strangler-shims legacy build before any `/clubs` canary (rollout prerequisite). Key parity (`packages/i18n`) not re-run here. |
| P6 SEO | PASS for `/clubs`; FAIL for `/privacy` and `/terms` JSON-LD | Raw HTML (no JS) for `/clubs`: localized `<title>` (`Книжкові клуби \| Book Club` / `Book Clubs \| Book Club`), the real public club name (`TestClubIcon`) present, canonical `https://book-club-planer.vercel.app/clubs`, og:* absolute, `robots index,follow`, JSON-LD WebSite + Organization graph, JSON-LD safely serialised (no raw `</script>` break). `/sitemap.xml` lists `/clubs/0ebcd8b0-...` (the public club); `/robots.txt` matches legacy content. Gaps: `/privacy` and `/terms` have no JSON-LD at all, while legacy serves the site-wide WebSite/Organization block from `index.html` (the parity `seo.spec.ts` `assertComplete` therefore fails for them). Harness notes: the stock `seo.spec.ts` compares canonical against the deployment origin, but the canonical is (correctly) the production origin, so `seo raw /clubs` "fails" on any preview (harness expectation problem, not a product bug); `seo raw` for `/`, `/login`, `/register`, `/support` fails because legacy emits a relative `og:image` (`/og-image.png`), out of R5 scope. |
| P7 A11y | FAIL (absolute), parity with legacy | Keyboard: tabs (Radix roving focus: focus the tablist, ArrowRight/Left/Home/End move and activate) PASS; mobile sheet at 375: focus trapped for 12 Tab + 12 Shift+Tab, Escape closes, focus returns to the trigger PASS. axe wcag2a/aa on `/clubs`: dark all sizes and uk/en: 0; **light (uk and en, 375/768/1280): 1 serious `color-contrast`** on the guest "log in to join" primary button (`#fff9f0` on `#b36109` = 4.33, needs 4.5), plus in the open sheet the title (`#b5720a` on `#f2eade` = 3.27). Legacy Angular shows the identical two failures (same tokens), so this is not a regression, but the plan's "0 serious/critical" is not met. `/privacy`, `/terms`: 0. Fix: darken the `primary-600` button background used with `text-primary-foreground` to at least 4.5:1 (about `#a35a08`) and the sheet title colour to at least 4.5:1 on `surface`, in `packages/config/tailwind-theme.css`; apply the same tokens to Angular to keep parity. `a11y-authenticated.spec.ts` BLOCKED (see P12). |
| P8 Visual | FAIL | Legacy baselines captured with `bypassCSP` (see note), Next compared at maxDiffPixelRatio 0.02. `/clubs` uk: 6/6 PASS. `/clubs` en: 375 light and dark FAIL (ratio 0.10, subtitle wraps to two lines: +28 px height); 768 and 1280 PASS. `/privacy` and `/terms` (uk and en are the same static Ukrainian text): 12/12 FAIL, ratios 0.04 to 0.09 and page height +18 to +26 px at 768/1280. Cause seen in the diffs: Next text is 1 to 2 % wider than Angular (same font families) so lines wrap differently. Likely `next/font` Inter/Playfair load as static instances while Google's CSS serves the variable `opsz` axis. Fix to try: `Inter({ axes: ['opsz'], ... })` and the Playfair equivalent in `apps/web/src/app/fonts.ts`, then re-run. Images: `playwright-report/parity/r5/visual/{uk,en}/*/*-{expected,actual,diff}.png`; baselines `e2e/parity/__snapshots__/visual.spec.ts/` (untracked, do not commit). Only dark/light, uk/en, 3 widths for the three R5 routes were run. |
| P9 Perf | FAIL (first-load JS); field metrics BLOCKED | First-load JS from the preview HTML (all `<script src>`, gzip -6, JS only, same comparator as `BASELINE-2026-10.md`): `/clubs` **243.6 KB** (gzip -9: 243.1) vs the 181 KB budget, **over by about 62 KB**; `/privacy` 158.3 KB, `/terms` 158.3 KB (both under). `npm run size` itself could not run in this environment: the script's local Edge Config mock did not make the proxy serve Next (`next start` returned 500 proxying to `legacy.invalid`) and the script then hangs on its stdio pipe; the same metric was computed against the deployed preview (`scratchpad/size.mjs`, output in this file). Note the script default budget is 200 KB, not 181. LCP/INP/CLS p75 need Speed Insights field data, not obtainable on a preview. Heaviest `/clubs` chunks (gzip): 69.8, 61.5, 41.6, 38.6 KB. Fix: analyze the four largest chunks (`next experimental-analyze`), most likely query client + zod contracts + Radix/Tabs pulled into the first-load tree; lazy-load what only signed-in users need. |
| P10 Analytics | BLOCKED | `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` return platform JS on the preview (not the Angular index.html) and each hard navigation loads them once; the page-view beacon is not sent outside production, so "exactly 1 per navigation" needs a canary window in Vercel Analytics. |
| P11 Errors | PASS | Guest `/clubs`, signed-in tabs and mocked join: 0 `console.error` and 0 `pageerror` (only expected "Failed to load resource 503" network lines in the deliberate 503 test). `/privacy`, `/terms`: 0. Side finding on legacy: in Chromium legacy's enforced Trusted Types CSP blocks a Maps bootstrap script and the guest/member `/clubs` list is never fetched (0 club cards, error toast) unless CSP is bypassed; that is the already-known N-1 and means the deployed legacy `/clubs` is currently broken in Chromium, so the migration improves it. |
| P12 E2E | BLOCKED (clubs.spec, a11y-authenticated) / PASS (public-pages) | `e2e/ui/clubs.spec.ts` and `a11y-authenticated.spec.ts` need `global-setup` personas (register + seed on the backend); it is refused for non-local APIs and I did not set `ALLOW_PROD_SEED`, so both are skipped for prod safety. `cleanup-pw-audit.sql` documents the residue such seeding leaves on prod. Equivalent coverage was written as a mocked spec (`e2e/parity/r5-clubs.spec.ts`, 28 tests, next only). `public-pages.spec.ts` (run through a temporary no-seeding config, the "wrong credentials" test excluded because it POSTs to the real login): 7/7 pass on the Next front door, 7 pass and 1 fail on both targets alike (`register-email-error` testid missing in the deployed legacy build, an undeployed R0 change, same result on legacy so no parity gap). |

## Header matrix (curl, preview, bypass header; legacy direct for comparison)

Files: `scratchpad/hdr/*` (not kept in repo). Results:

- `/clubs`, `/privacy`, `/terms` (Next): `content-security-policy` with a per-request `nonce-` (two requests gave two different nonces) and `'strict-dynamic'`; `content-security-policy-report-only: require-trusted-types-for 'script'; trusted-types default nextjs#bundler 'allow-duplicates'`; HSTS `max-age=63072000; includeSubDomains; preload`; exactly one `x-frame-options: DENY`; `x-content-type-options: nosniff`; `referrer-policy: strict-origin-when-cross-origin`; `permissions-policy`; `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`. PASS.
- `/api/v1/clubs` and `/api/v1/auth/session-status`: `cache-control: private, no-store`, no `access-control-allow-origin`. PASS.
- `/strangler.json`: `cache-control: private, max-age=30`. PASS.
- Legacy routes through the front door (`/login`, `/`): header set byte-identical (after dropping date/etag/x-vercel/age/set-cookie) to legacy direct, including the enforced Trusted Types CSP. PASS.
- `/_vercel/insights/*` and `/_vercel/speed-insights/*`: 200 `application/javascript` from the platform. PASS.

## HAR-diff (`npm run parity`)

Harness fix needed first: `e2e/parity/har-diff.ts` imports `'../seed-guard'` without an extension so `npm run parity` crashes with `ERR_MODULE_NOT_FOUND` under `node`; changed to `'../seed-guard.ts'`.

Legacy origin is recorded with `PARITY_LEGACY_BYPASS_CSP=1` (harness option added) because the enforced Trusted Types CSP stops the Angular app from loading the club list at all (see P11).

Journey `guest-browse` (`/events`, `/clubs`):

```
GET self /api/v1/clubs?                              legacy=1 next=0   <- allowed delta (server-side GET /clubs)
GET maps.googleapis.com /maps/api/js?...             legacy=2 next=1   (Next /clubs does not load Google Maps)
GET maps.googleapis.com /maps/api/mapsjs/gen_204?..  legacy=2 next=1
GET self /api/v1/config/maps-key?                    legacy=2 next=1
GET self /clubs?_rsc   legacy=0 next=1   <- RSC prefetch
GET self /privacy?_rsc legacy=0 next=2   <- RSC prefetch
GET self /terms?_rsc   legacy=0 next=2   <- RSC prefetch
```

Signed-in mocked journey (`/clubs`, click join; probe scripts, all `/api/v1` mocked, legacy with CSP bypass):

- legacy: `session-status`, `config/maps-key`, `POST auth/refresh`, `auth/me`, `users/me/stats`, `GET clubs`, `GET clubs/my` (twice), `POST clubs/:id/join`.
- next: `session-status`, `auth/me`, `GET clubs/my` once, `POST clubs/:id/join`, then one extra `GET clubs/my` (allowed delta).
- Same POST path; Next body `{}`. No `GET /clubs` in the browser, as expected.

Suggested allowlist additions or fixes: (a) `guest-browse.json`: the four Maps/maps-key entries (legacy-only, Next fewer) with reason "Angular shell bootstraps Maps on every route (N-1); Next loads it only where used"; (b) decide on the RSC prefetches: add `prefetch={false}` to the footer/header links to `/privacy`, `/terms` and the self-link `/clubs`, or allowlist `*?_rsc` (they are harmless GETs to routes that may still be legacy); (c) legacy-only `POST auth/refresh` and `users/me/stats`, and the duplicated legacy `GET clubs/my`, are legacy extras (Next makes fewer calls) and should be allowlisted for the `member-browse` journey.

The seeded `member-browse` and `member join` journeys and the `organizer view` journey are BLOCKED for the real harness (need `parity:setup-member`, which seeds prod); mocked equivalents above.

`guest-auth-pages` (`/login`, `/register`) shows legacy=2/next=0 Maps requests: routes served by Angular through the front door. Cause here is harness noise: prod maps-key returned 429 (rate limit hit by the repeated runs from one IP) and the bypass header added by `extraHTTPHeaders` is also sent to third parties (`fonts.gstatic.com` requests were CORS-blocked on the Angular pages). Out of R5 scope; not counted.

## Propagation (Edge Config, shared store `book-club-strangler`)

- Flip to next 100 % for `/clubs`, `/privacy`, `/terms`: write call 1.3 s, preview served Next (CSP nonce present) 2.4 s after the write returned.
- Restore to `legacy` 0 %: write call 1.5 s, preview served legacy 1.0 s (`/clubs`), 1.2 s (`/privacy`), 1.3 s (`/terms`) after the write returned.
- Plan acceptance (<= 60 s): met.
- Final store value (verified with `vercel edge-config items book-club-strangler --key strangler`): `{"version":3,"enabled":true,"routes":{"/__strangler-probe":{"target":"next","percent":100},"/clubs":{"target":"legacy","percent":0},"/privacy":{"target":"legacy","percent":0},"/terms":{"target":"legacy","percent":0}}}`. Before the run it was version 1 with only the probe (next 100) plus `/privacy` and `/terms` legacy 0 (no `/clubs` key); `/clubs` is now an explicit legacy 0 entry, which is equivalent.

## Failures and suggested fixes (summary)

1. P9 `/clubs` first-load JS 243.6 KB vs 181 KB: bundle analysis and lazy-loading of signed-in-only code.
2. P8 text metrics: `axes: ['opsz']` for Inter/Playfair in `apps/web/src/app/fonts.ts`; re-run visual.
3. P7 light-mode contrast (4.33 on the primary button, 3.27 on the sheet title): token fix in `packages/config/tailwind-theme.css`, mirror to Angular.
4. P5b: deploy the legacy build containing `10e2b8a` (lang/theme cookies) before any `/clubs` canary. Prerequisite for the whole rollout.
5. P6: add the site-wide WebSite/Organization JSON-LD to `/privacy` and `/terms` (root layout) to match legacy.
6. P2: allowlist or remove RSC prefetches; extend allowlists as listed.
7. P3 minor: hide the "no clubs found" empty state when the `/clubs/my` request failed.
8. Harness: `har-diff.ts` extension bug (fixed), `seo.spec.ts` canonical expectation vs preview origin, `npm run size` local mock broken, extraHTTPHeaders leaking the bypass header to third-party origins (prefer cookie bypass).
9. Legacy prod: Trusted Types CSP breaks the Angular bootstrap in Chromium (N-1), so `/clubs` on legacy currently fails to list clubs for Chromium users.

## Changes made in the repo (uncommitted)

- `playwright.parity.config.ts`: `next` project reads `PARITY_NEXT_BYPASS` into `extraHTTPHeaders`; `legacy` project honours `PARITY_LEGACY_BYPASS_CSP=1`.
- `e2e/parity/har-diff.ts`: `.ts` import fix, same two env options.
- `e2e/parity/visual.spec.ts`: optional `PARITY_LANG` (default `uk`, snapshot suffix `-en`).
- New untracked: `e2e/parity/r5-clubs.spec.ts`, `e2e/parity/__snapshots__/visual.spec.ts/`, `playwright-report/parity/r5/*` (gitignored).
- No secrets in any file; the bypass secret was passed through env only, and revoked at the end.
