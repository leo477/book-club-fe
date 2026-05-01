# Spartan UI Migration Plan — book-club-fe

## Контекст

Проект Angular 20 з 37 компонентами, власною Tailwind design system (primary/accent токени) і нульовою залежністю від UI-бібліотек. Мета: мігрувати на Spartan UI (@spartan-ng/brain + @spartan-ng/helm) поетапно, зберігши кастомні дизайн-токени та всю Angular 20 Signals логіку.

---

## Структура виконання

Кожен раунд виконується окремою сесією MCP агента. Агент отримує конкретне завдання, після завершення — reviewer перевіряє. Паралельні раунди запускаються одночасно.

### Доступні агенти

| Агент | Модель | Роль у міграції |
|-------|--------|----------------|
| `dev` | claude-sonnet-4-6 | Основна імплементація — Angular 20, Spartan, форми |
| `ui` | claude-haiku-4-5-20251001 | Стилізація, CVA variants, дизайн-токени |
| `reviewer` | claude-haiku-4-5-20251001 | Перевірка коду після кожного раунду |
| `tester` | claude-haiku-4-5-20251001 | Jest-тести для мігрованих компонентів |
| `security` | claude-sonnet-4-6 | Аудит після завершення міграції |

---

## Round 0 — Setup & Infrastructure
**Агент:** `dev`
**Паралельно:** ні (блокуючий)
**Орієнтовно:** 3–4 год

### Завдання
1. Встановити залежності:
   ```bash
   npm install @spartan-ng/brain @spartan-ng/helm @angular/cdk class-variance-authority
   ```
2. Оновити `tailwind.config.ts` — додати Spartan content paths та CSS variables:
   ```ts
   content: [..., './node_modules/@spartan-ng/**/*.{js,mjs}']
   ```
3. Додати Spartan CSS variables до `src/styles.scss`:
   - Змапити `--primary` → `--color-primary` (sky-600)
   - Змапити `--accent` → `--color-accent` (purple-600)
   - Зберегти кастомні `--color-bg`, `--color-surface`, `--color-text`
4. Перевірити `app.config.ts` — `provideZonelessChangeDetection()` вже є, нічого додавати
5. Створити `src/app/shared/spartan/` — директорія для перевикористовуваних hlm-обгорток

### Файли
- `tailwind.config.ts`
- `src/styles.scss`
- `src/app/shared/spartan/` (нова директорія)

### Перевірка
```bash
npm run build  # без помилок
npm run lint   # без попереджень
```

---

## Round 1 — Базові shared компоненти (паралельно: 1A + 1B)
**Паралельно:** Round 1A і Round 1B запускаються одночасно після Round 0

---

### Round 1A — Form primitives
**Агент:** `dev`
**Орієнтовно:** 4–5 год

#### Компоненти
- `form-field` → `HlmFormFieldComponent` + `HlmInputDirective`
- `social-link-field` → `HlmInputDirective` + `HlmLabelDirective`

#### Патерн
```typescript
import { HlmFormFieldComponent, HlmInputDirective, HlmLabelDirective, HlmErrorDirective } from '@spartan-ng/helm/form-field';

@Component({
  imports: [HlmFormFieldComponent, HlmInputDirective, HlmLabelDirective, HlmErrorDirective],
  template: `
    <hlm-form-field>
      <label hlmLabel>{{ label() }}</label>
      <input hlmInput [type]="type()" [formControl]="control()" />
      <hlm-error *ngIf="control().invalid">{{ errorMessage() }}</hlm-error>
    </hlm-form-field>
  `
})
```

#### Файли
- `src/app/shared/components/form-field/form-field.component.ts`
- `src/app/shared/components/social-link-field/social-link-field.component.ts`

---

### Round 1B — Feedback компоненти
**Агент:** `ui`
**Орієнтовно:** 3–4 год

#### Компоненти
- `loading-spinner` → `HlmSpinnerComponent`
- `toast` → `HlmToasterComponent` + `toast()` service
- `empty-state` → `HlmCardComponent` + content slots

#### Патерн для toast
```typescript
import { toast } from '@spartan-ng/helm/sonner';
toast.success('Клуб створено');
toast.error('Помилка збереження');
```

#### Файли
- `src/app/shared/components/loading-spinner/loading-spinner.component.ts`
- `src/app/shared/components/toast/toast.component.ts`
- `src/app/shared/components/empty-state/empty-state.component.ts`

---

### Round 1 Review
**Агент:** `reviewer`
- Перевірити що `input()` / `output()` використовуються скрізь (не `@Input/@Output`)
- Перевірити що дизайн-токени `primary-*` / `accent-*` збережені
- `npm run lint && npm run test`

---

## Round 2 — Button система та Badge
**Агент:** `ui`
**Паралельно:** після Round 1
**Орієнтовно:** 3–4 год

### Завдання
1. Створити `src/app/shared/spartan/button/` — hlm-button з CVA variants:
   ```typescript
   const buttonVariants = cva(
     'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
     {
       variants: {
         variant: {
           default: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
           accent:  'bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500',
           outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
           ghost:   'hover:bg-gray-100 text-gray-600',
           danger:  'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
         },
         size: {
           sm:  'px-3 py-1.5 text-sm',
           md:  'px-4 py-2 text-sm',
           lg:  'px-6 py-3 text-base',
           fab: 'w-14 h-14 rounded-full',
         }
       },
       defaultVariants: { variant: 'default', size: 'md' }
     }
   );
   ```
2. Замінити `social-badges` компонент на `HlmBadgeDirective`

### Файли
- `src/app/shared/spartan/button/hlm-button.directive.ts` (новий)
- `src/app/shared/components/social-badges/social-badges.component.ts`

### Перевірка
- Візуально пройти всі сторінки в браузері (light + dark mode)

---

## Round 3 — Auth форми
**Агент:** `dev`
**Паралельно:** після Round 2
**Орієнтовно:** 5–6 год

### Компоненти
- `login.component.ts` (201 рядок → очікувано ~120)
- `register.component.ts` (226 рядків → очікувано ~140)

### Завдання
1. Замінити всі `<input>` на `hlmInput` directive
2. Замінити кнопки на `hlmBtn` directive з variants
3. Зберегти кастомну анімацію `form-slide-in` (inline `<style>` або SCSS)
4. Password strength bar — залишити кастомним (немає аналога в Spartan)
5. `role-selector` у register — залишити кастомним grid

### Файли
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/register/register.component.ts`

### Review
**Агент:** `reviewer`
- Перевірити reactive forms + `HlmErrorDirective` для валідації
- Перевірити password confirmation validator

---

## Round 4 — Club та Event форми (паралельно: 4A + 4B)

---

### Round 4A — Club forms
**Агент:** `dev`
**Орієнтовно:** 5–6 год

#### Компоненти
- `create-club.component.ts` (159 рядків)
- `edit-club.component.ts` (168 рядків)
- `cover-upload.component.ts` — залишити кастомним, лише кнопки через `hlmBtn`

#### Завдання
- Всі `<input>`, `<textarea>` → `hlmInput`
- `<select>` для city-фільтра → `HlmSelectComponent` + `BrnSelectComponent`
- Кнопки → `hlmBtn`

---

### Round 4B — Event forms
**Агент:** `dev`
**Орієнтовно:** 4–5 год

#### Компоненти
- `create-event.component.ts` (162 рядки)
- `event-card.component.ts` (98 рядків) → `HlmCardComponent`
- `club-card.component.ts` (74 рядки) → `HlmCardComponent`

#### Завдання
- Картки → `hlm-card`, `hlm-card-header`, `hlm-card-content`
- Додати `HlmBadgeDirective` для статус-бейджів подій

---

### Round 4 Review
**Агент:** `reviewer` + `tester`
- Jest-тести для form validation
- `npm run test`

---

## Round 5 — Navigation та Tabs
**Агент:** `dev`
**Паралельно:** після Round 4
**Орієнтовно:** 6–8 год

### Компоненти
- `header.component.ts` (356 рядків → очікувано ~220)
- `clubs-list.component.ts` — Tabs
- `events-feed.component.ts` — Tabs

### Завдання Header
1. User dropdown → `BrnMenuTriggerDirective` + `HlmMenuComponent`
2. Mobile hamburger → `BrnSheetComponent` + `HlmSheetComponent`
3. Language switcher — залишити кастомним (2 кнопки, не потребує CDK)

```typescript
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmMenuComponent, HlmMenuItemDirective } from '@spartan-ng/helm/menu';
```

### Завдання Tabs
```typescript
import { BrnTabsComponent, BrnTabsTriggerDirective, BrnTabsContentDirective } from '@spartan-ng/brain/tabs';
import { HlmTabsComponent, HlmTabsListComponent, HlmTabsTriggerDirective } from '@spartan-ng/helm/tabs';
```

### Файли
- `src/app/layout/header/header.component.ts`
- `src/app/features/clubs/clubs-list/clubs-list.component.ts`
- `src/app/features/events/events-feed/events-feed.component.ts`

---

## Round 6 — Quiz Wizard
**Агент:** `dev`
**Паралельно:** після Round 4
**Орієнтовно:** 6–8 год

### Компоненти
- `quiz-create.component.ts` (297 рядків) — 2-step wizard
- `quiz-list.component.ts` (160 рядків)

### Завдання
1. Quiz wizard — Spartan не має wizard, використати власний step-логіку через `signal<number>`
2. Dynamic question list → `HlmCardComponent` для кожного питання
3. Radio buttons для відповідей → `BrnRadioGroupComponent` + `HlmRadioGroupComponent`
4. Tabs для статусів (active/draft) → `BrnTabsComponent`

### Важливо
Wizard логіка залишається кастомною — лише стилізація через Spartan primitives.

---

## Round 7 — Складні custom компоненти
**Агент:** `dev` + `ui`
**Паралельно:** після Round 5
**Орієнтовно:** 6–8 год

### Компоненти та підхід

| Компонент | Підхід |
|-----------|--------|
| `chat-widget` | FAB → `hlmBtn` variant=fab; side panel — **залишити кастомним** |
| `randomizer` | Spin анімація — **залишити кастомною**; кнопка → `hlmBtn` |
| `address-autocomplete` | Перевірити `BrnComboboxComponent`; якщо не підтримує async Google Places — залишити кастомним |
| `qr-code` | `HlmCardComponent` як обгортка |
| `profile` | Форма → `hlmInput` + `hlmBtn` |

---

## Round 8 — Club Detail (найскладніший)
**Агент:** `dev`
**Паралельно:** після Round 5
**Орієнтовно:** 6–8 год

### Компонент
- `club-detail.component.ts` (298 рядків) — 3-column layout

### Завдання
1. Tabs (members/events/quiz) → `BrnTabsComponent`
2. Confirm dialog для leave/delete → `BrnDialogComponent` + `HlmDialogComponent`
3. Member cards → `HlmCardComponent`
4. Кнопки дій → `hlmBtn` variants
5. 3-column CSS grid — **залишити кастомним** (Spartan не надає layout primitives)

---

## Round 9 — Final Review & Audit
**Агент:** `reviewer` + `tester` + `security`
**Паралельно:** після всіх попередніх раундів
**Орієнтовно:** 4–5 год

### reviewer
- [ ] Весь код використовує Angular 20 Signals API (`input()`, `output()`, `viewChild()`)
- [ ] Немає `@Input` / `@Output` декораторів у нових файлах
- [ ] Дизайн-токени `primary-*` / `accent-*` збережені скрізь
- [ ] Немає змішаних підходів (Spartan + старий кастомний) в одному компоненті

### tester
- [ ] Jest unit tests для всіх form components
- [ ] `npm run test` — всі тести проходять
- [ ] Перевірити keyboard navigation у tabs, dropdown, dialog

### security
- [ ] Аудит нових CDK overlay компонентів (focus trap, ARIA)
- [ ] XSS перевірка для `address-autocomplete` (Google Places input)

---

## Критичні файли для міграції

```
src/
├── styles.scss                          # Round 0: CSS variables
├── tailwind.config.ts                   # Round 0: content paths
├── app/
│   ├── shared/
│   │   ├── spartan/                     # Round 0: нова директорія
│   │   │   └── button/hlm-button.directive.ts  # Round 2
│   │   └── components/
│   │       ├── form-field/              # Round 1A
│   │       ├── loading-spinner/         # Round 1B
│   │       ├── toast/                   # Round 1B
│   │       ├── empty-state/             # Round 1B
│   │       └── social-badges/           # Round 2
│   ├── layout/
│   │   └── header/                      # Round 5
│   └── features/
│       ├── auth/login/ register/        # Round 3
│       ├── clubs/create/ edit/ detail/  # Round 4A, 8
│       ├── events/create/ feed/         # Round 4B, 5
│       ├── quiz/create/ list/           # Round 6
│       └── profile/                     # Round 7
```

---

## Хронологія

```
Round 0  ──────────────────────────────── Setup (блокуючий)
Round 1A ───────────┐
Round 1B ───────────┤ паралельно після Round 0
                    └── Round 1 Review
Round 2  ────────────────────────────────── після Round 1
Round 3  ────────────────────────────────── після Round 2
Round 4A ───────────┐
Round 4B ───────────┤ паралельно після Round 3
                    └── Round 4 Review
Round 5  ───────────┐
Round 6  ───────────┤ паралельно після Round 4
Round 7  ───────────┘
Round 8  ────────────────────────────────── після Round 5
Round 9  ────────────────────────────────── після всіх (фінальний аудит)
```

---

## Загальна оцінка

| Метрика | Значення |
|---------|----------|
| Раундів | 9 (+ 2 паралельні групи) |
| Агент-сесій | ~14 |
| Загальний час | **117–160 год** |
| Компонентів залишаться кастомними | chat-widget, randomizer, wizard-логіка, 3-col layout |
| Очікуване скорочення шаблонів | ~40–55% у простих компонентах |

---

## Що НЕ мігрується (залишається кастомним)

- `chat-widget` — FAB + sliding panel (немає Spartan аналога)
- `randomizer` — spin анімація
- Quiz wizard step-логіка
- 3-column layout у `club-detail`
- Password strength bar у `register`
- Language switcher у `header`
- `address-autocomplete` — якщо `BrnComboboxComponent` не підтримує async Google Places API
