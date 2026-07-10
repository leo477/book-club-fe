import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SupportBoardComponent } from './support-board.component';
import { SupportService } from '../../../core/services/support.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { Submission } from '../../../core/models/support.model';

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 's1', type: 'suggestion', title: 'T', body: 'B', status: 'pending',
    authorId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01',
    likeCount: 0, likedByMe: false, ...overrides,
  };
}

describe('SupportBoardComponent', () => {
  let supportSpy: {
    submissions: ReturnType<typeof signal<Submission[]>>;
    loadSubmissions: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let seoSpy: { setPageI18n: ReturnType<typeof vi.fn> };
  let component: SupportBoardComponent;

  async function setup(submissions: Submission[] = []) {
    supportSpy = {
      submissions: signal(submissions),
      loadSubmissions: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };
    seoSpy = { setPageI18n: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [SupportBoardComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SupportService, useValue: supportSpy },
        { provide: AuthService, useValue: { currentUser: signal({ id: 'u1', role: 'admin' }) } },
        { provide: SeoService, useValue: seoSpy },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SupportBoardComponent);
    component = fixture.componentInstance;
    return { fixture };
  }

  it('sets the page title on construction', async () => {
    await setup();
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SUPPORT.title');
  });

  it('loads submissions on init', async () => {
    await setup();
    await component.ngOnInit();
    expect(supportSpy.loadSubmissions).toHaveBeenCalled();
  });

  describe('type filters', () => {
    it('splits submissions by type', async () => {
      await setup([
        makeSubmission({ id: 'c1', type: 'complaint' }),
        makeSubmission({ id: 'k1', type: 'comment' }),
        makeSubmission({ id: 'sg1', type: 'suggestion' }),
      ]);
      expect(component.complaints().map(s => s.id)).toEqual(['c1']);
      expect(component.comments().map(s => s.id)).toEqual(['k1']);
      expect(component.suggestions().map(s => s.id)).toEqual(['sg1']);
    });
  });

  describe('suggestionsByStatus', () => {
    it('groups suggestions into kanban columns', async () => {
      await setup([
        makeSubmission({ id: 's-pending', type: 'suggestion', status: 'pending' }),
        makeSubmission({ id: 's-approved', type: 'suggestion', status: 'approved' }),
        makeSubmission({ id: 's-open', type: 'suggestion', status: 'open' }),
      ]);
      const groups = component.suggestionsByStatus();
      expect(groups.pending.map(s => s.id)).toEqual(['s-pending']);
      expect(groups.approved.map(s => s.id)).toEqual(['s-approved']);
      // 'open' isn't a kanban column — must not appear anywhere.
      expect(Object.values(groups).flat().some(s => s.id === 's-open')).toBe(false);
    });
  });

  describe('onApprove / onReject / onAdvance', () => {
    it('onApprove calls updateStatus with approved', async () => {
      await setup();
      await component.onApprove(makeSubmission({ id: 's1' }));
      expect(supportSpy.updateStatus).toHaveBeenCalledWith('s1', 'approved');
    });

    it('onReject calls updateStatus with rejected', async () => {
      await setup();
      await component.onReject(makeSubmission({ id: 's1' }));
      expect(supportSpy.updateStatus).toHaveBeenCalledWith('s1', 'rejected');
    });

    it('onAdvance moves approved to in_progress', async () => {
      await setup();
      await component.onAdvance(makeSubmission({ id: 's1', status: 'approved' }));
      expect(supportSpy.updateStatus).toHaveBeenCalledWith('s1', 'in_progress');
    });

    it('onAdvance moves in_progress to done', async () => {
      await setup();
      await component.onAdvance(makeSubmission({ id: 's1', status: 'in_progress' }));
      expect(supportSpy.updateStatus).toHaveBeenCalledWith('s1', 'done');
    });

    it('onAdvance does nothing for other statuses', async () => {
      await setup();
      await component.onAdvance(makeSubmission({ id: 's1', status: 'done' }));
      expect(supportSpy.updateStatus).not.toHaveBeenCalled();
    });

    it('does not throw when updateStatus rejects', async () => {
      await setup();
      supportSpy.updateStatus.mockRejectedValue(new Error('fail'));
      await expect(component.onApprove(makeSubmission())).resolves.toBeUndefined();
    });
  });
});
