# Canary metrics: events both fronts must emit

Goal: compare the Next canary against Angular in Vercel Analytics with identical event names and properties. The Next side is implemented in `apps/web/src/lib/analytics.ts` (`@vercel/analytics` `track`). The Angular side must emit the same events; this file is the contract (do not change Angular from this repo's migration work without the owner's go-ahead).

## Cohort tag

- The strangler front door sets the readable cookie `bc_bucket` (integer 0-99, 30 days) for every routed request. Both fronts sit behind it, so Angular can read it too.
- Label = decade bucket: `floor(n / 10) * 10` to `+ 9`, e.g. `0-9`, `40-49`, `90-99`. Missing or invalid cookie sends `bucket: null`.
- Every event below carries `app` (`'next'` or `'angular'`) and `bucket`.

## Events

| Event | When | Properties |
|---|---|---|
| `cohort` | Once per hard page load (page views cannot carry custom properties, so this ties the session to its bucket) | `app`, `bucket` |
| `join_club` | After a join request succeeds (`POST /clubs/:id/join` returned 2xx, any status: `pending`, `member`, `already_requested`) | `app`, `bucket` |
| `js_error` | `window` `error` and `unhandledrejection`, plus errors caught by React error boundaries; at most 5 per page load | `app`, `bucket`, `message` (max 120 chars; URLs, emails and 5+ digit runs replaced by `<url>`, `<email>`, `<n>`), `kind` (`error`, `unhandledrejection`, `boundary`) |

No user ids, emails, club names or stack traces are sent.

## Angular implementation sketch (for the Angular owner)

- Inject `track` from `@vercel/analytics` (already loaded on Angular via the platform script if Web Analytics is enabled on the project).
- `cohort`: on app bootstrap. `join_club`: in `ClubService.joinClub` success path. `js_error`: an Angular `ErrorHandler` plus `window.addEventListener('unhandledrejection', ...)`, with the same scrubbing and per-page cap.
- Set `app: 'angular'`.

## Reading it in Vercel Analytics

- Compare `join_club` per `cohort` session between `app = next` and `app = angular`, and `js_error` rate per page view, for the same bucket range as the canary percent (e.g. canary 10 % = buckets `0-9`).
- Vercel Analytics only records events in production deployments; previews will not show them.
