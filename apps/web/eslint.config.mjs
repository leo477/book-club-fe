import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { react: { version: '19.2.3' } } },
  {
    ignores: ['**/*.test.{ts,tsx}', 'src/test-support/**', 'src/test/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ regex: '(^@/|/)test-support(/|$)', message: 'test-support is for tests only' }] },
      ],
    },
  },
  globalIgnores(['.next/**', 'coverage/**', 'next-env.d.ts', 'src/components/ui/**']),
]);
