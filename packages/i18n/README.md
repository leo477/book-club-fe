# @book-club/i18n

`locales/{en,uk}.json` are the source of truth for both apps: flat ICU MessageFormat (`"QUIZ.create_questions_count": "{count, plural, ...}"`).

- `apps/web` imports them as `@book-club/i18n/{en,uk}.icu.json`.
- The Angular app (until R14) loads ngx-translate JSON from `public/i18n/`, which is gitignored and generated from the locales by `npm run build:ngx -w @book-club/i18n` (root `prestart`/`prebuild`/`prewatch` run it). Never edit `public/i18n`.
- Add keys to both locale files; `test/icu.test.ts` enforces identical key sets and that the ngx output round-trips.
- `scripts/extract-i18n.mjs` (root) only adds missing Angular keys; it has no `--clean`.
