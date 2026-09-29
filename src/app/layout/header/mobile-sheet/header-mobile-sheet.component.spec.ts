import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { HeaderMobileSheetComponent } from './header-mobile-sheet.component';

describe('HeaderMobileSheetComponent', () => {
  let component: HeaderMobileSheetComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMobileSheetComponent],
      providers: [provideTranslateService(), provideZonelessChangeDetection(), provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeaderMobileSheetComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isAuthenticated', false);
    fixture.componentRef.setInput('displayName', null);
    fixture.componentRef.setInput('isDark', false);
    fixture.componentRef.setInput('currentLang', 'uk');
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('themeToggle output emits when triggered', () => {
    let emitted = false;
    component.themeToggle.subscribe(() => (emitted = true));
    component.themeToggle.emit();
    expect(emitted).toBe(true);
  });

  it('langSwitch output emits when triggered', () => {
    let emitted = false;
    component.langSwitch.subscribe(() => (emitted = true));
    component.langSwitch.emit();
    expect(emitted).toBe(true);
  });

  it('signOut output emits when triggered', () => {
    let emitted = false;
    component.signOut.subscribe(() => (emitted = true));
    component.signOut.emit();
    expect(emitted).toBe(true);
  });
});
