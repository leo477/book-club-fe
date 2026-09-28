import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ChatComposerComponent } from './chat-composer.component';

describe('ChatComposerComponent', () => {
  let component: ChatComposerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComposerComponent],
      providers: [provideTranslateService(), provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ChatComposerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', '');
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('valueChange output emits the new value', () => {
    let emitted: string | undefined;
    component.valueChange.subscribe(v => (emitted = v));
    component.valueChange.emit('Hello');
    expect(emitted).toBe('Hello');
  });

  it('send output emits when triggered', () => {
    let emitted = false;
    component.send.subscribe(() => (emitted = true));
    component.send.emit();
    expect(emitted).toBe(true);
  });

  it('messageKeydown output emits the event', () => {
    let emitted: KeyboardEvent | undefined;
    component.messageKeydown.subscribe(v => (emitted = v));
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    component.messageKeydown.emit(event);
    expect(emitted).toBe(event);
  });
});
