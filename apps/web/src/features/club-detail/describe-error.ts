interface ErrorLike {
  name?: unknown;
  status?: unknown;
  detail?: unknown;
  code?: unknown;
  translationKey?: unknown;
  message?: unknown;
}

const asError = (err: unknown): ErrorLike => (typeof err === 'object' && err !== null ? err : {});

/** Timeouts and 5xx are already toasted by the api client's onError. */
export function isReported(err: unknown): boolean {
  const e = asError(err);
  return e.name === 'RequestTimeoutError' || (typeof e.status === 'number' && e.status >= 500);
}

/** `t` resolves keys of the ERRORS namespace. */
export function describeError(err: unknown, t: (key: string) => string): string {
  const e = asError(err);
  if (e.name === 'RequestTimeoutError') return t('timeout');
  if (typeof e.status === 'number') {
    if (e.status === 403 && e.code === 'OWNER_ONLY') return t('owner_only_action');
    if (e.status === 400 && e.code === 'OWNER_CANNOT_LEAVE') return t('owner_cannot_leave');
    if (e.status === 400 && e.code === 'CANNOT_BAN_SELF') return t('cannot_ban_self');
    if (typeof e.detail === 'string' && e.detail) return e.detail;
    if (typeof e.translationKey === 'string') return t(e.translationKey.replace(/^ERRORS\./, ''));
  }
  return typeof e.message === 'string' && e.message ? e.message : t('unexpected');
}
