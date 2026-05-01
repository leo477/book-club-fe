import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith, firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { HlmDropdownMenuImports } from '../../shared/spartan/dropdown-menu/src';
import { HlmSheetImports } from '../../shared/spartan/sheet/src';
import { HlmButton } from '../../shared/spartan/button/src';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslateModule, ...HlmDropdownMenuImports, ...HlmSheetImports, HlmButton],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  readonly currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: 'uk' },
  );

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

  switchLang(): void {
    const next = this.currentLang() === 'uk' ? 'en' : 'uk';
    void firstValueFrom(this.translate.use(next));
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }
}
