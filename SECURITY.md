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
