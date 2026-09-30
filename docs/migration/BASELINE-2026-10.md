# Pre-migration baseline (Angular SPA) - captured 2026-09-28

Status legend: REAL = measured in this run; TODO = not obtainable by the devops agent, owner/named person must supply. No number below is estimated.
Measured target: production `https://book-club-planer.vercel.app` (Vercel project `book-club-fe`, id `prj_2iTSD1B5dwOuswr3k1NrWov9WUc1`, team `team_ufPAT42YdXQJ0HnqNTMwtbtg`). Source tree: branch `chore/parity-harness` working tree on 2026-09-28 (Angular app code unchanged by that branch except data-testid attributes; re-run on `develop` at R0 merge if exact commit matters).

## Summary

| Metric group | Status |
|---|---|
| First-load JS (gzip) | REAL |
| Lighthouse (/, /clubs, /privacy) | REAL (single lab run, mobile) |
| Speed Insights p75 LCP/INP/CLS/TTFB | TODO |
| Analytics page views | TODO |
| Join-club / `/clubs` view ratio | TODO |
| Client JS error rate | TODO |
| Search Console indexed pages | TODO |

## 1. First-load JS (REAL)

Same logic as `.github/workflows/bundle-size.yml` / `vercel.json` (`ng build --configuration=production`), output redirected outside the repo.

Command:
```
cd /home/dmytr/angular/book-club-fe
npx ng build --configuration=production --output-path /tmp/baseline-dist
cd /tmp/baseline-dist/browser
# initial files = every script/link href in index.html
for f in $(grep -o '\(src\|href\)="[^"]*\.\(js\|css\)"' index.html | sed 's/.*="//;s/"//' | sort -u); do
  echo "$f raw=$(wc -c <./$f) gz6=$(gzip -6 -c ./$f | wc -c)"; done
```

| Item | Raw | gzip -6 (measured) | Angular "estimated transfer" |
|---|---|---|---|
| Initial JS (main + 8 chunks) | 580,000 B approx (741.24 kB incl. CSS) | 180,835 B (about 180.8 kB) | - |
| Initial CSS (`styles-*.css`) | 161,236 B | 22,414 B | 17.78 kB |
| Initial total (JS+CSS) | 741.24 kB | 203,249 B | 176.88 kB |

Notes:
- The plan's "181 KB gz" P9 threshold matches the gzip -6 **JS-only** figure (180,835 B). Use JS-only gzip -6 as the R5 comparator. Angular's estimate (176.88 kB, JS+CSS) uses a different compressor; do not mix the two.
- Per-file gz6: main-*.js 64,899; chunk (222 kB raw) 74,108; chunk (115 kB raw) 32,996; chunk (17 kB) 5,429; remainder under 2 kB each. Hashed names change per build; compare totals.
- Largest lazy chunks (raw): clubs-routes 89.46 kB, event-detail 34.18 kB, club-manage 31.66 kB, profile 27.90 kB, chat-widget 25.19 kB.
- Build ran into `/tmp/baseline-dist` (not in repo). `.angular/cache` is gitignored.

## 2. Lighthouse (REAL, single run)

Command (Lighthouse 12.8.2, Chromium from Playwright cache, default mobile emulation + simulated throttling, run from WSL2 on 2026-09-28 ~20:13 UTC):
```
export CHROME_PATH=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome
for p in "" clubs privacy; do
  npx -y lighthouse@12 "https://book-club-planer.vercel.app/$p" \
    --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path=/tmp/lh/${p:-home}.json --quiet; done
```

| URL (final) | Perf | A11y | Best Pr. | SEO | LCP | FCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| `/` (redirected to `/login` for guests) | 72 | 100 | 100 | 100 | 5.8 s | 3.2 s | 50 ms | 0 | 3.2 s |
| `/clubs` | 74 | 91 | 93 | 100 | 5.5 s | 3.0 s | 10 ms | 0 | 3.0 s |
| `/privacy` | 75 | 100 | 100 | 100 | 5.4 s | 2.8 s | 20 ms | 0.04 | 2.8 s |

Caveats:
- Lab data, one run per URL, run from a WSL2 machine; variance of several points is expected. R5 must re-run with the identical command and ideally 3 runs (median). Desktop preset not captured (add `--preset=desktop` if wanted).
- `/` is a client-side redirect to `/login` for unauthenticated users, so the "/" row measures `/login`. SEO 100 is Lighthouse's heuristic only; it does not prove server-rendered content (the SPA ships an empty shell, see plan D1).
- `/clubs` a11y 91 and best-practices 93 are the only sub-100 scores; details are in `/tmp/lh/clubs.json` (not persisted).

## 3. Vercel Speed Insights p75 - TODO

Not obtainable: `vercel whoami` reports no credentials on this machine and Speed Insights has no unauthenticated API.
Supplier: repo owner (Vercel team `team_ufPAT42YdXQJ0HnqNTMwtbtg`).
How: Vercel dashboard > project `book-club-fe` > Speed Insights. Set: Time range = **28 days ending on the R0 merge date (record start/end dates here)**; Percentile = **P75**; Environment = **Production**. For each of Device = Mobile, then Desktop; Route filter = each of `/clubs`, `/clubs/[id]`, `/events`, `/login` (route names as Speed Insights groups them; if `[id]` appears as a raw UUID, group manually). Record LCP, INP, CLS, TTFB (also FCP if wanted).

| Route | Device | LCP p75 | INP p75 | CLS p75 | TTFB p75 | Samples | Range |
|---|---|---|---|---|---|---|---|
| /clubs | mobile | TODO | TODO | TODO | TODO | TODO | TODO |
| /clubs | desktop | TODO | TODO | TODO | TODO | TODO | TODO |
| /clubs/[id] | mobile | TODO | TODO | TODO | TODO | TODO | TODO |
| /clubs/[id] | desktop | TODO | TODO | TODO | TODO | TODO | TODO |
| /events | mobile | TODO | TODO | TODO | TODO | TODO | TODO |
| /events | desktop | TODO | TODO | TODO | TODO | TODO | TODO |
| /login | mobile | TODO | TODO | TODO | TODO | TODO | TODO |
| /login | desktop | TODO | TODO | TODO | TODO | TODO | TODO |

Fair-comparison note for R5: use an equal 28-day window and same filters; low sample counts on `/clubs/[id]` should be recorded alongside values.

## 4. Vercel Analytics page views and join conversion - TODO

Supplier: repo owner (Vercel Analytics) and whoever has Render access to the backend `book-club-be` (logs), or DB access.
- Page views: Vercel dashboard > Analytics > Pages, same 28-day window, Production; record views and visitors for `/clubs`, `/clubs/[id]`, `/events`, `/login`.
- Join requests (numerator): count of `POST /api/v1/clubs/{id}/join` in the same window. Options: Render logs (`book-club-be` service > Logs, filter `POST /api/v1/clubs/` and `/join`, count 2xx/201 responses; note Render log retention may be shorter than 28 days, so export at R0 time), or a DB count of join-request rows created in the window (supabase `join_requests` table by `created_at`; confirm table name in `supabase/migrations/`). State which source was used and whether it counts only successful requests.
- Ratio = join requests / `/clubs` page views (say also whether `/clubs/[id]` views are the better denominator; the plan asks for `/clubs`).

| Metric | Value | Source | Range |
|---|---|---|---|
| Page views /clubs | TODO | Vercel Analytics | TODO |
| Page views /clubs/[id] | TODO | Vercel Analytics | TODO |
| Page views /events | TODO | Vercel Analytics | TODO |
| Page views /login | TODO | Vercel Analytics | TODO |
| POST /api/v1/clubs/*/join (successful) | TODO | Render logs or DB | TODO |
| Join / `/clubs` views ratio | TODO | computed | TODO |

## 5. Client JS error rate - TODO

No client error tracker exists in the repo (`src/app/core/error/global-error-handler.ts` only has a comment suggesting Sentry; no Sentry dependency in package.json), so a client JS error rate probably cannot be produced retroactively. Supplier: repo owner to confirm no external tool is in use.
How: if Sentry (or similar) exists, record events / sessions for 28 days, Production, release-agnostic; otherwise Vercel dashboard > Observability > Errors covers only server/edge errors, not browser JS errors. If no tool exists, record "not measured" and decide whether to add error reporting before R5 (otherwise P-checklist error-rate parity cannot be evaluated).

| Metric | Value | Source | Range |
|---|---|---|---|
| JS error events (28d) | TODO | TODO | TODO |
| Error-free session rate | TODO | TODO | TODO |

## 6. Google Search Console indexed pages - TODO

Supplier: repo owner (Search Console property for `https://book-club-planer.vercel.app`; ownership verification unknown from here).
How: Search Console > Indexing > Pages: record "Indexed" and "Not indexed" totals and the date of the last update; then Performance > Pages, filter Page contains `/clubs/` to get indexed/impression counts for club detail URLs. Alternatively URL Inspection for `/`, `/clubs`, `/privacy`. Cross-check: `https://book-club-planer.vercel.app/sitemap.xml` (build-time generated by `scripts/generate-sitemap.mjs`; per memory, contained no club URLs as of 2026-07-14, so `/clubs/*` indexed count is expected to be 0 or near 0).

| Metric | Value | As-of date |
|---|---|---|
| Indexed pages (total) | TODO | TODO |
| Not indexed pages | TODO | TODO |
| Indexed `/clubs/*` URLs | TODO | TODO |

## Re-measure checklist for R5

1. Same 28-day window length, Production, P75, mobile and desktop split (sections 3-4).
2. Same build command and gzip -6 computation on JS-only initial files (section 1); for the React target also count only first-load JS of the route (Next.js prints "First Load JS" - it is gzip; state that when comparing).
3. Same Lighthouse command and version 12.8.2, mobile preset, 3-run median (section 2).
4. Same source for join counts (section 4).
