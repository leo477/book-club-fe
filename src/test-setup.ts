/**
 * Global test setup for Vitest.
 * Provides browser API stubs that jsdom does not implement.
 */

// matchMedia stub — required by ThemeService; vi.fn() satisfies no-empty-function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(false),
  }),
});
