# Audit Report — Book Club (Angular 21 + FastAPI)

**Дата:** 2026-06-15
**Основне середовище:** прев'ю-прод `https://book-club-81rhzaq0y-dmytros-projects-ad22eb22.vercel.app/` (публічний, без SSO) — усі перевірки нижче відтворені тут.
**Звірка:** локальний dev `http://localhost:4200` (ті самі результати).
**Інструменти:** Playwright (chromium) + axe-core (WCAG2A/AA) + curl (HTTP-заголовки)
**Покриття:** 8 публічних роутів + 6 захищених (під свіже-зареєстрованим organizer-акаунтом проти прод-бекенду), форми login/register, security-заголовки, SEO-артефакти.
**Докази:** скріни прод-прогону в `audit-evidence/prod/`, сирий JSON прогону — `audit-evidence/audit-prod-results.json`, axe-результати — `playwright-report/audit-results.json`.

---

## Підсумок

| Severity | К-сть | Знахідки |
|---|---|---|
| 🔴 High | 2 | F-01 og:image віддає HTML, F-02 canonical/og:url на мертвий домен |
| 🟠 Medium | 4 | F-03 sitemap, F-04 /chats без заголовків, F-05 /clubs/create без SEO+h1, F-06 a11y privacy/terms |
| 🟡 Low | 4 | F-07 og:title не per-route, F-08 429 у консолі, F-09 нема manifest, F-10 нема google-site-verification |
| ℹ️ Info | 2 | F-11 submit не disabled, F-12 404→login для неавторизованих |
| ✅ Pass | — | Security-заголовки, токен не в localStorage, XSS-захист, 0 critical a11y, per-route titles |

---

## Статус виправлень (2026-06-15, через dev-агента, верифіковано)

| Знахідка | Статус | Перевірка |
|---|---|---|
| F-01 og:image | ✅ Виправлено | створено валідний `public/og-image.png` 1200×630 (амбер-градієнт + бренд) |
| F-03 sitemap lastmod | ✅ Виправлено (частково) | `lastmod`→2026-06-15, додано /privacy,/terms; **домен у `<loc>` лишається** (F-02) |
| F-04 /chats h1 | ✅ Виправлено | `/chats` тепер `<h1>Чати</h1>` |
| F-05 /clubs/create SEO+h1 | ✅ Виправлено | title «Створити клуб \| Book Club», `<h1>Створити клуб</h1>` |
| F-06 a11y privacy/terms | ✅ Виправлено | axe: **0** порушень на всіх 7 роутах (було 2 serious) |
| F-07 og:title per-route | ✅ Виправлено | новий `OgTitleStrategy` синхронізує og/twitter title; `/chats` og:title тепер «Чати \| Book Club» |
| **F-02 мертвий/відсутній прод-домен + весь сайт `noindex`** | ⛔ **Блокер — дія у Vercel** | потрібен робочий індексований прод-домен; кодом не лікується |
| F-08 429 у консолі | ↪️ Бекенд | рейт-ліміт onrender для аноніма |
| F-09 manifest, F-10 google-verification | ⏸️ Не робили | опційно, за потреби |

**Залишається лише F-02 (devops/Vercel):** усі живі `*.vercel.app`-деплої віддають `x-robots-tag: noindex`, а `book-club-fe.vercel.app` мертвий (404). Тобто Google не може індексувати сайт. Дія: призначити робочий прод-домен (кастомний або полагодити production-alias) у Vercel; після цього — замінити `book-club-fe.vercel.app` на нього в `index.html` (canonical/og:url/JSON-LD), `robots.txt`, `sitemap.xml` (одна правка, зроблю за командою).

---

## 🔴 High

### F-01 — `og:image` / `twitter:image` віддають HTML замість зображення
- **Категорія:** SEO / Google / соцмережі
- **Де:** усі сторінки (`<meta property="og:image" content="/og-image.png">`, `index.html:17,22`)
- **Опис:** Файл `public/og-image.png` **не існує**. На прев'ю-проді Vercel catch-all rewrite (`vercel.json` `/(.*) → /index.html`) повертає `/og-image.png` зі статусом **200, але `content-type: text/html`** (35 КБ index.html). Локально — **404**. Соц-кролери (Facebook, Twitter/X, Telegram) і Google отримують HTML замість картинки → прев'ю при шерінгу зламане. Підтверджено: на прод-роутах `og:image` резолвиться у `…vercel.app/og-image.png` (HTML).
- **Доказ:** `curl https://book-club-81rhzaq0y-…vercel.app/og-image.png` → `content-type: text/html; charset=utf-8`; localhost → `404 Not Found`.
- **Рекомендація:** додати реальний `public/og-image.png` (1200×630) **або** виправити шлях на наявне зображення; переконатися, що віддає `image/png`.

### F-02 — `canonical` та `og:url` вказують на неіснуючий домен
- **Категорія:** SEO / Google
- **Де:** `index.html:16,25,35` — `https://book-club-fe.vercel.app/`
- **Опис:** Домен `book-club-fe.vercel.app` віддає **404 `DEPLOYMENT_NOT_FOUND`**. У статичному HTML (те, що бачать кролери без JS і соц-скрепери) `canonical`, `og:url` і JSON-LD `url` ведуть на мертвий домен. `SeoService.applyOgUrl()` переписує їх на поточний origin **уже після завантаження JS** — тож на прев'ю-проді canonical у DOM стає `https://book-club-81rhzaq0y-…vercel.app/...` (**ефемерний preview-URL**, не стабільний канонічний домен). Підсумок: стабільного коректного `canonical` немає ніде — статичний HTML = мертвий домен, runtime = випадковий preview-домен. Соц-скрепери (без JS) бачать мертвий домен.
- **Доказ:** `curl https://book-club-fe.vercel.app/` → `HTTP/2 404 ... x-vercel-error: DEPLOYMENT_NOT_FOUND`; runtime canonical на прев'ю = preview-URL.
- **Рекомендація:** замінити всі входження на актуальний прод-домен (canonical, og:url, JSON-LD `url`, а також у `robots.txt` і `sitemap.xml`).

---

## 🟠 Medium

### F-03 — `sitemap.xml` застарілий і неповний
- **Категорія:** SEO / crawl
- **Де:** `public/sitemap.xml`, `public/robots.txt`
- **Опис:** Лише 4 статичні URL (`/`, `/clubs`, `/login`, `/register`); `lastmod` захардкоджено `2025-01-01`; усі `loc` і `robots.txt`→`Sitemap:` ведуть на мертвий `book-club-fe.vercel.app`. Динамічні `/clubs/:id`, `/events/:id` відсутні.
- **Рекомендація:** генерувати sitemap на актуальний домен з реальним `lastmod`; додати ключові динамічні сторінки.

### F-04 — Сторінка `/chats` не має жодного заголовка (h1/h2)
- **Категорія:** a11y + SEO
- **Де:** `/chats` (ChatsComponent)
- **Опис:** `h1count = 0`, `h2count = 0`. Сторінка без структури заголовків — погано для скрін-рідерів і семантики.
- **Доказ:** прогін Playwright: `[p_chats] ... h1=0`.
- **Рекомендація:** додати видимий або `sr-only` `<h1>` (напр. «Чати»).

### F-05 — `/clubs/create`: дефолтний `<title>`/OG і відсутній page-h1
- **Категорія:** SEO
- **Де:** `/clubs/create` (CreateClubComponent)
- **Опис:** `title = "Book Club — Читацькі клуби України"` (дефолт із index.html), `og:title` теж дефолт — компонент не викликає `SeoService.setPage*`. Єдиний `<h1>` на сторінці — лого хедера «📚 BookClub», власного заголовка форми немає.
- **Рекомендація:** додати `setPageI18n('SEO.create_club_title')` і власний `<h1>` сторінки.

### F-06 — Serious a11y-порушення на `/privacy` та `/terms`
- **Категорія:** a11y (WCAG AA)
- **Де:** `/privacy`, `/terms`
- **Опис:** axe: `color-contrast` (×2) і `link-in-text-block` (serious). Недостатній контраст тексту та посилання, що не відрізняються від тексту нічим, крім кольору.
- **Доказ:** `npm run audit:total` → `serious:color-contrast(2), serious:link-in-text-block(1)`.
- **Рекомендація:** підняти контраст до AA; додати підкреслення лінкам у тексті.

---

## 🟡 Low

### F-07 — `og:title` не оновлюється per-route на частині сторінок
- **Категорія:** SEO / соц-шерінг
- **Опис:** На `/events`, `/chats`, `/manage`, `/privacy`, `/terms` оновлюється `<title>`, але `og:title` лишається дефолтним «Book Club — Читацькі клуби України». На `/clubs` і auth-сторінках (через `setPageI18n`) — коректно.
- **Рекомендація:** синхронізувати `og:title` з title у `SeoService` для всіх роутів.

### F-08 — `429 Too Many Requests` у консолі під час неавторизованого бутстрапу
- **Категорія:** мережа / надійність
- **Опис:** На неіснуючому шляху (неавторизовано) в консолі `Failed to load resource: 429` — відтворюється і на прев'ю-проді, і локально. Бекенд (onrender) рейт-лімітить bootstrap-запит (refresh/me) для аноніма.
- **Рекомендація:** перевірити рейт-ліміти бекенду й приглушити очікувані 401/429 під час анонімного бутстрапу (interceptor вже має `SUPPRESS_ERROR_TOAST`).

### F-09 — Немає `manifest.webmanifest` (PWA / Lighthouse)
- **Категорія:** SEO / PWA
- **Рекомендація:** додати web-manifest з іконками для кращого Lighthouse-скору й «install».

### F-10 — Немає `google-site-verification`
- **Категорія:** Google Search Console
- **Опис:** Відсутній verification-мета-тег. Можливо навмисно (верифікація через DNS/файл) — підтвердити.

---

## ℹ️ Info / Спостереження

### F-11 — Кнопка submit не `disabled` на невалідній формі
- **Опис:** login/register не блокують submit при невалідних даних (валідація показується по сабміту/блюру). Функціонально працює: валідатори показують локалізовані помилки і `onSubmit()` не відправляє невалідну форму. Розбіжність із очікуванням чеклиста — не баг.

### F-12 — Неіснуючий шлях для неавторизованого → `/login`, а не 404
- **Опис:** `**`/NotFound у shell за `authGuard`, тож анонім на битому URL отримує `/login`, а не сторінку 404. Очікувано за архітектурою, але кролер/користувач не бачить справжню 404.

---

## ✅ Що пройшло (Pass)

- **Security-заголовки (прод/прев'ю)** — усі присутні й збігаються з `vercel.json`: `Content-Security-Policy` (з `frame-ancestors 'none'`), `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-XSS-Protection`. Прев'ю має `x-robots-tag: noindex` (не індексується).
- **Токени** — у `localStorage` лише `bc_has_session=1`; access-токен у пам'яті, refresh у httpOnly cookie. ✅
- **XSS** — `<script>` у displayName відхилено валідатором («Ім'я може містити лише літери…»). ✅
- **Секрети в коді** — `environment.ts`/`environment.prod.ts` містять лише публічні URL; хардкоднутих ключів/токенів не знайдено; Maps-ключ тягнеться з бекенду runtime. ✅
- **Per-route `<title>`** — унікальні на login/register/privacy/terms/events/clubs/profile/chats/manage. ✅
- **Per-route description** — на `/clubs` специфічний опис. ✅
- **a11y critical** — 0 critical порушень на всіх 7 публічних роутах (axe WCAG2A/AA). ✅
- **Форми** — валідація login/register показує коректні локалізовані помилки (email, minlength≥8, password mismatch, role). ✅
- **Auth-флоу** — реєстрація organizer → логін → редірект на `/events`; хедер показує Події/Клуби/Керування для organizer. ✅
- **alt / noopener** — на перевірених сторінках немає `<img>` без `alt` і немає `target="_blank"` без `rel="noopener"`. ✅

---

## Пріоритет фіксів
1. **F-01, F-02** (High) — реальний og-image + актуальний домен у canonical/og/JSON-LD/robots/sitemap.
2. **F-03** — згенерувати коректний sitemap.
3. **F-04, F-05** — заголовки + per-route SEO для chats/clubs-create.
4. **F-06** — контраст і лінки на privacy/terms.

> Фікси цих знахідок — окремий етап через `book-club-agents` MCP (dev-агент), за згодою користувача.
