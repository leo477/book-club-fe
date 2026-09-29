// hard navigation: the target may be owned by the legacy app, so the router must not handle it
export function hardNavigate(path: string): void {
  window.location.href = path;
}
