import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderNavLinksComponent } from './header-nav-links.component';

describe('HeaderNavLinksComponent', () => {
  async function setup(isAuthenticated: boolean) {
    await TestBed.configureTestingModule({
      imports: [HeaderNavLinksComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeaderNavLinksComponent);
    fixture.componentRef.setInput('isAuthenticated', isAuthenticated);
    fixture.detectChanges();
    return fixture;
  }

  it('creates component', async () => {
    const fixture = await setup(false);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides the support link when not authenticated', async () => {
    const fixture = await setup(false);
    const support = fixture.nativeElement.querySelector('[data-testid="nav-support"]');
    expect(support).toBeNull();
  });

  it('shows the support link when authenticated', async () => {
    const fixture = await setup(true);
    const support = fixture.nativeElement.querySelector('[data-testid="nav-support"]');
    expect(support).not.toBeNull();
  });
});
