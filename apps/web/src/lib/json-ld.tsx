const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

/** Escapes everything that could close the script element or be mis-parsed as HTML/JS line terminators; JSON.parse round-trips. */
export const serializeJsonLd = (data: object): string => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]!);

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
