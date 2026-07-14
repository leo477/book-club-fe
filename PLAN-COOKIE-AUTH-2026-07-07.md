# Міграція на httpOnly-куки через Vercel Rewrites (повна кукова auth)

## Контекст

Зараз refresh-токен зберігається в localStorage (`bc_refresh_token`) як fallback, бо FE (`book-club-fe.vercel.app`) і BE (`book-club-be.onrender.com`) — різні origin'и, і мобільні браузери блокують крос-сайтову httpOnly-куку (`SameSite=None`). Access-токен живе в пам'яті (signal) і передається через `Authorization: Bearer`, що лишає його доступним для XSS.

**Мета:** Vercel Rewrite `/api/*` → onrender робить BE first-party для браузера. Це дозволяє:
1. Повністю прибрати auth-дані з localStorage (`bc_refresh_token`, `bc_has_session`).
2. Перевести **і access, і refresh токени** в httpOnly-куки `SameSite=Lax` (рішення користувача: повна кукова auth).
3. Позбутися mobile-fallback'ів (body-токен у `/refresh`).

Міграція **безшовна, у 2 релізи** (рішення користувача): наявні сесії конвертуються автоматично, без примусового перелогіну.

**Реалізація — через MCP `book-club-agents`** (пам'ять: користувач вимагає всі зміни коду через MCP-агентів): `dev` для Angular, `devops` для vercel.json/Dockerfile, бекенд-агент для FastAPI.

## Ключові перевірені факти

- Токени мінтить **Supabase Auth**; BE лише валідує (`decode_access_token`) і має готову інфраструктуру httpOnly-куки (`_set_refresh_cookie`, `path=/api/v1/auth`, `samesite=none` у prod) + CORS `allow_credentials=True`.
- `get_current_user` (be: `app/dependencies.py:30`) — тільки Bearer header. WS-чат (be: `app/routers/chat.py:211`) — in-band фрейм `{type:'auth', token}`.
- **Vercel Rewrites не проксіюють WebSocket** → WS лишається на `wss://book-club-be.onrender.com` напряму, але httpOnly access-куку JS не прочитає → потрібен **WS-тикет**.
- SPA-fallback rewrite `/((?!.*\.[a-zA-Z0-9]+$).*)` матчить `/api/v1/...` (без крапки) → потрібен порядок + явний виняток `api/`.
- Rate-limiter (be: `app/limiter.py`) ключується по `request.client.host`, uvicorn без `--proxy-headers` → після проксі всі юзери зіллються в один Vercel-egress-IP-бакет. **Обовʼязково фіксимо в тому ж релізі.**
- OAuth: `fe_origin`-кука і весь редирект-танець живуть на backend-домені → `loginWithGoogle()` мусить лишитися на **абсолютному** URL бекенда (`environment.oauthBaseUrl`); сесія встановлюється уніфіковано через handoff-code → `POST /oauth/exchange` (відносний, через проксі → куки лягають на FE-домен).
- FE зараз пише `bc_refresh_token` у **всіх** флоу → безшовна міграція покриє ~100% активних сесій.

## Цільовий дизайн

- **Куки** (усі `httponly` крім маркера, `secure` у prod, `samesite=lax`, без `Domain`):
  - `access_token` — httpOnly, `path=/api/v1`, `max_age` = `expires_in` від Supabase.
  - `refresh_token` — httpOnly, `path=/api/v1/auth` (без змін), 7 днів.
  - `bc_session=1` — **не** httpOnly, `path=/`, 7 днів — маркер для FE `init()` («чи пробувати silent refresh»), замінює localStorage-маркер.
- **CSRF**: `SameSite=Lax` + same-origin проксі покривають основне; додатково middleware на BE: для не-safe методів із кукою — перевірка `Origin` (проти ALLOWED_ORIGINS + regex) або `Sec-Fetch-Site: same-origin/none`.
- **WS-тикет**: `POST /api/v1/auth/ws-ticket` (cookie-auth через проксі) → одноразовий тикет у Redis (TTL 60с) → FE шле `{type:'auth', ticket}`; `_ws_authenticate` приймає ticket (і токен — для перехідного періоду).
- **Dev-парність**: `proxy.conf.json` для Angular dev-server (`/api` → `localhost:8000`), `apiUrl: '/api/v1'` і в dev, і в prod → однакова поведінка Lax-кук усюди.

## Реліз 1 — Backend (деплоїться ПЕРШИМ, зворотно сумісний)

Файли: `app/routers/auth.py`, `app/dependencies.py`, `app/routers/chat.py`, `app/limiter.py`, `app/main.py`, `Dockerfile`, `tests/test_auth.py` (репо book-club-be).

1. `_set_refresh_cookie`/`_clear_refresh_cookie` (auth.py:131-154): `samesite="lax"` безумовно. Додати аналогічні хелпери для `access_token`-куки та `bc_session`-маркера; викликати в `register` (гілка з сесією), `login`, `refresh`, `oauth_exchange`, чистити в `logout`.
2. `oauth_exchange` (auth.py:381): додати `response: Response`, після `redis.getdel` ставити всі три куки. JSON із токенами поки лишити (старі кешовані бандли).
3. `oauth_callback` (auth.py:312): прибрати `_set_refresh_cookie` (кука на onrender-домені тепер марна); Redis-fail-гілка → редирект на `/login?oauth=failed`. `fe_origin` — без змін.
4. `get_current_user` (dependencies.py:30): читати access-токен із куки `access_token`, fallback на Bearer header (перехідний період + Swagger/тулінг). Те саме в `get_optional_user`.
5. **CSRF-middleware**: для POST/PUT/PATCH/DELETE, автентифікованих кукою (без Bearer) — валідувати `Origin`/`Sec-Fetch-Site`, інакше 403.
6. **WS-тикет**: новий `POST /auth/ws-ticket` (мінтить одноразовий Redis-ключ, TTL 60с, привʼязаний до user id); `_ws_authenticate` (chat.py:211) приймає `{type:'auth', ticket}` АБО легасі `{type:'auth', token}`.
7. `/refresh`: body-fallback `refreshToken` лишити з deprecation-коментарем (реліз 2).
8. **Проксі-IP**: Dockerfile CMD → `uvicorn ... --proxy-headers --forwarded-allow-ips="*"`; перевірити, що slowapi ключує реальний клієнтський IP (за потреби — кастомний `key_func` по лівому `X-Forwarded-For`).
9. `Cache-Control: no-store` на auth-відповідях (захист від edge-кешу проксі).
10. CORS, render.yaml, keep-alive cron — **без змін**.
11. Тести: куки на login/refresh/exchange (samesite=lax, httponly), cookie-auth у `get_current_user`, CSRF-middleware, ws-ticket, callback без Set-Cookie.

Верифікація: pytest; після деплою `curl -i` на login/refresh (три Set-Cookie, Lax); **поточний prod-FE далі працює** (Bearer + body-fallback).

## Реліз 1 — vercel.json + dev-проксі (devops)

Файли: `vercel.json`, новий `proxy.conf.json`, `angular.json` (репо book-club-fe).

1. `vercel.json` rewrites — порядок критичний (перший матч виграє):
   ```json
   "rewrites": [
     { "source": "/api/:path*", "destination": "https://book-club-be.onrender.com/api/:path*" },
     { "source": "/((?!api/)(?!.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }
   ]
   ```
2. CSP `connect-src`: прибрати `https://book-club-be.onrender.com` (покривається `'self'`), **лишити** `wss://book-club-be.onrender.com`.
3. `proxy.conf.json`: `{ "/api": { "target": "http://localhost:8000", "secure": false } }` + `options.proxyConfig` у `serve`-таргеті angular.json.

Ризик: таймаут зовнішнього rewrite Vercel (~30с) vs cold start Render — мітигується keep-alive cron'ом + клієнтські таймаути 15/30с; опційно розширити retry інтерцептора на 502/504.

## Реліз 1 — Frontend (dev-агент)

Файли: `src/environments/environment.ts|prod.ts`, `src/app/core/auth/token.store.ts`, `src/app/core/auth/auth.service.ts`, `src/app/core/interceptors/auth.interceptor.ts`, `src/app/core/services/chat-socket.service.ts`, `chat.service.ts`, `src/app/features/auth/oauth-callback/oauth-callback.component.ts` + відповідні `.spec.ts`.

1. Environments: `apiUrl: '/api/v1'` в обох; `wsUrl` без змін (абсолютний); новий `oauthBaseUrl` (dev `http://localhost:8000/api/v1`, prod `https://book-club-be.onrender.com/api/v1`) — тільки для `loginWithGoogle()`.
2. `auth.service.ts`:
   - `init()`: гейт по куці `bc_session` (хелпер `hasSessionCookie()`) АБО по легасі-ключах localStorage (тригер міграції); при легасі — `restoreSession()` один раз шле body-токен, після успіху/фейлу **видаляє** `bc_refresh_token`+`bc_has_session`.
   - Видалити `completeOAuthSession()` (уніфікація на exchange-флоу), всі записи `SESSION_MARKER`, всі `setRefreshToken`.
   - `signOut`: чистити `bc_session`-куку клієнтськи (belt-and-braces, BE теж чистить).
3. `auth.interceptor.ts`: **не** чіпляти Bearer (куки йдуть автоматично, same-origin); 401 → той самий single-in-flight `POST /auth/refresh {}` → replay (сигнал сесії — `bc_session`, не token store).
4. `token.store.ts`: прибрати in-memory access-signal з auth-флоу (стан = `currentUser` з `/auth/me`); `refreshToken()`/`clearRefreshToken()` лишити тільки для легасі-міграції (видалити в релізі 2).
5. **WS**: `chat.service.ts`/`chat-socket.service.ts` — перед конектом `POST /auth/ws-ticket`, слати `{type:'auth', ticket}`; при реконекті — новий тикет.
6. `oauth-callback.component.ts`: `code` тепер обовʼязковий; без code → `/login` з помилкою.
7. Оновити спеки (auth.service, interceptor, token.store, oauth-callback, chat-socket).

Після релізу 1 у localStorage лишаються тільки `theme` і `lang` (не auth, не чіпаємо).

## Реліз 2 — cleanup (через 2–4 тижні, ~після 2026-07-21)

- BE: прибрати body-fallback у `/refresh`; прибрати `accessToken`/`refreshToken` з `AuthResponse`/`RefreshResponse`/`OAuthExchangeResponse` (`app/schemas/auth.py`) — головний безпековий виграш: токени зникають із JS-читабельних відповідей; прибрати легасі `{type:'auth', token}` у WS; оновити тести.
- FE: видалити легасі-гілку `init()`, `TokenStore.refreshToken()/clearRefreshToken()`, поля токенів з інтерфейсів.
- Bearer-fallback у `get_current_user` можна лишити (Swagger, майбутні клієнти).

## Верифікація (E2E після релізу 1)

1. Email-логін → у devtools: `access_token`+`refresh_token` (httpOnly, Lax) і `bc_session` на **FE-домені**; localStorage без auth-ключів.
2. Перезавантаження → silent restore; анонім → жодного запиту `/auth/refresh`.
3. Протухлий access → 401 → один refresh → replay ok.
4. OAuth desktop + реальний мобільний + **Vercel preview** (перевірка `fe_origin`-маршрутизації).
5. Чат: тикет → WS конект/reconnect ok.
6. Logout → куки зникли, reload лишає розлогіненим.
7. Легасі-міграція: посіяти `bc_refresh_token` у localStorage → reload → залогінений, ключі видалені, куки є.
8. Rate-limit: різні мережі не ділять бакет `/login` (перевірка `--proxy-headers`).
9. FE: `npm run lint`, `npm run test`, `npm run build` (+ grep dist: onrender.com лише у wsUrl/oauthBaseUrl); BE: pytest.

## Rollback

- FE+vercel.json — атомарний Vercel-деплой, відкат через "promote previous deployment"; працює, бо BE релізу 1 досі віддає токени в body і приймає Bearer.
- BE відкочувати тільки ПІСЛЯ відкату FE (інакше зламаються first-party-куки).
- Межа безпеки rollback'а — реліз 2 (тому deprecation-вікно).
