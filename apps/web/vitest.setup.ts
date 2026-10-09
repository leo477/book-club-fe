import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom lacks the layout APIs Radix popper and cmdk call
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== 'undefined') globalThis.ResizeObserver ??= ResizeObserverStub;
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= () => {};
