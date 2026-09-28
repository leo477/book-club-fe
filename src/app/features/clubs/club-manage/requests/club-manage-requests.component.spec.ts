import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubManageRequestsComponent } from './club-manage-requests.component';

describe('ClubManageRequestsComponent', () => {
  let component: ClubManageRequestsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubManageRequestsComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubManageRequestsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('joinRequests', []);
    fixture.componentRef.setInput('processingRequestUserId', null);
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('approve output emits the userId', () => {
    let emitted: string | undefined;
    component.approve.subscribe(v => (emitted = v));
    component.approve.emit('u9');
    expect(emitted).toBe('u9');
  });

  it('reject output emits the userId', () => {
    let emitted: string | undefined;
    component.reject.subscribe(v => (emitted = v));
    component.reject.emit('u9');
    expect(emitted).toBe('u9');
  });
});
