import { environment } from '../../../environments/environment';

export function logError(...args: unknown[]): void {
  if (environment.production) return;
  console.error(...args);
}

export function logWarn(...args: unknown[]): void {
  if (environment.production) return;
  console.warn(...args);
}
