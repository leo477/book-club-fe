# SCRUM-81: stop returning tokens in the JSON body to web clients

Status: plan, not implemented. Source: SECURITY-R9 F-1 (Medium). The mobile app that blocked this is gone (SCRUM-164) and F-4 is closed (SCRUM-166).

## Problem

`/auth/login`, `/register`, `/refresh` and `/oauth/exchange` set httpOnly cookies **and** return `accessToken` / `refreshToken` in the body. Script on the page (XSS) can call `POST /auth/refresh` and read both tokens, so httpOnly does not protect against token theft. A stolen refresh token stays valid for `REFRESH_TOKEN_EXPIRE_DAYS` (7).

## Who reads the body today

| Client | Reads body tokens? | Notes |
| --- | --- | --- |
| Next (`apps/web`) | No | strips them at parse, relies on cookies (`legacy-session.ts` only sends a legacy token) |
| Angular (`src/app`) | **Yes** | `auth.service.ts` (register, signIn, restoreSession, OAuth exchange) and `auth.interceptor.ts` (refresh replay) put `accessToken` in `TokenStore` and send `Authorization: Bearer`; `chat.service.ts` uses `tokenStore.token()` as its "signed in" signal (lines 96, 301) |

`apiUrl` is `/api/v1` (same-origin Vercel proxy), so the cookies reach Angular requests without any header. The backend already accepts the `access_token` cookie (`dependencies.py`, Bearer wins when both are present), `ws-ticket` and `/auth/me` use the same dependency, and `csrf_middleware` covers cookie-only requests (SCRUM-67).

## Rollout order (the two halves must not ship together)

A cached Angular bundle in an open tab still expects body tokens. If the backend stops sending them first, that tab fails on its next refresh.

1. **Angular release, tolerant.** Stop depending on the body.
   - `TokenStore`: keep an optional in-memory token only as a fallback; add `isAuthenticated` derived from `AuthService.currentUser()`.
   - `auth.interceptor.ts`: add `Authorization` only when a token exists; on 401 call `/auth/refresh` (cookie) and replay, whether or not a new token came back.
   - `auth.service.ts`: `register`, `signIn`, `restoreSession`, OAuth exchange: do not require `accessToken` in the response; load the user from the response body (`user`) or `/auth/me`.
   - `chat.service.ts`: replace `tokenStore.token()` checks with the signed-in user signal.
   - Specs for each of the above, plus a spec that a response without tokens still signs the user in.
2. **Backend flag.** `WEB_TOKENS_IN_BODY` (default `true`). When `false` and `_is_trusted_web_origin(request)` holds, `login`, `register`, `refresh` and `oauth_exchange` return the response with `accessToken` / `refreshToken` omitted (schemas make them optional). Requests without a trusted Origin (tooling, tests) keep getting tokens. Unit tests for both branches.
3. **Flip** `WEB_TOKENS_IN_BODY=false` on Render after the Angular release has been live for at least one refresh-token lifetime window you are comfortable with (a day is enough for access tokens; open tabs older than that re-login). Rollback is the env var.
4. **Cleanup** (separate PR): remove the flag and the legacy `bc_refresh_token` migration in `TokenStore` / `legacy-session.ts`.

## Related, optional in the same ticket

- F-5: `logout` does not revoke the Supabase session, so a stolen refresh token lives up to 7 days. Needs a Supabase admin sign-out call on logout; separate PR, backend only.
- Contracts: `packages/contracts` auth response schemas must accept responses without tokens.

## Risks

- Angular is being decommissioned (R14, gated on 30 days at 100 %). It still serves most traffic, so the Angular half is real work for a client with a limited remaining life. If R14 is close, the alternative is to accept F-1 for Angular until it is removed and ship only the backend flag with the Next client (not recommended: the flag is global per origin).
- `SameSite=Lax` plus the Origin check already limits CSRF; removing body tokens does not change that.
- Dev (`environment.ts`) may use a cross-origin `apiUrl`; check `withCredentials` there before relying on cookies.

## Verification

Angular unit suite, backend tests for the flag, then a manual run on a preview: email login, register, Google sign-in, reload (restore), 401 mid-session (refresh and replay), chat connect, logout, in a browser with and without the flag.
