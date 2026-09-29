export function buildCsp(nonce: string, dev = false): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''} https://vercel.live https://maps.googleapis.com`,
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://covers.openlibrary.org https://maps.gstatic.com https://maps.googleapis.com https://*.supabase.co",
    "connect-src 'self' data: https://vercel.live wss://book-club-be.onrender.com https://openlibrary.org https://maps.googleapis.com https://maps.gstatic.com https://www.gstatic.com",
    'frame-src https://vercel.live',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export const TRUSTED_TYPES_REPORT_ONLY = "require-trusted-types-for 'script'; trusted-types default nextjs#bundler 'allow-duplicates'";

export function newNonce(): string {
  return btoa(crypto.randomUUID());
}
