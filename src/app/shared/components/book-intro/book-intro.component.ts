import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

type BookState = 'closed' | 'opening' | 'open-bg';

@Component({
  selector: 'app-book-intro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div
      class="book-scene-wrapper"
      [class.state-opening]="state() === 'opening'"
      [class.state-open-bg]="state() === 'open-bg'"
    >
      <div class="book-scene">
        <div class="book" [class.is-entering]="entering()">
          <!-- Back cover (static) -->
          <div class="book-cover-back"></div>

          <!-- Pages stack -->
          <div class="book-pages-stack">
            <div class="book-page page-1"></div>
            <div class="book-page page-2"></div>
            <div class="book-page page-3"></div>
            <div class="book-page page-4"></div>
            <div class="book-page page-5"></div>
          </div>

          <!-- Spine -->
          <div class="book-spine">
            <span class="spine-title">Book Club</span>
          </div>

          <!-- Front cover — CSS transition-based opening -->
          <div class="book-cover-front" [class.is-opening]="state() === 'opening' || state() === 'open-bg'">
            <div class="cover-content">
              <div class="cover-ornament">✦</div>
              <div class="cover-title">Book<br>Club</div>
              <div class="cover-ornament">✦</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 10;
      pointer-events: none;
    }

    @media (max-width: 767px) {
      :host { display: none; }
    }

    /* ── Wrapper ── */
    .book-scene-wrapper {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      transition: background 0.8s ease;
    }

    .book-scene-wrapper.state-open-bg {
      background: transparent;
    }

    /* ── 3D Scene ── */
    .book-scene {
      perspective: 900px;
      perspective-origin: 50% 40%;
    }

    /* ── Book: base tilt + transition ── */
    .book {
      position: relative;
      width: 200px;
      height: 264px;
      transform-style: preserve-3d;
      transform: scale(1) rotateY(-10deg) rotateX(5deg);
      transition: transform 0.5s ease-out;
    }

    /* Entrance animation — plays once on mount */
    .book.is-entering {
      animation: book-entrance 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
    }

    @keyframes book-entrance {
      from {
        transform: scale(0.15) rotateY(-10deg) rotateX(5deg);
        opacity: 0;
      }
      to {
        transform: scale(1) rotateY(-10deg) rotateX(5deg);
        opacity: 1;
      }
    }

    /* Tilt to flat when opening starts (CSS transition) */
    .state-opening .book,
    .state-open-bg .book {
      transform: scale(1) rotateY(0deg) rotateX(0deg);
    }

    /* Scale to background overlay */
    .state-open-bg .book {
      animation: book-to-bg 0.75s ease-in-out forwards;
    }

    @keyframes book-to-bg {
      from {
        transform: scale(1) rotateY(0deg) rotateX(0deg);
        opacity: 1;
        filter: blur(0);
      }
      to {
        transform: scale(4.5) rotateY(0deg) rotateX(0deg);
        opacity: 0.055;
        filter: blur(3px);
      }
    }

    /* ── Back cover ── */
    .book-cover-back {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #6b3d1e 0%, #4a2810 100%);
      border-radius: 2px 8px 8px 2px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    /* ── Pages stack ── */
    .book-pages-stack {
      position: absolute;
      top: 4px;
      left: 8px;
      right: 4px;
      bottom: 4px;
    }

    .book-page {
      position: absolute;
      inset: 0;
      background: #fdf5e6;
      border-radius: 0 4px 4px 0;
      border-left: 1px solid #e8d5b7;
    }

    .page-1 { transform: translateX(1px); background: #faebd7; }
    .page-2 { transform: translateX(2px); background: #fdf5e6; }
    .page-3 { transform: translateX(3px); background: #fffaf0; }
    .page-4 { transform: translateX(4px); background: #fdf5e6; }
    .page-5 { transform: translateX(5px); background: #faebd7; }

    /* Page lines */
    .book-page::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 12px;
      right: 8px;
      bottom: 20px;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 18px,
        #e8dcc8 18px,
        #e8dcc8 19px
      );
      opacity: 0.4;
    }

    /* ── Spine ── */
    .book-spine {
      position: absolute;
      top: 0;
      left: -18px;
      width: 18px;
      height: 100%;
      background: linear-gradient(90deg, #3d2010 0%, #6b3d1e 100%);
      border-radius: 4px 0 0 4px;
      transform: rotateY(-90deg) translateZ(-9px);
      transform-origin: right center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spine-title {
      color: #d4a855;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-family: Georgia, serif;
    }

    /* ── Front cover — transition-based opening ── */
    .book-cover-front {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, #8b4c1e 0%, #6b3414 50%, #4f2510 100%);
      border-radius: 2px 8px 8px 2px;
      box-shadow: inset -3px 0 8px rgba(0,0,0,0.3), 2px 4px 20px rgba(0,0,0,0.4);
      transform-origin: left center;
      transform: rotateY(0deg);
      transition: transform 0.95s cubic-bezier(0.4, 0.0, 0.2, 1);
      backface-visibility: hidden;
    }

    .book-cover-front.is-opening {
      transform: rotateY(-158deg);
    }

    /* Border decoration */
    .book-cover-front::before {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1.5px solid rgba(212, 168, 85, 0.5);
      border-radius: 2px;
      pointer-events: none;
    }

    /* ── Cover content ── */
    .cover-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
    }

    .cover-title {
      color: #d4a855;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      letter-spacing: 0.05em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }

    .cover-ornament {
      color: rgba(212, 168, 85, 0.7);
      font-size: 14px;
    }
  `],
})
export class BookIntroComponent {
  /** When set to true, the book opens and transitions to background. */
  readonly open = input<boolean>(false);
  /** Emitted once the full open+background animation completes. */
  readonly animationDone = output<void>();

  readonly entering = signal(true);
  readonly state = signal<BookState>('closed');

  constructor() {
    // Remove entrance class after the bounce animation finishes
    setTimeout(() => this.entering.set(false), 750);

    // Watch for external open trigger
    effect(() => {
      if (this.open()) {
        untracked(() => {
          // Step 1: tilt flat + cover swings open (transition, ~950ms)
          this.state.set('opening');

          // Step 2: book scales to background watermark
          setTimeout(() => this.state.set('open-bg'), 1100);

          // Step 3: notify parent when animation is complete
          setTimeout(() => this.animationDone.emit(), 1900);
        });
      }
    });
  }
}

