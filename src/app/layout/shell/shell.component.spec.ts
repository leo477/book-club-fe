import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShellComponent } from './shell.component';
import { ThemeService } from '../../core/services/theme.service';

describe('ShellComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [ShellComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), ThemeService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(ShellComponent);
    return { fixture };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('injects ThemeService', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance._theme).toBeTruthy();
  });
});
