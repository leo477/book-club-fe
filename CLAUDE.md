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
- Pre-commit hooks are managed via Husky. The only pre-commit hook is `.husky/pre-commit`, which runs `lint-staged`.
- The pre-commit hook updates `repomix-output.md` using `lint-staged`.
- No Python-specific formatting or linting tools are involved in the pre-commit process.

## Branching (develop = staging, main = production)
- `main` is the default, protected, production branch: merging deploys to production (ci.yml, web.yml). It accepts PRs only from `develop` (check `Release source`).
- `develop` is the pre-production testing branch: feature/fix PRs target `develop`; every push deploys a Vercel preview that is tested (CI, parity/e2e, canary checks) before the release PR `develop` -> `main`.
- Release PRs `develop` -> `main` use a **merge commit**, never squash (squash made `main` diverge and caused conflicts). Squash merging is disabled repo-wide.
- Dependabot version updates target `develop`.

## Notes
- Always check `repomix-output.md` for the latest project map.
- If a file is not in repomix-output.md, assume it doesn't exist yet.
- Backend API routes: see FastAPI project (not in this repo).
