import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

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
interface TrustedTypesWindow {
  trustedTypes?: {
    createPolicy(
      name: string,
      policy: { createScriptURL: (url: string) => string; createHTML: (html: string) => string },
    ): unknown;
  };
}

const trustedTypes = (globalThis as unknown as TrustedTypesWindow).trustedTypes;
if (trustedTypes) {
  const allowedScriptUrlPrefixes = ['https://maps.googleapis.com/', 'https://maps.gstatic.com/'];
  trustedTypes.createPolicy('default', {
    createScriptURL: (url: string) => {
      if (url.startsWith('/') || allowedScriptUrlPrefixes.some(prefix => url.startsWith(prefix))) return url;
      throw new Error(`Blocked untrusted script URL: ${url}`);
    },
    createHTML: (html: string) => {
      if (/^\s*<svg[\s>]/i.test(html)) return html;
      throw new Error('Blocked untrusted HTML assignment');
    },
  });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

inject();
injectSpeedInsights();
