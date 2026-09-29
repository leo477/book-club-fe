// only same-origin absolute paths: "//host", "/\host", "https:" and "javascript:" must never reach location.href
const SAFE_PATH = /^\/(?![/\\])/;
// browsers strip tab/CR/LF from URLs, so "/\t/evil.com" would become "//evil.com"
const CONTROL_CHARS = /[\u0000-\u001f]/;

// hard navigation: the target may be owned by the legacy app, so the router must not handle it
export function hardNavigate(path: string): void {
  if (!SAFE_PATH.test(path) || CONTROL_CHARS.test(path)) throw new Error(`hardNavigate: refusing non-local path ${JSON.stringify(path)}`);
  window.location.href = path;
}
