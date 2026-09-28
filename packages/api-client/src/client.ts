import { authTokens, parse } from '@book-club/contracts';
import type { z } from 'zod';
import { BackendHttpError, ERROR_KEYS, RequestTimeoutError, extractBackendDetail, translationKeyForStatus } from './errors';
import type { ApiClientConfig, RequestOptions } from './types';

const GET_TIMEOUT_MS = 15_000;
const MUTATION_TIMEOUT_MS = 30_000;
const RETRY_503_DELAY_MS = 3_000;
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

interface RawResponse {
  status: number;
  ok: boolean;
  text: string;
}

export type ApiClient = ReturnType<typeof createApiClient>;

function buildUrl(baseUrl: string, path: string, query: RequestOptions['query']): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return `${baseUrl}${path}${qs ? `?${qs}` : ''}`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, transport, onUnauthenticated, onForbidden, onError } = config;
  const getTimeout = config.getTimeoutMs ?? GET_TIMEOUT_MS;
  const mutationTimeout = config.mutationTimeoutMs ?? MUTATION_TIMEOUT_MS;
  const retryDelay = config.retry503DelayMs ?? RETRY_503_DELAY_MS;
  const doFetch: typeof fetch = (input, init) => (config.fetch ?? globalThis.fetch)(input, init);

  let refreshInFlight: Promise<boolean> | null = null;

  async function once(
    method: string,
    path: string,
    options: RequestOptions,
    token: string | null,
    timeoutMs: number,
  ): Promise<RawResponse> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const onExternalAbort = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    options.signal?.addEventListener('abort', onExternalAbort);
    try {
      const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
      const headers: Record<string, string> = {};
      if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const init: RequestInit = { method, headers, signal: controller.signal };
      if (transport.credentials) init.credentials = transport.credentials;
      if (options.body !== undefined) init.body = isForm ? (options.body as FormData) : JSON.stringify(options.body);
      const res = await doFetch(buildUrl(baseUrl, path, options.query), init);
      return { status: res.status, ok: res.ok, text: await res.text() };
    } catch (err) {
      if (timedOut) throw new RequestTimeoutError();
      if (options.signal?.aborted) throw err;
      throw new BackendHttpError(0, null, ERROR_KEYS.network);
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onExternalAbort);
    }
  }

  // 503 means the request never reached app logic (Render cold start), so replaying any method is safe.
  async function attempt(
    method: string,
    path: string,
    options: RequestOptions,
    token: string | null,
    timeoutMs: number,
  ): Promise<RawResponse> {
    const first = await once(method, path, options, token, timeoutMs);
    if (first.status !== 503) return first;
    await sleep(retryDelay);
    return once(method, path, options, token, timeoutMs);
  }

  // Concurrent 401s share one refresh instead of racing the backend's refresh-token rotation.
  function refresh(): Promise<boolean> {
    refreshInFlight ??= (async () => {
      try {
        const body = await transport.getRefreshBody();
        if (!body) return false;
        const raw = await attempt('POST', '/auth/refresh', { body }, null, mutationTimeout);
        if (!raw.ok) return false;
        await transport.storeTokens(parse(authTokens, parseJson(raw.text), 'refresh response'));
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  }

  async function request(method: string, path: string, options: RequestOptions = {}): Promise<unknown> {
    const verb = method.toUpperCase();
    const timeoutMs = MUTATION_METHODS.has(verb) ? mutationTimeout : getTimeout;
    const skip = options.skipAuthRedirect === true;
    const suppress = options.suppressErrorToast === true;
    const report = (error: BackendHttpError | RequestTimeoutError) =>
      onError?.(error, { suppress, path, method: verb });

    const run = async (sessionActive: boolean, isRetry: boolean): Promise<unknown> => {
      const token = await transport.getAccessToken();
      let raw: RawResponse;
      try {
        raw = await attempt(verb, path, options, token, timeoutMs);
      } catch (err) {
        if (err instanceof RequestTimeoutError) report(err);
        throw err;
      }
      if (raw.ok) return raw.status === 204 || raw.text === '' ? undefined : parseJson(raw.text);

      const detail = extractBackendDetail(parseJson(raw.text));

      if (raw.status === 401 && sessionActive && !skip && !isRetry) {
        if (await refresh()) return run(true, true);
        await transport.clear();
        onUnauthenticated?.();
        throw new BackendHttpError(401, detail, ERROR_KEYS.requestFailed);
      }

      const error = new BackendHttpError(raw.status, detail, translationKeyForStatus(raw.status));
      if (!skip && raw.status === 401 && sessionActive) {
        await transport.clear();
        onUnauthenticated?.();
      } else if (!skip && raw.status === 403) {
        onForbidden?.();
      } else if (raw.status >= 500) {
        report(error);
      }
      throw error;
    };

    return run(await transport.hasSession(), false);
  }

  async function send<S extends z.ZodType>(
    method: string,
    path: string,
    schema: S,
    options?: RequestOptions,
  ): Promise<z.output<S>> {
    return parse(schema, await request(method, path, options), `${method} ${path}`);
  }

  return {
    request,
    send,
    get: <S extends z.ZodType>(path: string, schema: S, options?: Omit<RequestOptions, 'body'>) =>
      send('GET', path, schema, options),
    post: <S extends z.ZodType>(path: string, schema: S, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      send('POST', path, schema, { ...options, body }),
    put: <S extends z.ZodType>(path: string, schema: S, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      send('PUT', path, schema, { ...options, body }),
    patch: <S extends z.ZodType>(path: string, schema: S, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      send('PATCH', path, schema, { ...options, body }),
    delete: <S extends z.ZodType>(path: string, schema: S, options?: RequestOptions) =>
      send('DELETE', path, schema, options),
  };
}
