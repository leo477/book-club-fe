import { Injectable, inject, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ChatAudioAlertService {
  private readonly document = inject(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);

  private _audioContext: AudioContext | null = null;

  constructor() {
    // Browsers keep a newly-created AudioContext suspended until a real user
    // gesture unlocks it; without this, the unread-message beep silently no-ops.
    const unlockAudio = () => {
      this._audioContext ??= new AudioContext();
      if (this._audioContext.state === 'suspended') void this._audioContext.resume();
    };
    this.document.addEventListener('click', unlockAudio, { once: true });
    this.document.addEventListener('keydown', unlockAudio, { once: true });
    this._destroyRef.onDestroy(() => {
      this.document.removeEventListener('click', unlockAudio);
      this.document.removeEventListener('keydown', unlockAudio);
    });
  }

  playBeep(): void {
    const ctx = this._audioContext ??= new AudioContext();
    if (ctx.state === 'suspended') return; // still locked, waiting for a user gesture
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
}
