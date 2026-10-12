import { afterEach, describe, expect, it, vi } from 'vitest';
import { createChatAudioAlert } from './chat-audio-alert';

class FakeAudioContext {
  static created = 0;
  static last: FakeAudioContext | null = null;
  state: 'suspended' | 'running' = 'suspended';
  currentTime = 0;
  destination = {};
  starts = 0;
  constructor() {
    FakeAudioContext.created += 1;
    FakeAudioContext.last = this;
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return { connect: () => undefined, gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined } };
  }
  createOscillator() {
    return { connect: () => undefined, frequency: { value: 0 }, start: () => void (this.starts += 1), stop: () => undefined };
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeAudioContext.created = 0;
});

describe('createChatAudioAlert', () => {
  it('stays silent until a user gesture unlocks the context, then beeps', async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const alert = createChatAudioAlert();
    alert.playBeep();
    expect(FakeAudioContext.last?.starts).toBe(0);
    document.dispatchEvent(new Event('click'));
    await Promise.resolve();
    alert.playBeep();
    expect(FakeAudioContext.created).toBe(1);
    expect(FakeAudioContext.last?.starts).toBe(1);
    alert.dispose();
  });

  it('removes its listeners on dispose, so no gesture creates a context afterwards', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    const alert = createChatAudioAlert();
    alert.dispose();
    document.dispatchEvent(new Event('click'));
    document.dispatchEvent(new Event('keydown'));
    expect(FakeAudioContext.created).toBe(0);
  });
});
