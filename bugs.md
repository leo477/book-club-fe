# Bug Report — Book Club App Audit

**Date:** 2026-05-16
**URL:** https://book-club-gdho2rz6a-dmytros-projects-ad22eb22.vercel.app/
**Browser:** Chromium (Playwright)
**Test user:** audit1778940166@test.com (Organizer)
**Backend:** https://book-club-be.onrender.com
**Audit scope:** functionality, performance, correctness, security, visual, console

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 5 |
| Medium   | 9 |
| Low      | 6 |
| **Total** | **21** |

---

## CRITICAL (1)

### C1 — `POST /clubs/{id}/join` hangs 20+ s and returns 500 (warm backend, deterministic)
- **Endpoint:** `POST /api/v1/clubs/{id}/join`
- **Reproduction:** Login → open any club detail → click "Приєднатись до клубу"
- **Verified by direct `fetch()` on a warm backend** (same JWT, GETs return ≤400 ms):
  | Club ID | Duration | Status | Body |
  |---|---|---|---|
  | `ae57500b…` | 21 385 ms | 500 | `{"detail":"Internal server error"}` |
  | `166b8789…` | 22 976 ms | 500 | `{"detail":"Internal server error"}` |
  | `19f8fb3c…` | 23 758 ms | 500 | `{"detail":"Internal server error"}` |
  | `f165e1ab…` | 19 725 ms | 500 | `{"detail":"Internal server error"}` |
- **NOT a cold-start issue** — confirmed: `GET /clubs` on the same session returns in 391 ms.
- **Likely cause:** request handler hangs on something (DB lock? loop? blocked await?) for ~20 s before erroring. Worth checking the backend traceback in logs.
- **Impact:** Core functionality completely broken — no user can join any club.
- **Frontend symptom:** the 15 s HTTP timeout fires first, so the user sees "Timeout has occurred" (see H1) — that message hides the real failure and prevents anyone from realising the issue is server-side.

---

## HIGH (5)

### H0 — Frontend reports "Timeout" for what is actually a 500 (hides root cause)
- **Where:** Join-club action on club detail
- **Observed:** The 15 s frontend timeout fires before the backend's 20+ s 500 response arrives, so the user (and any error monitoring sink) sees only a generic "timeout" instead of the real error.
- **Recommendation:** Either differentiate the messages, or surface the raw error body once it arrives. The current handling actively masks C1.

### H1 — Error message "Timeout has occurred" is not localized
- **Where:** Join club / create club / any mutation that times out
- **Observed text:** English string "Timeout has occurred" displayed inside the Ukrainian-language UI
- **Expected:** Localized message like "Перевищено час очікування. Спробуйте ще раз."
- **Code reference:** `src/app/core/interceptors/timeout.interceptor.ts` (or equivalent)

### H2 — `<html lang>` attribute does not update on language switch
- **Reproduction:** Click "EN" toggle in header
- **Observed:** Visible text switches to English, but `document.documentElement.lang` stays `"uk"`
- **Impact:** Screen readers announce wrong language; SEO/crawlers see mismatched language; `:lang(en)` CSS hooks broken.

### H3 — `<meta>` SEO tags are not localized
- **Reproduction:** Switch to English on `/clubs`
- **Observed values (still in Ukrainian):**
  - `<meta name="description">` — "Знайдіть книжковий клуб у вашому місті…"
  - `<meta property="og:locale">` — `uk_UA`
  - `<meta property="og:title">` — "Книжкові клуби"
  - `<meta name="twitter:title">` — "Книжкові клуби"
- **Impact:** Social shares and search engines always see Ukrainian metadata regardless of user's language.

### H4 — Duplicate API requests on initial page load
- **Symptom:** `GET /clubs/my` and `GET /clubs/{id}/chat/rooms` are each requested **twice** on the same render.
- **Network log on `/clubs`:** `clubs/my` calls #49 and #50.
- **Network log on club detail:** `clubs/my` #43 and #45.
- **Network log after club create:** `clubs/my` #44 and #48; `chat/rooms` #46 and #49.
- **Impact:** Doubled latency, wasted backend cycles, cache pressure. (Fixed on local PRs #44/#45 but not yet deployed.)

---

## MEDIUM (9)

### M1 — Mixed Ukrainian/English on "Club not found" page
- **Route:** `/clubs/{invalid-id}`
- **Observed:**
  ```
  Heading:   "Клуб не знайдено"        ← uk
  Paragraph: "This club could not be found."   ← en
  ```

### M2 — "Club Chat" button label is English (Ukrainian UI)
- **Location:** Club detail page, main column.
- Sibling FAB "Відкрити чат" is properly Ukrainian — inconsistent labelling.

### M3 — Chat panel close button labelled `close`
- **Location:** Slide-in chat panel header
- `aria-label="close"` in lowercase English — should be Ukrainian (`Закрити`) when UI is in `uk`.

### M4 — "Add first meeting" button (club create) in English
- **Route:** `/clubs/create`
- Button reading "Add first meeting" appears between visibility switch and submit. UI elsewhere is fully Ukrainian.

### M5 — Event-create form: multiple English placeholders / buttons
- **Route:** `/clubs/{id}/events/create`
- English placeholders found:
  - `title` → `April Discussion`
  - `bookTitle` → `The Master and Margarita`
  - address → `Start typing an address…`
  - `theme` → `sci-fi`
- English button labels: `📁 Upload image`, `🔗 Enter URL`, `📖 Book title` (label)

### M6 — Empty-search message is English (and semantically wrong)
- **Route:** `/clubs?q=…` (no results)
- **Observed:** `"No clubs have been created yet. Check back soon!"`
- **Issues:**
  1. English on Ukrainian UI
  2. Text says "no clubs created yet" but the actual condition is "no clubs match your search" — different meaning.

### M7 — Heading hierarchy skips levels
- **Route:** `/clubs`
- DOM goes `H1 → H3` (no `H2`). Repeated for every club tile.
- **Impact:** WCAG 2.4.6 / 1.3.1 — confuses screen-reader users navigating by heading level.

### M8 — Invalid routes silently redirect to `/clubs`
- **Reproduction:** Navigate to `/non-existent-page`, `/foobar`, etc.
- **Observed:** No 404 page. User is redirected to `/clubs` with no notice.
- **Expected:** Dedicated 404 with a back-to-home action.

### M9 — Action button stays disabled after timeout, then re-enables without feedback reset
- **Where:** "Приєднатись до клубу" after a failed join
- **Observed:** Button disabled during the failed call; once the timeout fires the button re-enables but the inline alert ("Timeout has occurred") persists indefinitely with no auto-dismiss / dismiss control.

---

## LOW (6)

### L1 — JWT stored in `sessionStorage`
- **Key:** `bc_access_token`
- **Decoded payload includes:** user id, email, role, session id, Supabase issuer.
- **Risk:** Any XSS payload can exfiltrate the token via JS. HttpOnly cookies would mitigate.
- Note: Angular auto-escapes interpolated bindings so the immediate XSS surface is small — but third-party scripts loaded via `<script src>` would still have full read access.

### L2 — CSP allows `'unsafe-inline'` for scripts
- **Header:** `script-src 'self' 'unsafe-inline' https://vercel.live`
- **Risk:** Defeats one of CSP's main XSS protections. Prefer nonces or hashes.

### L3 — No client-side validation on display name special chars
- Display name accepts `<script>alert('xss')</script>` and stores it raw.
- Angular escaping prevents execution, but the literal string is shown as the user's name everywhere (header avatar tooltip, profile heading).
- Recommend stripping `<`/`>` or limiting to safe character set.

### L4 — Theme button has no `aria-pressed` state announced on toggle
- Button label changes ("Темна тема" ↔ "Switch to light mode") but state isn't exposed semantically. Considered low because the label change does provide some signal.

### L5 — Hardcoded `og:url` in metadata points to `book-club-fe.vercel.app` not current host
- Site is reachable from `book-club-gdho2rz6a-…vercel.app`. OG URL doesn't reflect the actual deployment.
- Impact: link unfurls always point to the canonical preview URL, which is fine if intentional — flag for confirmation.

### L6 — `GET /clubs/{id}/bans` fails for organizer of brand-new club
- **Console warning:** `Failed to load club bans: Error @ chunk-AHSKIGED.js:0`
- Happens immediately after creating a fresh club; non-blocking (handled by `console.warn`).

---

## Tested but OK

- Login / register flows work (when backend is warm).
- Theme toggle (dark/light) — `documentElement.className` updates correctly, persists in `localStorage` (`theme=dark`).
- XSS in display-name field — Angular escapes it on render; not executable.
- SQL injection in search box — handled client-side, no API call sent for `/clubs?q=…`.
- Security headers — HSTS, X-Frame-Options DENY, frame-ancestors 'none', X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin are all present.
- Page-load performance — `/clubs` DOMContentLoaded ≈160 ms, `/profile` ≈145 ms (excluding API roundtrips).
- Mobile viewport (375×667) — header collapses, hamburger reveals working nav.
- Privacy / Terms pages — render with proper Ukrainian copy.

---

## Recommended fix priority

1. **C1** — backend: profile the `POST /clubs/{id}/join` handler. 20+ s and a generic 500 on a warm instance points to an unhandled exception inside a long blocking await (likely DB transaction / Supabase RPC). Check server traceback.
2. **H0** — frontend: stop showing "Timeout" for any error that hasn't actually hit the timeout boundary; or extend the timeout for mutating calls so users see the real 500.
3. **H4** — deploy PR #44/#45 (dedupe + TTL cache) which already fix the duplicate requests locally.
4. **H1, H2, H3, M1–M6** — i18n sweep: every user-facing string through the `TranslateService`, `<html lang>` binding, dynamic `<meta>` updates per locale.
5. **L1, L2** — security hardening: move token to HttpOnly cookie, remove `'unsafe-inline'` from CSP `script-src`.

---

## Audit environment

- Playwright Chromium, viewport 1280×800 (mobile pass at 375×667)
- Network: live (no throttling)
- Auth state: fresh organizer account created during audit
