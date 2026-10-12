export interface ChatAudioAlert {
  playBeep(): void;
  dispose(): void;
}

/** Browsers keep a new AudioContext suspended until a user gesture, so the first click or key unlocks it; until then the beep is skipped. */
export function createChatAudioAlert(doc: Document = document): ChatAudioAlert {
  let ctx: AudioContext | null = null;

  const unlock = () => {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  };
  doc.addEventListener('click', unlock, { once: true });
  doc.addEventListener('keydown', unlock, { once: true });

  return {
    playBeep() {
      ctx ??= new AudioContext();
      if (ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    },
    dispose() {
      doc.removeEventListener('click', unlock);
      doc.removeEventListener('keydown', unlock);
      void ctx?.close().catch(() => undefined);
      ctx = null;
    },
  };
}
