let token: string | null = null;

/** One Places billing session per autocomplete run: it is reused by every keystroke and ends when a place is picked. */
export const geocodeSessionToken = (): string => (token ??= crypto.randomUUID());

export const resetGeocodeSession = (): void => {
  token = null;
};
