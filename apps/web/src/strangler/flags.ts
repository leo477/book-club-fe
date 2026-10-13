/** Edge Config `strangler.routes` keys that gate a shell feature rather than a route; same `{target, percent}` shape and fail-safe (off). */
export const SHELL_CHAT_WIDGET = 'shell.chatWidget';
export const SHELL_FLAGS: readonly string[] = [SHELL_CHAT_WIDGET];
