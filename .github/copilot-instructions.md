# GitHub Copilot Instructions — Book Club Frontend

## Project Overview

This is a modern **Angular 20** frontend application for a book club platform. It is built with standalone components, signals-based state management, zoneless change detection, and Tailwind CSS for styling.

## Tech Stack

- **Framework**: Angular 20 (standalone, no NgModules)
- **Language**: TypeScript (strict mode, no `any`)
- **State Management**: Angular Signals (`signal()`, `computed()`, `effect()`)
- **Change Detection**: Zoneless (`provideExperimentalZonelessChangeDetection`)
- **Styling**: Tailwind CSS + SCSS design tokens
- **Testing**: Jest + @testing-library/angular + Playwright (e2e)
- **HTTP**: Typed repository services with `HttpClient`
- **Auth**: JWT with `httpOnly` cookies, functional route guards
- **i18n**: `@ngx-translate/core` with lazy-loaded translation files
- **Linting**: ESLint with `@angular-eslint` + Prettier
- **CI/CD**: GitHub Actions

## Architecture Conventions

- All components must be `standalone: true` with `ChangeDetectionStrategy.OnPush`
- State lives in signal-based services — never in component properties
- Use `computed()` for derived state, `effect()` only for side effects
- HTTP calls go through typed repository services (`BookRepository`, `UserRepository`, etc.)
- DTOs map API responses → domain models inside repository layer
- Functional guards (`CanActivateFn`, `CanMatchFn`) for route protection
- Reactive forms only (`ReactiveFormsModule`), always typed `FormGroup<{}>`

## Folder Structure

```
src/
├── app/
│   ├── core/           # Singleton services, interceptors, guards, error handler
│   ├── shared/         # Reusable components, directives, pipes
│   ├── layout/         # Shell, header, footer
│   ├── features/       # Lazy-loaded feature modules (books, profile, auth)
│   └── app.config.ts   # Bootstrap providers
├── assets/
│   └── i18n/           # Translation files per locale
└── styles/
    ├── tokens/         # CSS custom properties (colors, spacing, typography)
    ├── base/           # Reset, typography
    └── utilities/      # Helper classes
```

## Code Quality Rules

- **No `any`** — all types must be explicit
- **No `::ng-deep`** — use CSS custom properties for theming
- **No `localStorage` for tokens** — use `httpOnly` cookies or `sessionStorage`
- **No `bypassSecurityTrustHtml`** without explicit security review
- **No NgModules** — everything is standalone
- Always handle 401 (token refresh), 403 (redirect), 500 (toast + log) in HTTP interceptor chain
- All user-visible strings must be wrapped with `@ngx-translate` or `$localize`

## Testing Expectations

- Unit tests for all services and utilities (80%+ coverage)
- Component tests using `@testing-library/angular` (behavior-driven)
- E2E tests with Playwright for auth flow and critical user journeys
- Mock `HttpClient` with `HttpClientTestingModule` + `HttpTestingController`

## Custom Agents Available

This repository includes specialized Copilot agents. Use `/agent` to browse them:

| Agent      | Purpose                                                      |
|------------|--------------------------------------------------------------|
| `dev`      | Angular 20 architecture, implementation, and code review     |
| `devops`   | CI/CD pipelines, GitHub Actions, deployment automation       |
| `reviewer` | Pre-commit review, Husky setup, PR readiness checks          |
| `security` | XSS, CSP, JWT security audits and input sanitization         |
| `tester`   | Visual regression, Lighthouse, contract testing setup        |
| `ui`       | Design system, Tailwind, animations, accessibility           |
