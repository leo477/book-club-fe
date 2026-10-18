import 'client-only';
import type { Api } from '@book-club/api-client';

export { setErrorTranslator } from './error-translator';

// The client, its zod schemas and every endpoint module load on the first call instead of in every page's first-load JS.
const loadApi = () => import('./api-impl').then((m) => m.api);

type Call = (...args: unknown[]) => Promise<unknown>;

const lazyModule = (name: string): object =>
  new Proxy(
    {},
    {
      get:
        (_target, method: string): Call =>
        async (...args) => {
          const target = (await loadApi())[name as keyof Api] as unknown as Record<string, Call>;
          return target[method]!(...args);
        },
    },
  );

export const api = new Proxy({} as Api, {
  get: (_target, name) => (typeof name === 'string' ? lazyModule(name) : undefined),
});
