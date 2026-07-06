import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { QuizDetailBaseComponent } from './quiz-detail-base.component';
import { QuizService } from '../../core/services/quiz.service';
import { Quiz, QuizQuestion } from '../../core/models/quiz.model';
import { optionLabel, isInvalidTouched } from './quiz-form.utils';

@Component({ selector: 'app-test-quiz-detail', template: '', standalone: true })
class TestQuizDetailComponent extends QuizDetailBaseComponent {}

describe('QuizDetailBaseComponent', () => {
  let quizServiceSpy: { getQuiz: ReturnType<typeof vi.fn>; getQuestions: ReturnType<typeof vi.fn> };

  async function setup(quizId = '') {
    quizServiceSpy = {
      getQuiz: vi.fn().mockResolvedValue({ id: 'q1', title: 'Quiz' } as Quiz),
      getQuestions: vi.fn().mockResolvedValue([{ id: 'ques-1' }] as QuizQuestion[]),
    };
    await TestBed.configureTestingModule({
      imports: [TestQuizDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: QuizService, useValue: quizServiceSpy },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestQuizDetailComponent);
    fixture.componentRef.setInput('quizId', quizId);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('does not fetch when quizId is empty', async () => {
    const { component } = await setup('');
    expect(quizServiceSpy.getQuiz).not.toHaveBeenCalled();
    expect(component.quiz()).toBeNull();
    expect(component.questions()).toEqual([]);
  });

  it('fetches the quiz and questions when quizId is set', async () => {
    const { component } = await setup('q1');
    expect(quizServiceSpy.getQuiz).toHaveBeenCalledWith('q1');
    expect(quizServiceSpy.getQuestions).toHaveBeenCalledWith('q1');
    expect(component.quiz()?.id).toBe('q1');
    expect(component.questions().length).toBe(1);
  });

  it('isLoading reflects the resources settling', async () => {
    const { component } = await setup('q1');
    expect(component.isLoading()).toBe(false);
  });

  describe('base exposes the quiz-form utils it is built on', () => {
    it('optionLabel maps index 0-3 to A-D', () => {
      expect(optionLabel(0)).toBe('A');
      expect(optionLabel(3)).toBe('D');
    });

    it('isInvalidTouched is true only when invalid and touched', () => {
      const ctrl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
      expect(isInvalidTouched(ctrl)).toBe(false);
      ctrl.markAsTouched();
      expect(isInvalidTouched(ctrl)).toBe(true);
    });
  });
});
