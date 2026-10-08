# SECURITY-R9: review of feat/SCRUM-41-web-auth (apps/web /login, /register, /auth/callback)

Scope: `git diff develop..HEAD` plus the backend at /home/dmytr/angular/book-club-be (read-only). Method: code reading only. No production calls were made and no accounts were created.

## Verdict: ALLOW MERGE (no Critical or High finding in the diff)

Conditions before the Edge Config flip, not before merge: set `NEXT_PUBLIC_OAUTH_BASE_URL` in the Vercel build env for book-club-web (F-3), and confirm the CORS_ORIGIN_REGEX hosts are all owned by the team (F-6).

## Findings

| ID | Sev | Title |
|---|---|---|
| F-1 | Medium | The backend still returns accessToken/refreshToken in JSON bodies to cookie clients, so XSS can read them even though the web client strips them (pre-existing BE, not in the diff) |
| F-2 | Medium | OAuth handoff code is not bound to the initiating browser (login CSRF / session fixation) |
| F-3 | Low | `NEXT_PUBLIC_OAUTH_BASE_URL` unset gives a silent relative-URL fallback; the variable is not set in any repo file |
| F-4 | Low | Rate-limit key is the leftmost X-Forwarded-For (`--forwarded-allow-ips=*`): possible bypass on direct-to-Render calls (pre-existing; not verified live) |
| F-5 | Low | Logout does not revoke the Supabase session, and it fails to clear cookies when the access token is invalid (pre-existing) |
| F-6 | Low | OAuth origin allowlist is a fixed 3-host regex; its safety depends on those hostnames being owned. Preview domains are not allowed |
| F-7 | Low | Registration 202 (email confirmation required) is unhandled in the new register flow; `?oauth=failed` is ignored on /login |
| F-8 | Low | Legacy refresh token is sent in a POST body to a same-origin proxied endpoint on every page until the keys are gone |
| F-9 | Info | OAuth code may appear in analytics or Referer before `replaceState` |
| F-10 | Info | Email enumeration on register (409 EMAIL_EXISTS); login errors are uniform |

### F-1 Medium: token fields still in response bodies (pre-existing BE, not caused by this diff)
- The BE returns `accessToken` and `refreshToken` in the body of login (`app/routers/auth.py:309-313`), register (`:277-281`), refresh (`:345-348`) and oauth/exchange (`:461-464`, with the comment "backward compat"), in addition to setting httpOnly cookies.
- In this diff the web strips tokens at parse. `sessionResponse = z.object({user})` (`packages/contracts/src/user.ts:87`) drops the extra fields, and `exchangeOAuthSession` parses with `z.unknown()` and its result is never read (`oauth-callback.tsx:24`). Nothing reads tokens, nothing stores them, and `cookieTransport.storeTokens` is a no-op.
- Residual: the raw token is still in the network response, and the browser fetch API receives it. Anyone with script execution (XSS) can call `fetch('/api/v1/auth/refresh',{method:'POST',credentials:'include'})` and read a fresh refresh token. httpOnly therefore does not protect against token theft until the BE stops emitting the fields to Origin-trusted web clients.
- The mitigation is the nonce and strict-dynamic CSP (below), with Trusted Types in report-only mode.
- Existing unused `authApi.login`, `register`, `refresh` and `exchangeOAuthCode` (`packages/api-client/src/modules/auth.ts`) still parse token fields. Verified by grep that nothing in apps/web calls them. `client.ts:152` parses `authTokens` from refresh responses into memory only transiently, with a no-op store. That is acceptable but not zero.
- Fix: in the BE, when `_is_trusted_web_origin` is true, return an empty or user-only body, and remove the compat fields once the Angular bundle is retired. Add a lint rule or test forbidding `authTokens` use in apps/web.

### F-2 Medium: no binding between OAuth initiation and callback
- `oauth_google` (`auth.py:351-378`) sets only the `fe_origin` cookie. There is no state or nonce that ties the final `?code=` to the browser that began the flow.
- The handoff code is a 32-byte URL-safe secret, stored in Redis with a 60 s TTL and consumed by `getdel` (`:426-436`, `:454`). That is atomic and single-use, and brute force is infeasible (10/min limit).
- Attack: an attacker signs in with their own Google account, stops at `https://app/auth/callback?code=ATTACKER_CODE` within 60 s, and lures a victim to it. The victim's browser exchanges the code and is logged in as the attacker (login CSRF). Anything the victim then saves, such as profile data or club activity, lands in the attacker's account. The window is 60 s, so exploitation is hard but real.
- Fix: in the BE, set a short-lived httpOnly `oauth_state` cookie at `/oauth/google` (path `/api/v1/auth`) and store its hash in the Redis handoff entry. `oauth_exchange` must then require a matching cookie, which is sent same-origin through the proxy.

### F-3 Low: relative-URL fallback and missing build env
- `google-button.tsx:8` uses `process.env.NEXT_PUBLIC_OAUTH_BASE_URL ?? ''`. When it is absent at build, the browser navigates to the same-origin `/auth/oauth/google?origin=...`.
- That path is not exploitable: it is a fixed same-origin path, so no attacker-controlled host. It falls to the strangler fallback and the legacy SPA index, so the button silently does nothing useful.
- The variable appears only in `env.d.ts`, the runbook (`RUNBOOK-STRANGLER.md:55`) and tests. It is not in any repo-visible CI or env file, so it needs verifying in the Vercel project.
- Fix: fail the build when it is missing. Note the value must include `/api/v1`, since the code appends only `/auth/oauth/google`.

### F-4 Low: rate-limit key (pre-existing; not verified live)
- `limiter = Limiter(key_func=get_remote_address)` (`app/limiter.py`) is combined with `uvicorn --proxy-headers --forwarded-allow-ips=*` (`Dockerfile:54`). The installed uvicorn `_TrustedHosts` with `*` returns the leftmost X-Forwarded-For value, which a client can set.
- Via the Vercel rewrite, Vercel overwrites XFF with the real client IP (documented behaviour, not measured). A direct call to book-club-be.onrender.com with a forged XFF may bypass the `login` 10/min, `register` 5/min and `refresh` 20/min limits. Whether Render appends or replaces XFF was not verified.
- Fix: trust only the platform proxy (specific `--forwarded-allow-ips`) or key on the rightmost-trusted hop.

### F-5 Low: logout (pre-existing)
- `/auth/logout` requires `get_current_user` (`auth.py:467-477`) and only deletes the two cookies; it does not call the Supabase sign-out. A stolen refresh token stays valid for up to 7 days.
- If the access cookie has already expired, the client refreshes first (`client.ts` 401 path). If the refresh fails, the client calls `signOut`; the cookies then clear only on the server side when the refresh failure response clears them. That was not verified.
- The web logout (`components/layout/header.tsx:27-38`, existing code) calls `resetSessionHint` and `queryClient.clear()` and then hard-navigates to /login. The TanStack cache is cleared. The new login and register flows write only the user profile to `sessionKey`, and a hard navigation follows.
- Fix: call Supabase `sign_out(scope=local)` on logout, and always clear cookies even for an unauthenticated logout.

### F-6 Low: origin allowlist
- `_resolve_frontend_origin` (`auth.py:56-70`) uses the origin parsed from `scheme://netloc` against `^https://(book-club-planer|book-club-web-blue|book-club-fe)\.vercel\.app$`, `FRONTEND_URL` or `http://localhost:4200`.
- The regex is anchored and has no wildcard, so an attacker host cannot be injected via `?origin=` (userinfo and port tricks fail, because `netloc` includes them and the match is a full match). The callback re-validates the `fe_origin` cookie and falls back to `FRONTEND_URL`. No open redirect was found.
- Risks: if `book-club-fe.vercel.app` or `book-club-web-blue.vercel.app` is ever released or unowned, an attacker can claim it and receive handoff codes (code then redeemable for full tokens, see F-1). The effective production regex could not be verified: `render.yaml` has no CORS keys, so it is set in the Render dashboard.
- Preview deployments (`book-club-<hash>.vercel.app`) are not allowed, so the R9 acceptance item "OAuth from a preview domain" cannot pass without a BE change. Keep any widening exact-match.
- Fix: audit that every listed host is owned. Do not widen to `book-club-[a-z0-9-]+` (attacker-registrable).

### F-7 Low: functional gaps with security adjacency
- `register` returns 202 with `{message, code: "EMAIL_CONFIRMATION_REQUIRED"}` when no session is issued (`auth.py:268-273`). `registerSession` parses with `sessionResponse`, so the zod parse fails and the user sees a generic error even though the account exists. No token leak.
- The BE redirects failures to `/login?oauth=failed` (`auth.py:48`). The React login page does not read it, so no message is shown (the callback page's own error path is fine).

### F-8 Low: legacy bc_refresh_token migration
- `legacy-session.ts:20-44` sends the token only via same-origin `fetch('/api/v1/auth/refresh', credentials:'include')` over HTTPS to the first-party proxy. It is never sent elsewhere, never logged, and the response is not read. The keys are removed in `finally`, whatever the outcome.
- It runs from `useSession`'s query function (once per page load, for pages that mount `useSession`). When the keys are absent the cost is two `localStorage` reads. With the keys present there is one in-flight call, then deletion. There is no abuse amplification: an attacker cannot plant keys without already having script execution.
- The XSS window is the existing one: any XSS can already read `localStorage` for those keys. The token therefore stays in storage until the user first visits a React page that mounts `useSession`. The migration shortens that window; it does not add one.
- Behaviour to note: a failed refresh (for example a 429 or a network blip) still deletes the keys and forces re-login. Intended per the plan.
- Remove the module next release as planned.

### F-9 Info: code exposure
- `oauth-callback.tsx:18-20` reads the code and calls `history.replaceState` before the exchange or any redirect. Re-run is guarded by the module-level `attempt` promise, so StrictMode does not double-exchange or bounce to /login.
- The initial document request and page scripts carry the full same-origin URL as Referer (the policy is strict-origin-when-cross-origin, so cross-origin gets the origin only). The Vercel Analytics pageview might record `?code=` if it fires before `replaceState`. Impact is limited by single use and the 60 s TTL. Fix if desired: exclude `/auth/callback` from analytics via `beforeSend`.

### F-10 Info: enumeration and error rendering
- Login: the BE returns a uniform 401 `Invalid credentials` for any Supabase auth error, with no existence oracle. The UI maps `detail === 'Invalid credentials'` to a localized message. Timing was not measured.
- Register: 409 `Email already exists` (`auth.py:232-237`) is an enumeration oracle, limited to 5/min per IP and mirrored by the Angular app. This is a product tradeoff.
- Backend `detail` is rendered as React text nodes (`login-form.tsx:73`, `auth-error.ts`, register `:172`). No `dangerouslySetInnerHTML` or `innerHTML` appears in the auth code; the only uses in apps/web/src are the JSON-LD helper and the nonce-guarded theme script, neither of which touches error strings. There is no XSS from error strings.

## Checks that passed (by item)
1. Tokens: no `localStorage` or `sessionStorage` writes in the new code (the only reads are in `legacy-session.ts`). Only the profile goes into the query cache. No tokens in the URL (except the single-use handoff code, removed immediately). No console or log statements in the diff.
2. OAuth origin: allowlisted (F-6). Handoff is single-use (`getdel`), 60 s, `secrets.token_urlsafe(32)`. StrictMode double-exchange is handled. Failure goes to /login with a toast and a hard navigation to constants only.
3. Open redirects: there is no `returnUrl`, `next` or redirect parameter anywhere in the diff. `hardNavigate` accepts only `^/(?![/\\])` paths and rejects control characters, and every call site passes a literal (`/events`, `/login`). `useReplace` is not used by the auth pages.
4. CSRF: the BE CSRF middleware (`main.py:286-304`) validates Origin/Referer on non-GET requests that carry an `access_token` cookie. Same-origin fetches through the proxy send Origin. Login, register and exchange without an access cookie are not covered by the middleware. They are protected by JSON-only bodies (a cross-site form cannot send `application/json`), CORS preflight, and SameSite=Lax cookies (`auth.py:141-182`). Residual: `/auth/refresh` and `/auth/logout` without an access cookie rely on SameSite=Lax. Cookies are HttpOnly, SameSite=Lax, and Secure only when `ENV == "production"`. Cookie paths are `/api/v1/auth` (refresh) and `/api/v1` (access).
5. Rate limits: login 10/min, register 5/min, refresh 20/min, oauth/google 10/min and exchange 10/min per IP. Per-IP limits mean shared NAT users could hit the 20/min refresh limit on rapid Angular and Next hops. By code reasoning, `session-status` is unlimited and `/auth/refresh` fires only after a 401 with a session hint, so hops usually cost at most one refresh each. The plan's measured journey (refresh calls per session) was not run.
8. Headers: Next-owned routes get a per-request nonce CSP (`strangler/csp.ts`: `script-src 'nonce-…' 'strict-dynamic'`, `form-action 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`) and `Cache-Control: private, no-store` (`proxy-handler.ts:54`), applied to the `(auth)` route group like any other Next route. Trusted Types is report-only. The Google redirect is a `location.href` navigation, which `form-action` and `connect-src` do not govern. `/api/*` gets `private, no-store` (`next.config.ts`), and the BE adds `no-store` for the auth paths (`main.py:181-189`, `:281`). Pages are `robots: noindex` via `pageMetadata(..., {index:false})`. HSTS, XFO DENY, nosniff and Referrer-Policy are set.
9. Passwords: `autocomplete` is `current-password`, `new-password` (twice), `email` and `username`. The strength meter is derived from a `useWatch` value and renders only a label and bars. Passwords are not in the query cache, the mutation key or error strings. The mutation variables remain in `useMutation` state while mounted (in-memory only; `signIn.variables` holds the password until unmount or navigation). That is accepted.

## Could not verify
- Live behaviour: Set-Cookie passthrough and attributes via the Vercel rewrite, and Vercel's overwrite of X-Forwarded-For. No requests were made to production or to preview deployments.
- Effective production values of `CORS_ORIGIN_REGEX`, `FRONTEND_URL`, `ALLOWED_ORIGINS` and `ENV` on Render, and Vercel project domain ownership.
- Whether Render's load balancer appends or replaces X-Forwarded-For (F-4).
- Whether `NEXT_PUBLIC_OAUTH_BASE_URL` is set in the book-club-web Vercel env.
- Measured rate-limit headroom (refresh calls per session on a scripted Angular and Next journey).
- Whether Vercel Analytics records `?code=` (F-9).
- Login timing side channels.
