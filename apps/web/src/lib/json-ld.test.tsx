import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JsonLd, serializeJsonLd } from './json-ld';

describe('JsonLd', () => {
  it('escapes < so text can never close the script element', () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const html = renderToStaticMarkup(<JsonLd data={data} />);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain('type="application/ld+json"');
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it.each(['<', '>', '&', '\u2028', '\u2029'])('escapes %j and round-trips through JSON.parse', (char) => {
    const data = { name: `a${char}b`, nested: [`${char}${char}`] };
    const out = serializeJsonLd(data);
    expect(out).not.toContain(char);
    expect(JSON.parse(out)).toEqual(data);
  });

  it('keeps the whole payload free of raw <, >, & and line separators', () => {
    const data = { a: '<!-- x --> & <b>y</b>\u2028\u2029', 'k&<': 1 };
    expect(serializeJsonLd(data)).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
