import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubManagePanelComponent } from './club-manage-panel.component';

describe('ClubManagePanelComponent', () => {
  let fixture: ComponentFixture<ClubManagePanelComponent>;
  let component: ClubManagePanelComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubManagePanelComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    fixture = TestBed.createComponent(ClubManagePanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clubId', 'c1');
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes clubId input', () => {
    expect(component.clubId()).toBe('c1');
  });

  it('reflects updated clubId', () => {
    fixture.componentRef.setInput('clubId', 'c2');
    expect(component.clubId()).toBe('c2');
  });
});
