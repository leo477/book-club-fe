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
interface TrustedTypesWindow {
  trustedTypes?: {
    createPolicy(name: string, policy: { createScriptURL: (url: string) => string }): unknown;
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
  });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

inject();
injectSpeedInsights();
