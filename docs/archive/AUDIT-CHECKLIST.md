# QA & Audit Checklist — Book Club (Angular 21 + FastAPI)

Чеклист для двох ролей: **Тестувальник** (функціонал, елементи, форми, UX) та
**Аудитор** (SEO/Google, безпека, доступність, перформанс).
Середовища: локальний dev `http://localhost:4200` та прод/прев'ю на Vercel.

Легенда: `[ ]` не перевірено · `[x]` ОК · `[!]` знахідка (див. `AUDIT-REPORT.md`).

---

## A. Тестувальник

### A1. Навігація та роутинг
- [ ] `/` редіректить на `/events`
- [ ] Усі публічні роути відкриваються: `/login`, `/register`, `/privacy`, `/terms`, `/auth/callback`
- [ ] Захищені роути без авторизації → редірект на `/login` (`/clubs`, `/events`, `/profile`, `/chats`, `/manage`)
- [ ] `roleGuard`: `/manage`, `/clubs/create`, `/clubs/:id/edit`, `/clubs/:id/randomizer`, quiz-create/edit лише для organizer
- [ ] Неіснуючий шлях → `NotFoundComponent` (`**`)
- [ ] Перезавантаження на глибокому URL не дає 404 (SPA rewrite)
- [ ] Кнопки браузера назад/вперед працюють коректно

### A2. Елементи сторінок (layout)
- [ ] Header: лого, лінки (clubs, events, manage для organizer), user-меню, sign out
- [ ] Header: перемикач мови uk↔en, перемикач теми (sun/moon)
- [ ] Footer: лінки privacy/terms, актуальний рік
- [ ] Спінери завантаження (`loading-spinner`) показуються під час запитів
- [ ] Empty-state на порожніх списках (clubs/events без даних)
- [ ] Chat-віджет (FAB) присутній на авторизованих сторінках

### A3. Форми та валідація
- [ ] **Login**: email (формат), password (≥8); submit disabled при невалідних; помилка при невірних кредах
- [ ] **Register**: displayName (2–50, без `<`/`>`), email, password ≥8, confirm = match, role обовʼязковий
- [ ] **Create/Edit Club**: name 3–100, description ≤500, city required, coverUrl pattern `https?://...`
- [ ] **Create/Edit Event**: title 3–120, date required, durationMinutes 15–480
- [ ] **Create/Edit Quiz**: title 3–100, question 5–500, options ≤200, correctIndex обраний
- [ ] **Profile**: displayName 2–50, соц-лінки опціональні, перемикач socialsPublic
- [ ] **Randomizer**: purpose required
- [ ] Повідомлення помилок локалізовані (uk/en), без сирих ключів `ERRORS.*`
- [ ] Успішний сабміт кожної форми → очікуваний редірект/тост

### A4. Інтерактив і стан
- [ ] Перемикання мови змінює всі тексти + `<html lang>`; вибір зберігається (localStorage)
- [ ] Перемикання теми застосовується миттєво й персиститься
- [ ] RSVP-кнопка (attend/unattend) працює
- [ ] Book/address autocomplete видає підказки
- [ ] Cover-upload показує превʼю
- [ ] QR-код генерується
- [ ] Randomizer крутиться й видає результат
- [ ] Тости: 500/таймаут показують повідомлення; 401 → `/login`; 403 → `/clubs`
- [ ] Cold-start (503) → один автоматичний retry

### A5. Адаптивність та контент
- [ ] Мобільний (375), планшет (768), десктоп (1280) — лейаут не ламається, меню доступне
- [ ] Немає битих зображень / плейсхолдерів
- [ ] Немає тексту "undefined"/"null"/неперекладених ключів (`SEO.*`, `AUTH.*` тощо)

---

## B. Аудитор

### B1. SEO-теги для Google
- [ ] `<title>` присутній і **унікальний** на кожному роуті (через `SeoService`)
- [ ] `<meta name="description">` присутній, осмислений, унікальний per-route
- [ ] `<meta name="robots">` = `index, follow` на публічних
- [ ] `<link rel="canonical">` вказує на **актуальний робочий домен**
- [ ] `<html lang>` відповідає мові (uk/en)
- [ ] Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:locale`
- [ ] Twitter card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `og:image` / `twitter:image` повертають **реальне зображення** (200 + `image/*`), не HTML/404
- [ ] JSON-LD (WebApplication/WebSite) — валідний, URL актуальний
- [ ] `<meta name="theme-color">` присутній
- [ ] H1 присутній і унікальний; ієрархія h1→h2→h3 коректна

### B2. Crawl-артефакти
- [ ] `robots.txt`: Allow `/`, Disallow `/manage/`, Sitemap → **актуальний домен**
- [ ] `sitemap.xml`: актуальні URL, `lastmod` не застарілий, включає ключові сторінки
- [ ] Внутрішні лінки не ведуть на 404
- [ ] Зображення мають `alt`
- [ ] (Опц.) `manifest.webmanifest` для PWA/Lighthouse

### B3. Безпека — HTTP-заголовки (прод/прев'ю)
- [ ] `Content-Security-Policy` присутній і збігається з `vercel.json`
- [ ] `Strict-Transport-Security` (HSTS) присутній
- [ ] `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` обмежує camera/microphone/geolocation
- [ ] `X-XSS-Protection` присутній
- [ ] Прев'ю-деплої мають `x-robots-tag: noindex` (не індексуються)

### B4. Безпека — клієнт
- [ ] Немає секретів/API-ключів у JS-бандлі (Maps key тягнеться з бекенду runtime)
- [ ] Access-токен не в localStorage (лише `bc_has_session`; refresh у httpOnly cookie)
- [ ] XSS-проба в displayName/club name відхиляється (валідатор `<`/`>` + Angular sanitization)
- [ ] Зовнішні лінки (`target=_blank`) мають `rel="noopener"`
- [ ] Креди не передаються у query-string URL
- [ ] HTTPS скрізь; немає mixed content

### B5. Доступність (a11y, axe WCAG 2 A/AA)
- [ ] `npm run audit:total` — немає critical-порушень на публічних роутах
- [ ] Зібрані всі рівні (serious/moderate/minor) у звіт
- [ ] Інтерактивні елементи доступні з клавіатури, фокус видимий
- [ ] Контраст тексту відповідає AA

### B6. Перформанс / мережа
- [ ] Console errors = 0 на кожному роуті
- [ ] Uncaught pageerror = 0
- [ ] Немає неочікуваних 4xx/5xx у мережевих запитах
- [ ] (Опц.) Lighthouse: Performance / Best Practices / SEO нотатки
