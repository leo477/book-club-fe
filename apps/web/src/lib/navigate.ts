// only same-origin absolute paths: "//host", "/\host", "https:" and "javascript:" must never reach location.href
const SAFE_PATH = /^\/(?![/\\])/;

// hard navigation: the target may be owned by the legacy app, so the router must not handle it
export function hardNavigate(path: string): void {
  if (!SAFE_PATH.test(path)) throw new Error(`hardNavigate: refusing non-local path ${JSON.stringify(path)}`);
  window.location.href = path;
}
