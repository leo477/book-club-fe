# План: book-club-mobile — React Native (Expo) застосунок для iOS + Android

> Статус: затверджений план, імплементація ще не почата (2026-07-15).
> Реалізація фаз — окремими задачами. Виконавці: MCP-агенти `react-native-dev` (каркас/екрани), `react-native-tester` (тести), `python-backend-dev` (правка бекенду), `react-native-reviewer` (рев'ю), `react-native-release` (збірки/публікація).

## Context

Нативний мобільний застосунок book-club для iOS та Android — міграція функціоналу Angular-вебзастосунку (`book-club-fe`) на React Native проти наявного FastAPI-бекенду (`book-club-be`, prod `https://book-club-be.onrender.com/api/v1`). Новий проєкт: **`/home/dmytr/angular/book-club-mobile`**.

Узгоджені рішення:
- Поетапна міграція: Фаза 1 = MVP (auth + клуби + події + профіль), Фаза 2 = чат, Фаза 3 = решта.
- Google OAuth у Фазі 1 (потрібна одна мала зміна на бекенді — handoff-механізм уже готовий).
- Стек: Expo SDK (latest) + New Architecture, TypeScript strict, expo-router (typed routes), Zustand + TanStack Query, react-native-reanimated, @shopify/flash-list, expo-image, react-hook-form + zod, expo-secure-store, react-native-mmkv, i18next + expo-localization.
- **Білд-таргет: expo-dev-client з першого дня** (не Expo Go) — MMKV це нативний JSI-модуль, недоступний в Expo Go; dev client все одно знадобиться для Sentry/maps. Запуск: `npx expo run:android` / `run:ios`, далі `npx expo start --dev-client`.

---

## 1. Каркас (scaffold)

```bash
cd /home/dmytr/angular
npx create-expo-app@latest book-club-mobile --template default   # TS + expo-router + tabs
cd book-club-mobile
npm run reset-project   # прибрати приклади, видалити app-example/

npx expo install expo-dev-client expo-secure-store expo-web-browser expo-linking \
  expo-image expo-localization expo-image-picker react-native-mmkv \
  @shopify/flash-list react-native-reanimated react-native-gesture-handler

npm i @tanstack/react-query @tanstack/react-query-persist-client \
  @tanstack/query-sync-storage-persister zustand react-hook-form zod \
  @hookform/resolvers i18next react-i18next

npm i -D jest jest-expo @testing-library/react-native @types/jest prettier
npx expo lint   # scaffold eslint.config.js (flat, eslint-config-expo)
```

**app.config.ts** (конвертувати з app.json): `name: "Book Club"`, `slug: "book-club-mobile"`, **`scheme: "bookclub"`** (deep links), `newArchEnabled: true`, `ios.bundleIdentifier` / `android.package`: `com.bookclub.app`, `userInterfaceStyle: "automatic"`, `experiments.typedRoutes: true`, plugins: expo-router, expo-secure-store, expo-localization, expo-image-picker.

**Env** (EXPO_PUBLIC_*, читати через zod у `src/lib/env.ts`, fail-fast):
- `.env.development`: `EXPO_PUBLIC_API_URL=http://<LAN-IP>:8000/api/v1` (Android emulator: `http://10.0.2.2:8000/api/v1`)
- `.env.production`: `EXPO_PUBLIC_API_URL=https://book-club-be.onrender.com/api/v1`
- Мобільний клієнт використовує **абсолютний** URL (веб сидить за Vercel-proxy `/api/v1` — на мобільному цього немає).

**tsconfig**: extends expo/tsconfig.base, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, paths `@/* → ./src/*`. **jest.config.js**: preset jest-expo, `jest.setup.ts` з in-memory моками expo-secure-store та react-native-mmkv.

## 2. Структура проєкту

```
book-club-mobile/
├── app/
│   ├── _layout.tsx                  # Root: QueryClientProvider+persister, ThemeProvider, i18n, auth bootstrap gate
│   ├── (auth)/ _layout.tsx (redirect → (app) якщо залогінений), login.tsx, register.tsx
│   ├── auth/callback.tsx            # OAuth deep-link fallback (парсить ?code=)
│   ├── (app)/
│   │   ├── _layout.tsx              # guard: redirect → (auth)/login без сесії
│   │   ├── (tabs)/ _layout.tsx      # Таби: Events / Clubs / Chats / Profile
│   │   │   ├── events.tsx  clubs.tsx  chats.tsx (Фаза 1: EmptyState-заглушка)  profile.tsx
│   │   ├── events/[id].tsx
│   │   ├── clubs/[id]/index.tsx
│   │   └── profile/ edit.tsx  settings.tsx
│   └── +not-found.tsx
├── src/
│   ├── api/ client.ts  errors.ts  auth.api.ts  users.api.ts  clubs.api.ts  events.api.ts  members.api.ts
│   ├── models/ user.ts  club.ts  event.ts  book.ts        # порт 1:1 з book-club-fe/src/app/core/models/
│   ├── features/ auth/  clubs/  events/  profile/          # hooks + компоненти доменів
│   ├── components/ui/   # дизайн-система, §7
│   ├── stores/ auth.store.ts  toast.store.ts               # Zustand
│   ├── lib/ env.ts  storage.ts (MMKV)  secure-tokens.ts  query-client.ts  query-keys.ts  query-persister.ts
│   ├── i18n/ index.ts  locales/{en,uk}.json                # СКОПІЮВАТИ з book-club-fe/public/i18n/ (~765 ключів, {{param}} сумісний з i18next)
│   └── theme/ tokens.ts  index.tsx                         # light/dark токени з палітри веб-версії + Appearance + MMKV override
```

Таби Events / Clubs / Chats / Profile віддзеркалюють головну навігацію веб-шелла; лендинг = Events (як `'' → events` на вебі).

## 3. Базова інфраструктура

### 3.1 API-клієнт `src/api/client.ts` — дзеркалить `book-club-fe/src/app/core/interceptors/auth.interceptor.ts`
- Типізований `request<T>(path, {method, body, query, signal, suppressErrorToast?, skipAuth?})` над fetch; FormData passthrough для upload.
- Bearer з auth.store (Bearer звільнений від CSRF-перевірки на бекенді, куки не потрібні).
- Таймаути через AbortController: **15s GET / 30s мутації** (значення з interceptor'а) → `TimeoutError` з i18n-ключем.
- **503 retry рівно один раз** (~3s пауза) — Render cold start; інші статуси не ретраїти.
- **401 → single-flight refresh**: спільний `refreshPromise`; `POST /auth/refresh` з `{refreshToken}` (body-флоу), збереження ротованих токенів, повтор оригінального запиту один раз; конкурентні 401 чекають той самий проміс (бекенд ротує refresh-токени — це обов'язково). Провал refresh → очистити токени, статус `unauthenticated` → guard-layout редіректить на login.
- Нормалізація помилок: `ApiError {status, detail, translationKey}` з тим самим мапінгом статус→ключ (`ERRORS.*`); toast за замовчуванням, suppressible.

### 3.2 Токени — `src/lib/secure-tokens.ts`
expo-secure-store: `bc.accessToken` / `bc.refreshToken`. Access дублюється в Zustand для синхронного attach. Токени ніколи не потрапляють в MMKV/query-кеш.

### 3.3 Auth store + bootstrap
Zustand `{status: 'restoring'|'authenticated'|'unauthenticated', user, accessToken}`. Bootstrap за splash-скріном: refresh-токен є → `POST /auth/refresh` → `GET /auth/me`; інакше unauthenticated. Guards = group-layouts. Role-гейтинг (organizer) — перевірка `user.role` на екрані (актуально з Фази 3).

### 3.4 TanStack Query
Фабрика ключів `src/lib/query-keys.ts` (`keys.clubs.list(filters)`, `.detail(id)`, `.myMembership(id)`, `keys.events.*`, `keys.users.*`). Defaults: `staleTime 60_000`, `retry: false` (ретраї робить клієнт). Персистенція: sync-storage-persister над MMKV, `maxAge` 24h, buster-рядок; очищення кешу при signOut. NetInfo у Фазі 1 не потрібен.

### 3.5 Тема і 3.6 i18n
Токени light/dark з палітри веба; `useColorScheme()` + користувацький override `'system'|'light'|'dark'` в MMKV (паритет з theme.service.ts). Стилі — plain StyleSheet + токени, без styling-бібліотек. i18next: resources = скопійовані en/uk JSON, `fallbackLng: 'en'`, початкова мова = MMKV else `expo-localization`.

## 4. Google OAuth (мобільний флоу)

### Зміна на бекенді (єдина, `book-club-be`)
Handoff-механізм уже працює (origin allowlist → `bc_fe_origin` cookie → `/callback` 302 на `{origin}/auth/callback?code=<одноразовий код, Redis TTL 60s>` → `POST /oauth/exchange` повертає токени в body). Блокує лише allowlist:
1. `app/config.py`: `MOBILE_APP_SCHEME: str = "bookclub"`.
2. `app/routers/auth.py` → `_resolve_frontend_origin` (рядки ~56–70): додатково приймати origin, якщо `parsed.scheme == settings.MOBILE_APP_SCHEME`.
3. Тест: `bookclub://auth` резолвиться; `evil://x`, `https://evil.com` — ні.

### Флоу в застосунку (`src/features/auth/useGoogleOAuth.ts`)
1. `WebBrowser.openAuthSessionAsync(`${apiUrl}/auth/oauth/google?origin=bookclub://auth`, 'bookclub://auth')`.
2. success → парсити `code` з URL; немає code / dismiss → локалізований toast помилки.
3. `POST /auth/oauth/exchange {code}` (обміняти негайно — TTL 60s) → `GET /auth/me` → `authStore.signIn`.
4. Fallback: `app/auth/callback.tsx` через `useLocalSearchParams()` — Android intent / cold start.

## 5. Фаза 1 — екрани (MVP)

Порядок: дизайн-система → інфраструктура (client/stores/i18n/theme) → auth → таби.

| Екран | Route-файл | Замінює (Angular) | Хуки (API) |
|---|---|---|---|
| Login | `app/(auth)/login.tsx` | features/auth/login | `useLoginMutation` (POST /auth/login), `useGoogleOAuth` |
| Register | `app/(auth)/register.tsx` | features/auth/register | `useRegisterMutation` (POST /auth/register), RHF+zod |
| OAuth callback | `app/auth/callback.tsx` | features/auth/oauth-callback | `useOAuthExchangeMutation` |
| Events feed | `app/(app)/(tabs)/events.tsx` | events-feed | `useEventsQuery` (GET /events), `useMyEventsQuery` (GET /events/my); FlashList + pull-to-refresh + EmptyState |
| Event detail | `app/(app)/events/[id].tsx` | event-detail | `useEventQuery`, `useAttendMutation` / `useUnattendMutation` (POST/DELETE /events/{id}/attend, оптимістично, інвалідація detail+list); EventCountdown, OpenInMapsButton |
| Clubs list | `app/(app)/(tabs)/clubs.tsx` | clubs-list | `useClubsQuery` (GET /clubs), `useMyClubsQuery` (GET /clubs/my); пошук + фільтр міста (клієнтський, як на вебі) |
| Club detail | `app/(app)/clubs/[id]/index.tsx` | club-detail (header/info/members/events; book-vote і manage — пізніше) | `useClubQuery`, `useClubEventsQuery`, `useMyMembershipQuery` (GET /clubs/{id}/my-membership), `useJoinClubMutation` / `useLeaveClubMutation` |
| Profile | `app/(app)/(tabs)/profile.tsx` | profile (read) | `useMeQuery` (GET /users/me), `useMyStatsQuery` (GET /users/me/stats); StatsGrid, socials, Badge ролі |
| Profile edit | `app/(app)/profile/edit.tsx` | profile (edit) | `useUpdateProfileMutation` (PATCH /users/me), `useUpdateRoleMutation`, `useUpdateSocialsMutation`, `useUpdateSocialsVisibilityMutation` |
| Settings | `app/(app)/profile/settings.tsx` | шелл: тема/мова/logout | Тема, мова, logout, privacy/terms (зовнішні URL через expo-web-browser) |
| Chats stub | `app/(app)/(tabs)/chats.tsx` | — | EmptyState "скоро" (структура табів не змінюється у Фазі 2) |

Моделі: порт `user/club/event/book` (API вже camelCase, копіювати інтерфейси as-is).

**Верифіковано**: `PATCH /users/me` приймає лише `displayName` (`book-club-be/app/schemas/users.py`), avatar-upload endpoint'а немає (`/upload/cover` — для обкладинок). Фаза 1: аватар read-only (заповнюється Google OAuth); окремий бек-таск на майбутнє.

## 6. Фази 2–3 (скоуп, детальне планування пізніше)

**Фаза 2 — чат**: список кімнат у табі Chats (REST), екран `app/(app)/chats/[roomId].tsx` (inverted FlashList); WS-клієнт: `POST /auth/ws-ticket` (TTL 60s, брати безпосередньо перед connect) → `wss://…/api/v1/chat/rooms/{id}` → перший фрейм `{type:'auth', ticket}`; обробка `message`/`presence`/`presence_snapshot`, відправка `{text}`; reconnect з backoff + свіжий тикет; AppState background/foreground; unread → бейдж таба; злиття WS-повідомлень у query-кеш.

**Фаза 3**: квізи (list/create/edit/preview/session/take/leaderboard); book-vote на club detail; randomizer; support board; organizer-функції (create/edit club/event з book search + geocode autocomplete + `POST /upload/cover` через expo-image-picker; club manage: members/join-requests/bans/ролі; pause/cancel/reschedule; stats); react-native-maps; Sentry; push-нотифікації (окремий скоуп).

## 7. Дизайн-система `src/components/ui/` (будується першою)

Screen (SafeArea + scroll + keyboard-avoiding), Text (варіанти), Button (primary/secondary/destructive/ghost + loading), Input (label + error, RHF-friendly), Card, Avatar (expo-image + ініціали-fallback), Badge, Sheet (Modal bottom sheet + reanimated), Toast (toast.store + host у root layout), EmptyState, Spinner. Це заміна використовуваних Spartan-ng примітивів. Web-only речі НЕ портуються: SEO/meta/sitemap, Vercel proxy/analytics, Trusted Types/DOMPurify, View Transitions.

## 8. Тести та верифікація

**Unit (jest-expo)**: `client.test.ts` — Bearer attach; N конкурентних 401 → рівно один refresh і повтор усіх; провал refresh чистить сесію; 503 ретраїться один раз, 500 — ні; таймаут → TimeoutError. `auth.store.test.ts` — bootstrap-шляхи, signOut чистить SecureStore. Zod-схеми форм.
**RNTL (3 екрани)**: Login (валідація, сабміт, toast помилки), Clubs list (рендер, пошук, empty state), Event detail (RSVP toggle оптимістично).

**Ручна верифікація** (Android emulator dev client; iOS за наявності):
1. `npx expo run:android`, `.env.development` → локальний бекенд (uvicorn у book-club-be).
2. Register → автологін → таб Events; kill/relaunch → сесія відновлена через refresh.
3. Google OAuth повне коло (потрібна зміна §4 + Redis).
4. Clubs: список/пошук/detail/join/leave. Events: feed/detail/RSVP on-off/Open in Maps.
5. Profile: stats, редагування displayName/ролі/соцмереж зберігається.
6. Dark mode + українська — усе перекладено/затемлено.
7. Прод-бекенд: cold-start 503 retry відпрацьовує.

**Done для Фази 1**: всі екрани §5 працюють проти прод-бекенду на Android (iOS smoke), сесія переживає рестарт, обидва методи входу працюють, `tsc --noEmit` + lint + тести зелені.

## 9. Ризики / відкриті питання

- **Карти**: у Фазі 1 без мапи — адреса + "Open in Maps" (`Linking.openURL`; iOS `maps://?q=`, Android `geo:lat,lng?q=`). `GET /config/maps-key` віддає Google **JS**-ключ, непридатний для нативних SDK; react-native-maps → Фаза 3 (окремі платформні ключі + rebuild).
- **Avatar upload**: endpoint'а немає — read-only у Фазі 1, бек-таск пізніше (`avatarUrl` в UpdateProfileRequest + `/upload/avatar`).
- **Render cold start**: 503 ~15s → один retry + видимий стан "retrying".
- **OAuth на емуляторі**: потрібен AVD з браузером (Google-APIs image); deep-link fallback route покриває примхи Custom Tabs.
- **Ротація refresh-токенів**: single-flight обов'язковий — покрито unit-тестом на конкурентність.
- **i18n-дрейф**: ключі копіюються, не шаряться — прийнятно зараз, спільний пакет пізніше.

## Ключові файли-джерела
- `book-club-fe/src/app/core/interceptors/auth.interceptor.ts` — точна семантика таймаутів/503/refresh
- `book-club-be/app/routers/auth.py` — `_resolve_frontend_origin` (єдина правка бекенду) + контракт handoff
- `book-club-fe/src/app/core/models/` — моделі для порту
- `book-club-fe/public/i18n/{en,uk}.json` — копіюються as-is
- `book-club-fe/src/app/app.routes.ts` (+ clubs/events routes) — авторитетний перелік екранів і guard'ів
