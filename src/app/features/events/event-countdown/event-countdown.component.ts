import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-event-countdown',
  standalone: true,
  templateUrl: './event-countdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCountdownComponent {
  eventDate = input.required<string>();
  countdown = signal('');

  constructor() {
    effect((onCleanup) => {
      const update = () => {
        const diff = new Date(this.eventDate()).getTime() - Date.now();
        if (diff <= 0) { this.countdown.set(''); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        this.countdown.set(`${d}d ${h}h ${m}m ${s}s`);
      };
      update();
      const id = setInterval(update, 1000);
      onCleanup(() => clearInterval(id));
    });
  }
}
