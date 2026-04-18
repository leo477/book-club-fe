# Project Context
This project uses **Repomix** to provide a full map of the codebase.

## Stack
- Frontend: Angular 20 (Signals—using Angular 20 features like resource() and linkedSignal(), standalone components, SCSS, Tailwind)
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
- **Unit tests:** `npm run test` (Jest)
- **E2E tests:** Playwright (see docs)
- **Lint:** `npm run lint`

## Pre-commit Hooks & Development Workflow
- This project does **not** use `.pre-commit-config.yaml`, `ruff`, or `black`.
- Pre-commit hooks are managed via Husky. The only pre-commit hook is `.husky/pre-commit`, which runs `lint-staged`.
- The pre-commit hook updates `repomix-output.md` using `lint-staged`.
- No Python-specific formatting or linting tools are involved in the pre-commit process.

## Notes
- Always check `repomix-output.md` for the latest project map.
- If a file is not in repomix-output.md, assume it doesn't exist yet.
- Backend API routes: see FastAPI project (not in this repo).
