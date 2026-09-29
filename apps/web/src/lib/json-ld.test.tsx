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
});
