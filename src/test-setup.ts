/**
 * Global test setup for Vitest.
 * Provides browser API stubs that jsdom does not implement.
 */

// matchMedia stub — required by ThemeService
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
