# Trusted Types violation capture (SCRUM-67)

`e2e/tt/tt-capture.spec.ts` drives the Next app's flows (anonymous and member, uk/en, light/dark/system, `/events`, event detail with and without a venue, `/clubs`, `/clubs/:id`, `/login`, `/profile`, `/privacy`, a 404) against a production build and records the `Content-Security-Policy-Report-Only` Trusted Types violations the browser raises (`securitypolicyviolation` events plus matching console messages). It needs no endpoint and changes no header. It is not part of the CI parity workflow.

## Run

Same stack as `.github/workflows/parity.yml`: build `apps/web` with the parity env, start the mock backend and the Edge Config stub, `next start`, then:

    npm run test:tt          # PARITY_NEXT_URL defaults to http://localhost:3000

The env, the mock backend (`e2e/parity/r6/mock-backend.ts`), the Edge Config stub (`e2e/parity/r12/edge-config-server.mjs`) and `NODE_EXTRA_CA_CERTS` are exactly those of the parity workflow; use other ports and `PARITY_NEXT_URL` if 3000/9922/9944 are taken.

## Read

- The console prints a table: directive, sink and sample, blocked URI, disposition, flows. It also lists the Trusted Types policy names the page really created (the allowlist names that are in use).
- `test-results/tt/<flow>.json` holds every raw event (file and line included); `_summary.json` holds the deduplicated table.
- The Maps flow needs `maps.googleapis.com`; if it is unreachable that step is skipped and the output says so. The mock uses a fake key, so Maps loads and runs its script but renders no map (`mapRendered=false`).
- The run fails on any violation not in `e2e/tt/known-violations.json`. The keys are `directive | sink [script src] | blocked`. Each entry has a `reason`; the file is the to-do list for tightening the allowlist, so delete entries as the causes are fixed.
