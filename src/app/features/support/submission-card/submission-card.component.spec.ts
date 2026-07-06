import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SubmissionCardComponent } from './submission-card.component';
import { SupportService } from '../../../core/services/support.service';
import { Submission } from '../../../core/models/support.model';

function makeSubmission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 's1', type: 'suggestion', title: 'Add dark mode', body: 'Please add it',
    status: 'open', authorId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01',
    likeCount: 0, likedByMe: false, ...overrides,
  };
}

describe('SubmissionCardComponent', () => {
  let supportSpy: { toggleLike: ReturnType<typeof vi.fn> };
  let component: SubmissionCardComponent;

  async function setup(submission: Submission) {
    supportSpy = { toggleLike: vi.fn().mockResolvedValue(undefined) };
    await TestBed.configureTestingModule({
      imports: [SubmissionCardComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SupportService, useValue: supportSpy },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SubmissionCardComponent);
    fixture.componentRef.setInput('submission', submission);
    component = fixture.componentInstance;
    return { fixture };
  }

  describe('statusVariant', () => {
    it.each([
      ['open', 'outline'],
      ['pending', 'warning'],
      ['in_progress', 'secondary'],
      ['approved', 'success'],
      ['done', 'success'],
      ['rejected', 'destructive'],
    ] as const)('maps status %s to variant %s', async (status, variant) => {
      await setup(makeSubmission({ status }));
      expect(component.statusVariant()).toBe(variant);
    });
  });

  describe('canLike', () => {
    it('is false for suggestions', async () => {
      await setup(makeSubmission({ type: 'suggestion' }));
      expect(component.canLike()).toBe(false);
    });

    it('is true for complaints and comments', async () => {
      await setup(makeSubmission({ type: 'complaint' }));
      expect(component.canLike()).toBe(true);
    });
  });

  describe('reactionEmoji', () => {
    it('shows the angry emoji for complaints', async () => {
      await setup(makeSubmission({ type: 'complaint' }));
      expect(component.reactionEmoji()).toBe('😠');
    });

    it('shows the thumbs-up emoji otherwise', async () => {
      await setup(makeSubmission({ type: 'comment' }));
      expect(component.reactionEmoji()).toBe('👍');
    });
  });

  describe('reactionClasses', () => {
    it('applies the liked style when likedByMe is true', async () => {
      await setup(makeSubmission({ likedByMe: true }));
      expect(component.reactionClasses()).toContain('bg-[var(--color-accent-500)]');
    });

    it('applies the default style when likedByMe is false', async () => {
      await setup(makeSubmission({ likedByMe: false }));
      expect(component.reactionClasses()).toContain('border-[var(--color-ink-muted)]');
    });
  });

  describe('nextStatus', () => {
    it('is in_progress for approved submissions', async () => {
      await setup(makeSubmission({ status: 'approved' }));
      expect(component.nextStatus()).toBe('in_progress');
    });

    it('is done for in_progress submissions', async () => {
      await setup(makeSubmission({ status: 'in_progress' }));
      expect(component.nextStatus()).toBe('done');
    });

    it('is null for other statuses', async () => {
      await setup(makeSubmission({ status: 'open' }));
      expect(component.nextStatus()).toBeNull();
    });
  });

  describe('onToggleLike', () => {
    it('calls support.toggleLike with the submission id', async () => {
      await setup(makeSubmission({ id: 'sub-42' }));
      await component.onToggleLike();
      expect(supportSpy.toggleLike).toHaveBeenCalledWith('sub-42');
    });

    it('does not throw when toggleLike rejects', async () => {
      await setup(makeSubmission());
      supportSpy.toggleLike.mockRejectedValue(new Error('fail'));
      await expect(component.onToggleLike()).resolves.toBeUndefined();
    });
  });
});
