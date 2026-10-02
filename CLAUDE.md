# Project Context
This project uses **Repomix** to provide a full map of the codebase.

## Stack
- Frontend: Angular 21 (Signals — resource(), rxResource(), linkedSignal(), input()/output(), standalone components, SCSS, Tailwind)
- Backend: FastAPI (Async, Pydantic v2)

## Folder Structure
- `src/app/features/` — Angular feature components (auth, clubs, profile, quiz, randomizer)
- `src/app/core/` — Core services, guards, interceptors, models
- `src/app/shared/` — Shared UI components, pipes, directives
- `src/app/layout/` — Shell, header, footer
- `public/i18n/` — Translation files (en.json, uk.json)
- `supabase/migrations/` — SQL migrations for backend

## How to Run
- **Dev server:** `npm start` (Angular at http://localhost:4200)
- **Build:** `npm run build`
- **Update context:** `npm run build-ctx`

## Testing & Linting
- **Unit tests:** `npm run test` (Vitest)
- **E2E tests:** Playwright (see docs)
- **Lint:** `npm run lint`

## Pre-commit Hooks & Development Workflow
- This project does **not** use `.pre-commit-config.yaml`, `ruff`, or `black`.
- Pre-commit hooks are managed via Husky. The only pre-commit hook is `.husky/pre-commit`, which runs `lint-staged`. The Jira key rule (see "Jira Linking") is not enforced by a hook; follow it manually.
- The pre-commit hook updates `repomix-output.md` using `lint-staged`.
- No Python-specific formatting or linting tools are involved in the pre-commit process.

## Branching (develop = staging, main = production)
- `main` is the default, protected, production branch: merging deploys to production (ci.yml, web.yml). It accepts PRs only from `develop` (check `Release source`).
- `develop` is the pre-production testing branch: feature/fix PRs target `develop`; every push deploys a Vercel preview that is tested (CI, parity/e2e, canary checks) before the release PR `develop` -> `main`.
- Release PRs `develop` -> `main` use a **merge commit**, never squash (squash made `main` diverge and caused conflicts). Squash merging is disabled repo-wide.
- Dependabot version updates target `develop`.

## Jira Linking (mandatory)
- Jira project: `SCRUM` (https://dmytrozakharrchenko.atlassian.net). Every unit of work has a task (Story/Task/Bug/Subtask) under the migration epic `SCRUM-5`; open one first if none exists.
- **Commits**: the subject starts with the issue key, e.g. `SCRUM-24 fix(web): lower-case club id for fetch`. One key per commit; use the most specific issue (subtask over parent). Housekeeping commits (deps bumps by Dependabot, merge commits) are exempt.
- **Branches**: include the key, e.g. `feat/SCRUM-6-web-club-detail`, `fix/SCRUM-32-contrast-tokens`. Existing branches keep their names.
- **Pull requests**: the title starts with the issue key, and the description links the Jira issue(s) (`Closes SCRUM-N` / `Refs SCRUM-N`). A PR must not be opened without at least one linked issue.
- When the work changes scope or status, update the Jira issue (status, worklog, labels `R<N>` + `react-migration`) in the same session; findings from reviews/parity/security become Bugs under `SCRUM-5` with the round label.
- Do not add Claude attribution lines to commits or PRs (see existing push/PR authorship rule); the Jira key is the only required trailer-style reference.

## Notes
- Always check `repomix-output.md` for the latest project map.
- If a file is not in repomix-output.md, assume it doesn't exist yet.
- Backend API routes: see FastAPI project (not in this repo).
