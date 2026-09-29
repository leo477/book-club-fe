# Strangler front door runbook

Vercel team `dmytros-projects-ad22eb22` (`team_ufPAT42YdXQJ0HnqNTMwtbtg`).

| Thing | Value |
| --- | --- |
| Front door project | `book-club-web` `prj_wL7lvtSlmN5AX7x1PPKHL8VzbQIK` (Next.js, root `apps/web`, Node 24.x) |
| Legacy project | `book-club-fe` `prj_2iTSD1B5dwOuswr3k1NrWov9WUc1` (Angular, not renamed) |
| Legacy origin (`LEGACY_ORIGIN`) | `https://book-club-fe-dmytros-projects-ad22eb22.vercel.app` (team alias that follows book-club-fe production deploys) |
| Edge Config store | `book-club-strangler` `ecfg_dfkuedm9uuqj3caiisahhxxbbbis`, item `strangler` |
| Public alias | `book-club-planer.vercel.app` (currently on book-club-fe until cutover) |

`book-club-fe.vercel.app` is NOT usable as `LEGACY_ORIGIN`: it is a 307 redirect domain to `book-club-planer.vercel.app` and would loop after the swap.

All commands need `vercel login` as `zaharr3-8415` (or `--token`). Run from any directory.

## Manifest shape

```json
{"version":1,"enabled":true,"routes":{"/privacy":{"target":"next","percent":100}}}
```

- Next can only be served for routes present in `apps/web/src/strangler/routes.ts`; Edge Config can only disable them.
- Edge Config missing/unreadable (50 ms timeout) or `enabled:false` means legacy (fail-safe).
- The `bc_bucket` cookie (0-99) makes canaries sticky; a user is on Next when `bucket < percent`.

## Read current state

```sh
vercel edge-config items book-club-strangler --key strangler
```

## Flip a route (full on / full off)

Always send the whole `value` (upsert replaces the item). Bump `version`.

```sh
vercel edge-config update book-club-strangler --patch '{"items":[{"operation":"upsert","key":"strangler","value":{"version":2,"enabled":true,"routes":{"/__strangler-probe":{"target":"next","percent":100},"/privacy":{"target":"next","percent":100},"/terms":{"target":"legacy","percent":0}}}}]}'
```

Route to legacy = `{"target":"legacy","percent":0}`.

## Canary percent

Same command, e.g. `"/privacy":{"target":"next","percent":10}`. Raise 10 -> 50 -> 100 while watching error rate and Speed Insights against `BASELINE-2026-10.md`.

## Global kill (everything to legacy)

```sh
vercel edge-config update book-club-strangler --patch '{"items":[{"operation":"upsert","key":"strangler","value":{"version":3,"enabled":false,"routes":{}}}]}'
```

REST equivalent (no CLI): `PATCH https://api.vercel.com/v1/edge-config/ecfg_dfkuedm9uuqj3caiisahhxxbbbis/items?teamId=team_ufPAT42YdXQJ0HnqNTMwtbtg` with `Authorization: Bearer $VERCEL_TOKEN` and the same `{"items":[...]}` body.

## Propagation

Measured on a preview (2026-09-29, 4 flips 100 <-> 0, polled every 0.5 s from one client): the change was visible 1.0 s, 1.0 s, 3.8 s and 4.9 s after the write call returned (the write call itself takes about 1.5 s). Budget: 10 s typical, the plan's acceptance is <= 60 s. `/strangler.json` is cached `max-age=30`, so Angular's handoff guard can lag by up to 30 s.

## Rollback ladder

1. Route flag to `legacy` (seconds).
2. Global kill `enabled:false` (seconds).
3. Promote previous `book-club-web` deployment: `vercel rollback <deployment-url>` (project linked via `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` env vars).
4. Domain swap-back (minutes, no DNS involved):

Project-domain API (not exercised yet; verify on the first cutover):

```sh
# 1. remove from the front door
vercel api /v9/projects/book-club-web/domains/book-club-planer.vercel.app -X DELETE
# 2. attach to legacy
vercel api /v10/projects/book-club-fe/domains -X POST --input - <<< '{"name":"book-club-planer.vercel.app"}'
# 3. verify
curl -sI https://book-club-planer.vercel.app/clubs | grep -i -E 'x-vercel-id|content-security-policy'
```

Cutover (the opposite direction) is the same two calls with the projects swapped, after the security checklist below is green and the deployment to be exposed is a `book-club-web` production deployment. `book-club-fe.vercel.app` (redirect domain) stays on book-club-fe and keeps redirecting to `book-club-planer.vercel.app`.

Before the swap, make sure legacy `book-club-fe` still has its team alias `book-club-fe-dmytros-projects-ad22eb22.vercel.app` (it does; it is automatic per project) because the front door proxies to it.

## Token hygiene

- Runtime env `EDGE_CONFIG` on `book-club-web` contains only a READ token (`book-club-web-runtime-readonly`, created via `vercel api /v1/edge-config/<id>/token`). Never put a write/API token in project env.
- Writing needs a Vercel API token. Use a personal login for manual flips; for automation store a token scoped to the team in a protected GitHub Environment (`strangler-admin`, required reviewers, branch main only), never in repo-level secrets and never in `web.yml`.
- Rotate read token: create a new token, update the `EDGE_CONFIG` env var, redeploy, then delete the old one with `vercel edge-config tokens book-club-strangler --remove <token-id>`.
- `vercel curl` auto-generates a Deployment Protection bypass secret on the project (kept server-side in Vercel; do not paste it in logs/tickets). Revoke it in Project Settings > Deployment Protection when not needed.

## Preview / production separation

There is one store, and all three environments (production, preview, development) read the same `EDGE_CONFIG`. A flip made while testing a preview therefore also flips production. Before the first real canary, create `book-club-strangler-preview`, a second read token, and set `EDGE_CONFIG` for target `preview`/`development` only (`vercel env rm EDGE_CONFIG preview` then `vercel env add EDGE_CONFIG preview`), leaving production on `book-club-strangler`. Until then, do not test flips on previews unless the route is a probe.

## Deploy notes

- `book-club-web` has no Git connection and `apps/web/vercel.json` has `git.deploymentEnabled=false`; deploys come only from `.github/workflows/web.yml` (secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, new `VERCEL_PROJECT_ID_WEB`= `prj_wL7lvtSlmN5AX7x1PPKHL8VzbQIK`) or the CLI.
- Manual preview from the repo root (do not clobber the Angular link in `.vercel/`; back it up first):

```sh
export VERCEL_ORG_ID=team_ufPAT42YdXQJ0HnqNTMwtbtg VERCEL_PROJECT_ID=prj_wL7lvtSlmN5AX7x1PPKHL8VzbQIK
vercel pull --yes --environment=preview && vercel build && vercel deploy --prebuilt
```

- The first ever deployment of a project is promoted to that project's production automatically (it got `book-club-web-blue.vercel.app`); later `vercel deploy --prebuilt` without `--prod` are previews.
- Previews are behind Vercel SSO protection: use `vercel curl <path> --deployment <url> -- -sI`.

## Security checklist (R2 security review)

Run against the front door before and after cutover; all must pass.

1. Header matrix (`curl -I` on the deployment/alias):
   - `/clubs`, `/login`, `/` (legacy via fallback): headers must equal legacy's, including `content-security-policy` with `require-trusted-types-for 'script'`, exactly one `x-frame-options`, HSTS, nosniff. Diff: `diff <(curl -sI $LEGACY/clubs | tr -d '\r' | sort) <(curl -sI $FRONT/clubs | tr -d '\r' | sort)` ignoring date/x-vercel-*/age/etag.
   - `/__strangler-probe` and migrated routes (Next): CSP with a fresh `nonce-` per request and `strict-dynamic`, `content-security-policy-report-only` with trusted-types, HSTS, `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy`, `permissions-policy`, `cache-control` private/no-store.
   - `/api/*`: `cache-control: private, no-store`, no `access-control-allow-origin: *`, `set-cookie` (when present) has no `Domain` widening.
   - `/strangler.json`: JSON, `cache-control` contains `max-age=30`.
2. `/_vercel/insights/*` and `/_vercel/speed-insights/*` must return JS from the platform (not the Angular `index.html`) and must not be rewritten to legacy. Also enable Web Analytics and Speed Insights on `book-club-web` (they are not enabled by default; page views are counted per project, so book-club-fe dashboards stop receiving data after cutover). Confirm a single page view per hard navigation.
3. Tighten backend `CORS_ORIGIN_REGEX` (`book-club-be/app/config.py`, currently `^https://book-club-[a-z0-9-]+\.vercel\.app$`, also used for OAuth `fe_origin`) to the exact origins: `^https://(book-club-planer|book-club-web-blue)\.vercel\.app$` plus any custom domain, once previews no longer need to call the API from their own origins. Every Vercel project or preview named `book-club-*` is currently trusted.
4. `og-image.png` (and any other file legacy serves as static, plus `googleea44a5e89a1de9d7.html`) must be moved into `apps/web/public` before cutover is considered complete; until then they resolve through the fallback. Do not add colliding names to `apps/web/public` while Angular owns them.
5. `LEGACY_ORIGIN` is a fixed env value; the fallback rewrite has no user-controlled host. Re-check `next.config.ts` when touching rewrites.
6. Edge Config runtime credential is read-only (see Token hygiene).
