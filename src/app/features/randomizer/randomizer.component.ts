import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { RandomizerService } from '../../core/services/randomizer.service';
import { BookCandidate } from '../../core/models/randomizer.model';

interface CandidateForm {
  title: FormControl<string>;
  author: FormControl<string>;
}

@Component({
  selector: 'app-randomizer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  styleUrl: './randomizer.component.scss',
  templateUrl: './randomizer.component.html',
})
export class RandomizerComponent implements OnInit {
  protected readonly randomizerService = inject(RandomizerService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly candidateForm = new FormGroup<CandidateForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    author: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected clubId = '';

  ngOnInit(): void {
    this.clubId = this.route.snapshot.params['id'] as string;
    this.randomizerService.loadHistory(this.clubId).catch(() => {
      // non-critical: history load failure is silently ignored
    });
  }

  protected addCandidate(): void {
    if (this.candidateForm.invalid) return;
    const { title, author } = this.candidateForm.getRawValue();
    const book: BookCandidate = { title: title.trim(), author: author.trim() };
    this.randomizerService.addCandidate(book);
    this.candidateForm.reset();
  }

  protected removeCandidate(index: number): void {
    this.randomizerService.removeCandidate(index);
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
      .then(() => {
        this.isSaving.set(false);
      })
      .catch(err => {
        this.isSaving.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }

  protected reset(): void {
    this.randomizerService.reset();
    this.candidateForm.reset();
    this.errorMessage.set('');
  }
}
