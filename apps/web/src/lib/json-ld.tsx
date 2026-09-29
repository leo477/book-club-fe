/** `<` is escaped so club text can never close the script element. */
export const serializeJsonLd = (data: object): string => JSON.stringify(data).replace(/</g, '\\u003c');

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
