import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService, AppLang } from '../../core/services/language.service';
import { HlmSheetImports } from '../../shared/spartan/sheet/src';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmIconImports } from '../../shared/spartan/icon/src';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideSun, lucideMoon })],
  imports: [
    RouterLink, RouterLinkActive, TranslateModule, NgIcon,
    ...HlmIconImports,
    ...HlmSheetImports, HlmButton,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth      = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly language  = inject(LanguageService);
  readonly themeService      = inject(ThemeService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  readonly currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: 'uk' },
  );

  readonly showUserMenu = signal(false);

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.displayName ?? '';
    return (
      name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('') || '?'
    );
  });

  async switchLang(): Promise<void> {
    const next: AppLang = this.currentLang() === 'uk' ? 'en' : 'uk';
    await this.language.use(next);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
