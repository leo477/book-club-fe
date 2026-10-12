'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMPTY_QUIZ_QUESTION, quizMetaForm, quizQuestionForm, type QuizMetaForm, type QuizQuestionForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AppLink } from '@/components/app-link';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { optionLabel } from './quiz-ui';
import { newDraftKey, type DraftQuestion } from './use-quiz';

const OPTIONS = [0, 1, 2, 3] as const;

export interface EditorSubmit {
  title: string;
  description: string;
  questions: readonly DraftQuestion[];
  removedIds: readonly string[];
}

interface Props {
  heading: string;
  backHref: string;
  questionsStepLabel: string;
  submitLabel: string;
  savingLabel: string;
  initialMeta: QuizMetaForm;
  initialQuestions: readonly DraftQuestion[];
  /** A quiz that has left draft is read-only. */
  locked?: boolean;
  lockedNotice?: string;
  pending: boolean;
  error: string | null;
  /** Resolves true once saved, false on failure; a second submit before then is dropped. */
  onSubmit: (values: EditorSubmit) => Promise<boolean>;
}

function Required({ children }: { children: ReactNode }) {
  return (
    <>
      {children}{' '}
      <span className="text-red-500" aria-hidden="true">
        *
      </span>
    </>
  );
}

/** The two-step form create and edit share: details, then questions. The owner decides what a valid submit does. */
export function QuizEditor({ heading, backHref, questionsStepLabel, submitLabel, savingLabel, initialMeta, initialQuestions, locked = false, lockedNotice, pending, error, onSubmit }: Props) {
  const t = useTranslations('QUIZ');
  const tAll = useTranslations();
  const [step, setStep] = useState<1 | 2>(1);
  const [meta, setMeta] = useState({ title: initialMeta.title.trim(), description: initialMeta.description.trim() });
  const [questions, setQuestions] = useState<readonly DraftQuestion[]>(initialQuestions);
  const [removedIds, setRemovedIds] = useState<readonly string[]>([]);
  const submitting = useRef(false);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const addHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusRemoved = useRef<number | null>(null);
  const stepMoved = useRef(false);
  const busy = pending || locked;

  const metaForm = useForm<QuizMetaForm>({ resolver: zodResolver(quizMetaForm), defaultValues: initialMeta, mode: 'onTouched' });
  const questionForm = useForm<QuizQuestionForm>({ resolver: zodResolver(quizQuestionForm), defaultValues: EMPTY_QUIZ_QUESTION, mode: 'onTouched' });
  const correct = useWatch({ control: questionForm.control, name: 'correctIndex' });

  const addQuestion = questionForm.handleSubmit((values) => {
    const options = [values.option0, values.option1, values.option2, values.option3].map((o) => o.trim());
    setQuestions((prev) => [...prev, { key: newDraftKey(), question: values.question.trim(), options, correctIndex: Number(values.correctIndex) }]);
    questionForm.reset(EMPTY_QUIZ_QUESTION);
    questionForm.setFocus('question');
  });

  const removeQuestion = (index: number) => {
    if (busy) return;
    focusRemoved.current = index;
    const id = questions[index]?.id;
    if (id) setRemovedIds((prev) => [...prev, id]);
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const index = focusRemoved.current;
    if (index === null) return;
    focusRemoved.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-remove]');
    const target = buttons?.length ? buttons[Math.min(index, buttons.length - 1)] : addHeadingRef.current;
    target?.focus();
  }, [questions]);

  useEffect(() => {
    if (!stepMoved.current) return;
    stepMoved.current = false;
    stepRef.current?.focus();
  }, [step]);

  const goTo = (next: 1 | 2) => {
    stepMoved.current = true;
    setStep(next);
  };

  const save = async () => {
    if (submitting.current || locked || questions.length === 0) return;
    submitting.current = true;
    const saved = await onSubmit({ ...meta, questions, removedIds });
    // a saved quiz navigates away, so only a failed save may be submitted again
    if (!saved) submitting.current = false;
  };

  const stepName = step === 1 ? t('create_step_details') : questionsStepLabel;

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fantasy text-2xl font-bold tracking-wide text-[var(--color-ink)]">{heading}</h1>
          <p ref={stepRef} tabIndex={-1} className="text-sm text-[var(--color-ink-muted)] mt-0.5 outline-none" aria-live="polite">
            {t('create_step_of', { step })} — {stepName}
          </p>
        </div>
        <AppLink href={backHref} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
          {t('create_cancel')}
        </AppLink>
      </header>

      <div className="flex gap-3" aria-hidden="true">
        {[1, 2].map((n) => (
          <div key={n} className={cn('flex-1 h-1.5 rounded-full', step >= n ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700')} />
        ))}
      </div>

      {locked && lockedNotice ? (
        <div role="alert" className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          {lockedNotice}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={(e) => void metaForm.handleSubmit((values) => { setMeta({ title: values.title.trim(), description: values.description.trim() }); goTo(2); })(e)} noValidate className="parchment-card p-6 space-y-5">
          <fieldset disabled={locked} className="space-y-5 min-w-0">
            <FormField
              id="quiz-title"
              type="text"
              data-testid="quiz-title-input"
              label={<Required>{t('create_title_label')}</Required>}
              placeholder={t('create_title_placeholder')}
              error={metaForm.formState.errors.title?.message}
              {...metaForm.register('title')}
            />
            <Field invalid={!!metaForm.formState.errors.description}>
              <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('create_desc_label')}</FieldLabel>
              <FieldControl>
                <Textarea rows={3} className="resize-none" placeholder={t('create_desc_placeholder')} {...metaForm.register('description')} />
              </FieldControl>
              <FieldError className="text-xs">{metaForm.formState.errors.description?.message ? tAll(metaForm.formState.errors.description.message) : null}</FieldError>
            </Field>
          </fieldset>
          <div className="flex justify-end">
            <Button type="submit" data-testid="next-button" disabled={locked} className="bg-primary-600 hover:bg-primary-700 text-white">
              {t('create_continue')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {questions.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">{t('questions_heading', { count: questions.length })}</h2>
              <ol ref={listRef} className="space-y-3">
                {questions.map((q, index) => (
                  <li key={q.key} className="parchment-card px-5 py-4 flex items-start gap-3">
                    <span aria-hidden="true" className="size-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-ink)] break-words">{q.question}</p>
                      {q.correctIndex === null ? null : (
                        <p className="text-green-700 dark:text-green-400 text-xs mt-1 break-words">
                          <span aria-hidden="true">✓ </span>
                          <span className="sr-only">{t('result_correct')}: </span>
                          {q.options[q.correctIndex]}
                        </p>
                      )}
                      {initialQuestions.length > 0 ? <p className="text-[10px] uppercase font-bold mt-1 text-[var(--color-ink-muted)]">{q.id ? t('question_saved') : t('question_new')}</p> : null}
                    </div>
                    {locked ? null : (
                      <Button type="button" variant="ghost" size="icon-sm" data-remove disabled={busy} aria-label={t('remove_question_aria', { number: index + 1 })} onClick={() => removeQuestion(index)}>
                        <span aria-hidden="true">✕</span>
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {locked ? null : (
            <form onSubmit={(e) => void addQuestion(e)} noValidate className="parchment-card p-6 space-y-5">
              <h2 ref={addHeadingRef} tabIndex={-1} className="font-semibold text-[var(--color-ink)] outline-none">{questions.length === 0 ? t('create_first_question') : t('create_another_question')}</h2>
              <Field invalid={!!questionForm.formState.errors.question}>
                <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Required>{t('create_question_label')}</Required>
                </FieldLabel>
                <FieldControl>
                  <Textarea rows={2} className="resize-none" placeholder={t('create_question_placeholder')} {...questionForm.register('question')} />
                </FieldControl>
                <FieldError className="text-xs">{questionForm.formState.errors.question?.message ? tAll(questionForm.formState.errors.question.message) : null}</FieldError>
              </Field>

              <fieldset className="space-y-2 min-w-0">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Required>{t('create_answers_label')}</Required>
                </legend>
                <p id="quiz-answers-hint" className="text-xs text-[var(--color-ink-muted)]">
                  {t('create_answers_hint')}
                </p>
                {OPTIONS.map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <label className="flex items-center cursor-pointer pt-2">
                      <input
                        type="radio"
                        value={String(i)}
                        aria-label={t('correct_option_aria', { label: optionLabel(i) })}
                        aria-describedby="quiz-answers-hint"
                        className="size-4 accent-[var(--color-accent-600,#16a34a)]"
                        {...questionForm.register('correctIndex')}
                      />
                      <span aria-hidden="true" className={cn('ml-2 size-6 rounded-full flex items-center justify-center text-xs font-bold', correct === String(i) ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300')}>
                        {optionLabel(i)}
                      </span>
                    </label>
                    <div className="flex-1 min-w-0">
                      <FormField
                        type="text"
                        label={<span className="sr-only">{t('option_aria', { label: optionLabel(i) })}</span>}
                        placeholder={t('option_aria', { label: optionLabel(i) })}
                        error={questionForm.formState.errors[`option${i}`]?.message}
                        {...questionForm.register(`option${i}`)}
                      />
                    </div>
                  </div>
                ))}
              </fieldset>

              <Button type="submit" variant="outline" disabled={pending} className="w-full border-dashed">
                {t('create_add_question')}
              </Button>
            </form>
          )}

          {error ? (
            <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <div className="flex justify-between items-center pb-8">
            <Button type="button" variant="ghost" disabled={pending} onClick={() => goTo(1)}>
              {t('create_back')}
            </Button>
            <Button type="button" data-testid="quiz-save" disabled={questions.length === 0 || pending || locked} onClick={() => void save()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6">
              {pending ? <Spinner className="mr-2" /> : null}
              {pending ? savingLabel : submitLabel}
              {questions.length > 0 ? ` (${questions.length} ${t('create_questions_count', { count: questions.length })})` : ''}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
