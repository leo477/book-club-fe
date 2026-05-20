import { ApplicationConfig, ApplicationRef, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, firstValueFrom, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { SeoService } from './core/services/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      // Inherit parent route params (e.g. :id) into all descendant routes
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    provideTranslateService({ fallbackLang: 'uk' }),
    ...provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const translate = inject(TranslateService);
        const seo = inject(SeoService);
        const appRef = inject(ApplicationRef);
        return () =>
          firstValueFrom(
            translate.use('uk').pipe(
              catchError(() => translate.use('en').pipe(catchError(() => of(null)))),
            ),
          ).then(() => {
            seo.bootstrapLocaleSync();
            appRef.tick();
          });
      },
      multi: true,
    },
  ],
};
