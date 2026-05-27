# План виправлень бага з аудиту 2026-05-25

Кожен пункт із `AUDIT-2026-05-25.md` зіставлено з MCP-агентом
(`mcp__book-club-agents__run_agent`). Виконувати **строго в порядку хвиль**:
бекенд → фронтенд → тести → ревʼю → деплой. У межах хвилі задачі незалежні.

---

## Хвиля 1. Бекенд (python-backend-dev)

> Чому першим: C1/H1/H3/H5 — корінь у FastAPI; фронту лікувати немає сенсу,
> поки не зафіксовано контракт.

### Виклик: `mcp__book-club-agents__run_agent` (agent=`python-backend-dev`)

#### B1. Полагодити WebSocket auth (C1)
**task:**
```
Fix WS handshake 403 on /chat/rooms/{room_id}?token=…
Repro: новостворений користувач відкриває чат клубу, у який щойно вступив; REST
GET /api/v1/chat/rooms/{id}/messages → 200, але WS upgrade → 403.
Гіпотези: (а) JWT валідація для WS вимагає інший claim/audience; (б) перевірка
членства читає stale-кеш і не бачить щойно доданого учасника.
DoD: WS відкривається для будь-якого члена кімнати; додати pytest
test_ws_room_membership_after_join, який спочатку POST /clubs/{id}/join, потім
WS connect — має бути 101 Switching Protocols.
```

#### B2. Розвʼязати звʼязок між "RSVP на подію" та "членство у клубі" (H1)
**task:**
```
Зараз POST /events/{id}/attend неявно робить користувача членом клубу. Треба
розділити: (1) залишити RSVP без сайд-ефекту членства, АБО (2) повертати
response, який чітко повідомляє про auto-join (поле auto_joined_club_id), щоб
фронт показав підтвердження. Узгодити з фронт-командою — за замовчуванням
варіант (1). Оновити OpenAPI та регресійні тести.
```

#### B3. Лічильники `/users/me/stats` (H3)
**task:**
```
Після /clubs/{id}/join значення clubs_joined у GET /users/me/stats залишається 0.
Перевірити: чи інкрементується clubs_joined у транзакції join, чи кешується
відповідь (Redis ETag?). Виправити, додати pytest, який після join очікує
clubs_joined==1.
```

#### B4. Чат-кімнати: дедуп + валідація + чистка (H5)
**task:**
```
У клубі Super Puper (id=efc6aa3b-…) є 10 кімнат "igor" + сміттєві "dd","fd",
"ikzgf". Потрібно:
- POST /clubs/{id}/chat/rooms: відхиляти duplicate name у межах клубу (409);
- min/max length для name (3..40);
- Alembic-міграція, що мерджить дублікати (за іменем у клубі) і видаляє
  кімнати без повідомлень останні 30 днів — лише в production-safe spike.
DoD: тести на 409 при дублі, тест на cleanup-міграцію.
```

---

## Хвиля 2. Фронтенд — функціональні баги (dev)

> Можна стартувати, як тільки B1–B3 змерджено (контракти не змінюються).

### Виклик: `mcp__book-club-agents__run_agent` (agent=`dev`)

#### F1. Organizer routing / UI (C2 + H4)
**task:**
```
Маршрут /manage сьогодні рендерить ClubsListComponent — заглушка. Потрібно:
1) Створити OrganizerDashboardComponent (Angular 21, standalone, signals,
   resource()): мої клуби з кнопками Edit/Delete/Manage members, кнопка
   "Створити клуб".
2) На сторінках /clubs та /events додати CTA "+ Новий клуб" / "+ Нова подія",
   видимі лише коли currentUser().role === 'organizer' (computed signal).
3) У header додати посилання "Керування" з guard'ом roleGuard('organizer').
4) Forms: ClubCreateDialog (Reactive Forms, валідація 3..50 для name).
DoD: маршрути /manage, /clubs/new, /events/new працюють, role-guard блокує
для readers; e2e тест у Playwright (логін як organizer → створити клуб).
```

#### F2. Фільтр "Мої події" (H2)
**task:**
```
Tab "Мої події" на /events показує "Немає подій", навіть коли користувач має
RSVP. Подивитись src/app/features/events/events-list — фільтр зараз бере
events із my-clubs. Замінити на GET /api/v1/events/my (attending=true). Якщо
endpoint відсутній — додати завдання беку. Оновити helper-текст empty-state.
```

#### F3. Кнопка "Надіслати" disabled (M5)
**task:**
```
У ChatWidget кнопка submit лишається [disabled] навіть коли в textarea є
текст. Перевірити computed(() => message().trim().length > 0). Імовірно
biding на formControl з updateOn:'blur' або забутий ngModel sync. Виправити
та додати unit-тест.
```

#### F4. Public landing та back-link (M2 + M3)
**task:**
```
- /login та /register: посилання "На головну" нікуди не веде для guest.
  Або сховати посилання для unauth, або зробити публічну /welcome.
- /privacy і /terms: "← Назад" завжди → /clubs. Замінити на location.back()
  з fallback на /events (auth) / /login (unauth).
```

---

## Хвиля 3. UI/UX / a11y / i18n (ui)

> Незалежно від хвилі 2 — можна паралелити з F1.

### Виклик: `mcp__book-club-agents__run_agent` (agent=`ui`)

#### U1. Уніфікувати RSVP-кнопку (M1)
**task:**
```
Один і той самий action має 4 різні підписи: "Участь" / "✓ Іду" / "✓ Йду" /
"✓ Іду · Скасувати". Винести в єдиний компонент <event-rsvp-button>, додати
ключі i18n events.rsvp.join / events.rsvp.attending / events.rsvp.cancel
(uk + en). Замінити всі call-sites.
```

#### U2. Два "Відкрити чат" на club detail (M4)
**task:**
```
На /clubs/:id видно одночасно inline-кнопку "Відкрити чат" у картці "Про клуб"
та глобальний FAB. Сховати FAB на маршрутах *Club detail* (роутер-aware),
залишити лише inline. Також FAB має ховатися, коли chat panel відкрита.
```

#### U3. Дубль-кнопки "Закрити чат" + a11y (M6)
**task:**
```
ChatPanel header містить дві кнопки з aria-label="Закрити чат". Видалити одну;
переконатись, що Escape закриває панель, focus повертається на trigger.
Перевірити з playwright snapshot, що тільки один button[aria-label="Закрити
чат"] у DOM.
```

#### U4. Локалізація фільтра міст (L1)
**task:**
```
/events: combobox "All cities"/"Kyiv" англійською в українському UI. Перевести
через ngx-translate (events.cities.all, events.cities.kyiv тощо) і прокинути
locale у backend-список або форматувати на клієнті.
```

#### U5. Cover/avatar клуба (L2)
**task:**
```
ClubCard без cover виглядає debug-данням. Додати дефолтний градієнт-плейсхолдер
з ініціалами клубу, як у avatar користувача. SCSS-only, без бекенду.
```

#### U6. Toast при збереженні соцмереж (L3)
**task:**
```
ProfileComponent → "Зберегти" не дає фідбеку. Підключити global ToastService
(SnackBar/Material або власний) — success "Збережено", error "Не вдалось…".
Поширити на "Зберегти імʼя", role-toggle.
```

---

## Хвиля 4. Тестування (tester)

### Виклик: `mcp__book-club-agents__run_agent` (agent=`tester`)

#### T1. Playwright-регресії на всі знайдені баги
**task:**
```
Створити e2e/audit-2026-05-25.spec.ts з тестами для кожного пункту C1..L3.
Фікстура: registerUser() — реєструє унікальний email, повертає token.
Перевірити: WS opens, RSVP не auto-joins club, /events?tab=my показує RSVP,
profile stats оновлюються, send-button enabled при тексті, єдина close-chat
кнопка, RSVP-label однаковий усюди.
```

---

## Хвиля 5. Code review (reviewer) → деплой (devops)

### R1. `mcp__book-club-agents__run_agent` (agent=`reviewer`)
**task:** `Review всіх PR з хвиль 1-4 перед merge у develop`

### D1. `mcp__book-club-agents__run_agent` (agent=`devops`)
**task:** `Зробити preview-deploy на Vercel для гілки fix/audit-bugs-2026-05; після merge у develop — продакшн deploy + smoke check '/login → /events'`

---

## Підсумкова таблиця

| ID | Issue | Severity | Agent | Хвиля |
| --- | --- | --- | --- | --- |
| B1 | C1 WS 403 | critical | python-backend-dev | 1 |
| B2 | H1 RSVP→join | high | python-backend-dev | 1 |
| B3 | H3 stats | high | python-backend-dev | 1 |
| B4 | H5 chat rooms | high | python-backend-dev | 1 |
| F1 | C2+H4 organizer | critical+high | dev | 2 |
| F2 | H2 my events | high | dev | 2 |
| F3 | M5 send disabled | medium | dev | 2 |
| F4 | M2+M3 back links | medium | dev | 2 |
| U1 | M1 RSVP label | medium | ui | 3 |
| U2 | M4 double chat btn | medium | ui | 3 |
| U3 | M6 close-chat dup | medium | ui | 3 |
| U4 | L1 cities i18n | low | ui | 3 |
| U5 | L2 club avatar | low | ui | 3 |
| U6 | L3 toast feedback | low | ui | 3 |
| T1 | regression suite | – | tester | 4 |
| R1 | code review | – | reviewer | 5 |
| D1 | deploy | – | devops | 5 |

**Скажіть «погнали» — і я почну з хвилі 1 (4 паралельні виклики python-backend-dev).**
