import 'client-only';
import type { Api } from '@book-club/api-client';
import { translateError } from './error-translator';
import { showToast } from './toast';

export { setErrorTranslator } from './error-translator';

// The client, its zod schemas and every endpoint module load on the first call instead of in every page's first-load JS.
const loadApi = () => import('./api-impl').then((m) => m.api);

// Not importable from @book-club/api-client without pulling zod into first load.
const NETWORK_ERROR_KEY = 'ERRORS.network';

let pending: Promise<Api> | null = null;

const getApi = async (): Promise<Api> => {
  pending ??= loadApi().catch(async () => {
    try {
      return await loadApi();
    } catch (error) {
      pending = null;
      showToast('error', translateError(NETWORK_ERROR_KEY));
      throw error;
    }
  });
  return pending;
};

// Keys a runtime probes on any value (await, JSON.stringify, React, test matchers); a function here would be mistaken for a thenable or element.
const PROBED = new Set(['then', 'toJSON', '$$typeof', 'asymmetricMatch']);

type Call = (...args: unknown[]) => Promise<unknown>;

const modules = new Map<string, object>();

const lazyModule = (name: string): object => {
  const cached = modules.get(name);
  if (cached) return cached;
  const proxy = new Proxy(
    {},
    {
      get:
        (_target, method) =>
        (typeof method !== 'string' || PROBED.has(method)
          ? undefined
          : (async (...args) => {
              const target = (await getApi())[name as keyof Api] as unknown as Record<string, Call | undefined>;
              const fn = target?.[method];
              if (typeof fn !== 'function') throw new Error(`api.${name}.${method} is not a function`);
              return fn(...args);
            }) satisfies Call),
    },
  );
  modules.set(name, proxy);
  return proxy;
};

export const api = new Proxy({} as Api, {
  get: (_target, name) => (typeof name !== 'string' || PROBED.has(name) ? undefined : lazyModule(name)),
});
