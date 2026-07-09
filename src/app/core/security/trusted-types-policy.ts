import DOMPurify, { type Config } from 'dompurify';

// @googlemaps/js-api-loader and @vercel/analytics|speed-insights assign
// script.src as a raw string rather than through a Trusted Types policy. With
// `require-trusted-types-for 'script'` enforced (vercel.json CSP), the browser
// falls back to a policy named "default" if one is registered, so we scope it
// to the Maps script origins plus same-origin (already covered by 'self').
//
// `@ng-icons/core` (used via `@ng-icons/lucide` throughout the app for icon
// rendering — header, profile stats, Spartan UI components like hlm-icon/
// hlm-toaster/hlm-spinner/hlm-dropdown-menu/hlm-sheet-content/
// hlm-tabs-paginated-list) writes SVG icon markup directly via `innerHTML`
// (through `Renderer2.setProperty` client-side, `nativeElement.innerHTML =`
// during SSR) without going through Angular's DomSanitizer or its own
// Trusted Types policy. Since `require-trusted-types-for 'script'` blocks
// any unsanitized `innerHTML` write with no `createHTML` trap registered,
// this broke icon rendering app-wide (reproducible even on pages with no
// map, e.g. login). The createHTML trap only allows strings that look like
// well-formed SVG markup (starts with `<svg`) — not a blanket HTML
// pass-through — since that's the only thing `@ng-icons/core` ever assigns
// here, and the SVG bodies come from the bundled `@ng-icons/lucide` package
// at build time, not user input.
//
// The `<svg` prefix check alone is not sufficient: it only gates the start
// of the string, so anything inside a well-formed `<svg>...</svg>` wrapper
// (including an inline `<script>`, an `on*=` handler, or a nested
// `<foreignObject><iframe src="javascript:...">`) would pass through
// unsanitized. That's a residual XSS risk even though today's only consumer
// isn't attacker-controlled, so the trap also runs the string through
// DOMPurify's SVG profile (which strips disallowed elements — including
// `foreignObject`/`iframe` — plus event handlers and javascript:/data: URIs
// in any attribute, not just href) with an explicit FORBID_TAGS/FORBID_ATTR
// belt-and-suspenders, as defense in depth for any future consumer of this
// same fallback path.
//
// DOMPurify sanitizes by parsing the markup into a scratch, detached
// document — an `innerHTML` write (or `DOMParser.parseFromString`, itself a
// guarded Trusted Types sink in this Chromium version) like any other. If
// that internal write isn't pre-signed, it falls back to *this* "default"
// policy's `createHTML`, which would call `DOMPurify.sanitize()` again:
// every icon render would recurse into itself and peg the renderer
// (confirmed via a CDP profile: thousands of nested createHTML -> sanitize
// -> createHTML frames per render). DOMPurify ships a documented mechanism
// for exactly this case (`TRUSTED_TYPES_POLICY`): give it its own, narrowly
// scoped policy purely for that internal parse, so its write is already
// trusted and never re-enters the policy below. That inner policy's
// `createHTML` is a pure passthrough — it does no sanitization itself — but
// it's only ever used to let DOMPurify build the scratch DOM it then walks
// and cleans; DOMPurify's actual sanitization (and the `<svg` prefix check
// above) still fully gates what `default.createHTML` returns. The inner
// policy is never assigned anywhere else, so it grants no capability beyond
// what DOMPurify's parse step already needs. Its name is allowlisted in
// vercel.json's `trusted-types` directive as a single, narrowly-scoped
// addition (see the comment there) — approved specifically for this fix.
const DOMPURIFY_INTERNAL_POLICY_NAME = 'dompurify-internal';

export interface TrustedTypesWindow {
  trustedTypes?: {
    createPolicy(
      name: string,
      policy: { createScriptURL: (url: string) => string; createHTML: (html: string) => string },
    ): unknown;
  };
}

export function setupTrustedTypesPolicy(win: TrustedTypesWindow = globalThis as unknown as TrustedTypesWindow): void {
  const trustedTypes = win.trustedTypes;
  if (!trustedTypes) return;

  // Passthrough only — DOMPurify's own sanitizer, invoked below, is the real
  // security boundary. See the module comment above for why this is safe.
  const domPurifyInternalPolicy = trustedTypes.createPolicy(DOMPURIFY_INTERNAL_POLICY_NAME, {
    createScriptURL: (url: string) => url,
    createHTML: (html: string) => html,
  });

  const allowedScriptUrlPrefixes = ['https://maps.googleapis.com/', 'https://maps.gstatic.com/'];
  trustedTypes.createPolicy('default', {
    createScriptURL: (url: string) => {
      if (url.startsWith('/') || allowedScriptUrlPrefixes.some(prefix => url.startsWith(prefix))) return url;
      throw new Error(`Blocked untrusted script URL: ${url}`);
    },
    createHTML: (html: string) => {
      if (!/^\s*<svg[\s>]/i.test(html)) throw new Error('Blocked untrusted HTML assignment');
      const clean = DOMPurify.sanitize(html, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ['script'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        TRUSTED_TYPES_POLICY: domPurifyInternalPolicy as unknown as NonNullable<Config['TRUSTED_TYPES_POLICY']>,
      });
      if (!clean) throw new Error('Blocked untrusted HTML assignment');
      return clean;
    },
  });
}
