import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { RandomizerService } from '../../core/services/randomizer.service';

@Component({
  selector: 'app-randomizer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, TranslateModule],
  styleUrl: './randomizer.component.scss',
  templateUrl: './randomizer.component.html',
})
export class RandomizerComponent implements OnInit {
  protected readonly randomizerService = inject(RandomizerService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected clubId = '';

  protected readonly purposeControl = new FormControl('Хто представляє книгу?', {
    nonNullable: true,
    validators: [Validators.required],
  });

  // toSignal keeps OnPush change detection working without manual markForCheck
  private readonly _purposeValue = toSignal(this.purposeControl.valueChanges, {
    initialValue: this.purposeControl.value,
  });

  protected readonly selectedCount = computed(
    () =>
      this.randomizerService
        .candidates()
        .filter(m => this.randomizerService.selectedIds().has(m.userId)).length,
  );

  protected readonly initials = (name: string): string =>
    name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  ngOnInit(): void {
    this.clubId = this.route.snapshot.params['id'] as string;
    this.randomizerService.loadClubMembers(this.clubId);
    this.randomizerService.setPurpose(this.purposeControl.value);

    // Sync purpose input → service via the signal derived from valueChanges
    // effect() would be ideal here but we keep it simple with a subscription
    // that is automatically cleaned up when the component destroys
    this.purposeControl.valueChanges.subscribe(v =>
      this.randomizerService.setPurpose(v),
    );

    this.randomizerService.loadHistory(this.clubId).catch(() => {});
  }

  protected spin(): void {
    this.errorMessage.set('');
    this.randomizerService.spin().catch(err => {
      this.errorMessage.set((err as Error).message);
    });
  }

  protected saveSession(): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.randomizerService
      .saveSession(this.clubId)
      .then(() => this.isSaving.set(false))
      .catch(err => {
        this.isSaving.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }

  protected reset(): void {
    this.randomizerService.reset();
    this.errorMessage.set('');
  }
}
