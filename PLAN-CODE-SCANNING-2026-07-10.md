# Fix all GitHub Code Scanning alerts (book-club-fe)

## Context

The repo's Security tab has **199 open code-scanning alerts** (Dependabot: 0 open vulnerabilities). The 23 alerts fixed this morning in PR #128 already auto-closed after merge. The user wants all remaining alerts resolved, with **all code changes performed by the book-club-agents MCP agents** (Claude orchestrates only). User decisions: MIT license, dismiss non-fixable Scorecard alerts + enable branch protection, split work into ~4 PRs by domain into `develop`.

### Alert inventory (state: open, fetched 2026-07-10)

| Group | Tool / Rule | Count | Nature |
|---|---|---|---|
| A. CI security | Scorecard `PinnedDependenciesID` (64), `TokenPermissionsID` (4); CodeQL `actions/missing-workflow-permissions` (5) | 73 | Workflows not hash-pinned, missing/excessive GITHUB_TOKEN permissions |
| B. Test quality | SonarCloud `typescript:S5906` (79), `S5976` (2) | 81 | Generic assertions → `toHaveLength`/`toBeInstanceOf`; 2 groups of tests → parameterized `it.each` |
| C. A11y + CSS | SonarCloud `Web:S6819` (3), `S6842` (1), `S6853` (2), `css:S1874` (1) | 7 | ARIA roles in address-autocomplete, unassociated form labels, deprecated `word-break: break-word` |
| D. Stale QDJS | Qodana (QDJS), 10 rules | 33 | Tool last ran **2026-04-14**; spot-checks show most findings already fixed in current code — they will never auto-close because the tool no longer runs |
| E. Repo-level Scorecard | License, SecurityPolicy, BranchProtection, CodeReview, CIIBestPractices, Fuzzing | 6 | Not code fixes: LICENSE file, SECURITY.md content, repo settings, process |

Full per-alert list saved at `/tmp/claude-1000/-home-dmytr-angular-book-club-fe/a0f21c43-8266-415a-ab4b-0f692e31a5cf/scratchpad/alerts.txt` (regenerate with `gh api "repos/leo477/book-club-fe/code-scanning/alerts?state=open&per_page=100" --paginate`).

## Execution model

All code changes go through `mcp__book-club-agents__run_agent` (returns a `__delegate__` payload → immediately spawn a general-purpose Agent with the provided `agentPrompt`). One agent invocation per PR. Non-code actions (alert dismissals, branch protection, PR creation/merging, verification) are done by the orchestrator directly.

**Important repo quirk:** the Husky pre-commit hook regenerates `repomix-output.md` on every commit, so parallel branches always conflict on that file. **Create and merge PRs sequentially**, branching each from the freshly updated `origin/develop`.

## PR 1 — CI/workflow security (agent: `security`, fallback `devops`)

Branch `fix/workflow-security-hardening` off `develop`. Closes 73 alerts + 2 repo-level ones.

Files: `.github/workflows/*.yml` (ci, codeql, scorecard, pr-review, lighthouse, i18n-check, dependency-review, secret-scan, stale, bundle-size, auto-labeler), `LICENSE`, `SECURITY.md`.

1. **Pin every GitHub Action to a full commit SHA** (keep a `# vX.Y.Z` comment) across all 11 workflows — 62 of the 64 PinnedDependencies alerts. Resolve SHAs with `gh api repos/{owner}/{repo}/git/ref/tags/{tag}`.
2. **ci.yml:294 npmCommand** — change `npm install` to `npm ci` (or add `--ignore-scripts` where appropriate); **ci.yml:208 downloadThenRun** — pin the downloaded script (checksum verification or pinned version).
3. **Add least-privilege `permissions:` blocks** — CodeQL alerts: ci.yml jobs at lines ~18, 42, 72, 96, 120 get explicit `permissions: contents: read` (plus whatever each job actually needs). Scorecard TokenPermissions: add top-level `permissions: read-all` to scorecard.yml; move `statuses: write` (pr-review.yml) and `security-events: write` (codeql.yml) from top level down to the jobs that need them; review `deployments: write` in ci.yml:278.
4. **Add `LICENSE`** (MIT, copyright Dmytro Zakharchenko 2026) — closes Scorecard LicenseID.
5. **SECURITY.md** — exists on `main` but Scorecard warns "no linked content"; ensure it exists on `develop` with disclosure contact/links — improves SecurityPolicyID.

Risk note: wrong permissions blocks can break CI — after merging, watch the first `develop` run of every workflow and fix forward if a job fails with a 403.

## PR 2 — Test-quality Sonar alerts (agent: `tester`)

Branch `fix/sonar-test-assertions` off updated `develop`. Closes 81 alerts.

- **S5906 (79)**: mechanical replacements exactly as each alert message states — `expect(x.length).toBe(n)` → `expect(x).toHaveLength(n)`, `expect(x instanceof T).toBe(true)` → `expect(x).toBeInstanceOf(T)`. Affected specs (~25 files) include `chat.service.spec.ts` (largest cluster), `club.service.computed.spec.ts`, `quiz.service.spec.ts`, `event.service.spec.ts`, `randomizer.service.spec.ts`, `seo.service.spec.ts`, `club.service.spec.ts`, `auth.guard.spec.ts`, `role.guard.spec.ts`, `book-stores.component.spec.ts`, `book-autocomplete.component.spec.ts`, quiz/leaderboard specs, `support.service.spec.ts`, `upload.service.spec.ts`, `book-cover.service.spec.ts`. Get exact lines from the alerts list.
- **S5976 (2)**: convert to parameterized tests with Vitest `it.each` — `address-autocomplete.component.spec.ts:280` (3 near-identical tests) and `chat-widget.component.spec.ts:467` (4 tests).
- Must keep all 1103 tests green (`npx ng test --watch=false`).

## PR 3 — Accessibility + CSS (agent: `ui`, fallback `web-quality-enhancer`)

Branch `fix/sonar-a11y-css` off updated `develop`. Closes up to 7 alerts.

- `address-autocomplete.component.html:23-26` (S6819 ×3, S6842): the component implements the WAI-ARIA combobox pattern (`role="listbox"`/`role="option"` on ul/li), which Sonar flags generically. Agent must evaluate: if the pattern is correct (input with `role="combobox"`, `aria-controls`, `aria-activedescendant`, keyboard support), **keep the markup and the orchestrator dismisses these 4 alerts as false positives**; only refactor if the pattern is actually incomplete. Do not degrade the working autocomplete UX to satisfy the rule.
- `create-event.component.html:147` and `edit-event.component.html:155` (S6853): associate the `<label>` with its control (`for`/`id` or wrap the control).
- `chats.component.scss:56` (css S1874): `word-break: break-word` → `overflow-wrap: anywhere` (verify chat-bubble wrapping visually/by test).

## PR 4 — Valid QDJS leftovers (agent: `dev`)

Branch `fix/qdjs-leftovers` off updated `develop`.

First verify each of the 33 QDJS alerts against current code (spot-checks already done show most are stale). Known still-present candidates to fix:
- `AngularNgOptimizedImage` (2): `club-detail.component.html:28`, `clubs-list.component.html:91` — switch `src` → `ngSrc` with `NgOptimizedImage` import **only if** images have fixed dimensions/fill; otherwise mark for dismissal.
- `AngularUndefinedBinding` (4): Tailwind `[class.dark:bg-…]` bindings in quiz templates (Angular can't bind escaped `:` class syntax — replace with `[ngClass]`/`class` conditional) and `ngSubmit` on a form in `club-detail.component.html:423` (likely missing `FormsModule` import).
- `ES6MissingAwait` (3), `JSDeprecatedSymbols` (5), remaining unused symbols — fix only those that still exist at current line content.
- Already verified stale (dismiss, don't touch code): `quiz.service.ts:86` attempt var, `create-club` auth field, `quiz-take` router field, `club-detail` router field, `extract-i18n.mjs` `[\w]` regexes, all 5 `JSIgnoredPromiseFromCall` (navigate calls now have `.catch`), `randomizer._purposeValue` (used in an effect — false positive), eslint finnish notation ones (interceptor rewritten).

The agent returns two lists: **fixed** and **confirmed-stale/false-positive** (with alert numbers). Orchestrator then dismisses the stale list.

## Orchestrator actions (no MCP, not code changes)

1. **Dismiss stale/false-positive alerts** via `gh api -X PATCH repos/leo477/book-club-fe/code-scanning/alerts/{n} -f state=dismissed -f dismissed_reason="..." -f dismissed_comment="..."` — reasons: `false positive` for QDJS stale + a11y-combobox (if kept), `won't fix` for Scorecard CodeReviewID (#395), CIIBestPracticesID (#394), FuzzingID (#396). QDJS alerts are the only closure path since Qodana never re-runs.
2. **Enable branch protection** on `main` and `develop` via `gh api -X PUT repos/leo477/book-club-fe/branches/{branch}/protection`: require status checks (Build, Lint, Unit Tests, Type Check), block force-pushes/deletions, **do not require PR approvals** (solo maintainer would be locked out) — closes/improves BranchProtectionID (#324). Confirm exact check names from a recent run before applying.
3. **PRs**: create each PR into `develop`, wait for CI green, merge, pull, branch the next one. Standard commit/PR footers.

## Verification

- Per PR: `npm run lint`, `npx tsc -p tsconfig.app.json --noEmit && npx tsc -p tsconfig.spec.json --noEmit`, `npx ng test --watch=false` (1103+ tests green), `npm run build`.
- PR 1 extra: after merge, confirm every workflow's first `develop` run succeeds (no token-permission 403s).
- End state check: after all merges + next SonarCloud/CodeQL/Scorecard analyses on `develop` (~minutes), re-run the alert count — target: `gh api ".../code-scanning/alerts?state=open" --paginate` returns 0 (or only deliberately-left-open items). Scorecard runs on a weekly cron — its alerts may take until the next scheduled run to close; can be triggered via `gh workflow run scorecard.yml` if dispatchable.

## Final status (2026-07-10, end of session)

**222 → 36 open alerts.** Six PRs merged into `develop`, all sequential, all green CI:

| PR | What | Alerts closed |
|---|---|---|
| #129 | Pin all GH Actions to SHA, scope workflow permissions, add LICENSE/SECURITY.md | ~73 (PinnedDependencies, TokenPermissions, missing-permissions, License, SecurityPolicy) |
| #130 | `toHaveLength`/`toBeInstanceOf`, `it.each` parameterization in specs | 81 (S5906, S5976) |
| #131 | Complete ARIA combobox pattern, merge toggle labels, fix deprecated CSS | 3 of 7 (S6853, css:S1874) — 4 combobox alerts persisted, see below |
| #132 | Triage 32 QDJS alerts against current code; fix 3 real (deprecated `currentLang`) | 3 (rest confirmed stale, left open — see below) |
| #133 | **Hotfix**: 4 of the action SHAs pinned in #129 were annotated-tag-object SHAs, not commit SHAs — broke Scorecard's own workflow-identity verification on every push since #129 (`imposter commit` 400 errors). Re-resolved correctly. | Restored Scorecard functionality |
| #134 | Added `actions`-language CodeQL job (closes the 5 orphaned `missing-workflow-permissions` alerts for real, not by dismissal); scoped SonarCloud suppression for the 2 combobox rules per file (confirmed false positive — static rule can't recognize a complete custom-rendered ARIA combobox) | 5 CodeQL + 4 SonarCloud |

Also: enabled branch protection on `main` and `develop` (required checks: Lint, Type Check, Unit Tests, Build; blocks force-push/delete; requires conversation resolution) — closed Scorecard `BranchProtectionID` for real.

**Investigated and explicitly rejected:** moving the Vercel CLI into `package.json` devDependencies so Scorecard could verify its pin via `package-lock.json` hash — pulls in 17 high-severity transitive vulnerabilities via `@vercel/fun`/builder packages. Worse trade-off than the nitpick it would silence. Left as the exact-version (`vercel@55.0.0`) global install.

**Remaining 36 open, none dismissed, none fixable by this repo's code:**
- **32 QDJS (Qodana)** — no workflow in this repo runs Qodana; it was a one-time external scan (last ran 2026-04-14, per the tool's own `code-scanning/analyses` history). All 32 were individually verified against current code in #132: 3 were real and fixed, 29 no longer apply. Since the tool never re-runs, GitHub can't auto-close any of them — they'll sit open indefinitely unless someone with Qodana Cloud access re-triggers a scan, or they're manually dismissed (explicitly not done this session per user instruction to fix rather than dismiss).
- **Scorecard `CodeReviewID`, `CIIBestPracticesID`, `FuzzingID`** — require a second human reviewer on every PR, OpenSSF Best Practices badge signup, and a fuzzing harness, respectively. Process/certification changes, not code.
- **Scorecard `PinnedDependenciesID`** (1, the Vercel CLI line) — see rejected fix above.
