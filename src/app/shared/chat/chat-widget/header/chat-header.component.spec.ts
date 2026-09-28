import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ChatHeaderComponent } from './chat-header.component';

describe('ChatHeaderComponent', () => {
  let component: ChatHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHeaderComponent],
      providers: [provideTranslateService(), provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ChatHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomsView', true);
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('back output emits when triggered', () => {
    let emitted = false;
    component.back.subscribe(() => (emitted = true));
    component.back.emit();
    expect(emitted).toBe(true);
  });

  it('closePanel output emits when triggered', () => {
    let emitted = false;
    component.closePanel.subscribe(() => (emitted = true));
    component.closePanel.emit();
    expect(emitted).toBe(true);
  });
});
