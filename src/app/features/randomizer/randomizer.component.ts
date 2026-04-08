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
  styles: [
    `
      @keyframes winner-pop {
        0% { transform: scale(0.5) rotate(-5deg); opacity: 0; }
        60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      .winner-pop { animation: winner-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

      @keyframes confetti-float {
        0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-60px) rotate(360deg); opacity: 0; }
      }
      .confetti-dot { animation: confetti-float 1.5s ease-out infinite; }
    `,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4 sm:p-8"
    >
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- ── Header ── -->
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="font-display text-3xl font-bold text-white">🎲 Book Randomizer</h1>
            <p class="text-primary-300 mt-1">Can't decide? Let fate pick your next read.</p>
          </div>
          <a
            [routerLink]="['/clubs', clubId]"
            class="text-primary-300 hover:text-white transition-colors text-sm"
          >
            ← Back to Club
          </a>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- ── Left column: Add + list candidates ── -->
          <div class="space-y-4">
            <!-- Add form -->
            <div class="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h2 class="text-white font-semibold text-lg mb-4">Add a Book</h2>
              <form
                [formGroup]="candidateForm"
                (ngSubmit)="addCandidate()"
                class="space-y-3"
                novalidate
              >
                <input
                  formControlName="title"
                  placeholder="Book title"
                  class="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-2.5
                         placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400
                         focus:border-transparent transition-all"
                />
                <input
                  formControlName="author"
                  placeholder="Author name"
                  class="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-2.5
                         placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400
                         focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  [disabled]="candidateForm.invalid"
                  class="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-40
                         disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5
                         font-medium transition-colors"
                >
                  + Add Book
                </button>
              </form>
            </div>

            <!-- Candidates list -->
            <div class="space-y-2">
              @for (c of randomizerService.candidates(); track $index) {
                <div
                  class="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/10
                         flex items-center justify-between gap-3 group transition-all
                         hover:bg-white/15"
                >
                  <div class="min-w-0">
                    <p class="text-white font-medium truncate">{{ c.title }}</p>
                    <p class="text-primary-300 text-sm truncate">by {{ c.author }}</p>
                  </div>
                  <button
                    (click)="removeCandidate($index)"
                    class="text-white/30 hover:text-red-400 transition-colors flex-shrink-0
                           text-lg leading-none"
                    aria-label="Remove {{ c.title }}"
                  >
                    ✕
                  </button>
                </div>
              } @empty {
                <div
                  class="bg-white/5 rounded-xl p-8 text-center text-white/30 border
                         border-dashed border-white/20"
                >
                  <p class="text-3xl mb-2">📚</p>
                  <p class="text-sm">Add at least 2 books to spin</p>
                </div>
              }
            </div>
          </div>

          <!-- ── Right column: Spin + result ── -->
          <div class="flex flex-col items-center gap-8">
            <!-- Animated wheel -->
            <div class="relative">
              <div
                class="w-36 h-36 rounded-full border-4 border-primary-400 bg-white/10
                       flex items-center justify-center text-6xl select-none transition-all
                       duration-300 shadow-2xl shadow-primary-900/60"
                [class.animate-spin]="randomizerService.isSpinning()"
                aria-hidden="true"
              >
                🎡
              </div>
              <!-- Decorative confetti dots when result shown -->
              @if (randomizerService.result() && !randomizerService.isSpinning()) {
                <span
                  class="confetti-dot absolute -top-2 left-4 w-2 h-2 rounded-full
                         bg-accent-400"
                  style="animation-delay: 0s"
                ></span>
                <span
                  class="confetti-dot absolute -top-3 right-6 w-2 h-2 rounded-full
                         bg-primary-400"
                  style="animation-delay: 0.3s"
                ></span>
                <span
                  class="confetti-dot absolute top-2 -right-2 w-1.5 h-1.5 rounded-full
                         bg-yellow-400"
                  style="animation-delay: 0.6s"
                ></span>
                <span
                  class="confetti-dot absolute top-6 -left-3 w-1.5 h-1.5 rounded-full
                         bg-green-400"
                  style="animation-delay: 0.9s"
                ></span>
              }
            </div>

            <!-- Spin button -->
            <button
              (click)="spin()"
              [disabled]="randomizerService.candidates().length < 2 || randomizerService.isSpinning()"
              class="relative px-12 py-5 rounded-2xl text-2xl font-bold text-white
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
                     transform hover:scale-105 active:scale-95 focus:outline-none
                     focus:ring-4 focus:ring-accent-400 shadow-2xl"
              [class.bg-accent-600]="!randomizerService.isSpinning()"
              [class.hover:bg-accent-500]="!randomizerService.isSpinning()"
              [class.bg-accent-700]="randomizerService.isSpinning()"
              [class.animate-pulse]="randomizerService.isSpinning()"
              aria-live="polite"
            >
              @if (randomizerService.isSpinning()) {
                ⏳ Spinning…
              } @else {
                🎲 Spin!
              }
            </button>

            <!-- Winner card -->
            @if (randomizerService.result(); as winner) {
              <div class="winner-pop w-full">
                <div
                  class="bg-gradient-to-br from-accent-500 to-primary-600 rounded-2xl p-6
                         text-center shadow-2xl border border-white/20"
                >
                  <div class="text-4xl mb-2" aria-hidden="true">🏆</div>
                  <p class="text-white/70 text-xs uppercase tracking-widest mb-1">
                    Next Read
                  </p>
                  <p class="text-white text-2xl font-display font-bold leading-tight">
                    {{ winner.title }}
                  </p>
                  <p class="text-white/80 mt-1 text-sm">by {{ winner.author }}</p>
                </div>
              </div>
            }

            <!-- Action buttons -->
            <div class="flex gap-3 w-full">
              @if (randomizerService.result() && authService.isOrganizer()) {
                <button
                  (click)="saveSession()"
                  [disabled]="isSaving()"
                  class="flex-1 bg-primary-700 hover:bg-primary-600 disabled:opacity-50
                         text-white rounded-xl px-4 py-2.5 font-medium transition-colors
                         text-sm"
                >
                  {{ isSaving() ? '…Saving' : '💾 Save to History' }}
                </button>
              }
              <button
                (click)="reset()"
                class="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4
                       py-2.5 font-medium transition-colors text-sm border border-white/10"
              >
                🔄 Reset
              </button>
            </div>

            <!-- Error message -->
            @if (errorMessage()) {
              <p class="text-red-400 text-sm text-center">{{ errorMessage() }}</p>
            }
          </div>
        </div>

        <!-- ── Session history ── -->
        @if (randomizerService.history().length > 0) {
          <div class="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <h2 class="text-white font-semibold text-lg mb-4">📜 Session History</h2>
            <div class="space-y-3">
              @for (session of randomizerService.history(); track session.id) {
                <div
                  class="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between
                         gap-3 flex-wrap"
                >
                  <div>
                    <p class="text-white font-medium">
                      {{ session.result?.title ?? '—' }}
                    </p>
                    <p class="text-primary-300 text-sm">
                      {{ session.candidates.length }} candidates
                    </p>
                  </div>
                  <p class="text-white/40 text-xs">
                    {{ session.createdAt | date: 'mediumDate' }}
                  </p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
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
