# План рефактору фронтенду — 2026-07-06

Сеньйорський аудит Angular 21 фронтенду (`src/app`, 259 TS-файлів): безпека, коректність, best practices, антипатерни. Проведено двома профільними агентами (security + reviewer) з перехресною перевіркою проти `SECURITY.md`, `AUDIT-REPORT.md`, `ARCHITECTURE-REVIEW.md` — вже виправлені пункти не дублюються.

## Загальна оцінка

Кодова база **дуже чиста** для Angular 21: 71/72 компонентів на OnPush (98.6%), zoneless bootstrap, нуль legacy `@Input`/`@Output`, нуль `*ngIf`/`*ngFor` (100% `@if`/`@for` з `track`), нуль ручного Subject/BehaviorSubject-стейту, всі 15 `.subscribe()` з `takeUntilDestroyed`, точна en/uk парність i18n (681/681 ключів), `npm audit --omit=dev` — 0 вразливостей. Системних антипатернів немає — знахідки точкові.

**Реліз-блокери: 3** — витік токена (S-1), баг дати (C-1), mock-сервіс голосування (C-2).

---

## Фаза 1 — Безпека та критичні баги (блокери)

### S-1 [HIGH][S] Bearer-токен витікає на openlibrary.org
`src/app/core/interceptors/auth.interceptor.ts:137-140` чіпляє `Authorization: Bearer <token>` до **кожного** запиту без allowlist хостів, а `src/app/core/services/book-cover.service.ts:24-25` викликає `https://openlibrary.org/search.json` через той самий `HttpClient` → живий Supabase access token відлітає третій стороні при кожному пошуку обкладинки.
**Фікс:** позитивний allowlist в інтерсепторі — додавати заголовок лише якщо `req.url` відносний або починається з `environment.apiUrl`. Опційно: проксувати OpenLibrary через бекенд.

### C-1 [HIGH][S] UTC/local баг у редагуванні події (псування даних)
`src/app/features/events/edit-event/edit-event.component.ts:118`: `new Date(ev.date).toISOString().slice(0,16)` кладе **UTC** у `datetime-local`, а сабміт (рядок 185) трактує його як локальний час → кожне відкриття-збереження форми зсуває подію на 2–3 години (UTC+2/+3) назад, кумулятивно.
**Фікс:** формувати значення інпуту з локальних компонент дати (`getFullYear()…getMinutes()`, малий util `toDatetimeLocal()`). Додати spec — файл без тестів.

### C-2 [HIGH][S-M] BookVoteService — client-only заглушка під виглядом живої фічі
`src/app/core/services/book-vote.service.ts` — увесь стейт в in-memory signal, нуль HTTP: «голосування клубу» живе в одній вкладці і зникає при перезавантаженні. Користувач сприймає це як втрату даних.
**Фікс:** або підключити до бекенд-ендпоінта, або явно позначити як demo (feature flag / бейдж).

### S-2 [MED][S] Refresh token у localStorage
`src/app/core/auth/token.store.ts:30-40`: access token коректно в пам'яті, але refresh token (довгоживуча креденшл) — у `localStorage`, тобто ексфільтрується будь-яким XSS/шкідливою залежністю.
**Фікс:** httpOnly refresh cookie як універсальний шлях; localStorage лише як фолбек для мобільного OAuth-кейсу; переконатися в rotation + reuse detection на бекенді.

### S-3 [MED][S] Послабити CSP (`vercel.json:17`)
- Прибрати `'unsafe-hashes'` зі `script-src` (Angular-шаблонам не потрібен).
- Звузити `img-src` з wildcard `https:` до фактичних хостів: `'self' data: blob: https://covers.openlibrary.org https://maps.gstatic.com https://maps.googleapis.com`.
- Додати Trusted Types: `require-trusted-types-for 'script'; trusted-types angular`.
- Перевірити й прибрати невикористовувані origin'и з `connect-src` (`*.pusher.com`, `*.supabase.co` — SDK у `src` не знайдено).

---

## Фаза 2 — Коректність UX та обробка помилок

### E-1 [MED][XS] Реконект чат-сокета при рефреші токена — фікс застосований лише в одному з двох місць
`features/chats/chats.component.ts:96-99` читає токен через `untracked()` (з коментарем чому), але ідентичний effect у `shared/chat/chat-widget/chat-widget.component.ts:149-155` трекає `tokenStore.token()` напряму → глобально змонтований віджет рве/перевідкриває сокет на кожен рефреш токена. **Фікс:** той самий `untracked`.

### E-2 [MED][M] 401 → мовчазний refresh-retry замість logout
`auth.interceptor.ts:57-60`: 401 при наявному токені одразу чистить стор і кидає на `/login`, хоча refresh-механізм існує (`AuthService.restoreSession`, викликається лише на bootstrap). **Фікс:** на 401 — одна спроба рефрешу з guard'ом від конкурентних запитів, потім replay запиту; logout лише якщо рефреш провалився.

### E-3 [MED][S] Проковтнуті помилки user-дій → тост через існуючий `formatActionError`
- `event-detail.component.ts:132-160` — `onAttend` тостить лише 400; `onCancelAttend`/`onCancelEvent` без catch.
- `club-detail.component.ts:295-315, 393-413` — `handleKick`/`handleBan`/`onSetWinner` після rollback кидають `throw` у template handler → unhandled rejection без фідбека.
- `chat-widget.component.ts:232` — floating promise `createRoom`: при фейлі форма закривається як при успіху.
- `chat.service.ts:146,176,194,392,412,430` — 7 `.catch(console.error)`: всі чат-фейли невидимі користувачу.

### E-4 [LOW][S] Логування у prod-консоль
`core/error/global-error-handler.ts:13` — безумовний `console.error(error)`; всього 15 `console.*` у `src` (FE-3 з ARCHITECTURE-REVIEW казав 1 — кількість зросла). **Фікс:** гейтити на `isDevMode()`, у prod — тільки санітизована телеметрія (Vercel track вже є).

### E-5 [LOW][XS] `window.open` без валідації
`shared/book-stores/book-stores.component.ts:92`: `window.open(store.url, '_blank')` — додати перевірку `https://`-префікса і `'noopener,noreferrer'`.

---

## Фаза 3 — Архітектура та дедуплікація

### A-1 [MED][M] Дубльований chat-bootstrap у двох компонентах
Effects «load clubs → loadAllClubRooms» + «connect active room» скопійовані: `chat-widget.component.ts:131-166` і `chats.component.ts:68-105` (включно з однаковим прапорцем `_clubsLoadTriggered`). Віджет завжди у shell, тож візит на `/chats` виконує обидва → **дубльовані GET /clubs/{id}/chat/rooms**. **Фікс:** єдиний оркестратор (`ChatConnectionManager` або effects у `ChatService`) — робить E-1 структурним, а не точковим.

### A-2 [MED][L] Розділити ChatService (525 рядків, змішані відповідальності)
`core/services/chat.service.ts` = HTTP API + WS lifecycle/backoff + presence + unread + optimistic sends + AudioContext-біп + visibility→`ApplicationRef.tick()` хак. **Фікс:** `ChatApi` (HTTP, поряд з `core/api/api-mappers.ts`) + `ChatSocket` (WS/reconnect) + signal store. Розблоковує тестування reconnect-логіки.

### A-3 [LOW][S] N+1 запити unread counts
`chats.component.ts:87-92` перезапускає `fetchUnreadCounts` на кожну зміну `rooms` (включно з `_upsertRoom`), а `chat.service.ts:307-320` шле GET на кожну кімнату. **Фікс:** batch-ендпоінт `GET /chat/unread-counts?room_ids=…` (потребує бекенд) або diff-only фетч.

### A-4 [LOW][S] Дубльований optimistic-patch відвідуваності
`event.service.ts:207-216` та `club-detail.component.ts:415-437` — однаковий isAttending/±1 патч з rollback. **Фікс:** `linkedSignal` від сервісного per-club кешу подій — прибирає копію.

### A-5 [LOW][XS] Мертвий код (видалити, ~20 хв)
- `club-detail.component.ts:71-77` — `_lang` toSignal без читачів.
- `club-detail.component.ts:160-172` — `deleteCountdown` без використання в шаблоні (і нереактивний: `Date.now()` усередині `computed`); з ним падає останній консюмер `club.service.ts:392-397` `msUntilDeletion`.
- `club.service.ts:107-108` — стаби `myParticipatedClubs`/`myMissedClubs` (`computed(() => [])`).

### A-6 [LOW][M] Ручний resource-pipeline у club-detail
`club-detail.component.ts:174-255` — ~80 рядків params-triggered fetch + cancellation + loading/error signals руками, тоді як проєкт уже використовує `resource()` у 8 місцях. Не терміново (код коректний), але найбільше відхилення від власного ідіому.

---

## Фаза 4 — i18n, консистентність, тести

### I-1 [MED][M] Хардкод рядків повз ngx-translate
- `book-vote-section.component.html` — **весь шаблон** українською без `translate`, включно з ручною плюралізацією `'голос' : 'голосів'`; + `book-vote-section.component.ts:50`.
- `app.routes.ts:10-103` — статичні `title:` лише українською (перемкнувши EN, заголовки вкладок лишаються UA).
- `club-detail.component.ts:169-171` (`${hours} год ${minutes} хв`), `randomizer.service.ts:57,97`.
- Англійський бік: `edit-event.component.ts:200`, `edit-club.component.ts:100`, `club.service.ts:127,147`, `event.service.ts:112,125`.
**Фікс:** ключі `ERRORS.*`/`TITLES.*`, плюралізація через translate-параметри/ICU. (`privacy`/`terms` — юридичний UA-текст, чіпати лише якщо потрібна EN-версія.)

### Q-1 [LOW][XS] Точкова консистентність
- `shared/components/social-link-field` — єдиний компонент без OnPush (1 рядок).
- `chats.component.ts:39` — останній `@ViewChild` → `viewChild()`.
- Функції в шаблонах: `book-vote-section.component.html:92-176` `getPercent()` → у computed; `chats.component.html:66-67` grouping-прапорці → у `activeMessagesWithDivider`.
- Прямий доступ до глобалів (`theme.service.ts:18`, `language.service.ts:25`, `chat.service.ts:68-84`, `event-detail.component.ts:152` bare `confirm()`) → DI-токени / стилізований confirm-флоу як у chat-widget.

### T-1 [MED][M] Прогалини тестів (Vitest)
core — покритий повністю (єдина прогалина: `language.service.ts`); shared — майже (нема `event-rsvp-button`); features — 15/51 компонентів без spec. Пріоритетні: `edit-event` (містить C-1), `chats.component` (4 effects, WS), `oauth-callback` (auth-critical), `club-manage`, `organizer-dashboard/*`, `support/*`, `quiz-detail-base`, `leaderboard-base`.

---

## Верифіковано як безпечне (без дій)
- XSS: нуль `[innerHTML]`, `bypassSecurityTrust*`, `eval` у `src`; чат-повідомлення рендеряться інтерполяцією (авто-екранування).
- OAuth: `origin` валідується на бекенді за allowlist-регекспом; callback чистить `code` з URL/history; client-controlled `returnUrl` не приймається.
- `target="_blank"` лінки мають `rel="noopener noreferrer"`; динамічні `[href]` з фіксованим `https://` префіксом.
- Guards default-deny і чекають `isLoading`; WS-токен передається app-level фреймом, не в query string.
- `src/environments/*` — без секретів (Maps key видається бекендом у runtime); mock-server dev-only, у prod-білд не потрапляє; e2e-креденшли генеруються CSPRNG per-run.
- Роль `organizer` самопризначувана — це UX-розмежування, авторизація має бути (і за твердженням бекенд-коду є) на сервері; `admin` з клієнта не виставляється.

## Порядок виконання (рекомендація)

| Спринт | Пункти | Ефект |
|---|---|---|
| 1 (блокери) | S-1, C-1, E-1, A-5 | закритий витік токена, зупинене псування дат, стабільний чат-сокет |
| 2 | C-2, E-2, E-3, S-3, E-5 | немає «втрати» голосів, немає mid-session logout, видимі помилки, жорсткіший CSP |
| 3 | A-1, S-2, I-1, E-4 | єдиний chat-оркестратор, безпечніший refresh, повний i18n |
| 4 | A-2, A-3, A-4, A-6, Q-1, T-1 | розділений ChatService, специ для критичних потоків |

## Верифікація
- Після S-1: у DevTools/Network запит до `openlibrary.org` **без** `Authorization`; запити до `book-club-be.onrender.com` — з ним. Spec на інтерсептор: третій хост → без заголовка.
- Після C-1: spec на round-trip `date → datetime-local → date` у TZ Europe/Kyiv; вручну відкрити-зберегти подію двічі — час незмінний.
- Після E-1/A-1: на `/chats` — один GET rooms на клуб; при рефреші токена сокет не переривається (лог WS у DevTools).
- Після E-2: прострочити access token (або зменшити TTL) — запит повторюється після рефрешу без викиду на /login.
- Після S-3: сторінка працює без CSP-violation у консолі; обкладинки/мапи вантажаться.
- Загалом: `npm run lint`, `npm run test:ci`, e2e `npm run audit:current`; для чату — ручна перевірка двома вкладками.
