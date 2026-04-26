import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  input,
  effect,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-cover-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-2">
      @if (previewUrl() || externalUrl()) {
        <div class="relative rounded-xl overflow-hidden h-28 bg-gray-100 dark:bg-gray-700">
          <img
            [src]="previewUrl() || externalUrl()"
            alt="Cover preview"
            class="w-full h-full object-cover"
            (error)="clearPreview()"
          />
          <button
            type="button"
            (click)="clearPreview()"
            class="absolute top-1 right-1 rounded-full bg-black/50 text-white text-xs px-2 py-0.5 hover:bg-black/70 transition-colors"
          >✕</button>
        </div>
      }

      <div class="flex gap-2">
        <button
          type="button"
          (click)="fileInput.click()"
          [disabled]="isUploading()"
          class="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          @if (isUploading()) {
            <span class="animate-spin">⏳</span> Uploading…
          } @else {
            📁 Upload image
          }
        </button>

        <button
          type="button"
          (click)="showUrlInput.set(!showUrlInput())"
          class="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          🔗 {{ showUrlInput() ? 'Hide URL' : 'Enter URL' }}
        </button>
      </div>

      @if (showUrlInput()) {
        <input
          type="url"
          [formControl]="control()"
          placeholder="https://example.com/cover.jpg"
          class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      }

      @if (uploadError()) {
        <p class="text-xs text-red-600 dark:text-red-400">{{ uploadError() }}</p>
      }

      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
})
export class CoverUploadComponent {
  readonly control = input.required<FormControl<string>>();

  private readonly uploadService = inject(UploadService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isUploading = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly showUrlInput = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly externalUrl = signal<string>('');

  constructor() {
    effect(onCleanup => {
      const ctrl = this.control();
      this.externalUrl.set(ctrl.value);
      const sub = ctrl.valueChanges.subscribe(v => this.externalUrl.set(v ?? ''));
      onCleanup(() => sub.unsubscribe());
    });
  }

  clearPreview(): void {
    this.previewUrl.set(null);
    this.control().setValue('');
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.previewUrl.set(URL.createObjectURL(file));
    this.uploadError.set(null);
    this.isUploading.set(true);

    this.uploadService.uploadCover(file).subscribe({
      next: url => {
        this.control().setValue(url);
        this.isUploading.set(false);
      },
      error: () => {
        this.uploadError.set('Upload failed. Please try again or use a URL.');
        this.isUploading.set(false);
        this.previewUrl.set(null);
      },
    });
  }
}
