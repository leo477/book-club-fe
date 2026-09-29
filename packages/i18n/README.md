# @book-club/i18n

Converts the Angular i18n JSON (`../../public/i18n/{en,uk}.json`, read via the relative path `../../../public/i18n` from `src/` and `test/`) into ICU MessageFormat.

- `dist/` is generated and gitignored: build it before anything imports `@book-club/i18n/*.icu.json`:
  `npm run build -w @book-club/i18n` (`npm test` runs it automatically via `pretest`).
- Moving or renaming `public/i18n` breaks this package.
- `overrides/{en,uk}.json` add keys missing from the frozen source (currently the uk `few`/`other` forms of `QUIZ.create_questions_count`). Overrides never replace source keys; the build warns when the source gains a key, and the tests fail. Delete the override entry then.
