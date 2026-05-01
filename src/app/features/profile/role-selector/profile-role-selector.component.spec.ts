import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileRoleSelectorComponent } from './profile-role-selector.component';
import { firstValueFrom } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';

describe('ProfileRoleSelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileRoleSelectorComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProfileRoleSelectorComponent);
    fixture.componentRef.setInput('currentRole', 'user');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('roleChange output emits value when triggered', async () => {
    const fixture = TestBed.createComponent(ProfileRoleSelectorComponent);
    fixture.componentRef.setInput('currentRole', 'user');
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const emitted: string[] = [];
    outputToObservable(comp.roleChange).subscribe(v => emitted.push(v));

    comp.roleChange.emit('organizer');
    expect(emitted).toEqual(['organizer']);
  });

  it('reflects the currentRole input', () => {
    const fixture = TestBed.createComponent(ProfileRoleSelectorComponent);
    fixture.componentRef.setInput('currentRole', 'organizer');
    fixture.detectChanges();
    expect(fixture.componentInstance.currentRole()).toBe('organizer');
  });

  it('roleChange output can emit user role', async () => {
    const fixture = TestBed.createComponent(ProfileRoleSelectorComponent);
    fixture.componentRef.setInput('currentRole', 'organizer');
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const result = firstValueFrom(outputToObservable(comp.roleChange));
    comp.roleChange.emit('user');
    expect(await result).toBe('user');
  });
});
