/**
 * The only way text becomes an `<img src>` in the organizer forms: parsed as an absolute URL, scheme allow-listed,
 * and the re-serialized `href` returned, so nothing but a normalized http(s) URL reaches the DOM.
 * `blob:` is for the object URL of a locally picked file (`URL.createObjectURL`), never for typed text.
 */
export function safeImageUrl(value: string, { allowBlob = false }: { allowBlob?: boolean } = {}): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return '';
  }
  if (url.protocol === 'https:' || url.protocol === 'http:' || (allowBlob && url.protocol === 'blob:')) return url.href;
  return '';
}
