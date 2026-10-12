# Strangler shim inventory (R13.5, SCRUM-114)

Scope: every piece of code, config or ops state that exists only because Angular and Next run side by side. Verdict is "now" (provably unused today, removed in this round) or "R14" (needed while `rewrites.fallback`/Angular exist, or needs a rollout decision). Method: grep of non-test importers per export under `apps/web/src`, reading `src/app/**`, `.github`, `vercel.json`, `e2e`, and the route coverage run (`node scripts/check-route-coverage.mjs`: 28/28 Angular routes covered).

## Next side (apps/web)

| Shim | Used by | Verdict |
|---|---|---|
| `next.config.ts` `rewrites.fallback` -> `LEGACY_ORIGIN` | every path the manifest does not own (unknown URLs, `/og-image.png`, Google verification file, any route not yet 100 %) | R14 (plan: remove after 30 days at 100 %) |
| `DISABLE_LEGACY_FALLBACK` (`lib/legacy-fallback.ts`, proxy, `readState`) | R13 preview audit | R14 (delete together with the fallback) |
| `src/proxy.ts` + `strangler/proxy-handler.ts` (decide next/legacy, `bc_bucket`, legacy rewrite, 503 without origin) | every request | R14 keeps only the CSP/nonce part |
| `strangler/config.ts` (`decide`, `parseConfig`, `loadConfig`, `computeState`, bucket helpers), `strangler/edge-config.ts` | proxy, `readState`, `/strangler.json`, `layout.tsx` | R14 simplified to a global `enabled` or deleted |
| `strangler/routes.ts` (`manifest`, `matchRoute`, `isLegacyShadowed`, `compilePattern`) | `AppLink`, `use-push`, `use-replace`, proxy, coverage script and test | R14 (`isLegacyShadowed` goes first; the manifest is also the coverage script input until Angular is deleted) |
| `strangler/context.tsx` (`StranglerProvider`, `useEnabledRoutes`) and `layout.tsx` `enabledRoutes` | `AppLink`, `use-push`, `use-replace`, `chat-provider` | R14 (every link becomes a plain `Link`) |
| `components/app-link.tsx` `<a>` vs `<Link>` switch, `prefetch={false}` | 35 files | R14 (collapse to `Link`, re-enable prefetch) |
| `lib/use-push.ts`, `lib/use-replace.ts` router-vs-hard-navigation split | 17 call sites | R14 |
| `lib/navigate.ts` `hardNavigate`/`replaceNavigate` | `api.ts` (401 redirect), login/register/oauth forms, header | R14 for the "target may be legacy" reason; the safe-path validation is a security control and stays (rename only) |
| `app/strangler.json/route.ts` | Angular `StranglerManifestService` (fetched at boot) | R14 (only consumer is Angular) |
| `strangler/flags.ts` `shell.chatWidget` | `chat-provider`, `chat-slot` | Not a shim: a product rollout flag. Needs a rollout decision (flip to 100 %, then drop the flag), independent of R14 |
| `app/__strangler-probe/page.tsx` + manifest entry `/__strangler-probe` | `proxy-handler.test.ts`, `routes.test.ts`, runbook canary smoke, `e2e/parity/r12/edge-config-server.mjs` | R14 (still the only route usable to smoke-test the front door without touching a real page) |
| `lib/legacy-session.ts` (`migrateLegacySession`, called from `features/clubs/use-session.ts`) | every first session probe in a browser that still holds `bc_refresh_token`/`bc_has_session` | R14 or later: time-based, remove once the oldest refresh token issued before cookie auth has expired and canary events show no `/auth/refresh` calls from it; cannot be proven unused from code |
| `strangler/csp.ts`, `lib/ws-base-url.ts`, `vercel.json` CSP | Next front door | Not a shim; stays |
| `_internal/revalidate` | backend cache invalidation | Not a shim; stays |
| `bc_bucket` cookie, `x-bc-bucket` header, `lib/analytics.ts` bucket tag | canary cohort split, canary events | R14 (events keep working without the cohort once everything is 100 %) |
| `app/robots.test.ts` reads `public/robots.txt` | parity of robots rules with Angular | R14 (file moves to `apps/web`) |
| `scripts/check-route-coverage.mjs` + `web.yml` job | CI gate on manifest completeness | R14 (deleted with `src/app/**/*.routes.ts`) |

## Angular side (src)

| Shim | Used by | Verdict |
|---|---|---|
| `core/strangler/strangler-manifest.service.ts` (`provideAppInitializer` in `app.config.ts`) | the guard below | R14 (Angular deleted) |
| `core/strangler/strangler-handoff.guard.ts` on `privacy`, `terms`, clubs list `''` | hard-hands those three routes to Next when the manifest enables them | R14: still the live handoff for the only three Angular routes that have a Next twin and no other redirect; removing it now would stop `/privacy`, `/terms`, `/clubs` from moving to Next for users who land through Angular navigation |
| Angular `**` not-found route | unknown URLs while the fallback exists | R14 (`app/not-found.tsx` takes over when the fallback goes) |

## Ops / config

| Item | Verdict |
|---|---|
| Edge Config item `strangler` and token | R14 (or simplified, per plan) |
| `LEGACY_ORIGIN` env, legacy Vercel project `book-club-fe` alias | R14, project archived not deleted for 30 days |
| `e2e/parity/r12/edge-config-server.mjs` local stub | R14 |
| Runbook sections on flipping routes, canary, global kill | R14 rewrites them to the post-decommission rollback |

## Removed in this round

Nothing functional is provably unused: every shim above has a live importer, a live route, or an ops dependency until the fallback is removed. Two stale comments in `features/club-detail/membership.tsx` (ManagePanel "legacy manage screen", ChatButton "chat widget is not ported yet ... legacy chat page") described state that stopped being true in R10/R12 (`/clubs/:id/manage` and `/chats` are manifest routes) and were corrected.

## Observed drift (not fixed here)

- Angular `StranglerManifestService` compiles only `:id` as a UUID and treats other params (`:quizId`) as `[^/]+`; the Next manifest treats `:id` and `:quizId` as UUIDs. Quiz URLs with a non-UUID quiz id therefore hand off from Angular but are not owned by Next. Harmless today (quiz routes are not behind the Angular guard), moot after R14.
