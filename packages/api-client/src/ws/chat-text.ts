export const MAX_MESSAGE_LENGTH = 2000;

// mirrors the backend's invisible set: zero-width and joiner marks, soft hyphen, braille blank, hangul fillers, mongolian vowel separator, BOM
const INVISIBLE = /[\u00AD\u115F\u1160\u180E\u200B-\u200F\u2060\u2800\u3164\uFEFF]/g;
// C0 controls (bar tab, LF, CR), DEL and C1 controls including NEL
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;

/** Same rules the backend enforces, so a message it would reject never leaves the browser. */
export function isSendableText(text: string): boolean {
  if (text.length > MAX_MESSAGE_LENGTH || CONTROL.test(text)) return false;
  return text.replace(INVISIBLE, '').trim().length > 0;
}
