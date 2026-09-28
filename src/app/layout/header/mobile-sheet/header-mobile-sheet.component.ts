import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIcon } from '@ng-icons/core';
import { HlmSheetImports } from '../../../shared/spartan/sheet/src';
import { HlmIconImports } from '../../../shared/spartan/icon/src';

@Component({
  selector: 'app-header-mobile-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, NgIcon, ...HlmIconImports, ...HlmSheetImports],
  templateUrl: './header-mobile-sheet.component.html',
})
export class HeaderMobileSheetComponent {
  readonly isAuthenticated = input.required<boolean>();
  readonly displayName = input<string | null>(null);
  readonly isDark = input.required<boolean>();
  readonly currentLang = input.required<string>();

  readonly themeToggle = output<void>();
  readonly langSwitch = output<void>();
  readonly signOut = output<void>();
}
