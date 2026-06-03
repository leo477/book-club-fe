import { ApplicationConfig, ApplicationRef, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { MapsConfigService } from './core/services/maps-config.service';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
  withRouterConfig,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, firstValueFrom, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { SeoService } from './core/services/seo.service';
import { LanguageService } from './core/services/language.service';

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
    provideAppInitializer(async () => {
      const translate = inject(TranslateService);
      const seo = inject(SeoService);
      const appRef = inject(ApplicationRef);
      const initialLang = inject(LanguageService).initialLang;
      await firstValueFrom(
        translate.use(initialLang).pipe(
          catchError(() => translate.use('en').pipe(catchError(() => of(null)))),
        ),
      );
      await firstValueFrom(
        translate.reloadLang(translate.currentLang ?? initialLang).pipe(catchError(() => of(null))),
      );
      document.documentElement.lang = translate.currentLang ?? initialLang;
      seo.bootstrapLocaleSync();
      appRef.tick();
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.init();
    }),
    provideAppInitializer(() => inject(MapsConfigService).load()),
  ],
};
