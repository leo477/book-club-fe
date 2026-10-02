# План: міграція book-club-fe з Angular на React (strangler, route-by-route) — 2026-09-28

> Статус: **лише план**. Вихідний код не змінювався.
> Автор: MCP-агент `react-migration`. Оркестрація: Claude (усі зміни коду роблять MCP-агенти `book-club-agents`).
> Виконавці: `react-dev`, `react-tester`, `react-reviewer`, `ui`, `devops`, `security`, `dev` (Angular-шими, лише за потреби), `tester`, `python-backend-dev` (лише якщо parity вимагає змін бекенду), `react-native-dev/-tester/-reviewer` (трек мобільного шарингу).
> Мова: пояснення українською, **task-промпти для агентів — англійською** (системні промпти агентів англійські; вставляти як є в `run_agent`).

---

## 0. TL;DR

- **Ніякого big-bang.** Next.js App Router стає «вхідними дверима» на Vercel; усе, що ще не перенесено, прозоро проксюється (fallback rewrite) на існуючий Angular-деплой. Кожен маршрут вмикається/вимикається **прапорцем у Vercel Edge Config** (з canary-відсотком) — rollback = зміна значення, без деплою, ≤ 60 с.
- **Стек**: React 19 + React Compiler, Next.js (поточний стабільний мажор, App Router), shadcn/ui + Radix + Tailwind 4, next-intl (ICU), TanStack Query v5, react-hook-form + zod, Vitest + RTL + MSW, **той самий Playwright-набір** (`e2e/`). FastAPI не змінюється.
- **Монорепо** в межах `book-club-fe` (npm workspaces): Angular лишається в корені до виведення з експлуатації; нове — `apps/web` (Next), `packages/contracts` (zod), `packages/api-client`, `packages/i18n`, `packages/config`. `book-club-mobile` підключається як `apps/mobile` окремим треком.
- **Пілот**: shell (header/footer) + **`/clubs`** (список клубів) — публічний, read-mostly (одна мутація «join»), SEO-значущий, репрезентативний (SSR + клієнтська авторизаційна персоналізація + i18n + форми пошуку/фільтра). Не auth, не чат. Перед ним — «walking skeleton» `/privacy` + `/terms`.
- **Go/no-go gate G1** після пілоту з вимірюваними критеріями (§7). Якщо no-go — вимикаємо прапорці, Angular лишається, спільні пакети (контракти/api/i18n) лишаються корисними для мобільного — втрати обмежені ~15–18 pd.
- **Оцінка повної міграції**: ~75–95 person-days (агентно-асистованих), 14 раундів + мобільний трек. Узгоджено з оцінкою варіанта C у `PLAN-UI-STACK-2026-09-28.md` (50–80 pd + SSR 5–10).

---

## 1. Бізнес-драйвери (записані; власник підтверджує цифри на R0)

Рішення про React ухвалене власником продукту. `PLAN-UI-STACK-2026-09-28.md` §3 відхилив варіант C як «не окупається лише заради мобільного» — цей план **не суперечить** тій оцінці вартості, а фіксує інші драйвери, які її виправдовують, і робить міграцію відкличною на кожному кроці.

| # | Драйвер | Як вимірюємо | Ціль |
|---|---|---|---|
| D1 | **SEO гостьового режиму.** Зараз CSR-only: `/clubs` і `/clubs/:id` віддають порожній `index.html` з мета-тегами головної; SSR «відкладено» (memory: SEO guest-mode 2026-07-14); `sitemap.xml` генерується **під час білду** (`scripts/generate-sitemap.mjs`) і в проді не має URL клубів. | Search Console: проіндексовані сторінки `/clubs/*`; server-HTML містить назви клубів; Rich Results валідні | ≥ 80 % публічних клубів проіндексовано за 60 днів після R6 |
| D2 | **Один стек з мобільним (Expo).** `book-club-mobile` уже має `src/api/*`, `src/models/*`, zod, TanStack Query, RHF — фактично дублює контракти вебу. | к-сть дубльованих моделей/клієнтів | 0 дублікатів моделей/API-клієнта між web і mobile після RM |
| D3 | **Швидкість розробки та екосистема.** Один mental model (React/TanStack/RHF/zod) для web+mobile+агентів; react-* агенти вже існують. | lead time фічі, яка є і на web, і на mobile | −30 % після R10 (базлайн фіксується в R0) |
| D4 | **Прибрати апгрейд-блокер Angular↔Spartan brain** (`peer @angular/* <23`, `PLAN-UI-STACK` §6) і стек з двома UI-бібліотеками. | — | Angular+Spartan видалено в R14 |
| D5 | **Perf на мобільних мережах** (LCP публічних сторінок завдяки SSR/streaming). | Speed Insights p75 LCP mobile | `/clubs`, `/clubs/[id]` ≤ 2.5 s і не гірше базлайну |

Не-драйвери (свідомо): «React модніший», «Angular повільний» — не аргументи; розмір бандла Spartan (≤ 15 KB gz) — не аргумент.

---

## 2. Факти з коду (перевірено 2026-09-28)

| Область | Факт | Наслідок для міграції |
|---|---|---|
| Версії | Angular **22.2**, zoneless, signals, `rxResource`, TS 6.0, Tailwind 4.2, ngx-translate 18, Spartan brain 1.5.0 (CLAUDE.md ще каже 21) | — |
| Розмір | ~12.2k рядків TS (non-spec) у `src/app`; 101 spec-файл (Vitest через `ng test`) | Юніт-тести не переносяться 1:1 — пишуться заново на RTL+MSW; e2e переносяться як є |
| Маршрути | `app.routes.ts` + `clubs.routes.ts`, `events.routes.ts`, `quiz.routes.ts`, `support.routes.ts` — **29 URL-патернів** (таблиця §5) | Інвентар для strangler-маніфесту |
| Guards | `authGuard` → `/login` (без returnUrl); `roleGuard('organizer')` → toast `ERRORS.organizers_only` + `/clubs`; admin задовольняє все | Семантика відтворюється 1:1 (включно з відсутністю returnUrl — parity) |
| Shell | `ShellComponent`: header (424 рядки, mobile-sheet, nav-links), footer, **`@defer (on idle)` chat-widget** (WebSocket) | Пілотний React-shell **без** чат-віджета (див. §6 R5) |
| Auth | Cookie-auth частково реалізовано: `/api/*` через Vercel rewrite (first-party), refresh — httpOnly `SameSite=Lax` `path=/api/v1/auth`, BE ставить `access_token` cookie (`path=/api/v1`) і читає її без Bearer (`book-club-be/app/dependencies.py:30-48`); SPA все ще тримає access-токен у пам'яті (`TokenStore`) і шле Bearer; `/auth/session-status`; `/auth/ws-ticket` для WS; CSRF-перевірка Origin на BE; `CORS_ORIGIN_REGEX = ^https://book-club-[a-z0-9-]+\.vercel\.app$` | React-клієнт працює **чисто на куках** (без Bearer, без токена в JS). Нові Vercel-проєкти мають називатися `book-club-*`, щоб preview-домени проходили CORS/CSRF/OAuth-allowlist **без змін бекенду** |
| Interceptor | 15 s GET / 30 s мутації, 503 retry, single-flight refresh, `SUPPRESS_ERROR_TOAST`, `SKIP_AUTH_REDIRECT`, мапінг статус→`ERRORS.*`, 401→`/login`, 403→`/clubs` | Портується в `packages/api-client` (той самий контракт, що вже має mobile `src/api/client.ts`) |
| WS | `chat-socket.service.ts`, `wss://book-club-be.onrender.com` напряму (Vercel не проксює WS) + ws-ticket | Чат — останній функціональний раунд (R12) |
| Google Maps | `@angular/google-maps` у `shared/components/event-map`, `core/services/routing.service.ts`; ключ з `GET /config/maps-key` (`MapsConfigService` в app-initializer); CSP/Trusted Types мають винятки для `@googlemaps/js-api-loader` | React: `@vis.gl/react-google-maps`, ключ так само з бекенду, лінива ініціалізація (закриває N-1 «Maps blocks bootstrap») |
| i18n | `public/i18n/{en,uk}.json` — 715 / 717 ключів, 32 неймспейси; 10 інтерполяцій `{{ x }}`; плюрали суфіксами (`votes_one/_few/_many/_other`, `create_questions_count_*`); default `uk`, fallback `uk`; мова в `localStorage.lang` | next-intl потребує ICU → **генератор** ICU з поточного формату (джерело правди не змінюємо до R14); мову для SSR треба мати в **cookie** |
| Тема | `localStorage.theme` + inline-скрипт у `index.html` (CSP-хеш) | Для SSR без мерехтіння — cookie `theme` (dual-write з Angular у R3) |
| SEO | `SeoService` (title/description/og/twitter/canonical з `META.*`/`SEO.*`), `OgTitleStrategy`, JSON-LD у `index.html` + `injectWebSiteJsonLd()` на `/clubs`; **немає SSR/prerender** (`angular.json` без `outputMode`) | Next: `generateMetadata`, JSON-LD у RSC, `app/sitemap.ts` (ISR), `app/robots.ts` |
| Vercel | `vercel.json`: `/api/:path*` → onrender, SPA-fallback, суворий CSP з `require-trusted-types-for 'script'`; деплой через GitHub Actions (`vercel build` + `deploy --prebuilt`), `git.deploymentEnabled=false`; прод-домен `book-club-planer.vercel.app` | Два Vercel-проєкти: `book-club-web` (Next, front door, отримує прод-домен) і `book-club-legacy` (Angular) |
| Аналітика | `@vercel/analytics` + `@vercel/speed-insights` у `main.ts` | Має збиратись **одним** проєктом (front door) — перевірити в R2 |
| E2E | `e2e/ui/*` (7 файлів, ~23 describe/test), `e2e/api/*` (10), `playwright.full-audit.config.ts`, axe у `audit-helper.ts`; запускається вручну проти живого бекенду; лише **3** Angular-специфічні селектори (`hlm-field-error[validator=…]`, `app-event-rsvp-button button`, `app-address-autocomplete input`); 22 файли з `data-testid` | Набір майже framework-agnostic → після R0 ганяємо **той самий** набір проти обох таргетів |
| CI | `ci.yml` (lint/test/build/typecheck/sonar/deploy), `bundle-size.yml`, `lighthouse.yml` (статичний dist), `i18n-check.yml`, CodeQL, scorecard | Додаються jobs для `apps/web` і `parity` |
| Mobile | `book-club-mobile` **вже реалізований** значною мірою (expo-router, 30+ екранів, `src/api/*.api.ts`, `src/models/*`, i18next, zod 4, TanStack Query 5, React 19.2.3) | Mobile — перший споживач спільних пакетів; його `src/api/client.ts` і `src/models/*` — стартова точка для `packages/*` |

---

## 3. Рішення по стеку: Next.js App Router vs Vite SPA

| Критерій | Next.js App Router | Vite SPA (React Router/TanStack Router) |
|---|---|---|
| **SEO guest-mode (D1)** | SSR/ISR `/clubs`, `/clubs/[id]` з реальним контентом у HTML; `generateMetadata` (title/og/canonical per club); `sitemap.ts` з ISR — URL клубів з'являються без ребілду | Той самий CSR, що зараз; потрібен окремий prerender/SSR-шар — повторює нинішню «відкладену» проблему |
| **Cookie-auth через Vercel rewrites** | `rewrites()` у `next.config` (`beforeFiles`: `/api/:path*` → onrender) — ідентично нинішньому `vercel.json`; куки лишаються first-party; RSC для публічних сторінок робить **неавторизований** fetch на сервері, персоналізація — на клієнті через `/api/v1` з куками | Працює так само (vercel.json rewrites) — паритет, але без SSR |
| **Strangler** | Нативний `rewrites.fallback` на Angular-деплой + middleware/proxy з Edge Config для per-route kill switch і canary-бакетів | Потрібна Vercel Routing Middleware окремо; fallback через vercel.json — можливо, але два SPA з різними index.html на одному origin складніше маршрутизувати |
| Складність | Вища (server/client boundary, кешування, CSP з nonce) | Нижча |
| Шаринг з Expo | Однаковий (TS-пакети без DOM) | Однаковий |

**Рішення: Next.js App Router.** Вирішальні аргументи — D1 (SEO — єдиний драйвер, який Vite SPA не закриває) і вбудований strangler-механізм (`rewrites.fallback` + middleware + Edge Config). Складність стримуємо правилами:
- RSC лише для **публічних read-сторінок** (SSR/ISR з гостьовими даними); усі авторизовані сторінки — Client Components з TanStack Query (фактично SPA-режим усередині Next). Жодних Server Actions для мутацій — мутації йдуть у FastAPI через `/api/v1` (один бекенд-контракт для web і mobile).
- Серверний fetch **ніколи** не форвардить куки користувача на бекенд (access-кука має `path=/api/v1` і не приходить на сторінкові запити — це зручно і безпечно: SSR-кеш не може містити персональних даних).
- Мова/тема на сервері — з cookie (`lang`, `theme`), без i18n-префіксів у URL (URL-паритет).

Версії фіксуємо на R1: Next — поточний стабільний мажор (на 2026-09 — 16.x; у 16 `middleware.ts` перейменовано на `proxy.ts` — використовувати актуальну назву), React = **та сама** версія, що в Expo SDK мобільного (зараз 19.2.3), щоб у монорепо був один React.

---

## 4. Архітектура strangler на Vercel

```
                         book-club-planer.vercel.app  (Vercel project: book-club-web, Next.js)
 браузер ──► proxy/middleware (Edge): читає Edge Config "strangler"
              │  маршрут у маніфесті і бакет користувача ≤ percent  → рендер Next
              │  маршрут у маніфесті, але вимкнений/поза бакетом     → NextResponse.rewrite(LEGACY_ORIGIN + path)
              ▼
        next.config rewrites:
          beforeFiles: /api/:path*  → https://book-club-be.onrender.com/api/:path*   (як зараз)
          fallback:    /:path*      → ${LEGACY_ORIGIN}/:path*                         (усе не-Next → Angular)
                                            │
                          book-club-legacy.vercel.app (Vercel project: book-club-legacy, Angular, vercel.json як зараз)
 WS чату: wss://book-club-be.onrender.com напряму (без змін)
```

Деталі:
1. **Edge Config** item `strangler` (приклад):
   ```json
   { "version": 7,
     "routes": {
       "/privacy":     { "target": "next", "percent": 100 },
       "/terms":       { "target": "next", "percent": 100 },
       "/clubs":       { "target": "next", "percent": 10 },
       "/clubs/:id":   { "target": "legacy", "percent": 0 } } }
   ```
   Бакет: middleware ставить `bc_bucket` (0–99, не-httpOnly, 30 днів, `SameSite=Lax`) — sticky canary. Відсутній/зламаний Edge Config → **fail-safe = legacy**.
2. **Маніфест у Next** (`apps/web/src/strangler/routes.ts`) — статичний список маршрутів, які Next *уміє* рендерити (патерн + regex; `:id` = UUID, тож `/clubs/create` ніколи не матчиться як `[id]`). Edge Config може лише **вимкнути** те, що є в маніфесті, але не ввімкнути невідоме.
3. **`/strangler.json`** (Route Handler, `Cache-Control: max-age=30`) — віддає поточний стан для Angular-шима (R3).
4. **Навігація через межу застосунків**:
   - Angular → Next: після завантаження SPA Angular-роутер обробляв би `/clubs` сам. Шим у R3: `canMatch`-guard `stranglerHandoff` на мігрованих маршрутах читає маніфест (завантажений у app-initializer, fail-open = лишитися в Angular) і робить `location.assign(url)` — повне перезавантаження в Next.
   - Next → Angular: компонент `AppLink` — `next/link` для маршрутів, якими володіє Next (і увімкнених для бакета), інакше звичайний `<a href>` (hard nav → fallback → Angular).
5. **Спільний стан між застосунками**: сесія — лише httpOnly-куки (обидва застосунки на одному origin, `/api/v1`). Мова/тема — cookies `lang`/`theme` (dual-write з обох сторін + localStorage для зворотної сумісності). Жодного спільного JS-стану.
6. **Безпекові заголовки**: Angular-відповіді проксюються зі своїми заголовками (CSP з Trusted Types лишається як є). Next-маршрути — власний CSP через middleware з **nonce** (`script-src 'self' 'nonce-…' 'strict-dynamic'`), що робить сторінки динамічними: для публічних сторінок кешуємо **дані** (`fetch` з `next: { revalidate, tags }`), а не HTML. Trusted Types для Next-маршрутів — спочатку `Content-Security-Policy-Report-Only`, enforcement — рішення `security` у R5.
7. **Статика/колізії**: Next віддає `/_next/*`; Angular — `/main-*.js`, `/chunk-*.js`, `/styles-*.css`, `/i18n/*.json`, `/favicon.*`, `/og-image.png`, `googleea44a5e89a1de9d7.html`. `apps/web/public` **не** містить файлів з цими іменами, доки Next ними не володіє. `sitemap.xml`/`robots.txt` переходять у Next у R5 (з видаленням `postbuild` у legacy лише в R14).
8. **Аналітика**: обидва застосунки ініціалізують `@vercel/analytics`/speed-insights; перевірити в R2, що `/_vercel/insights/*` обробляється front-door проєктом (а не йде у fallback), і що page view рахується один раз на hard nav.
9. **Preview-оточення**: `LEGACY_ORIGIN` — env-змінна на рівні Vercel-середовища (prod → legacy prod URL, preview → legacy preview URL тієї ж гілки або legacy prod). Імена проєктів `book-club-web` / `book-club-legacy` проходять `CORS_ORIGIN_REGEX` бекенду — **зміни BE не потрібні**; OAuth `fe_origin` allowlist — те саме (перевірка в R2).
10. **Rollback-рівні**: (a) прапорець маршруту в Edge Config (секунди); (b) `strangler.enabled=false` глобально → усе у legacy; (c) Vercel «promote previous deployment» для `book-club-web`; (d) аварійний: перевісити прод-домен назад на `book-club-legacy` (хвилини, DNS не задіяний — це vercel.app-аліас).

---

## 5. Інвентар маршрутів і порядок міграції

| URL | Angular-компонент(и) | Доступ | Раунд |
|---|---|---|---|
| `/privacy`, `/terms` | `features/privacy`, `features/terms` (без shell) | публічний | **R4** (skeleton) |
| `/clubs` | `clubs-list` (+`club-card`), shell (header/footer) | публічний (+персоналізація) | **R5 — ПІЛОТ** |
| `/clubs/:id` | `club-detail` (header, info, members, club-event-card, club-sidebar-right, manage-panel, book-vote), `book-intro`, `book-stores`, `social-badges`, `qr-code` | публічний (+member/organizer дії) | R6 |
| `/`(→`/events`), `/events`, `/events/:id` | `events-feed`, `event-card`, `event-detail`, `event-countdown`, `event-map`, `event-rsvp-button` | auth | R7 |
| `/profile`, `/support`, `/support/new` | `profile` (+role-selector, stats), `support-board`, `submission-card`, `create-submission` | auth | R8 |
| `/login`, `/register`, `/auth/callback` | `features/auth/*` | публічний (auth-флоу) | R9 |
| `/clubs/create`, `/clubs/:id/edit`, `/clubs/:id/manage`, `/clubs/:id/events/create`, `/events/:id/edit`, `/clubs/:id/randomizer` | `create-club`, `edit-club`, `club-manage`, `create-event`, `edit-event`, `randomizer`, `cover-upload`, `address-autocomplete`, `book-autocomplete`, `form-field`, `social-link-field` | organizer | R10 |
| `/clubs/:id/quizzes`, `…/create`, `…/:quizId`, `…/:quizId/edit`, `…/:quizId/preview`, `…/:quizId/session`, `…/:quizId/leaderboard` | `features/quiz/*` (leaderboard — polling `setInterval`) | auth / organizer | R11 |
| `/chats` + chat-widget у shell | `features/chats`, `shared/chat/chat-widget`, `chat*.service` | auth, realtime WS | R12 |
| `**` (404) | `not-found` | — | R14 (до того — legacy через fallback) |

Правило заморозки: коли маршрут входить у раунд, Angular-реалізація цього маршруту **заморожена** (лише P1-фікси, які дублюються в React). Нові фічі для вже мігрованих маршрутів — лише в React.

---

## 6. Раунди

Позначення effort — person-days агентно-асистованої роботи (включно з рев'ю-ітераціями). Кожен раунд = окрема гілка від `develop` → PR → `react-reviewer` (або `reviewer` для Angular) approve → merge → деплой → перемикання прапорця (окремим кроком, після деплою).

### Спільний parity-чекліст (P-чекліст), застосовується до кожного мігрованого маршруту

| # | Категорія | Перевірка | Інструмент / поріг |
|---|---|---|---|
| P1 | URLs | ті самі шляхи, query-параметри, редіректи (`/`→`/events`, guards→`/login`/`/clubs`), trailing slash, 404 для невалідного `:id` | Playwright `toHaveURL`; таблиця редіректів |
| P2 | Дані / HAR | той самий набір API-викликів (метод+шлях+query), без зайвих/дубльованих запитів, ті самі payload мутацій | `e2e/parity/har-diff.ts`: HAR обох таргетів, diff з allowlist відмінностей |
| P3 | Стани | loading, empty, error, 503 cold-start retry, timeout (15/30 s), оптимістичні оновлення | MSW-сценарії в RTL + Playwright route mocking |
| P4 | Auth | guest / user / organizer / admin; 401→refresh→replay (одна refresh на N конкурентних 401); guards; CSRF (мутації з Origin) | e2e fixtures `auth.fixture.ts` для кожної ролі |
| P5 | i18n | uk (default) і en; усі ключі маршруту присутні; плюрали (uk one/few/many/other); перемикання мови зберігається через межу Angular↔Next | `packages/i18n` key-parity тест + Playwright в обох мовах |
| P6 | SEO | `<title>`, description, og:*, twitter:*, canonical (абсолютний, без query-сміття), JSON-LD, `robots`; для публічних — контент у **server HTML** (curl без JS) | `e2e/parity/seo.spec.ts` + curl-snapshot |
| P7 | A11y | axe: 0 serious/critical; клавіатура (tab-order, Esc, focus return для sheet/dialog), `aria-invalid`/`describedby` для полів, roving tabindex для tabs | `audit-helper.ts` AxeBuilder (ті самі тести, що з `PLAN-UI-STACK` R2) |
| P8 | Visual | скріншоти 375 / 768 / 1280, light/dark, uk | Playwright `toHaveScreenshot`, maxDiffPixelRatio 0.02 (шрифтовий антиаліасинг), ручне рев'ю дифів > 0.5 % |
| P9 | Perf | LCP / INP / CLS p75 (Speed Insights, mobile), JS first-load gz | не гірше базлайну R0; LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; first-load JS ≤ 181 KB gz (Angular initial baseline) |
| P10 | Analytics | page view рівно 1 на навігацію (soft і hard), ті самі кастомні події (якщо є) | Vercel Analytics порівняння 7 днів canary vs control |
| P11 | Errors | JS error rate на 1k переглядів; error boundary (`error.tsx`, `global-error.tsx`) замість `GlobalErrorHandler`; toasts з тими самими ключами | ≤ базлайн + 10 %; 0 unhandled rejections у консолі e2e |
| P12 | E2E | **той самий** `e2e/ui/*` spec для маршруту зелений проти `PARITY_TARGET=legacy` і `PARITY_TARGET=next` | `npm run audit:full` з обома таргетами |

---

### R0 — Базлайни, parity-харнес, декуплінг e2e від Angular
- **Scope**: зафіксувати метрики «до»; зробити e2e-набір незалежним від фреймворку; додати інструменти parity (HAR-diff, SEO-snapshot, screenshot-baselines). Бізнес-драйвери §1 підтверджує власник (цифри-цілі).
- **Файли**: `e2e/ui/public-pages.spec.ts` (селектор `hlm-field-error[validator="email"]` → role/`data-testid`), `e2e/ui/events.spec.ts` (`app-event-rsvp-button button`, `app-address-autocomplete input` → `data-testid`), відповідні `data-testid` у `features/auth/register/*.html`, `shared/components/event-rsvp-button/*.html`, `shared/components/address-autocomplete/*.html`; нові `e2e/parity/{har-diff.ts,seo.spec.ts,visual.spec.ts}`, `playwright.parity.config.ts` (projects `legacy`/`next`, `PARITY_TARGET`), `docs/migration/BASELINE-2026-10.md` (дозволено: це вхідні дані для гейту, не звіт).
- **Агенти**: `tester` (Angular-сторона + харнес), `devops` (метрики), `reviewer`.
- **Acceptance**: `grep -rE "locator\('[^']*(hlm|app-|brn)" e2e` → 0; `audit:full` зелений проти поточного прод/локалу; baseline-файл містить LCP/INP/CLS p75 для `/clubs`, `/clubs/:id`, `/events`, JS error rate, first-load JS, Lighthouse, кількість проіндексованих сторінок, join-конверсію `/clubs` (join / page views).
- **Parity**: n/a (встановлює еталон). Legacy без SSR, тож raw legacy-vs-next parity для SEO — N/A; next перевіряється проти expectations.
- **Rollback**: revert PR (лише тести й `data-testid`).
- **Effort**: 1.5–2 pd. **Залежності**: `refactor/spartan-isolation` змерджено в `develop` (не чіпаємо `shared/spartan`, `toast.service.ts`, `eslint.config.js`).

Промпт `tester`:
```
Repo: /home/dmytr/angular/book-club-fe (branch off develop: chore/parity-harness). Read PLAN-REACT-MIGRATION-2026-09-28.md §2, §6 (P-checklist) and R0.
Goal: make the Playwright suite framework-agnostic and add a parity harness. Do NOT touch src/app/shared/spartan, src/app/core/services/toast.service.ts or eslint.config.js.
1) Replace the 3 Angular-specific selectors: e2e/ui/public-pages.spec.ts `hlm-field-error[validator="email"]`, e2e/ui/events.spec.ts `app-event-rsvp-button button` and `app-address-autocomplete input`. Prefer getByRole/getByLabel; where impossible add data-testid in the Angular templates (register email error, RSVP button, address input). Keep assertions locale-independent.
2) Add playwright.parity.config.ts with two projects, `legacy` and `next`, whose baseURL comes from PARITY_LEGACY_URL / PARITY_NEXT_URL, reusing e2e/global-setup.ts and fixtures.
3) Add e2e/parity/har-diff.ts: records HAR for a named journey on both targets, normalises (strip ids/timestamps/hashes, ignore /_next, /_vercel, static assets) and fails on any difference in (method, path, query keys, request body shape) not listed in an allowlist JSON per route.
4) Add e2e/parity/seo.spec.ts: for a route list, fetch raw HTML with request.get (no JS) and assert title, meta description, og:title/og:description/og:url/og:image, canonical, JSON-LD presence; also after JS render. Snapshot to e2e/parity/__snapshots__.
5) Add e2e/parity/visual.spec.ts: screenshots at 375/768/1280, light+dark (set `theme` in localStorage AND cookie), uk locale.
6) Add npm scripts: parity, parity:seo, parity:visual. No CI wiring yet.
Acceptance: npm run lint, npm run test:ci green; `npm run audit:full` green against localhost; grep for Angular element selectors in e2e returns nothing. Report changed files.
```
Промпт `devops`:
```
Repo: /home/dmytr/angular/book-club-fe. Read PLAN-REACT-MIGRATION-2026-09-28.md §1 and R0.
Produce docs/migration/BASELINE-2026-10.md with the pre-migration baseline: Vercel Speed Insights p75 (mobile+desktop) LCP/INP/CLS/TTFB for /clubs, /clubs/[id], /events, /login over the last 28 days; Vercel Analytics page views and the ratio of join-club requests (POST /api/v1/clubs/*/join from backend logs or analytics) to /clubs page views; client JS error rate if available; first-load JS (gzip) from a fresh production build (reuse bundle-size.yml logic); Lighthouse scores for /, /clubs, /privacy; Google Search Console indexed-page count (ask the owner to paste it if API access is unavailable, leave a TODO row). Record date ranges and exact commands/queries so R5 can re-measure identically. No source changes.
```
Промпт `reviewer`:
```
Review branch chore/parity-harness in /home/dmytr/angular/book-club-fe against PLAN-REACT-MIGRATION-2026-09-28.md R0. Check: selectors are role/testid based and locale-independent; data-testid additions do not change behaviour; har-diff normalisation cannot hide real API differences (review the allowlist mechanism); no edits under src/app/shared/spartan, toast.service.ts, eslint.config.js. Output blocking/non-blocking findings.
```

---

### R1 — Монорепо та спільні пакети (`contracts`, `api-client`, `i18n`, `config`)
- **Scope**: npm workspaces у корені `book-club-fe` **без переміщення Angular** (корінь лишається Angular-застосунком до R14 — мінімальний churn для CI/Sonar/Husky/repomix). Пакети — framework-agnostic TS (без DOM/React), придатні для Next і Expo.
- **Структура**:
  ```
  book-club-fe/
  ├─ package.json            # + "workspaces": ["apps/*", "packages/*"]; Angular deps як зараз
  ├─ src/, angular.json, …   # Angular (legacy) — не переміщується
  ├─ e2e/                    # єдиний Playwright-набір для обох таргетів
  ├─ apps/web/               # Next.js (R2)
  ├─ apps/mobile/            # book-club-mobile (трек RM, git subtree)
  └─ packages/
     ├─ contracts/           # zod-схеми + z.infer типи: user, club, event, book, book-vote, quiz, randomizer, support, chat, geocode; ApiError
     ├─ api-client/          # createApiClient({ baseUrl, transport }) — fetch; transports: cookieTransport (web: credentials 'include', no Bearer), bearerTransport (mobile: token getter/setter); single-flight refresh; 15s/30s timeouts; 503 retry x1; status→ERRORS.* mapping; domain modules clubs/events/users/...
     ├─ i18n/                # locales ← public/i18n/{en,uk}.json (джерело правди лишається там до R14); build: ICU-генератор для next-intl; key-parity тест en↔uk
     └─ config/              # tsconfig.base.json, eslint preset для React/TS, Tailwind 4 theme tokens (CSS variables з src/styles)
  ```
- **Джерела для портування**: `src/app/core/models/*.model.ts`, `src/app/core/api/api-mappers.ts` + `api-error.util.ts`, `src/app/core/interceptors/auth.interceptor.ts` (семантика), `book-club-mobile/src/models/*`, `book-club-mobile/src/api/{client,errors,*.api}.ts` (вже майже потрібна форма); схеми звіряти з `book-club-be/app/schemas/*.py` (Pydantic v2 — джерело правди контракту).
- **ICU-генератор**: `{{ name }}` → `{name}`; групи `key_one/_few/_many/_other` → `key: "{count, plural, one {…} few {…} many {…} other {…}}"` (для `create_questions_count_*` параметр визначити за використанням у шаблоні); екранування `'`/`{`; тест — round-trip на всіх 715/717 ключах, CI падає на незгенерованих ключах.
- **Агенти**: `react-dev`, `react-tester`, `react-reviewer`.
- **Acceptance**: `npm ci` у корені ставить і Angular, і workspaces; `npm run build`/`test:ci`/`lint` Angular — без змін результатів; `npm -w packages/contracts test` (zod-схеми парсять фікстури з `e2e/fixtures` і реальні відповіді — записані JSON з прод-бекенду); `api-client` тести: N конкурентних 401 → рівно 1 refresh; 503 → 1 retry; 500 → 0 retry; timeout → `TimeoutError` з `ERRORS.timeout`; cookie-транспорт ніколи не ставить `Authorization`; i18n key-parity en↔uk + ICU-валідатор (`intl-messageformat` парсить усі повідомлення).
- **Parity**: P5 (ключі), P4 (семантика refresh на рівні юніт-тестів).
- **Rollback**: revert PR; Angular не залежить від пакетів.
- **Effort**: 4–5 pd. **Залежності**: R0 (можна паралельно).

Промпт `react-dev`:
```
Repo: /home/dmytr/angular/book-club-fe (branch off develop: feat/monorepo-packages). Read PLAN-REACT-MIGRATION-2026-09-28.md §2, §4, R1.
Create npm workspaces WITHOUT moving the Angular app: root package.json gets "workspaces": ["apps/*","packages/*"]; Angular stays at the root and its build/test/lint must behave exactly as before.
Create:
- packages/config: tsconfig.base.json (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, moduleResolution bundler), eslint flat preset for TS/React, tailwind theme CSS variables extracted (copied, not moved) from the Angular global styles.
- packages/contracts: zod 4 schemas + inferred types for user, club, club member/join request/ban, event, book, book-vote, quiz (+session/leaderboard), randomizer, support, chat room/message, geocode, maps-key config, ApiError. Sources: src/app/core/models, src/app/core/api/api-mappers.ts, /home/dmytr/angular/book-club-mobile/src/models, and the Pydantic schemas in /home/dmytr/angular/book-club-be/app/schemas (backend is the source of truth; API is camelCase). Export parse helpers; no runtime deps other than zod.
- packages/api-client: fetch-based createApiClient({ baseUrl, transport, onUnauthenticated, onError }) reproducing src/app/core/interceptors/auth.interceptor.ts semantics exactly: 15s GET / 30s mutations via AbortController, one retry on 503 after ~3s, single-flight POST /auth/refresh on 401 then replay once, SKIP_AUTH_REDIRECT and SUPPRESS_ERROR_TOAST as per-request options, status->ERRORS.* translation key mapping (copy the table), BackendHttpError/RequestTimeoutError equivalents. Two transports: cookieTransport (credentials:'include', never sets Authorization, refresh body {}) for web; bearerTransport (getToken/setTokens, refresh with body {refreshToken}) for mobile — mirror /home/dmytr/angular/book-club-mobile/src/api/client.ts. Domain modules (clubs, events, users, auth, members, bookVote, quiz, randomizer, support, chat, books, geocode, upload, config) returning zod-parsed data.
- packages/i18n: re-export public/i18n/en.json and uk.json (do NOT move them), plus scripts/build-icu.mjs that emits dist/{en,uk}.icu.json for next-intl: `{{ x }}`→`{x}`, suffix plural groups (_one/_few/_many/_other) → ICU plural; tests: every key present in both locales, every generated message parses with intl-messageformat, round-trip count equals source count.
Use Vitest for all packages. Pin React-free deps only. Do not touch src/app/shared/spartan, toast.service.ts, eslint.config.js (root Angular lint config).
Acceptance: root `npm ci && npm run lint && npm run test:ci && npm run build` unchanged; `npm -ws test` green. Report the package public APIs.
```
Промпт `react-tester`:
```
Repo: /home/dmytr/angular/book-club-fe, branch feat/monorepo-packages. Read PLAN-REACT-MIGRATION-2026-09-28.md R1 acceptance.
Harden tests for packages/api-client, packages/contracts, packages/i18n: MSW (node) handlers for /api/v1/auth/refresh and representative endpoints; cases: 5 concurrent 401 -> exactly 1 refresh and 5 replays; refresh failure -> onUnauthenticated called once, no loop; 503 retried once, 500/502 not; GET timeout 15s and POST timeout 30s with fake timers; SKIP_AUTH_REDIRECT suppresses onUnauthenticated; cookie transport never sends Authorization; bearer transport stores rotated tokens. Contracts: parse recorded fixtures (add e2e/fixtures/api-samples/*.json captured from the live API via e2e/fixtures/api-client.ts) and reject malformed payloads. i18n: plural ICU output for uk votes_* renders correct forms for 1, 2, 5, 21. Report coverage per package (target >= 90% lines for api-client).
```
Промпт `react-reviewer`:
```
Review feat/monorepo-packages in /home/dmytr/angular/book-club-fe against PLAN-REACT-MIGRATION-2026-09-28.md R1. Focus: packages are DOM/React-free and usable from Expo (no Node-only APIs, no window access at import time); api-client semantics match src/app/core/interceptors/auth.interceptor.ts (diff them explicitly: timeouts, retry, refresh single-flight, redirect/toast flags, error mapping); zod schemas match book-club-be/app/schemas; workspaces did not change Angular build/test output or lockfile resolution of Angular deps; no secrets. Blocking vs non-blocking findings.
```

---

### R2 — Next.js-застосунок, front door на Vercel, Edge Config kill switch (0 мігрованих маршрутів)
- **Scope**: `apps/web` (Next App Router, React Compiler, Tailwind 4 + токени з `packages/config`, shadcn/ui init, next-intl без роутингу — локаль з cookie `lang`, default `uk`; TanStack Query provider; `api-client` з cookieTransport; `error.tsx`/`global-error.tsx`/`not-found` → **не** використовується для невідомих URL, бо вони йдуть у fallback). Strangler: `next.config` rewrites (`beforeFiles` `/api/:path*`, `fallback` → `LEGACY_ORIGIN`), `proxy.ts`/`middleware.ts` з Edge Config + бакетами, `/strangler.json`, `AppLink`. Інфра: два Vercel-проєкти, перевішування прод-домену на `book-club-web`, CI.
- **Dark launch**: після деплою **весь** трафік іде через Next, але маніфест порожній → 100 % відповідей від Angular через fallback. Це доводить прозорість проксі у проді до першого мігрованого маршруту.
- **Файли**: `apps/web/**` (новий), `.github/workflows/web.yml` (lint/typecheck/vitest/build для `apps/web` + `packages/*`, деплой `book-club-web` через `vercel build/deploy --prebuilt --cwd apps/web`), `.github/workflows/ci.yml` (deploy legacy-джоба → проєкт `book-club-legacy`; змінюються лише secrets/`VERCEL_PROJECT_ID`), `vercel.json` Angular — **без змін**.
- **Агенти**: `react-dev` (app + middleware), `devops` (Vercel-проєкти/домен/Edge Config/CI), `security` (CSP/заголовки/куки/редіректи), `react-reviewer`.
- **Acceptance**: у проді `book-club-planer.vercel.app` обслуговується `book-club-web`; `e2e` `audit:full` зелений проти front door (усе — Angular через fallback); логін/refresh/logout, OAuth Google (desktop + мобільний браузер), WS-чат, Maps працюють; `curl -I /clubs` → заголовки Angular (CSP з trusted-types) незмінні; `/api/v1/health`-подібний запит іде на onrender з Set-Cookie на FE-домені; Edge Config недоступний → fallback legacy (тест); kill-switch drill: додати фейковий маршрут `/__strangler-probe` (Next page) і перемкнути його on/off — ефект ≤ 60 s; Speed Insights/Analytics рахуються один раз; TTFB p75 через проксі зріс ≤ 50 ms.
- **Parity**: P1, P2 (HAR ідентичний, бо рендерить Angular), P4, P10, P11, P12.
- **Rollback**: (d) перевісити домен назад на `book-club-legacy` (проєкт Angular лишається повноцінним прод-деплоєм); код — revert.
- **Effort**: 4–5 pd. **Залежності**: R1.

Промпт `react-dev`:
```
Repo: /home/dmytr/angular/book-club-fe (branch feat/web-skeleton). Read PLAN-REACT-MIGRATION-2026-09-28.md §3, §4, R2.
Create apps/web: Next.js (current stable major, App Router, TypeScript strict, React Compiler on), React pinned to the exact version used by /home/dmytr/angular/book-club-mobile (19.2.3) so the monorepo has one React. Tailwind 4 using packages/config tokens; shadcn/ui initialised (components.json) with only button/card/input/label/badge/separator/sheet/tabs/sonner/skeleton for now; next-intl WITHOUT i18n routing: locale from cookie `lang` (fallback `uk`), messages from packages/i18n ICU build; theme from cookie `theme` (fallback prefers-color-scheme via a tiny inline script with nonce), `<html lang class>` set on the server.
Providers: TanStack Query v5 (staleTime 60s, retry false — retries live in api-client), Sonner toaster, api-client with cookieTransport and baseUrl '/api/v1'; onUnauthenticated → hard navigate to /login (legacy until R9).
Strangler:
- next.config: rewrites.beforeFiles `/api/:path*` → `https://book-club-be.onrender.com/api/:path*`; rewrites.fallback `/:path*` → `${process.env.LEGACY_ORIGIN}/:path*`.
- src/strangler/routes.ts: typed manifest {pattern, regex, owner:'next'} — empty except a `/__strangler-probe` test page.
- proxy.ts (or middleware.ts if the pinned Next still uses that name): for manifest paths only, read Edge Config key `strangler` via @vercel/edge-config (timeout 50ms), assign sticky `bc_bucket` cookie (0-99, Lax, 30d), and NextResponse.rewrite to LEGACY_ORIGIN when the route is disabled, missing, below percent, or Edge Config fails (fail-safe = legacy). Add nonce-based CSP for Next-rendered responses (script-src 'self' 'nonce-X' 'strict-dynamic'; keep the rest of the directives from vercel.json; Trusted Types in Report-Only).
- app/strangler.json/route.ts: returns {version, routes:[{pattern, enabled}]} computed for the caller's bucket, Cache-Control max-age=30.
- components/app-link.tsx: next/link for Next-owned+enabled routes, plain <a> otherwise.
- @vercel/analytics and @vercel/speed-insights in the root layout.
Tests: Vitest+RTL for AppLink and the manifest matcher (UUID :id, /clubs/create never matches /clubs/:id); unit test for middleware decision table incl. Edge Config failure.
Do not modify Angular src/ or vercel.json. Report env vars required (LEGACY_ORIGIN, EDGE_CONFIG).
```
Промпт `devops`:
```
Repo: /home/dmytr/angular/book-club-fe, branch feat/web-skeleton. Read PLAN-REACT-MIGRATION-2026-09-28.md §4 and R2.
1) Vercel: rename/confirm the existing Angular project as `book-club-legacy` (keep its vercel.json and GitHub Actions deploy), create project `book-club-web` rooted at apps/web. Both names must match the backend CORS_ORIGIN_REGEX ^https://book-club-[a-z0-9-]+\.vercel\.app$ — verify preview URLs match.
2) Edge Config store `book-club-strangler` linked to book-club-web with item `strangler` = {"version":1,"enabled":true,"routes":{"/__strangler-probe":{"target":"next","percent":100}}}; document the exact CLI/API command to flip a route (runbook docs/migration/RUNBOOK-STRANGLER.md: flip, canary %, global kill, domain swap-back, expected propagation time).
3) Env: LEGACY_ORIGIN per environment (production → legacy production URL; preview → legacy production URL unless a same-branch legacy preview exists).
4) CI: new .github/workflows/web.yml (lint, typecheck, vitest for apps/web + packages/*, next build, deploy via vercel build/deploy --prebuilt --cwd apps/web; same pinned vercel CLI 55.0.0 and gating style as ci.yml). Point ci.yml deploy job at book-club-legacy. Path filters so Angular-only changes don't redeploy web and vice versa, but packages/** triggers both.
5) Cutover: move the production alias book-club-planer.vercel.app to book-club-web only after preview smoke passes; keep book-club-legacy reachable on its own URL.
6) Verify /_vercel/insights and /_vercel/speed-insights are served by the front door (not the fallback) and page views are not double counted.
Acceptance per R2 in the plan, including a measured kill-switch drill and TTFB delta. Report URLs, project ids (no secrets) and drill timings.
```
Промпт `security`:
```
Review the strangler front door on branch feat/web-skeleton (/home/dmytr/angular/book-club-fe, apps/web + Vercel config) per PLAN-REACT-MIGRATION-2026-09-28.md §4 and R2. Check: /api rewrite keeps cookies first-party and never caches auth responses (Cache-Control no-store passthrough); fallback rewrite cannot be abused as an open proxy (LEGACY_ORIGIN fixed, no user-controlled host); legacy responses keep their CSP/Trusted Types/HSTS/XFO headers unchanged through the proxy; Next CSP nonce is per-request and not cached; bc_bucket cookie carries no sensitive data; OAuth `origin` handoff and backend CSRF Origin checks accept the new project domains and nothing broader; Edge Config token scope is read-only in runtime. Output findings with severity and concrete fixes.
```
Промпт `react-reviewer`:
```
Review feat/web-skeleton in /home/dmytr/angular/book-club-fe against PLAN-REACT-MIGRATION-2026-09-28.md R2. Focus: server/client boundaries (no user cookies forwarded to backend from server code), middleware decision table and fail-safe to legacy, manifest can only disable not enable unknown routes, next-intl cookie locale without URL prefixes, one React version in the workspace, bundle of the empty app, test quality. Blocking vs non-blocking.
```

---

### R3 — Angular-шими для співіснування
- **Scope** (мінімальні зміни Angular, поза зоною Spartan-ізоляції):
  1. `LanguageService.use()` і `ThemeService.toggle()` — dual-write cookie `lang`/`theme` (`path=/; max-age=31536000; SameSite=Lax; Secure`), читання: cookie → localStorage → default; на старті, якщо є лише localStorage, записати cookie (міграція без взаємодії користувача).
  2. `stranglerHandoff` `canMatch`-guard + `StranglerManifestService` (app-initializer, `GET /strangler.json`, timeout 1 s, fail-open → лишитися в Angular); guard вішається на маршрути з маніфесту (спершу `privacy`, `terms`, `clubs` `''`), робить `location.assign` і повертає `false`.
  3. Нічого в `shared/spartan`, `toast.service.ts`, `eslint.config.js`, header-шаблонах.
- **Файли**: `src/app/core/services/language.service.ts`, `theme.service.ts`, новий `src/app/core/strangler/{strangler-manifest.service.ts,strangler-handoff.guard.ts}` + specs, `src/app/app.routes.ts`, `src/app/features/clubs/clubs.routes.ts`, `src/app/app.config.ts` (initializer). CSP legacy: `connect-src 'self'` уже покриває `/strangler.json`.
- **Агенти**: `dev`, `tester`, `reviewer`.
- **Acceptance**: unit-тести guard (enabled → `location.assign`, disabled/помилка → `true`); cookie встановлюються при перемиканні мови/теми і при першому старті; `audit:full` зелений; з порожнім маніфестом поведінка Angular ідентична.
- **Parity**: P1, P5 (мова переживає перехід Angular→Next), P8 (без flash теми).
- **Rollback**: revert PR (guard fail-open; cookie нешкідливі).
- **Effort**: 1.5 pd. **Залежності**: R2 (для `/strangler.json`; можна розробляти паралельно з моком).

Промпт `dev`:
```
Repo: /home/dmytr/angular/book-club-fe (branch feat/strangler-shims off develop). Read PLAN-REACT-MIGRATION-2026-09-28.md §4 items 4-5 and R3. Angular 22 zoneless/signals conventions of this repo.
1) LanguageService and ThemeService: dual-write cookies `lang` and `theme` (path=/, max-age 1 year, SameSite=Lax, Secure on https) alongside the existing localStorage keys; resolve initial value cookie → localStorage → current default; on startup, if only localStorage has a value, write the cookie.
2) Add src/app/core/strangler/strangler-manifest.service.ts (loads GET /strangler.json once in an app initializer, 1s timeout, never blocks bootstrap longer than that, on any failure = empty manifest) and strangler-handoff.guard.ts (CanMatchFn: if the target URL matches an enabled pattern, call globalThis.location.assign(url) and return false; otherwise true). Patterns support `:id` as UUID.
3) Apply the guard to the `privacy`, `terms` routes in app.routes.ts and the `''` route in features/clubs/clubs.routes.ts only. Nothing else.
Constraints: do not touch src/app/shared/spartan, src/app/core/services/toast.service.ts, eslint.config.js, layout/header. Specs for all new/changed code with Vitest. Acceptance: npm run lint, npm run test:ci, npm run build green; with an empty manifest behaviour is identical.
```
Промпт `tester`:
```
On branch feat/strangler-shims (/home/dmytr/angular/book-club-fe) add Playwright checks to e2e/parity: (a) switching language/theme in Angular sets cookies lang/theme; (b) with /strangler.json mocked (page.route) to enable /clubs, clicking the header Clubs link performs a full document navigation (assert a new document request) ; (c) with /strangler.json failing, navigation stays client-side. Run audit:full against localhost and report.
```
Промпт `reviewer`:
```
Review feat/strangler-shims in /home/dmytr/angular/book-club-fe against PLAN-REACT-MIGRATION-2026-09-28.md R3: fail-open everywhere, bootstrap not delayed > 1s, no redirect loops (Next rewrites a disabled route back to Angular while Angular's manifest is stale for ≤30s — ensure the guard cannot bounce endlessly: add a sessionStorage loop breaker if needed), cookie attributes, no overlap with Spartan-isolation files. Blocking vs non-blocking.
```

---

### R4 — Walking skeleton: `/privacy`, `/terms`
- **Scope**: дві статичні сторінки без shell у Next (SSG з обома мовами, мова з cookie → сторінка динамічна по cookie; дозволено `dynamic` рендер — вони дешеві), metadata (`TITLES.privacy/terms`, `META.*`), footer-посилання. Мета — прогнати **весь конвеєр** (build → deploy → canary → 100 % → drill) на нульовому ризику.
- **Файли**: з `src/app/features/privacy/*`, `src/app/features/terms/*` → `apps/web/src/app/(public)/privacy/page.tsx`, `terms/page.tsx`; маніфест + Edge Config.
- **Агенти**: `react-dev`, `react-tester`, `react-reviewer`, `devops` (перемикання).
- **Acceptance**: P-чекліст повністю зелений для обох; Edge Config 10 % → 100 % за 48 год без регресій; Angular-guard R3 передає навігацію з footer.
- **Rollback**: прапорець `target: legacy`.
- **Effort**: 1.5 pd. **Залежності**: R2, R3.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-privacy-terms. Read PLAN-REACT-MIGRATION-2026-09-28.md §6 P-checklist and R4. Port src/app/features/privacy and src/app/features/terms (templates + i18n keys) to apps/web as Server Components under app/(public)/privacy and app/(public)/terms: identical markup semantics/headings/links, Tailwind classes translated 1:1, generateMetadata using TITLES.privacy/TITLES.terms and META.* exactly like SeoService/OgTitleStrategy (title, description, og:*, twitter:*, absolute canonical without query). Register both in src/strangler/routes.ts. Links to non-migrated routes via AppLink. No client JS beyond the root layout.
```
Промпт `react-tester`:
```
Branch feat/web-privacy-terms. Add Vitest+RTL tests for both pages (uk/en render, headings, links) and run e2e/parity (har-diff, seo, visual) with PARITY_LEGACY_URL=<legacy preview> PARITY_NEXT_URL=<web preview> for /privacy and /terms, plus the existing public-pages e2e against the web preview. Report per P1–P12 with evidence; P9 from Lighthouse on the preview.
```
Промпт `react-reviewer`:
```
Review feat/web-privacy-terms against PLAN-REACT-MIGRATION-2026-09-28.md R4 and the P-checklist evidence from react-tester. Blocking vs non-blocking.
```
Промпт `devops`:
```
After feat/web-privacy-terms is deployed to production: set Edge Config strangler routes /privacy and /terms to {"target":"next","percent":10}; after 24h with no error-rate or Speed Insights regression versus BASELINE-2026-10.md, set percent 100; after 24h more, perform a kill-switch drill (target legacy → back to next) and record propagation time in RUNBOOK-STRANGLER.md.
```

---

### R5 — ПІЛОТ: React-shell + `/clubs` (+ sitemap/robots)
- **Чому `/clubs`**: публічний і read-mostly (читання списку; одна мутація `join`, яка доводить cookie-auth + CSRF без auth-флоу); SEO-значущий (D1) → перевіряє SSR/metadata/JSON-LD/sitemap; репрезентативний: shell, i18n, тема, dual-mode guest/auth, таби `all/my`, пошук/фільтр міста, empty/error/loading, картки, toasts, a11y (sheet/tabs). Не auth-флоу, не realtime. Малий (462 рядки + shell ~500).
- **Scope**:
  - **Shell**: header (nav-links, mobile-sheet на shadcn Sheet/Radix Dialog, перемикачі мови/теми з dual-write cookie+localStorage, user-menu/вихід через `POST /auth/logout`), footer. **Chat-widget**: у пілоті не рендериться; на його місці — посилання-кнопка на `/chats` (legacy) лише для автентифікованих (явна задокументована відмінність P8/P2; повноцінний віджет — R12). Рішення про прийнятність — власник на гейті (альтернатива: тримати `/clubs` у legacy для автентифікованих — не рекомендовано).
  - **`/clubs`**: RSC отримує публічний список `GET /clubs` (без кук, `revalidate: 300`, tag `clubs`) і рендерить картки в HTML; Client-острів: авторизаційний стан (`GET /auth/session-status` → `/auth/me` через TanStack Query), таб «мої» (`GET /clubs/my`), owned-ids, `POST /clubs/{id}/join` з тими ж станами кнопки/тостами; `setPageI18n('SEO.clubs_*')` → `generateMetadata`; `injectWebSiteJsonLd()` → JSON-LD у RSC.
  - **SEO-інфра**: `app/sitemap.ts` (статичні маршрути з `generate-sitemap.mjs` + публічні клуби, ISR 1 год), `app/robots.ts` (контент з `public/robots.txt`). Legacy `postbuild` лишається (його файл просто перекривається front door; видаляється в R14).
  - **UI-примітиви**: `ui` мапить Spartan-helm → shadcn з тими самими візуальними токенами (button/card/input/badge/tabs/sheet/spinner/field-error), a11y-поведінка Radix ≥ brain.
- **Файли-джерела**: `src/app/layout/{shell,header,header/nav-links,header/mobile-sheet,footer}/*`, `src/app/features/clubs/clubs-list/**`, `src/app/core/services/club.service.ts` (`loadPublicClubs`, `loadMyClubs`, `myOwnedClubIds`, `joinClub`), `seo.service.ts`, `og-title-strategy.ts`, `shared/components/empty-state`, `shared/components/loading-spinner`, `scripts/generate-sitemap.mjs`, `public/robots.txt`, `src/index.html` (JSON-LD, мета).
- **Цільові файли**: `apps/web/src/app/(shell)/layout.tsx`, `(shell)/clubs/page.tsx`, `apps/web/src/features/clubs/{clubs-list-client.tsx,club-card.tsx,use-clubs.ts}`, `apps/web/src/components/layout/{header,footer,mobile-nav,locale-switch,theme-switch}.tsx`, `apps/web/src/components/ui/*`, `app/sitemap.ts`, `app/robots.ts`.
- **Агенти**: `ui` → `react-dev` → `react-tester` → `security` → `react-reviewer` → `devops` (canary).
- **Acceptance**: P-чекліст 100 % для `/clubs` (guest, user, organizer, admin; uk/en; light/dark; 375/768/1280); `curl /clubs` містить назви клубів і локалізований title; sitemap містить `/clubs/{id}` публічних клубів; e2e `clubs.spec.ts` (member/organizer describe) зелений проти обох таргетів; HAR-diff без незадокументованих відмінностей (очікувана відмінність: публічний список береться на сервері → у браузері на 1 `GET /clubs` менше); first-load JS `/clubs` ≤ 181 KB gz.
- **Rollout**: 10 % (72 год) → 50 % (72 год) → 100 %; далі 14 днів soak на 100 % перед гейтом.
- **Rollback**: `/clubs` → `legacy` у Edge Config; shell не впливає на legacy.
- **Effort**: 6–8 pd. **Залежності**: R4.

Промпт `ui`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-pilot-clubs. Read PLAN-REACT-MIGRATION-2026-09-28.md R5 and PLAN-UI-STACK-2026-09-28.md §2 (usage counts).
Produce the React design-system mapping for apps/web/src/components/ui based on shadcn/ui (Radix) so that the visual result matches the Angular Spartan helm layer in src/app/shared/spartan (read-only reference; do not modify it): button (all variants/sizes used by hlmBtn), card, input, label, badge, separator, spinner, tabs, sheet (side, overlay, close), field + field-error (aria-invalid/aria-describedby wiring), sonner toaster (position/duration identical to the Angular toaster). Use packages/config Tailwind tokens; light/dark parity. Add a /__ui route (dev-only, excluded from the manifest) rendering every variant side by side for visual review. Document any unavoidable visual deltas.
```
Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-pilot-clubs (after ui). Read PLAN-REACT-MIGRATION-2026-09-28.md §3, §4, §6 P-checklist and R5 carefully.
Port:
1) Shell: src/app/layout/{shell,header,header/nav-links,header/mobile-sheet,footer} → apps/web/src/app/(shell)/layout.tsx + components/layout/*. Same nav items, active states, role-dependent items, language switch (writes cookie lang + localStorage lang, then router.refresh()), theme switch (cookie theme + localStorage theme + html class), user menu with logout (POST /api/v1/auth/logout then hard navigate /login). Instead of the chat widget render, for authenticated users only, a fixed-position link to /chats with the same position/size and CHAT.* label (documented delta). All links through AppLink.
2) /clubs: src/app/features/clubs/clubs-list (+club-card) → app/(shell)/clubs/page.tsx. Server Component fetches GET /clubs anonymously via packages/api-client (server instance, absolute backend URL, no cookies forwarded, next: {revalidate:300, tags:['clubs']}) and renders the list HTML. Client island hydrates auth (session-status → /auth/me through TanStack Query with the cookie transport), 'all'|'my' tabs (GET /clubs/my), owned ids, search and city filter exactly as the Angular template (client-side filtering), join button (POST /clubs/{id}/join with identical pending/member/already_requested handling and toasts from ClubService), empty/loading/error states. generateMetadata with SEO.clubs_title/SEO.clubs_description/SEO.clubs_og_title and absolute canonical; WebSite JSON-LD equivalent to SeoService.injectWebSiteJsonLd and index.html.
3) app/sitemap.ts reproducing scripts/generate-sitemap.mjs (static routes + public clubs, revalidate 3600, degrade to static on fetch failure) and app/robots.ts reproducing public/robots.txt.
4) Register /clubs in src/strangler/routes.ts. Tests: Vitest+RTL+MSW for the client island (guest, member, organizer; join flows; tabs; filters; error/empty), header (keyboard + mobile sheet focus trap), sitemap.
Constraints: no Server Actions, no user cookies in server fetches, React Compiler friendly code (no manual memo unless measured), first-load JS for /clubs ≤ 181 KB gzip.
```
Промпт `react-tester`:
```
Branch feat/web-pilot-clubs, preview URLs from devops. Execute the full P1–P12 checklist of PLAN-REACT-MIGRATION-2026-09-28.md for /clubs and the shell: e2e/ui/clubs.spec.ts and a11y-authenticated.spec.ts against both targets; har-diff journeys (guest browse, member my-tab, member join, organizer view) with an allowlist entry ONLY for the server-side GET /clubs; seo.spec raw-HTML assertions incl. club names present without JS; visual 375/768/1280 light/dark uk/en; axe 0 serious/critical incl. mobile sheet focus trap/Escape/focus return and tabs arrow keys; cold-start 503 and timeout via route mocking; language switch persists Angular→Next→Angular. Produce a parity report table with evidence links and a clear PASS/FAIL per item.
```
Промпт `security`:
```
Security review of feat/web-pilot-clubs (/home/dmytr/angular/book-club-fe/apps/web) per PLAN-REACT-MIGRATION-2026-09-28.md R5: server fetches never carry user cookies and ISR cache holds only public data; join mutation goes same-origin with credentials and passes backend CSRF Origin check; no tokens in JS-readable storage; JSON-LD/club text rendered without dangerouslySetInnerHTML except JSON-LD serialised safely (escape </script>); CSP nonce enforcement on /clubs and decision on Trusted Types enforcement vs report-only (review report-only violations from the canary); logout clears state. Findings with severity and fixes.
```
Промпт `react-reviewer`:
```
Review feat/web-pilot-clubs against PLAN-REACT-MIGRATION-2026-09-28.md R5 plus the react-tester parity report and security findings. Check server/client split, query keys and invalidation after join, hydration mismatches (locale/theme from cookies), a11y of shadcn primitives vs Spartan, bundle size, test quality, and that nothing in src/ (Angular) changed. Approve only if all P-items PASS or have an owner-accepted documented delta.
```
Промпт `devops`:
```
Pilot rollout for /clubs per PLAN-REACT-MIGRATION-2026-09-28.md R5: Edge Config /clubs percent 10 → (72h, compare Speed Insights, error rate, join-conversion vs BASELINE-2026-10.md split by bc_bucket cohort) → 50 → (72h) → 100, then 14-day soak. Stop and set target legacy immediately if JS error rate > baseline+10%, LCP p75 mobile > 2.5s or worse than baseline, or join conversion < baseline−5%. Record every step in RUNBOOK-STRANGLER.md and collect the G1 gate metrics into docs/migration/GATE-G1.md.
```

---

### 7. GATE G1 — go / no-go після пілоту
Оцінюється після 14 днів на 100 % для `/clubs`. Власник + `react-reviewer` + `security` підписують `docs/migration/GATE-G1.md`.

| # | Критерій | Поріг GO |
|---|---|---|
| G1.1 | P-чекліст `/clubs` + shell | 12/12 PASS або документовані відхилення, прийняті власником |
| G1.2 | JS error rate `/clubs` | ≤ базлайн + 10 %; 0 інцидентів P1/P2 за 14 днів |
| G1.3 | LCP p75 mobile `/clubs` | ≤ 2.5 s **і** ≤ базлайн; INP p75 ≤ 200 ms; CLS p75 ≤ 0.1 |
| G1.4 | First-load JS `/clubs` | ≤ 181 KB gz |
| G1.5 | SEO | server HTML містить контент; Rich Results валідні; sitemap з URL клубів; проіндексовані сторінки не впали; ≥ 1 URL `/clubs/*` у Search Console або підтверджена відсутність публічних клубів у проді (memory: у проді може не бути публічних клубів — тоді критерій = коректний sitemap для seed-клубу на preview) |
| G1.6 | Бізнес | join-конверсія `/clubs` ≥ базлайн − 5 % |
| G1.7 | Rollback | 2 успішні drill-и в проді, propagation ≤ 60 s, без деплою |
| G1.8 | Delivery | фактичні витрати R1–R5 ≤ 1.5 × оцінки (≤ 30 pd); CI-час зріс ≤ 5 хв |
| G1.9 | Якість | 0 відкритих blocking-знахідок `react-reviewer`/`security`; coverage `apps/web` ≥ 80 % lines, `api-client` ≥ 90 % |

- **GO** → R6+ за планом; темп: один раунд у роботі, наступний — у підготовці.
- **GO з умовами** (1–2 пороги пропущено незначно) → ≤ 2 ітерації фіксів, повторний замір 7 днів.
- **NO-GO** (структурні проблеми strangler/auth/perf або delivery > 2×): `/clubs`, `/privacy`, `/terms` → legacy, front door лишається прозорим проксі або домен повертається на `book-club-legacy`; `packages/*` лишаються і переходять у мобільний трек (RM); Angular продовжує жити за `PLAN-UI-STACK` (раунд 4 знову актуальний). Втрати ≈ R2–R5 (~13–17 pd).

---

### R6 — `/clubs/[id]` (club detail) + on-demand revalidation
- **Scope**: RSC для гостьового вигляду (header, info, book-intro, book-stores, social-badges, members count, club events list, QR) з `revalidate: 600` + tag `club:{id}`; `generateMetadata` з назвою/описом/обкладинкою клубу (og:image = cover); JSON-LD `Organization`/`Event` для майбутніх подій. Client-острови: membership (`GET /clubs/{id}/my-membership`), join/leave, book-vote (`book-vote.service`), tabs (shadcn Tabs), manage-panel/sidebar — **лише посилання** на organizer-маршрути (legacy до R10). Невалідний/приватний id → поведінка як в Angular (перевірити: 404 vs редірект). UUID-regex у маніфесті; `/clubs/create`, `/clubs/:id/*` лишаються legacy.
- **Backend (опційно)**: `python-backend-dev` — після PATCH/pause/cancel клубу викликати `POST {WEB_ORIGIN}/api/revalidate` (секрет у заголовку) → `revalidateTag('club:{id}')`, `revalidateTag('clubs')`; без цього — просто TTL 600 с (прийнятно). Next-частина — `app/api/revalidate/route.ts` (**увага**: шлях під `/api` перехоплюється rewrite на бекенд — використати `/_internal/revalidate`).
- **Файли-джерела**: `src/app/features/clubs/club-detail/**` (1 702 рядки), `shared/components/{book-intro,social-badges,qr-code,event-rsvp-button}`, `shared/book-stores`, `core/services/{club,book-vote,book-cover}.service.ts`.
- **Агенти**: `react-dev`, `react-tester`, `security`, `react-reviewer`, `devops`; `python-backend-dev` (опц.).
- **Acceptance**: P-чекліст для guest/member/pending/organizer/admin; tabs a11y; sitemap-URL клубів відкриваються в Next з повним SSR; Search Console приймає сторінки.
- **Rollback**: прапорець `/clubs/:id`. **Effort**: 6–8 pd (+1 pd BE). **Залежності**: G1.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-club-detail. Read PLAN-REACT-MIGRATION-2026-09-28.md P-checklist and R6. Port src/app/features/clubs/club-detail/** (header, info, members, club-event-card, club-sidebar-right, manage-panel, book-vote) plus shared book-intro, book-stores, social-badges, qr-code to apps/web/src/app/(shell)/clubs/[id]/page.tsx. Server Component: anonymous GET /clubs/{id} and GET /clubs/{id}/events (revalidate 600, tags club:{id}), notFound()/redirect exactly mirroring Angular behaviour for missing/private clubs (read club-detail.component.ts to confirm), generateMetadata with club name/description/cover og:image, JSON-LD for the club and upcoming events. Client islands: my-membership, join/leave (same statuses/toasts), book-vote (book-vote.service semantics, optimistic update + invalidation), tabs via shadcn Tabs with the same tab ids and URL behaviour, organizer actions as AppLink to legacy routes. Add /_internal/revalidate route (POST, secret header REVALIDATE_SECRET, revalidateTag club:{id} and clubs) — NOT under /api. Register /clubs/:id (UUID) in the manifest. Tests with RTL+MSW for every role/state.
```
Промпт `python-backend-dev` (опційно):
```
Repo /home/dmytr/angular/book-club-be. Read /home/dmytr/angular/book-club-fe/PLAN-REACT-MIGRATION-2026-09-28.md R6. Add a fire-and-forget, non-blocking notifier: after successful club create/update/pause/resume/cancel/delete and club event create/update/delete, POST to f"{settings.WEB_REVALIDATE_URL}" with header X-Revalidate-Secret and JSON {"tags":["clubs","club:<id>"]}; settings WEB_REVALIDATE_URL/WEB_REVALIDATE_SECRET optional (feature disabled when unset); 2s timeout, errors logged not raised; run via BackgroundTasks. Tests with respx/httpx mock. No API contract changes.
```
Промпти `react-tester` / `security` / `react-reviewer` / `devops` — як у R5, з заміною маршруту на `/clubs/:id`, журналів HAR (guest view, member vote, join/leave, organizer view) і додатковою перевіркою `security`: секрет revalidate, відсутність персональних даних у ISR-кеші. Rollout 25 % → 100 % (48 год кроки).

---

### R7 — `/`(→`/events`), `/events`, `/events/[id]` (auth + Google Maps)
- **Scope**: Client Components з TanStack Query (сторінки під auth; RSC лише для layout). Guard: серверно — перевірка маркера сесії неможлива без кук на сторінці → клієнтський guard (`useSession` → `router.replace('/login')`) з тим самим skeleton, що й Angular під час `isLoading`. `event-countdown` (таймер), `event-rsvp-button` (оптимістично), `event-map` → `@vis.gl/react-google-maps` з ключем з `GET /config/maps-key`, лінивим завантаженням лише на `/events/[id]` (закриває N-1), `routing.service` (маршрут до місця) → хук. Редірект `/` → `/events` переходить у Next.
- **Файли-джерела**: `src/app/features/events/{events-feed,event-card,event-detail,event-countdown}/**`, `shared/components/{event-map,event-rsvp-button}`, `core/services/{event,maps-config,routing,geocoding}.service.ts`, `core/utils/event-attendance.util.ts`.
- **Агенти**: `react-dev`, `react-tester`, `security` (CSP для Maps: `maps.googleapis.com`, `maps.gstatic.com`, worker blob), `react-reviewer`, `devops`.
- **Acceptance**: P-чекліст; countdown-тести з fake timers (включно з нульовою/від'ємною різницею); карта не блокує рендер; `events.spec.ts` зелений на обох таргетах.
- **Rollback**: прапорці `/`, `/events`, `/events/:id`. **Effort**: 6–7 pd. **Залежності**: R6.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-events. Read PLAN-REACT-MIGRATION-2026-09-28.md R7 and the P-checklist. Port events-feed, event-card, event-detail, event-countdown, shared event-map and event-rsvp-button, and the services event/maps-config/routing/geocoding to apps/web (app/(shell)/events/page.tsx, events/[id]/page.tsx, redirect / → /events in the manifest-aware way). Auth-only pages: a reusable RequireAuth client boundary that reproduces authGuard (wait for session bootstrap, then replace('/login') — no returnUrl, parity) and a RequireRole reproducing roleGuard (toast ERRORS.organizers_only + replace('/clubs')). Maps via @vis.gl/react-google-maps, key fetched from GET /config/maps-key only when the map mounts. RSVP optimistic with rollback on error and the same toasts. Countdown with setInterval cleanup. Register /, /events, /events/:id (UUID) in the manifest; /events/:id/edit stays legacy. Tests RTL+MSW+fake timers.
```
Інші промпти — шаблон R5 (tester: журнали feed/filter, detail RSVP on/off, map load, countdown; security: CSP Maps + Trusted Types policy для js-api-loader; devops: canary 25 → 100).

---

### R8 — `/profile`, `/support`, `/support/new`
- **Scope**: форми на react-hook-form + zod з `packages/contracts` (displayName-валідатор з `shared/utils/display-name.validator.ts`), role-selector, stats (`/users/me/stats`), соцмережі + видимість, support board (адмін-дії для `admin`), створення звернення.
- **Файли-джерела**: `src/app/features/profile/**`, `features/support/**`, `shared/components/{social-link-field,form-field}`, `core/services/support.service.ts`, `AuthService.updateRole/updateDisplayName/...`.
- **Агенти**: `react-dev`, `react-tester`, `react-reviewer`, `devops`.
- **Acceptance**: P-чекліст; field-error a11y (`aria-invalid`/`describedby`) як у Spartan field; `support-profile.spec.ts` зелений на обох.
- **Rollback**: прапорці. **Effort**: 4–5 pd. **Залежності**: R7 (RequireAuth/RequireRole).

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-profile-support. Read PLAN-REACT-MIGRATION-2026-09-28.md R8. Port features/profile (incl. role-selector, stats), features/support (support-board, submission-card, create-submission), shared social-link-field and form-field to apps/web using react-hook-form + zod schemas from packages/contracts (move display-name rules from src/app/shared/utils/display-name.validator.ts into contracts), identical validation messages via FORM_ERRORS.* keys, identical submit/disabled/loading states and toasts, admin-only controls on the support board. Invalidate the session user query after profile/role updates. Register /profile, /support, /support/new. Tests RTL+MSW for validation, submit success/failure, role changes, admin vs user.
```
Інші промпти — шаблон R5.

---

### R9 — Auth: `/login`, `/register`, `/auth/callback`
- **Scope**: email/password login/register (RHF+zod, ті самі id полів `#login-email` тощо — e2e на них спираються), Google OAuth: `loginWithGoogle` → абсолютний `oauthBaseUrl` (`NEXT_PUBLIC_OAUTH_BASE_URL`), `/auth/callback?code=` → `POST /auth/oauth/exchange` (same-origin, куки) → `/auth/me`; помилка → `/login` з повідомленням. Легасі-міграція `bc_refresh_token` у localStorage (з `AuthService.init`) — відтворити в React один реліз (якщо метрики показують, що ще є такі сесії), потім видалити.
- **Ризики**: у цей момент auth-флоу живе в React, а решта авторизованих сторінок частково в Angular — обидва покладаються на куки → ок; Angular після hard nav робить `session-status`→`refresh` (одна ротація на перехід — прийнятно, перевірити rate-limit `/auth/refresh`).
- **Агенти**: `react-dev`, `security` (**обов'язково до мерджу**), `react-tester`, `react-reviewer`, `devops`; `python-backend-dev` — лише якщо rate-limit на `/auth/refresh` заважає частим переходам.
- **Acceptance**: P-чекліст + сценарії з `PLAN-COOKIE-AUTH` §«Верифікація» 1–8 проти Next (desktop, реальний мобільний, Vercel preview); OAuth з preview-доменом; жодних токенів у JS-сховищах; `public-pages.spec.ts` зелений.
- **Rollback**: прапорці `/login`, `/register`, `/auth/callback` (атомарно — одним записом Edge Config). **Effort**: 4–5 pd. **Залежності**: R8.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-auth. Read PLAN-REACT-MIGRATION-2026-09-28.md R9 and docs/archive/PLAN-COOKIE-AUTH-2026-07-07.md. Port features/auth/login, register, oauth-callback to apps/web (full-screen, no shell). Keep the same element ids (#login-email, #login-password, #reg-display-name, #reg-email, #reg-password, #reg-confirm-password) and data-testid login-error. Email login/register via POST /auth/login|register with the cookie transport — never read/store tokens from the JSON body. Google: window.location.href = `${NEXT_PUBLIC_OAUTH_BASE_URL}/auth/oauth/google?origin=${location.origin}`; /auth/callback exchanges ?code via POST /auth/oauth/exchange then GET /auth/me, error → /login with the same message key; missing code → /login. After success hard-navigate to /events (same as Angular). One-release legacy migration: if localStorage bc_refresh_token or bc_has_session exist, POST /auth/refresh with {refreshToken} once and delete both keys regardless of result. Register the three routes. Tests RTL+MSW incl. OAuth error paths.
```
Промпт `security`:
```
Mandatory pre-merge review of feat/web-auth (/home/dmytr/angular/book-club-fe/apps/web) per PLAN-REACT-MIGRATION-2026-09-28.md R9 and PLAN-COOKIE-AUTH verification list: no tokens in JS storage or React state beyond the user profile; OAuth origin handoff and code exchange (60s TTL, single use); open-redirect checks on any redirect param; CSRF on login/register/logout; rate-limit behaviour of /auth/refresh with frequent Angular↔Next hard navigations (measure refresh calls per session over a scripted journey); logout clears cookies and caches (TanStack Query cache cleared). Findings with severity; block merge on High+.
```
Інші промпти — шаблон R5 (devops: перемикання трьох маршрутів одним записом, canary 10 → 50 → 100 з 72-год кроками).

---

### R10 — Organizer-форми та randomizer
- **Routes**: `/clubs/create`, `/clubs/[id]/edit`, `/clubs/[id]/manage`, `/clubs/[id]/events/create`, `/events/[id]/edit`, `/clubs/[id]/randomizer`.
- **Scope**: RHF+zod; `cover-upload` (`POST /upload/cover`, FormData), `address-autocomplete` і `book-autocomplete` → shadcn Combobox (Radix Popover + cmdk) з тією ж debounce/мінімальною довжиною й TTL-кешем (`core/utils/ttl-cache.util.ts`); club-manage (members/join-requests/bans/ролі/pause/cancel/reschedule/stats/delete) — розбити на підкомпоненти; randomizer (`randomizer.service`). RequireRole('organizer').
- **Файли-джерела**: `features/clubs/{create-club,edit-club,club-manage}/**`, `features/events/{create-event,edit-event}/**`, `features/randomizer/**`, `shared/components/{cover-upload,address-autocomplete,book-autocomplete}`, `core/services/{upload,book-search,geocoding,randomizer}.service.ts`.
- **Агенти**: `react-dev` (можна 2 підраунди: форми клубу/події; manage+randomizer), `react-tester`, `react-reviewer`, `security` (upload: тип/розмір, DOMPurify-еквівалент для описів якщо рендеряться як HTML), `devops`.
- **Acceptance**: P-чекліст; combobox a11y (ARIA 1.2 combobox, клавіатура); `clubs.spec.ts` organizer-describe і `events.spec.ts` зелені на обох; після мутацій — revalidate тегів R6.
- **Rollback**: прапорці по маршруту. **Effort**: 8–10 pd. **Залежності**: R9.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-organizer. Read PLAN-REACT-MIGRATION-2026-09-28.md R10. Port create-club, edit-club, club-manage (split into members, join-requests, bans, status actions, stats, danger zone), create-event, edit-event, randomizer, cover-upload, address-autocomplete and book-autocomplete (shadcn Combobox with Radix Popover + cmdk; keep debounce, min length and TTL cache semantics from core/utils/ttl-cache.util.ts and the TypeaheadComboboxBase). react-hook-form + zod from packages/contracts, identical validation keys, upload via POST /upload/cover (FormData, same size/type limits), invalidate TanStack queries and call /_internal/revalidate for affected club tags after mutations. All routes wrapped in RequireRole('organizer'). Register the six routes. Tests RTL+MSW per form: validation, success, backend error mapping, role denial.
```
Інші промпти — шаблон R5.

---

### R11 — Квізи
- **Routes**: `/clubs/[id]/quizzes`, `…/create`, `…/[quizId]`, `…/[quizId]/edit`, `…/[quizId]/preview`, `…/[quizId]/session`, `…/[quizId]/leaderboard`.
- **Scope**: `quiz-detail-base`/`leaderboard-base` → хуки; leaderboard polling (`setInterval`) → `refetchInterval` TanStack Query з паузою у фоні; сесія ведучого (organizer) — поточна реалізація через REST (перевірити, що WS не використовується — підтверджено: WebSocket лише в chat), take-flow з таймерами.
- **Файли-джерела**: `src/app/features/quiz/**` (2 176 рядків), `core/services/quiz.service.ts`.
- **Агенти**: `react-dev`, `react-tester`, `react-reviewer`, `devops`.
- **Acceptance**: P-чекліст; `quizzes.spec.ts` зелений на обох; polling не дублює запити (HAR). **Rollback**: прапорці. **Effort**: 7–9 pd. **Залежності**: R10.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-quiz. Read PLAN-REACT-MIGRATION-2026-09-28.md R11. Port src/app/features/quiz/** (list, create, edit, preview, session, take, leaderboard; shared quiz-detail-base and leaderboard-base logic as hooks) to apps/web under app/(shell)/clubs/[id]/quizzes/**. Leaderboard polling → TanStack Query refetchInterval with the same period, paused when the tab is hidden; session/take timers with cleanup; role rules as in quiz.routes.ts. Register the seven routes (create before :quizId; quizId format check). Tests RTL+MSW+fake timers.
```
Інші промпти — шаблон R5.

---

### R12 — `/chats` і chat-widget у shell (realtime)
- **Scope**: `chat-socket.service` → `packages/api-client/ws` (framework-agnostic WS-клієнт: ws-ticket перед кожним connect/reconnect, backoff, presence/presence_snapshot/message, send `{text}`) — **той самий** модуль бере mobile; React-хуки поверх нього; злиття повідомлень у query-кеш; `chat-audio-alert.service`, `chat-timestamp.pipe`; chat-widget у React-shell (замінює заглушку R5), `/chats` сторінка. `wss://book-club-be.onrender.com` напряму (CSP `connect-src`).
- **Агенти**: `react-dev`, `react-tester`, `security` (ws-ticket, XSS у повідомленнях), `react-reviewer`, `devops`.
- **Acceptance**: P-чекліст; `chats.spec.ts` + `e2e/api/chat.api.spec.ts` зелені; reconnect після offline/online і після sleep вкладки; бейдж непрочитаних; немає витоків сокетів при навігації (перевірка в DevTools/Playwright CDP).
- **Rollback**: прапорець `/chats` + прапорець `shell.chatWidget` (Edge Config) → повернення до заглушки. **Effort**: 6–8 pd. **Залежності**: R11.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-chat. Read PLAN-REACT-MIGRATION-2026-09-28.md R12. Extract a framework-agnostic chat socket client into packages/api-client/src/ws (port src/app/core/services/chat-socket.service.ts + chat.service.ts semantics: fetch POST /auth/ws-ticket before every connect and reconnect, first frame {type:'auth', ticket}, exponential backoff with jitter, presence/presence_snapshot/message handling, send {text}, clean close). Build React hooks on top (useChatRoom, useChatRooms, unread counts) merging live messages into TanStack Query caches; port chat-widget (split into header, message list, composer) into the shell replacing the R5 placeholder behind Edge Config flag shell.chatWidget, and features/chats to app/(shell)/chats/page.tsx; audio alert and timestamp formatting as in Angular. Register /chats. Tests: WS client with a mock server (vitest + ws), hooks with RTL.
```
Інші промпти — шаблон R5 (security: ws-ticket TTL/одноразовість, рендер тексту без HTML, rate limiting).

---

### R13 — Хвіст: 404, legacy-only залишки, перевірка повноти
- **Scope**: `not-found` у Next як глобальний catch-all (прибрати `rewrites.fallback` можна лише в R14 — тут просто порт сторінки й перевірка, що маніфест покриває 100 % маршрутів §5); прогін `audit:full` проти Next з вимкненим fallback на preview; інвентар і видалення непотрібних шимів.
- **Агенти**: `react-dev`, `react-tester`, `react-reviewer`. **Effort**: 1.5–2 pd. **Залежності**: R12.

Промпт `react-dev`:
```
Repo /home/dmytr/angular/book-club-fe, branch feat/web-tail. Read PLAN-REACT-MIGRATION-2026-09-28.md §5 and R13. Port features/not-found as app/not-found.tsx with identical content/links/metadata (TITLES.not_found). Add a preview-only env flag DISABLE_LEGACY_FALLBACK that removes rewrites.fallback so the whole app runs on Next; produce a coverage report comparing src/strangler/routes.ts against every route in src/app/**/*.routes.ts and fail CI if any is missing.
```

---

### R14 — Виведення Angular з експлуатації
- **Scope**: 30 днів на 100 % для всіх маршрутів → прибрати `rewrites.fallback`, Edge Config-логіку спростити до глобального `enabled` (або видалити middleware-гілку legacy), видалити Angular (`src/`, `angular.json`, Angular deps, `tsconfig.app/spec`, `vitest.config.ts` для Angular, `scripts/generate-sitemap.mjs`, `postbuild`, `public/` → `apps/web/public` для `favicon`, `og-image`, Google verification file), перенести `public/i18n` у `packages/i18n/locales` і **перевести джерело на ICU** (mobile додає `i18next-icu`), `extract-i18n.mjs`/`i18n-check.yml` → під ICU; CI: прибрати legacy-джоби, Sonar → `apps/web`+`packages`; `lighthouse.yml` → проти preview Next; оновити `CLAUDE.md`, `repomix.config.json`, husky/lint-staged; архівувати проєкт `book-club-legacy` (не видаляти ще 30 днів — страховка).
- **Backend**: без змін (mobile все ще використовує Bearer + body-токени; web — куки). Рішення щодо `PLAN-COOKIE-AUTH` «Реліз 2» (прибрати токени з JSON) — **не застосовується**, поки mobile їх потребує; альтернатива — віддавати токени в body лише для клієнтів без Origin (окреме рішення `security` + `python-backend-dev`, поза цим планом).
- **Агенти**: `devops`, `react-dev`, `react-reviewer`, `security`.
- **Acceptance**: `audit:full` зелений проти прод; жодного запиту до `book-club-legacy` за 7 днів (логи Vercel); репо без `@angular/*`, `@spartan-ng/*`, `@ngx-translate/*`.
- **Rollback**: до видалення `book-club-legacy` — повернути `rewrites.fallback` (revert) + прапорці; після — лише git revert + передеплой legacy з тегу `angular-final`.
- **Effort**: 3–4 pd. **Залежності**: R13 + 30 днів soak.

Промпт `devops`:
```
Repo /home/dmytr/angular/book-club-fe, branch chore/decommission-angular. Read PLAN-REACT-MIGRATION-2026-09-28.md R14. Preconditions: every manifest route at 100% for ≥30 days and zero legacy hits for 7 days (attach Vercel logs query). Tag the last Angular commit `angular-final`. Remove the legacy deploy job, Angular build/test/lint jobs, lighthouse static-dist config (retarget to the web preview), bundle-size Angular logic, Sonar paths; keep book-club-legacy project archived but not deleted for 30 days. Update RUNBOOK-STRANGLER.md with the post-decommission rollback (redeploy tag angular-final + restore fallback).
```
Промпт `react-dev`:
```
Same branch. Remove the Angular application (src/, angular.json, tsconfig.app.json, tsconfig.spec.json, Angular vitest config, Angular/Spartan/ngx-translate deps, scripts/generate-sitemap.mjs and postbuild, extract-i18n for Angular), move public/i18n/{en,uk}.json into packages/i18n/locales and convert the source of truth to ICU (update packages/i18n tests; provide a migration note for apps/mobile to add i18next-icu), move favicon/og-image/google verification file to apps/web/public, remove rewrites.fallback and the legacy branch of the strangler middleware, update CLAUDE.md and repomix config. All workspace builds/tests/e2e green.
```

---

### RM — Трек мобільного шарингу (паралельно після G1; не блокує web)
- **Scope**: `git subtree add --prefix=apps/mobile` (зі збереженням історії) `book-club-mobile`; Metro/Expo monorepo-конфіг (watchFolders, `nodeModulesPaths`, один React); mobile переходить на `@book-club/contracts`, `@book-club/api-client` (bearerTransport), `@book-club/i18n` (i18next споживає ті самі JSON; після R14 — `i18next-icu`); видалити дублікати `apps/mobile/src/models/*`, `src/api/client.ts`, `src/api/errors.ts`; CI: jest-expo для `apps/mobile` на змінах `packages/**`.
- **Агенти**: `react-native-dev`, `react-native-tester`, `react-native-reviewer`, `devops`.
- **Acceptance**: `npx expo run:android` працює з монорепо; усі mobile-тести зелені; 0 дубльованих моделей; зміна схеми в `packages/contracts` ламає typecheck і web, і mobile в одному PR.
- **Rollback**: mobile-репо лишається джерелом до мерджу; після — revert subtree-мерджу. **Effort**: 3–4 pd. **Залежності**: R1 (технічно), G1 (рекомендовано).

Промпт `react-native-dev`:
```
Read /home/dmytr/angular/book-club-fe/PLAN-REACT-MIGRATION-2026-09-28.md RM. Bring /home/dmytr/angular/book-club-mobile into /home/dmytr/angular/book-club-fe as apps/mobile via git subtree (preserve history), configure Expo/Metro for npm workspaces (single React version shared with apps/web, watchFolders for packages/*), then replace apps/mobile/src/models/*, src/api/client.ts, src/api/errors.ts and per-domain api modules with @book-club/contracts and @book-club/api-client (bearerTransport backed by expo-secure-store; keep the existing single-flight refresh behaviour and tests passing), and load i18n resources from @book-club/i18n. Keep app behaviour identical; jest-expo suite green; expo run:android works.
```
Промпти `react-native-tester`/`react-native-reviewer`: перевірити паритет поведінки клієнта (401/503/timeouts), відсутність Node-only імпортів у бандлі Metro, дублікатів React.

---

## 8. Зведення: effort і залежності

| Раунд | Що | Effort (pd) | Залежить від |
|---|---|---|---|
| R0 | Базлайни, parity-харнес | 1.5–2 | Spartan-ізоляція змерджена |
| R1 | Монорепо + packages | 4–5 | — (паралельно R0) |
| R2 | Next skeleton + front door + Edge Config | 4–5 | R1 |
| R3 | Angular-шими (handoff guard, cookies lang/theme) | 1.5 | R2 |
| R4 | `/privacy`, `/terms` | 1.5 | R2, R3 |
| R5 | **Пілот**: shell + `/clubs` + sitemap/robots | 6–8 | R4 |
| **G1** | **Gate** (+14 днів soak) | — | R5 |
| R6 | `/clubs/[id]` (+ BE revalidate опц.) | 6–9 | G1 |
| R7 | `/`, `/events`, `/events/[id]` (Maps) | 6–7 | R6 |
| R8 | profile, support | 4–5 | R7 |
| R9 | auth-сторінки | 4–5 | R8 |
| R10 | organizer-форми + randomizer | 8–10 | R9 |
| R11 | квізи | 7–9 | R10 |
| R12 | чат (WS) | 6–8 | R11 |
| R13 | 404 + повнота | 1.5–2 | R12 |
| R14 | виведення Angular | 3–4 | R13 + 30 днів |
| RM | mobile у монорепо | 3–4 | R1 (реком. G1) |
| **Разом** | | **≈ 73–94** | |

До гейту G1: ~19–23 pd — це і є «ціна експерименту».

## 9. Межі з паралельними треками
- **Spartan-ізоляція (`refactor/spartan-isolation`, `ToastService` facade)**: цей план не редагує `src/app/shared/spartan/**`, `src/app/core/services/toast.service.ts`, `eslint.config.js`, dependency-піни Spartan. R0 стартує після мерджу гілки в `develop`. `PLAN-UI-STACK` раунди 2–3 (alias-імпорти, axe-тести sheet/tabs/field, Dependabot-група) **продовжуються** — їхні axe-тести стають P7-еталоном; раунд 4 (B-lite) **скасовується**, якщо G1 = GO (Angular буде видалено), і відновлюється, якщо NO-GO.
- **`REFACTOR-PLAN-FABLE-2026-09-28.md` Phase 2**: items 5–6 (rxResource у club-detail/event-detail/edit-club; розбиття club-manage/chat-widget/header) — рекомендація: **заморозити** для компонентів, що мігрують у R5–R12 (роботу буде викинуто), дозволити лише для того, що потрібне до G1; item 7 (тест event-countdown) — корисний як еталон поведінки для R7, лишити.
- **Cookie-auth**: R2/R5/R9 спираються на вже реалізовану частину; React не використовує Bearer. `PLAN-COOKIE-AUTH` «Реліз 2» блокується мобільним (див. R14).
- **Mobile Phase 2/3**: WS-клієнт з R12 — спільний; до RM мобільний продовжує розвиватися у своєму репо.

## 10. Ризики та мітигації
| Ризик | Ймовірність / вплив | Мітигація |
|---|---|---|
| Прод-домен — `*.vercel.app`-аліас; перевішування між проєктами | низька / високий | репетиція на preview-аліасі; runbook swap-back (R2); розглянути власний домен до R2 |
| Подвійний refresh-ротаційний трафік при переходах Angular↔Next | середня / середній | виміряти в R9; access-кука (`path=/api/v1`) часто робить refresh зайвим; rate-limit review |
| Hydration mismatch через locale/theme | середня / низький | cookie як єдине джерело на сервері; тест у P8 |
| CSP з nonce робить сторінки динамічними (без HTML-кешу) | висока / низький | кешуємо дані (`fetch` revalidate/tags), TTFB контролюється P9 |
| Vercel external rewrite timeout vs cold start Render | середня / середній | keep-alive cron (існує), 503-retry у клієнті, SSR-fetch з timeout 8 s і деградацією до клієнтського завантаження |
| Дрейф i18n між ngx-translate і ICU | середня / середній | генератор + CI key-parity (R1) до R14 |
| Два UI в проді (візуальні розбіжності) | висока / низький | `ui`-мапінг (R5), visual diff P8 |
| Паралельні фічі в Angular під час міграції | середня / середній | правило заморозки §5 |
| Втома/затягування (напівмігрований стан роками) | середня / високий | G1 + явний темп; кожен раунд має бюджет; R14 має дату-ціль (G1 + ~12 тижнів) |

## 11. Порядок запуску агентів (шаблон для кожного раунду)
1. `ui` (якщо є нові примітиви) → 2. `react-dev` → 3. `react-tester` (P-звіт) → 4. `security` (якщо auth/CSP/upload/WS/нові заголовки) → 5. `react-reviewer` (approve на основі P-звіту) → 6. ітерації `react-dev` ↔ `react-reviewer` до approve (≤ 3) → 7. merge → 8. `devops`: деплой + canary + drill → 9. оновлення `docs/migration/RUNBOOK-STRANGLER.md` і статусу раунду в цьому плані.
Angular-зміни (лише R0, R3) — `dev`/`tester` → `reviewer`. Бекенд (лише R6 опц., R9 за потреби) — `python-backend-dev` → `python-backend-reviewer`.
