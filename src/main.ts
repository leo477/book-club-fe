import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

inject();
injectSpeedInsights();
