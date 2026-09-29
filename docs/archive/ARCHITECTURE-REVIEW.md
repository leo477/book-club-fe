# Architecture Review — book-club-fe (Angular 21)

**Дата:** 2026-06-15
**Скоуп:** структура проєкту, межі модулів, шар сервісів/стану, DI/бутстрап, тестова дисципліна, гігієна репо.
**Метод:** статичний аналіз дерева, grep по напрямах залежностей, читання ключових файлів (`app.config.ts`, `core/*`, `tsconfig`).
**Парний документ:** бекенд — `ARCHITECTURE-REVIEW.md` у репо `book-club-be`.

## Загальний вердикт: **9 / 10**
Практично взірцева Angular 21-структура. Чистий поділ `core / shared / features / layout`, строго односторонній напрям залежностей, сучасний zoneless-бутстрап, доменні сервіси на сигналах і висока тестова дисципліна. Зауваження — дрібні.

---

## Структура
```
src/app/
├── core/       (53 ts)  api/ · auth/ · interceptors/ · models/ · services/
├── shared/     (108 ts) components/ · pipes/ · chat/ · spartan/ (vendored UI) · utils/
├── features/   (77 ts)  auth · clubs · events · quiz · profile · chats · randomizer · organizer-dashboard · privacy · terms · not-found
└── layout/     (6 ts)   shell · header · footer
```

## Сильні сторони
- **Межі модулів — ідеальні** (перевірено grep'ом):
  - **0** крос-імпортів між фічами (жодна фіча не імпортує іншу);
  - **0** імпортів `features/` з `core/`;
  - **0** імпортів `features/` з `shared/`.
  - Напрям залежностей строго односторонній: `features → core/shared`, ніколи навпаки. Це найскладніше втримати в живому проєкті — і воно тримається.
- **Сучасний `app.config.ts`:** `provideZonelessChangeDetection()`, `provideRouter` з `withComponentInputBinding()` + `withViewTransitions()` + `paramsInheritanceStrategy: 'always'`, кастомний `TitleStrategy` (`OgTitleStrategy`), функціональний `authInterceptor`, три `provideAppInitializer` (i18n → auth → maps). Жодного NgModule.
- **Доменний сервісний шар:** один сервіс на домен (`club/event/quiz/chat/book-*/geocoding/...`), стан на сигналах; компоненти переважно не звертаються до HTTP напряму.
- **Тестова дисципліна:** майже кожен сервіс має `.spec` (≈30 специв у `core/services`), плюс e2e/axe-аудити (`e2e/`, `playwright.*.config.ts`).
- **Гігієна репо:** локально в корені багато PNG-скрінів і scratch-доків, але **всі вони в `.gitignore`** (`/*.png`, `/coverage`, `/test-results`, `/playwright-report`, `refactor_opus.md`, `spartan_plan.md`…) — у git не потрапляють.

---

## Зауваження
| # | Severity | Що | Де | Рекомендація |
|---|---|---|---|---|
| FE-1 | Low | 2 компоненти інжектять `HttpClient` напряму повз сервісний шар | `features/events/event-detail`, `features/events/edit-event` | винести виклики у `EventService` для єдиної точки доступу + кешування/обробки помилок |
| FE-2 | Low | Немає кастомного `ErrorHandler` (лише `provideBrowserGlobalErrorListeners()` + тости інтерсептора) | `app.config.ts` | додати `ErrorHandler`, що логуватиме в Sentry/аналітику |
| FE-3 | Nit | 1 файл із залишеним `console.log/debug` у src | `src/app` | прибрати або замінити на logger |
| FE-4 | Nit | `shared/book-stores` за змістом ближче до фічі, ніж до shared-примітиву | `shared/book-stores` | оцінити перенесення у `features/` |
| FE-5 | Info | spartan-UI вендорнуто з глибоким `src/lib`-нестингом (≈основна маса з 108 ts у shared) | `shared/spartan/*` | свідомий shadcn-подібний патерн; ОК, лише роздуває `shared/` — за бажання винести в окремий `ui/` сегмент |

---

## Висновок
Архітектурно фронт не потребує втручання. Перелічені пункти — косметика й мікро-узгодження (FE-1/FE-2 варті уваги для єдиної моделі доступу до даних і логування). Основний борг проєкту — **не у фронті, а в бекенді** (див. парний документ: мертвий шар репозиторіїв + «товсті» роутери).
