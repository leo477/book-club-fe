import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SocialBadgesComponent } from './social-badges.component';
import { UserSocials } from '../../../core/models/user.model';

describe('SocialBadgesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialBadgesComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  function createWithSocials(socials: UserSocials) {
    const fixture = TestBed.createComponent(SocialBadgesComponent);
    fixture.componentRef.setInput('socials', socials);
    fixture.detectChanges();
    return fixture;
  }

  it('should create with empty socials', () => {
    const fixture = createWithSocials({});
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create with populated socials', () => {
    const socials: UserSocials = {
      telegram: 'testuser',
      github: 'testuser',
      instagram: 'testuser',
    };
    const fixture = createWithSocials(socials);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.socials()).toEqual(socials);
  });
});
