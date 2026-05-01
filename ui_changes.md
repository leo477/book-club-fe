# UI Changes Plan: Bento Grid + Glassmorphism Redesign

## Context

Проєкт book-club-fe (Angular 20) потребує повного редизайну під **Bento Grid** та **Glassmorphism** стилістику.
Паралельно є два активних баги:

1. **Порожня сторінка при старті** — замість `/login` відкривається пустий shell
2. **Стилі не застосовуються** — елементи відображаються без стилів після останнього апгрейду

**Мета:** Сучасний, консистентний UI з Bento Grid розмітками на всіх сторінках та glassmorphism-картками/формами, без регресій у функціональності.

---

## Поточний стан (аудит)

### Баги (до редизайну — Round 0)

**Порожня сторінка:** `app.routes.ts:21` — `path: ''` завантажує `ShellComponent` **без гарда**. Дочірній редирект `'' → 'clubs'` (рядок 46) запускає `authGuard` асинхронно, тому користувач бачить порожній shell (~200–500ms) до редиректу на `/login`.

**Стилі зникли:** `styles.scss` та `postcss.config.mjs` налаштовані правильно (`@import "tailwindcss"` + `@tailwindcss/postcss`). Ймовірна причина — зіпсований PostCSS/Vite кеш або зміна у `vite.config.ts`. Потребує діагностики при старті Round 0.

### Що вже є (не ламати)
- Glassmorphism частково: `backdrop-blur-md`, `bg-white/85` у auth + header
- CSS Grid на clubs-list (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Design tokens у `@theme` (primary sky-blue, accent purple) у `styles.scss:5–34`
- Spartan UI (HLM) компоненти: button, card, input, field, badge, sheet, spinner у `src/app/shared/spartan/`
- Dark mode через `.dark` CSS змінні у `styles.scss:65–90`

---

## MCP Агенти

| Агент | Модель | Роль у плані |
|-------|--------|--------------|
| **dev** | claude-sonnet-4-6 | Основна реалізація Angular — routing, компоненти, логіка |
| **ui** | claude-haiku-4-5-20251001 | HTML/CSS редизайн, Bento Grid верстка, glassmorphism стилі |
| **reviewer** | claude-haiku-4-5-20251001 | Code review перед кожним комітом, перевірка регресій |
| **tester** | claude-haiku-4-5-20251001 | Візуальна регресія, перевірка стилів після кожного раунду |

---

## Раунди

---

### Round 0 — Hotfix: Баги (пріоритет №1)

**Ціль:** Виправити обидва баги до початку редизайну.

**Агенти:** `dev`

#### Задача 0.1 — Порожня сторінка

**Файл:** `src/app/app.routes.ts`

**Фікс:** Додати `canActivate: [authGuard]` на кореневий маршрут ShellComponent (рядок 20–22):

```typescript
{
  path: '',
  component: ShellComponent,
  canActivate: [authGuard],   // ← додати
  children: [ ... ]
}
```

Це змусить `authGuard` спрацювати **до** рендеру ShellComponent — user одразу отримає redirect на `/login`.

**Перевірка:** Відкрити `http://localhost:4200/` без токену → має одразу редиректити на `/login` без порожнього флешу.

#### Задача 0.2 — Діагностика стилів

**Агент:** `dev`

**Кроки:**
1. `rm -rf .angular/cache node_modules/.cache` — очистити Vite/Angular кеш
2. `npm start` — перевірити чи завантажуються стилі
3. Якщо не допомогло — перевірити `vite.config.ts` на наявність кастомних postcss налаштувань що конфліктують з `postcss.config.mjs`
4. Перевірити чи `@import "tailwindcss"` у `styles.scss:1` генерує CSS у DevTools (Network → styles.scss)

**Можливі причини:**
- Конфлікт між `postcss.config.mjs` та `vite.config.ts` (якщо там є вбудований postcss)
- `angular.json` не вказує на правильний `styles.scss` (перевірити рядки 32–34)
- `@spartan-ng/brain/hlm-tailwind-preset.css` файл не існує після апгрейду (перевірити `node_modules/@spartan-ng/brain/`)

---

### Round 1 — Design Tokens + Global Foundation

**Ціль:** Встановити глобальну дизайн-систему для Bento Grid + Glassmorphism.

**Агенти:** `ui` (верстка), `dev` (TypeScript утиліти)

#### Задача 1.1 — Glassmorphism токени у styles.scss

**Файл:** `src/styles.scss`

Додати у `@theme` блок (після рядка 34):

```scss
@theme {
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-bg-strong: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.20);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --glass-blur: blur(12px);
  --glass-blur-strong: blur(20px);

  /* Bento Grid spacing */
  --bento-gap: 1rem;
  --bento-gap-lg: 1.5rem;
  --bento-radius: 1.25rem;
  --bento-radius-lg: 1.75rem;
}
```

#### Задача 1.2 — Reusable Tailwind utility classes

**Файл:** `src/styles.scss` (додати після design tokens)

```scss
@layer utilities {
  /* Glassmorphism card */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--bento-radius);
    box-shadow: var(--glass-shadow);
  }

  .glass-card-strong {
    background: var(--glass-bg-strong);
    backdrop-filter: var(--glass-blur-strong);
    -webkit-backdrop-filter: var(--glass-blur-strong);
    border: 1px solid var(--glass-border);
    border-radius: var(--bento-radius-lg);
    box-shadow: var(--glass-shadow);
  }

  /* Bento grid layouts */
  .bento-grid {
    display: grid;
    gap: var(--bento-gap);
    grid-template-columns: repeat(4, 1fr);
  }

  .bento-grid-3 {
    display: grid;
    gap: var(--bento-gap);
    grid-template-columns: repeat(3, 1fr);
  }

  /* Bento cell sizes */
  .bento-span-2 { grid-column: span 2; }
  .bento-span-3 { grid-column: span 3; }
  .bento-span-row-2 { grid-row: span 2; }

  /* Glass input */
  .glass-input {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(4px);
  }
}
```

#### Задача 1.3 — Dark mode glassmorphism

У `.dark` блок (`styles.scss:65`) додати override для glass:

```scss
.dark {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-bg-strong: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.40);
}
```

#### Задача 1.4 — HLM Card override

**Файл:** `src/app/shared/spartan/ui-card-helm/src/lib/hlm-card.directive.ts`

Переглянути поточні класи HlmCard, додати variant `glass` через CVA або просто оновити базові класи щоб вони включали `rounded-[var(--bento-radius)]`.

**Перевірка R1:** `npm start` → перевірити у DevTools що `.glass-card` та `.bento-grid` класи доступні.

---

### Round 2 — Clubs: Bento Grid (найбільший impact)

**Ціль:** Clubs List та Club Detail — основні сторінки користувача.

**Агенти:** `dev` (логіка), `ui` (HTML/CSS шаблони)

#### Задача 2.1 — Clubs List: Bento Grid розмітка

**Файл:** `src/app/features/clubs/clubs-list/clubs-list.component.html`

**Поточно:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` — однакові карточки.

**Нове:** Перша карточка (featured) займає `span 2` (ширша), решта — стандартні. На мобайлі — linear stack.

```html
<!-- Hero section з glassmorphism -->
<section class="relative overflow-hidden min-h-[280px] rounded-[var(--bento-radius-lg)] glass-card-strong px-8 py-10 mb-6">
  <div class="absolute inset-0 bg-gradient-to-br from-primary-600/40 to-accent-600/40 -z-10"></div>
  <!-- search + title -->
</section>

<!-- Bento Grid -->
<div class="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <!-- Featured club (span 2) -->
  @if (clubs()[0]) {
    <div class="bento-span-2 bento-span-row-2">
      <app-club-card [club]="clubs()[0]" variant="featured" />
    </div>
  }
  <!-- Regular clubs -->
  @for (club of clubs().slice(1); track club.id) {
    <app-club-card [club]="club" />
  }
</div>
```

#### Задача 2.2 — ClubCardComponent: glassmorphism + featured variant

**Файл:** `src/app/features/clubs/clubs-list/club-card/club-card.component.ts`

Додати `@Input() variant: 'default' | 'featured' = 'default'`. У HTML:
- Default: `glass-card p-4 hover:scale-[1.02] transition-transform`
- Featured: `glass-card-strong p-6 flex flex-col justify-between` + більший текст заголовку

#### Задача 2.3 — Club Detail: Bento layout

**Файл:** `src/app/features/clubs/club-detail/club-detail.component.html`

**Поточно:** `flex flex-col lg:flex-row gap-6`

**Нове:** Справжній Bento Grid для desktop:

```
[ Book Cover + Info (span 2, row 2) ] [ Members (span 2) ]
                                       [ Schedule (span 2) ]
[ Description (span 4) ]
[ Upcoming Events — bento grid всередині (span 4) ]
```

- Всі секції отримують `glass-card` клас
- Hero: `glass-card-strong` з gradient overlay

#### Задача 2.4 — ClubEventCard: glassmorphism refinement

**Файл:** `src/app/features/clubs/club-detail/club-event-card/club-event-card.component.html` та `.scss`

Замінити `.parchment-card` на glassmorphism стиль (прибрати старий parchment ефект). Зберегти `@keyframes card-appear` анімацію — вона хороша.

**Перевірка R2:** Відкрити `/clubs` — перевірити що featured card ширша, всі карточки з glass ефектом, hover анімації працюють. Пройти в club detail.

---

### Round 3 — Events Feed: Bento по датах

**Ціль:** Events Feed з glassmorphism групуванням по датах.

**Агенти:** `ui` (розмітка), `dev` (логіка групування якщо треба змінювати)

#### Задача 3.1 — Events Feed layout

**Файл:** `src/app/features/events/events-feed/events-feed.component.html`

**Нове:** Кожна дата-група — окремий Bento Grid. Перший event у групі — featured (span 2), решта — стандартні.

- Фільтр міста: `glass-card` pill-стиль
- Date header: glassmorphism sticky pill `glass-card px-4 py-1.5 text-sm font-medium sticky top-20 z-10`

#### Задача 3.2 — EventCard: glassmorphism

**Файл:** `src/app/features/events/event-card/event-card.component.html`

Замінити поточні Tailwind класи на `glass-card` + hover ефект. Зберегти всю логіку.

**Перевірка R3:** Відкрити `/events` — перевірити групи по датах, featured event.

---

### Round 4 — Auth Forms: Glassmorphism Polish

**Ціль:** Login/Register — консистентний glassmorphism з backdrop.

**Агенти:** `ui`

#### Задача 4.1 — Login page

**Файл:** `src/app/features/auth/login/login.component.html`

**Поточно:** вже має `bg-white/85 backdrop-blur-md` — хороший старт.

**Нове:**
- Прибрати inline `<style>` блок — перенести в component SCSS файл (або Tailwind)
- Фон: `bg-gradient-to-br from-primary-900 via-accent-900 to-primary-800` + animated mesh
- Карточка: `glass-card-strong max-w-md w-full mx-auto`
- Inputs: `glass-input` клас
- Submit button: gradient `from-primary-500 to-accent-500`

#### Задача 4.2 — Register page

**Файл:** `src/app/features/auth/register/register.component.html`

Аналогічно до login — консистентний стиль.

**Перевірка R4:** Відкрити `/login` та `/register` — glassmorphism форма на темному gradient фоні.

---

### Round 5 — Profile: Bento Sections

**Ціль:** Profile page — секційний Bento Grid замість вертикального стека.

**Агенти:** `ui`, `dev`

#### Задача 5.1 — Profile layout

**Файл:** `src/app/features/profile/profile.component.html`

**Нове Bento Grid для desktop:**

```
[ Avatar + Name + Role (span 2, row 2) ] [ Stats (span 2) ]
                                          [ Social Links (span 2) ]
[ Edit Form (span 4) ]
```

- Кожна секція: `glass-card`
- Avatar: ring з `ring-2 ring-primary-400/50`

#### Задача 5.2 — Profile Stats

**Файл:** `src/app/features/profile/profile-stats/profile-stats.component.html`

Bento мікро-grid 2×2 для stats карточок (books read, clubs joined, events attended тощо).

**Перевірка R5:** Відкрити `/profile` — секції як bento, stats карточки.

---

### Round 6 — Secondary Pages + Shared

**Ціль:** Quiz, Randomizer, Shared компоненти — уніфікувати.

**Агенти:** `ui`

#### Задача 6.1 — Quiz List

**Файл:** `src/app/features/quiz/quiz-list/quiz-list.component.html`

Замінити `space-y-4` вертикальний стек на `bento-grid-3` — quiz карточки як bento cells.

#### Задача 6.2 — Shared компоненти

- `empty-state` → `glass-card` стиль
- `loading-spinner` → зберегти, але обгорнути у glass-overlay якщо використовується як page-level loader
- `form-field` → оновити border/focus стилі під glassmorphism (більш subtle)

#### Задача 6.3 — Header refinement

**Файл:** `src/app/layout/header/header.component.html`

Header вже має `backdrop-blur` — перевірити консистентність з рештою, можливо посилити `bg-white/10` → `glass-card` стиль.

**Перевірка R6:** Пройтись по всіх сторінках — візуальна консистентність.

---

### Round 7 — Review + Visual Regression

**Ціль:** Фінальна перевірка якості коду та відсутності регресій.

**Агенти:** `reviewer`, `tester`

#### Задача 7.1 — Code Review

**Агент:** `reviewer`

Перевірити всі змінені файли на:
- Відсутність inline styles (все у SCSS або Tailwind)
- Правильне використання `glass-card` / `bento-grid` класів
- Відсутність дублювання стилів
- Angular 20 best practices (OnPush, signals, standalone)

#### Задача 7.2 — Visual Regression Tests

**Агент:** `tester`

Playwright screenshots для кожної сторінки:
- `/login`, `/register`
- `/clubs`, `/clubs/:id`
- `/events`
- `/profile`

Порівняти до/після — зафіксувати як baseline для майбутніх змін.

#### Задача 7.3 — Unit Tests

**Агент:** `tester`

Запустити `npm run test` — всі 53 тести мають проходити (регресій не повинно бути, якщо тільки змінювались HTML/CSS).

---

## Критичні файли

| Файл | Зміни |
|------|-------|
| `src/styles.scss` | R1: glass/bento токени + utility classes |
| `src/app/app.routes.ts:20` | R0: додати `canActivate: [authGuard]` |
| `src/app/features/clubs/clubs-list/clubs-list.component.html` | R2: bento grid |
| `src/app/features/clubs/clubs-list/club-card/club-card.component.html` | R2: glassmorphism + featured variant |
| `src/app/features/clubs/club-detail/club-detail.component.html` | R2: bento layout |
| `src/app/features/clubs/club-detail/club-event-card/club-event-card.component.html` | R2: glass cards |
| `src/app/features/events/events-feed/events-feed.component.html` | R3: bento by date |
| `src/app/features/auth/login/login.component.html` | R4: glass form + move inline styles |
| `src/app/features/auth/register/register.component.html` | R4: glass form |
| `src/app/features/profile/profile.component.html` | R5: bento sections |
| `src/app/shared/spartan/ui-card-helm/` | R1: glass variant |

---

## Технічні обмеження

- **Tailwind v4**: немає `tailwind.config.ts` — конфіг через `@theme` у `styles.scss`. Кастомні утиліти через `@layer utilities`.
- **Spartan UI (HLM)**: HlmCard/HlmButton використовують CVA — розширювати через `className` input або додатковий variant, не переписувати базові компоненти.
- **OnPush**: всі компоненти з `ChangeDetectionStrategy.OnPush` — нові `@Input()` variants мають бути чистими значеннями.
- **Angular animations**: поточні SCSS `@keyframes` (card-appear, shimmer, winner-pop) — зберегти, не замінювати.
- **Dark mode**: всі нові glass стилі мають мати `.dark` override.

---

## Порядок виконання

```
Round 0 (Hotfix)   → Round 1 (Foundation) → Round 2 (Clubs)
     → Round 3 (Events) → Round 4 (Auth) → Round 5 (Profile)
          → Round 6 (Secondary) → Round 7 (Review)
```

Round 0 є блокуючим — без нього редизайн не починати (баги ускладнять тестування).
Round 1 є блокуючим для всіх наступних — design tokens мають бути визначені першими.
Round 2–6 можна частково паралелізувати (різні feature-директорії незалежні).
