const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

export function assertSeedAllowed(apiUrl: string): void {
  const { hostname } = new URL(apiUrl);
  if (LOCAL_HOSTS.has(hostname) || process.env['ALLOW_PROD_SEED'] === '1') return;
  throw new Error(
    `Refusing to register accounts and seed data on non-local API ${apiUrl}. ` +
      'Point AUDIT_API_BASE_URL at a local backend, or set ALLOW_PROD_SEED=1 to seed a shared environment deliberately.',
  );
}
