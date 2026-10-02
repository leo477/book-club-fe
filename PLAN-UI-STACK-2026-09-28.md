# План: UI-стек book-club-fe — Spartan vs pure Angular vs React (2026-09-28)

> Статус: рішення + план. Аналіз read-only, вихідний код не змінювався.
> Виконавці: MCP-агенти `dev`, `ui`, `tester`, `reviewer`, `devops`.

## 1. Рішення

**Варіант A — лишаємось на Spartan, але «володіємо» ним**: helm-шар уже згенерований у репо (`src/app/shared/spartan`, ~2.2k рядків), тому залежність від апстріму зводиться до `@spartan-ng/brain` (headless-примітиви з a11y). Закриваємо її за фасадами (toast, алiаси імпортів), вирізаємо мертвий код, фіксуємо версії, вмикаємо a11y-регресію. Варіант B лишається як **тригерний** план (раунд 4), варіант C — відхилено.

## 2. Факти з коду (перевірено)

Уточнення до вхідних цифр: «73 файли / 47× helm/utils» — це переважно **сам згенерований шар**; фічевий код залежить від Spartan значно менше.

| Метрика | Значення |
|---|---|
| Non-spec `.ts` / `.html` у `src` | 203 / 60 (app-код без spartan: ~10.4k рядків TS, ~6.4k рядків HTML) |
| Згенерований helm (`src/app/shared/spartan`) | 14 компонентів, ~2 184 рядки; виключений з lint-правил, Vitest coverage і Sonar |
| Імпорти `@spartan-ng/*` всередині helm | helm/utils 47 (функція `hlm()` = clsx+twMerge + `classes()` з глобальним MutationObserver), brain/sheet 7, tabs 6, field 4, core 4, dialog/button/input/label/separator/sonner по 1 |
| Фічеві файли з прямим `@spartan-ng/brain/sonner` (`toast`) | **14** non-spec (core/services, interceptors, guards, error handler, 8 компонентів) |
| Фічеві файли з helm через відносні шляхи `../../shared/spartan/*/src` | **36** (button 27, spinner 12, card 12, input 11, field 6, tabs 2, icon 2, badge 2, sheet/sonner/separator 1) |
| Використання в шаблонах | hlmBtn 89, hlm-field-error 62, hlm-field 50, hlmInput 48, hlmFieldLabel 25, hlm-spinner 22, hlmCard* 17, tabs 18 (2 екрани: club-detail, club-manage), sheet 16 (1 екран: header-mobile-sheet) |
| Мертвий код | `dropdown-menu` (15 файлів, 464 рядки) — не використовується у фічах |
| Аліаси `@spartan-ng/helm/*` у tsconfig | вже налаштовані, але фічі ними не користуються |
| `@spartan-ng/cli` | лежить у `dependencies` (має бути devDependency) |

**Churn**: апгрейд `0.0.1-alpha.716 → 1.5.0` (PR #146/#149) коштував 1 рядок (`hlm-sheet-close.ts`, прибраний `delay` input, коміт c94ea68). Після 1.x API стабілізувався — ризик churn низький, але brain peer-dep `@angular/* <23` → при переході на Angular 23 чекаємо сумісний реліз.

**Бандл** (свіжий `dist`, prod): initial ≈ 580 KB raw / ≈ 181 KB gzip (budget warning 750 KB). Sonner-чанк 45 KB raw / 11.8 KB gzip — найважчий шматок Spartan; brain tree-shake-иться по entry points, тож sheet/tabs/field — одиниці KB. Заміна Spartan дасть економію ≤ ~15 KB gzip — не аргумент.

**A11y**: brain дає focus-trap + aria для sheet (dialog), roving tabindex для tabs, `aria-describedby`/`aria-invalid` зв'язку для field-error. Саме це — основна вартість відмови від Spartan. У `e2e/audit-helper.ts` є AxeBuilder — можна покрити ці екрани.

## 3. Порівняння варіантів

| | A: Spartan (owned) | B: pure Angular + CDK | C: React |
|---|---|---|---|
| Вартість, person-days | **2–4** | 8–12 | 50–80 (+ SSR/Next.js ще 5–10) |
| Обсяг змін | ~50 файлів, механічно | 36 фічевих файлів + ~1.5k рядків власних примітивів | повний rewrite ~60 компонентів, сервісів, guard-ів, i18n, тестів (Vitest→RTL), e2e стабільні |
| A11y ризик | низький (лишається brain) | середній: переписати focus-trap/tabs/field aria на CDK | високий на період переписування |
| Регрес/заморозка фіч | ні | 1–2 тижні часткової | 2–4 місяці |
| Шаринг з RN (Expo) | через окремий TS-пакет контрактів | те саме | лише хуки/TanStack Query/zod; UI (react-dom + Tailwind) у RN **не переноситься** |

**Чому не C**: RN не рендерить DOM/Tailwind — спільним між web і mobile може бути лише не-UI шар (типи API, zod-схеми, i18n JSON, API-клієнт), а це досяжно framework-agnostic TS-пакетом без переписування web. Виграш C для мобільного ~10–15% його обсягу проти 50–80 pd rewrite. SEO/SSR можна отримати через Angular SSR (вже відкладено, окремий трек).

**Чому не B зараз**: платимо 8–12 pd за переписування a11y-примітивів, які вже працюють і стабільні з 1.x, з мінімальним виграшем у бандлі. B має сенс лише за тригерів (див. раунд 4).

## 4. Фазований план

### Раунд 1 — Ізоляція brain та гігієна залежностей (`dev`, `reviewer`) — ~1 pd
- Створити `src/app/core/services/toast.service.ts` (фасад `success/error/info/promise` над `toast` з brain/sonner); замінити прямі імпорти в 14 файлах: `core/error/global-error-handler.ts`, `core/auth/role.guard.ts`, `core/services/{chat,support}.service.ts`, `core/interceptors/auth.interceptor.ts`, `shared/chat/chat-widget/chat-widget.component.ts`, `features/events/{events-feed,event-detail}`, `features/clubs/{club-detail,club-detail/book-vote,edit-club,club-manage}`, `features/profile/profile.component.ts`, `features/auth/oauth-callback`; оновити specs, що мокають `@spartan-ng/brain/sonner`.
- `eslint.config.js`: `no-restricted-imports` для `@spartan-ng/brain/*` поза `src/app/shared/spartan/**` і `toast.service.ts`.
- Видалити `src/app/shared/spartan/dropdown-menu` + шлях у `tsconfig.json`; прибрати згадку з `core/security/trusted-types-policy.ts`.
- `package.json`: `@spartan-ng/cli` → devDependencies; `@spartan-ng/brain` → точна версія `1.5.0`.
- **Приймання**: `npm run lint`, `npm run test:ci`, `npm run build` зелені; `grep -r "@spartan-ng/brain" src --exclude-dir=spartan` → лише toast.service; тости працюють (login error, role guard).
- **Rollback**: `git revert` PR (зміни ізольовані, без міграцій даних).

### Раунд 2 — Уніфікація імпортів і тести на helm-логіку (`dev`, `tester`) — ~1 pd
- Замінити відносні `../../shared/spartan/<x>/src` на аліаси `@spartan-ng/helm/<x>` у 36 файлах (механічно).
- Оцінити `utils` `classes()` (глобальний MutationObserver): залишити, якщо profiling не показує проблем; інакше спростити до `host: { '[class]': computed(hlm(...)) }` у тих, що мають логіку.
- `tester`: Playwright + axe (через `e2e/audit-helper.ts`) для header-mobile-sheet (focus-trap, Esc, повернення фокусу), tabs у club-detail/club-manage (стрілки, aria-selected), форм з hlm-field-error (aria-invalid/describedby). Юніт-смоук для `toast.service`.
- **Приймання**: 0 відносних імпортів `shared/spartan` поза самим шаром; axe без serious/critical на цих екранах; e2e зелені.
- **Rollback**: revert PR; a11y-тести лишити (вони незалежні).

### Раунд 3 — Контроль апгрейдів (`devops`, `reviewer`) — ~0.5 pd
- Dependabot: окрема група `@spartan-ng/*` з label `ui-stack`, без automerge; обов'язковий прогін e2e a11y з раунду 2 у CI для цих PR.
- CI: перевірка bundle budget (initial 750 KB warn) як required check; зафіксувати поточний baseline (~181 KB gzip).
- Короткий runbook у `docs/`: апгрейд brain → `npx @spartan-ng/cli` regenerate diff → ручний merge у `src/app/shared/spartan`.
- **Приймання**: тестовий Dependabot PR запускає a11y-e2e; budget-check блокує регрес.
- **Rollback**: revert workflow/конфіг.

### Раунд 4 (тригерний, B-lite) — Власні примітиви (`ui`, `dev`, `tester`, `reviewer`) — 3–6 pd
Запускати лише якщо: brain не підтримує новий мажор Angular > 4 тижнів, **або** апгрейд ламає > 5 файлів, **або** потрібен кастом, який brain блокує.
- Крок 1 (без ризику a11y): button/input/label/separator/badge/card/spinner → власні директиви в `src/app/shared/ui/` з тим самим селектором `hlm*` (шаблони не змінюються).
- Крок 2: toast → власний `ToastService` + компонент на CDK Overlay + `LiveAnnouncer` (фасад з раунду 1 робить заміну однофайловою).
- Крок 3: tabs → `@angular/cdk/a11y` (`FocusKeyManager`); sheet → `@angular/cdk/dialog`; field → власні директиви з `aria-describedby`.
- **Приймання**: ті самі axe/e2e з раунду 2 зелені; `@spartan-ng/*` видалено з package.json; бандл не більший за baseline.
- **Rollback**: покроково по PR; селектори збережені, тож revert будь-якого кроку не зачіпає фічі.

## 5. Трек шарингу з мобільним (незалежно від UI-ліби)
Коли стартує `book-club-mobile`: винести framework-agnostic шар (типи API з `src/app/core/models`, zod-схеми валідації, ключі i18n з `public/i18n/*.json`) у спільний пакет (npm workspace або git submodule). Це дає реальну частку реюзу, яку React-міграція web не збільшує.

## 6. Ризики
- brain peer-dep `@angular/* <23` — блокер апгрейду Angular до виходу сумісного релізу (мітигація: раунд 3 + тригер раунду 4).
- helm-шар виключений з coverage/Sonar — локальні правки в ньому не тестуються (мітигація: смоук/a11y тести раунду 2).
- `classes()` з глобальним MutationObserver — потенційний perf-ризик на довгих списках (перевірка в раунді 2).
