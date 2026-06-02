import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary', 'html'],
      reportsDirectory: 'coverage/book-club-fe',
      exclude: [
        'src/test-setup.ts',
        'src/app/shared/spartan/**',
        '**/*.spec.ts',
      ],
    },
  },
});
