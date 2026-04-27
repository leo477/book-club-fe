# Refactor Opus — Angular 20 Book-Club FE

> Раунди R1–R6. Кожен завершується `npm run lint && npm run test && npm run build` + git commit.

---

## R1 — RxJS Antipattern Cleanup

**Мета:** Ліквідувати останні `subscribe()` без cleanup та архаїчний `OnInit/OnDestroy + destroy$`.

**Scope:**
- `src/app/layout/header/header.component.ts:51` — `translate.use(next).subscribe()` → `firstValueFrom`
- `src/app/shared/components/address-autocomplete/address-autocomplete.component.ts` — `OnInit/OnDestroy + Subject<void> destroy$` + ручний `valueChanges.subscribe()` → `toSignal()` + `takeUntilDestroyed`

**Агент:** general-purpose

**Acceptance:**
- 0 `subscribe()` без cleanup у scope-файлах
- `lint` clean, `test` 53/53, ручна перевірка autocomplete + lang switch

---

## R2 — Decomposition of Large Files

**Мета:** Жоден файл не перевищує 180 LOC (TS) / 220 LOC (HTML).

**Scope:**
- `src/app/shared/components/book-intro/book-intro.component.ts` (297 LOC) → split presentational + container
- `src/app/features/clubs/club-detail/club-detail.component.ts` (258 LOC) → `ClubMembershipActionsService` або inline-actions component
- `src/app/features/clubs/club-detail/club-detail.component.html` (301 LOC) → `ClubHeaderComponent`, `ClubInfoCardComponent`
- `src/app/core/services/club.service.ts` (252 LOC) → `ClubReadService` (queries) + `ClubMembershipService` (mutations)

**Агент:** Plan → general-purpose

**Acceptance:**
- Жоден файл >180 LOC TS / >220 LOC HTML
- Всі тести зелені, lint clean

---

## R3 — Angular 20 Modernization: httpResource / linkedSignal

**Мета:** Використати Angular 20 `httpResource()`, `linkedSignal`, `resource()` замість manual Promise/subscribe HTTP-патернів.

**Scope:**
- `src/app/core/auth/auth.service.ts` — розширити `resource()` → `linkedSignal` для derived stats
- Quiz / Club / Event сервіси — замінити manual signal+Promise на `resource()` де доречно
- Перейти на `httpResource()` для HTTP queries без side-effects

**Агент:** Explore → Plan → general-purpose

**Acceptance:**
- Сервіси без ручного `.subscribe()` для HTTP
- Всі тести проходять, lint clean

---

## R4 — Performance: @defer + NgOptimizedImage + track audit

**Мета:** Зменшити initial bundle, прискорити рендеринг важких компонентів.

**Scope:**
- `@defer` блоки для `quiz-take`, `club-detail`, `randomizer`
- Замінити `<img loading="lazy">` → `NgOptimizedImage`
- Audit `@for` — замінити `track $index` → `track item.id` де є стабільний ключ

**Агент:** general-purpose

**Acceptance:**
- `npm run build` — initial bundle ≤ поточному
- lint clean, всі тести зелені

---

## R5 — Test Coverage Bump

**Мета:** Coverage functions ≥ 75%.

**Компоненти без тестів (14):** `profile`, `randomizer`, `quiz-create`, `quiz-take`, `quiz-list`, `chat-widget`, `social-link-field`, `cover-upload`, `social-badges`, `book-intro`, `qr-code`, `role-selector`, `profile-stats`
**Сервіси без тестів (2):** `book-cover.service`, `upload.service`

Мінімум: smoke-тест (component creates) + 1 інтеграційний сценарій.

**Агент:** general-purpose

**Acceptance:**
- Coverage functions ≥ 75%
- Всі тести зелені

---

## R6 — Polish & Dedup

**Мета:** 0 lint warnings, усунення дрібних дублювань.

**Scope:**
- Barrel-export для spartan/helm: `src/app/shared/spartan/index.ts`
- Dedupe `ApiUserSocials` ↔ `UserSocials` у `core/api/api-mappers.ts`
- Видалити inline `style="font-family:..."` у `club-detail.html`
- `.nonNullable` для всіх FormControl де передбачається non-null
- Виправити `rxjs-x/finnish notation` warnings у `auth.guard.ts` / `auth.interceptor.ts`

**Агент:** general-purpose

**Acceptance:**
- 0 `npm run lint` warnings
- ≤10 LOC дельта на файл
- Всі тести зелені
