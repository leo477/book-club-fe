# Project Context
This project uses **Repomix** to provide a full map of the codebase.

## Stack
- Frontend: Angular 20 (Signals, standalone components, SCSS, Tailwind)
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

## Notes
- Always check `repomix-output.md` for the latest project map.
- Backend API routes: see FastAPI project (not in this repo).
