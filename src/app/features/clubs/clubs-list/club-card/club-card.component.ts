import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Club } from '../../../../core/models/club.model';
import { TranslateModule } from '@ngx-translate/core';
import { HlmCardImports } from '../../../../shared/spartan/card/src';
import { HlmButton } from '../../../../shared/spartan/button/src';
import { HlmSeparator } from '../../../../shared/spartan/separator/src';
import { HlmSpinner } from '../../../../shared/spartan/spinner/src';

@Component({
  selector: 'app-club-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, TranslateModule, ...HlmCardImports, HlmButton, HlmSeparator, HlmSpinner],
  templateUrl: './club-card.component.html',
})
export class ClubCardComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwned = input<boolean>(false);
  readonly isAuthenticated = input<boolean>(false);
  readonly joining = input<boolean>(false);
  readonly variant = input<'default' | 'featured'>('default');

  readonly join = output<void>();

  protected daysUntil(dateStr: string): number {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.round((target - now) / 86400000);
  }
}
