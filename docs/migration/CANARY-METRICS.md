# Canary metrics: events both fronts must emit

Goal: compare the Next canary against Angular with identical event names and properties. Vercel Hobby has no custom events, so both fronts send them to a first-party endpoint and the backend stores them in `analytics_events`. Vercel Analytics page views (`inject()` in `src/main.ts`) are unchanged.

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

## Transport (both fronts)

- `POST /api/v1/analytics/event`, same-origin relative URL, answers `204`, no auth, no cookies.
- Body: `{ "app": "angular"|"next", "name": "cohort"|"join_club"|"js_error", "bucket": "40-49"|null, "kind"?: "error"|"unhandledrejection"|"boundary", "message"?: string }`. `kind` and `message` (max 120) only for `js_error`.
- Angular sends with `fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true, credentials: 'omit' })`, never through HttpClient or its interceptors, never retried, failures swallowed (so a failing call cannot loop through the global error handler). Code: `src/app/core/services/canary-analytics.service.ts` (`CANARY_TRACK`).
- Angular: `cohort` on bootstrap, `join_club` in `ClubService.joinClub`, `js_error` from the global `ErrorHandler` and `window` `unhandledrejection`, capped at 5 per page load.

## Reading it (backend DB, table `analytics_events`)

Columns assumed: `app`, `name`, `bucket`, `kind`, `message`, `created_at`. For a canary at 10 % use buckets `0-9`.

```sql
-- events per app / bucket
SELECT app, bucket, name, count(*) AS events
FROM analytics_events
WHERE created_at > now() - interval '7 days'
GROUP BY app, bucket, name
ORDER BY app, bucket, name;

-- join conversion per app / bucket (join_club / cohort)
SELECT app, bucket,
  count(*) FILTER (WHERE name = 'cohort') AS cohorts,
  count(*) FILTER (WHERE name = 'join_club') AS joins,
  round(count(*) FILTER (WHERE name = 'join_club')::numeric
        / NULLIF(count(*) FILTER (WHERE name = 'cohort'), 0), 4) AS join_rate
FROM analytics_events
WHERE created_at > now() - interval '7 days'
GROUP BY app, bucket
ORDER BY app, bucket;

-- js_error rate per app / bucket (js_error / cohort)
SELECT app, bucket,
  count(*) FILTER (WHERE name = 'cohort') AS cohorts,
  count(*) FILTER (WHERE name = 'js_error') AS js_errors,
  round(count(*) FILTER (WHERE name = 'js_error')::numeric
        / NULLIF(count(*) FILTER (WHERE name = 'cohort'), 0), 4) AS error_rate
FROM analytics_events
WHERE created_at > now() - interval '7 days'
GROUP BY app, bucket
ORDER BY app, bucket;

-- top js_error messages
SELECT app, kind, message, count(*) AS n
FROM analytics_events
WHERE name = 'js_error' AND created_at > now() - interval '7 days'
GROUP BY app, kind, message
ORDER BY n DESC
LIMIT 20;
```

`bucket` is NULL when the `bc_bucket` cookie is missing; those rows group together.
