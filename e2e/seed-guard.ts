const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

export function isLocalApi(apiUrl: string): boolean {
  return LOCAL_HOSTS.has(new URL(apiUrl).hostname);
}

export function isSeedAllowed(apiUrl: string): boolean {
  const { hostname } = new URL(apiUrl);
  return LOCAL_HOSTS.has(hostname) || process.env['ALLOW_PROD_SEED'] === hostname;
}

export function assertSeedAllowed(apiUrl: string): void {
  if (!isSeedAllowed(apiUrl)) {
    const { hostname } = new URL(apiUrl);
    throw new Error(
      `Refusing to register accounts and seed data on non-local API ${apiUrl}. ` +
        `Point AUDIT_API_BASE_URL at a local backend, or set ALLOW_PROD_SEED=${hostname} to seed that exact shared host deliberately.`,
    );
  }
  if (!isLocalApi(apiUrl)) console.warn(`[seed-guard] ALLOW_PROD_SEED matched: writing to NON-LOCAL host ${new URL(apiUrl).hostname}`);
}
