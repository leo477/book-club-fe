import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      exclude: ['src/test-setup.ts'],
    },
  },
});
