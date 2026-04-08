import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      [style.width.px]="size()"
      [style.height.px]="size()"
      class="rounded-lg"
      [attr.aria-label]="'QR code'"
      role="img"
    ></canvas>
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
      QRCode.toCanvas(canvas, val, { width: sz, margin: 2 }, (err) => {
        if (err) console.error('QR generation error:', err);
      });
    });
  }
}
