# Security Policy

## Supported Versions

This is a continuously-deployed web application, not a versioned library — there is
no historical release line to support. Security fixes are applied to the `develop`
branch and released to production via the `main` branch. Only the latest deployed
version is supported; older deployments are not maintained.

| Branch    | Supported          |
| --------- | ------------------- |
| `main`    | :white_check_mark: |
| `develop` | :white_check_mark: |
| Other     | :x:                 |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately
rather than opening a public issue.

- **Contact:** dmytrozakharrchenko@gmail.com
- **Scope:** This repository (Angular frontend) only. The FastAPI backend lives in a
  separate, private repository — vulnerabilities affecting API behavior should still
  be reported to the same contact and will be routed accordingly.

When reporting, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce, or a proof-of-concept if available
- The affected URL(s), component(s), or file(s), if known

**What to expect:**

- Acknowledgement of your report within 5 business days
- An initial assessment (accepted / declined, with reasoning) within 14 days
- Regular updates while a fix is developed, and credit in the fix's release notes if
  you'd like it (or anonymity, if you prefer)

Please do not publicly disclose the issue until a fix has been released.

## Preferred Languages

We accept reports in English or Ukrainian.

## Accepted Dependency Risks

CI blocks on `npm audit --omit=dev --audit-level=high` (shipped dependencies). The full
audit including dev dependencies runs as a non-blocking informational step and is written to
the job summary. The blocking audit does not cover build-time tooling (devDependencies such as
`typescript` or `tailwindcss`) that produces the shipped bundle; those are reviewed through the
informational audit and Dependabot.

| Advisory | Package chain | Why accepted |
| --- | --- | --- |
| GHSA-vfj7-8cjw-p6xm (high, stack-exhaustion DoS in `braces` <=3.0.3) | `eslint-config-next` -> `fast-glob` -> `micromatch` -> `braces`; `@spartan-ng/cli` -> `ts-morph` -> `@ts-morph/common` -> `fast-glob`; `@spartan-ng/cli` -> `@nx/rspack` -> `ts-checker-rspack-plugin` -> `chokidar` -> `braces` (among others, all through the same dev-only tools) | Dev tooling only (lint and code generation on trusted local files); never bundled or deployed. No patched release exists (3.0.3 is latest). The `eslint-config-next` "fix" is a semver-major downgrade and is not applied. |

Review by: 2026-11-05 (re-run `npm audit`; drop this entry once `braces` is patched). Tracked in SCRUM-76.
