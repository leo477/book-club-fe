import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EventCountdownComponent } from './event-countdown.component';

describe('EventCountdownComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  async function setup(eventDate: string) {
    await TestBed.configureTestingModule({
      imports: [EventCountdownComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(EventCountdownComponent);
    fixture.componentRef.setInput('eventDate', eventDate);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('renders the initial day/hour/minute/second breakdown when the event is several days away', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    // 2 days, 3 hours, 4 minutes, 5 seconds from "now"
    const target = new Date('2026-01-03T03:04:05.000Z');

    const { component } = await setup(target.toISOString());

    expect(component.countdown()).toBe('2d 3h 4m 5s');
  });

  it('updates to an hours-only-scale countdown as time advances', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    // exactly 2 hours, 30 minutes, 0 seconds away
    const target = new Date('2026-01-01T02:30:00.000Z');

    const { component, fixture } = await setup(target.toISOString());
    expect(component.countdown()).toBe('0d 2h 30m 0s');

    // advance 1 hour -> 1h 30m 0s remaining
    vi.advanceTimersByTime(60 * 60 * 1000);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countdown()).toBe('0d 1h 30m 0s');
  });

  it('updates to a minutes-scale countdown as time advances', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2026-01-01T00:05:00.000Z'); // 5 minutes away

    const { component, fixture } = await setup(target.toISOString());
    expect(component.countdown()).toBe('0d 0h 5m 0s');

    vi.advanceTimersByTime(3 * 60 * 1000); // advance 3 minutes
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countdown()).toBe('0d 0h 2m 0s');
  });

  it('ticks down second by second when only seconds remain', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2026-01-01T00:00:10.000Z'); // 10 seconds away

    const { component, fixture } = await setup(target.toISOString());
    expect(component.countdown()).toBe('0d 0h 0m 10s');

    vi.advanceTimersByTime(1000); // 1 second tick
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countdown()).toBe('0d 0h 0m 9s');

    vi.advanceTimersByTime(4000); // advance 4 more seconds
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countdown()).toBe('0d 0h 0m 5s');
  });

  it('sets the countdown to an empty string once the event has already passed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2025-12-31T00:00:00.000Z'); // in the past

    const { component } = await setup(target.toISOString());

    expect(component.countdown()).toBe('');
  });

  it('clears the countdown to empty once the event time is reached while ticking', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2026-01-01T00:00:02.000Z'); // 2 seconds away

    const { component, fixture } = await setup(target.toISOString());
    expect(component.countdown()).toBe('0d 0h 0m 2s');

    vi.advanceTimersByTime(3000); // advance past the target
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.countdown()).toBe('');
  });

  it('renders the countdown text in the template', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2026-01-01T00:00:30.000Z');

    const { fixture } = await setup(target.toISOString());

    const text = (fixture.nativeElement as HTMLElement).textContent?.trim();
    expect(text).toBe('0d 0h 0m 30s');
  });

  it('stops updating once the component is destroyed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const target = new Date('2026-01-01T00:00:10.000Z');

    const { component, fixture } = await setup(target.toISOString());
    expect(component.countdown()).toBe('0d 0h 0m 10s');

    fixture.destroy();
    vi.advanceTimersByTime(5000);

    // countdown signal should remain unchanged after destroy since the interval was cleared
    expect(component.countdown()).toBe('0d 0h 0m 10s');
  });
});
