import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubManageToolsComponent } from './club-manage-tools.component';

describe('ClubManageToolsComponent', () => {
  let component: ClubManageToolsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubManageToolsComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubManageToolsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'club-1');
    fixture.componentRef.setInput('newRoomName', '');
    fixture.componentRef.setInput('isCreatingRoom', false);
    fixture.componentRef.setInput('roomError', null);
    fixture.componentRef.setInput('showRescheduleInput', false);
    fixture.componentRef.setInput('rescheduleDate', '');
    fixture.componentRef.setInput('showCancelConfirm', false);
    fixture.componentRef.setInput('showDeleteConfirm', false);
    fixture.componentRef.setInput('isDeleting', false);
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('createRoom output emits when triggered', () => {
    let emitted = false;
    component.createRoom.subscribe(() => (emitted = true));
    component.createRoom.emit();
    expect(emitted).toBe(true);
  });

  it('pauseClub output emits when triggered', () => {
    let emitted = false;
    component.pauseClub.subscribe(() => (emitted = true));
    component.pauseClub.emit();
    expect(emitted).toBe(true);
  });

  it('delete output emits when triggered', () => {
    let emitted = false;
    component.delete.subscribe(() => (emitted = true));
    component.delete.emit();
    expect(emitted).toBe(true);
  });

  it('showCancelConfirmChange output emits the requested value', () => {
    let emitted: boolean | undefined;
    component.showCancelConfirmChange.subscribe(v => (emitted = v));
    component.showCancelConfirmChange.emit(true);
    expect(emitted).toBe(true);
  });
});
