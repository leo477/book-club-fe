# R14 preparation: what removing Angular touches

Nothing here is to be executed before SCRUM-115 passes (every manifest route at 100 % for 30 days, 7 days with zero legacy hits). This is the inventory, built from the repository on 2026-10-19, so the R14 PR is a checklist run and not a discovery exercise. Plan: `PLAN-REACT-MIGRATION-2026-09-28.md` R14; tickets SCRUM-116 to SCRUM-122.

## R14.2 CI and deploy (SCRUM-116)

| File | Angular-specific part | Action |
| --- | --- | --- |
| `.github/workflows/ci.yml` | jobs `lint`, `test`, `build`, `security`, `typecheck`, `sonarcloud`, `changes` (legacy-relevant diff), `deploy` (legacy Vercel deploy) | remove, or keep only what also covers `apps/web`/`packages`; `web.yml` already has `lint`, `typecheck`, `test`, `route-coverage`, `build`, `deploy` |
| `.github/workflows/bundle-size.yml` | measures the Angular build | retarget to `apps/web` first-load JS (`npm run size` in `apps/web`) or remove |
| `.github/workflows/lighthouse.yml` + `.lighthouserc.json` | `staticDistDir ./dist/book-club-fe/browser` | retarget to a `book-club-web` preview URL |
| `.github/workflows/i18n-check.yml` | checks Angular `public/i18n` parity | moved to `packages/i18n/locales` (SCRUM-118) |
| `.github/workflows/parity.yml` | `legacy` Playwright project and the local production Angular build | remove the legacy project and `r6-dual`; keep Next-only specs |
| `sonar-project.properties` | `sonar.sources=src` and `sonar.tests=src` (Angular only) | point at `apps/web/src` and `packages/*/src` |
| Vercel project `book-club-fe` | legacy deployment | tag `angular-final` first; archive the project (owner, SCRUM-122), delete only after 30 more days |

Tag before anything is deleted: `git tag angular-final <last Angular commit>` and keep `rewrites.fallback` restorable (post-decommission rollback = redeploy that tag and restore the fallback; document it in the runbook, R14.6).

## R14.3 Remove the app and its dependencies (SCRUM-117)

- Directories and files: `src/` (Angular app), `angular.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `proxy.conf.json`, `mock-server/` (check `apps/web` tests do not use it), root `vitest.config.ts` (Angular tests), root `eslint.config.js` Angular rules, `components.json` (Spartan), `scripts/extract-i18n.mjs`, root `vercel.json` (legacy CSP/rewrites; its CSP keeps being mirrored by `apps/web` until then, see `csp-vercel.test.ts`), `playwright.full-audit.config.ts` Angular-targeted parts.
- `package.json`: scripts `ng`, `start`, `build`, `watch`, `test`, `test:ci`, `lint`, `extract-i18n*`, `dev`, `mock`; all `@angular/*`, `@spartan-ng/*`, `@ngx-translate/*`, `@ng-icons/*`, the `@angular/cli`/`@angular/build` overrides. The remaining `npm audit` advisories through `@spartan-ng/cli` (SCRUM-78) close with this.
- Root becomes a pure workspace root: move scripts that survive (`audit:full`, `parity*`) under `apps/web` or `e2e`.
- `src/app/core/security/trusted-types-policy.ts` and the `ng-icons`/`dompurify-internal` entries in `vercel.json` go with the app (SCRUM-172 becomes moot).

## R14.4 i18n (SCRUM-118, covers SCRUM-74)

- Done in SCRUM-118: `packages/i18n/locales/{en,uk}.json` are the ICU source of truth; `public/i18n` is generated from them for Angular (`npm run build:ngx -w @book-club/i18n`, wired into root `prestart`/`prebuild`/`prewatch`) and gitignored. `extract-i18n.mjs` has no `--clean` (SCRUM-74).
- At R14.3: delete the root `i18n:ngx`/`pre*` scripts, `build-ngx.mjs`, `toNgx` and its round-trip test (and the `@formatjs/icu-messageformat-parser` devDependency if unused).

## R14.5 Static files and routing (SCRUM-119)

- Copies already exist in `apps/web/public` (SCRUM-129: `og-image.png`, `googleea44a5e89a1de9d7.html`, favicon); delete the root `public/` originals and the test that keeps them identical (`apps/web/src/static-files.test.ts`).
- Remove `rewrites.fallback` and the `LEGACY_ORIGIN` proxy branch in `proxy-handler.ts`, the legacy middleware branch, the Edge Config read paths for percent rollout (or keep Edge Config only as a kill switch), `DISABLE_LEGACY_FALLBACK` and its build guard (`check-legacy-guard.mjs`, `legacy-fallback.ts`, tests).
- `not-found` in Next becomes the real 404 (the plan's R13 already ported the page).
- The `book-club-planer.vercel.app` alias stays on `book-club-web`.

## R14.6 Docs and tooling (SCRUM-120)

`CLAUDE.md` (stack, folder structure, commands), `repomix.config.json` (drop `src/`), `.husky`/`lint-staged` globs (`src/**/*.{ts,py,html}`), `README.md`, `RUNBOOK-STRANGLER.md` (post-decommission rollback), the plan files.

## R14.7 Verification (SCRUM-121)

At least two review rounds, a security review, then `audit:full` green against production, plus: no `x-vercel-id` of the legacy project in any response, sitemap and robots still served by Next, Google Search Console shows no new 404 spike for the first week.

## Known follow-ups that are NOT part of R14

SCRUM-81 (cookie-only web sessions): the Angular half (FE #254) is throwaway after R14, the backend flag and the contract change stay. SCRUM-94 (member list pagination), SCRUM-140 items 1 and 4, SCRUM-67 CSP items.
