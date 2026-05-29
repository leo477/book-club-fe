import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HlmCard } from '../../spartan/card/src';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [HlmCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div hlmCard class="flex items-center justify-center p-6 w-fit gap-0 py-6">
      <canvas
        #canvas
        [style.width.px]="size()"
        [style.height.px]="size()"
        class="rounded-lg"
        [attr.aria-label]="'QR code'"
        role="img"
      ></canvas>
    </div>
  `,
})
export class QrCodeComponent {
  readonly value = input.required<string>();
  readonly size = input<number>(200);

  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const val = this.value();
      const sz = this.size();
      const canvas = this.canvasRef().nativeElement;
      if (!val || !canvas) return;
      void import('qrcode').then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lib: typeof import('qrcode') = (mod as any).default; // NOSONAR
        lib.toCanvas(canvas, val, { width: sz, margin: 2 }, (err: unknown) => {
          if (err && !environment.production) console.error('QR generation error:', err);
        });
      });
    });
  }
}
