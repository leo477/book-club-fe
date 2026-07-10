import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { EventRsvpButtonComponent } from './event-rsvp-button.component';

describe('EventRsvpButtonComponent', () => {
  async function setup(inputs: Partial<{
    attending: boolean; loading: boolean; closed: boolean; showCancel: boolean;
  }> = {}) {
    await TestBed.configureTestingModule({
      imports: [EventRsvpButtonComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(EventRsvpButtonComponent);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    return { fixture, button };
  }

  it('shows the join label when not attending', async () => {
    const { button } = await setup({ attending: false });
    expect(button.nativeElement.textContent).toContain('events.rsvp.join');
  });

  it('shows the attending label when attending', async () => {
    const { button } = await setup({ attending: true });
    expect(button.nativeElement.textContent).toContain('events.rsvp.attending');
  });

  it('shows the cancel affordance when attending and showCancel is true', async () => {
    const { button } = await setup({ attending: true, showCancel: true });
    expect(button.nativeElement.textContent).toContain('events.rsvp.cancel');
  });

  it('shows the registration-closed label and disables the button when closed', async () => {
    const { button } = await setup({ closed: true });
    expect(button.nativeElement.textContent).toContain('EVENTS.registration_closed');
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('disables the button while loading', async () => {
    const { button } = await setup({ loading: true });
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('is enabled when neither loading nor closed', async () => {
    const { button } = await setup({ loading: false, closed: false });
    expect(button.nativeElement.disabled).toBe(false);
  });

  it('emits clicked on click', async () => {
    const { fixture, button } = await setup();
    const spy = vi.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    button.nativeElement.click();
    expect(spy).toHaveBeenCalled();
  });
});
