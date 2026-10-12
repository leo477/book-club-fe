'use client';
'use no memo';

import type { Quiz, QuizQuestion } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePush } from '@/lib/use-push';
import { QuizEditor } from './quiz-editor';
import { QuizDetail } from './quiz-ui';
import { draftsOf, useSaveQuiz } from './use-quiz';

export function QuizEdit({ clubId, quizId }: { clubId: string; quizId: string }) {
  return <QuizDetail clubId={clubId} quizId={quizId}>{(quiz, questions) => <EditForm key={quiz.id} clubId={clubId} quiz={quiz} questions={questions} />}</QuizDetail>;
}

function EditForm({ clubId, quiz, questions }: { clubId: string; quiz: Quiz; questions: readonly QuizQuestion[] }) {
  const t = useTranslations('QUIZ');
  const push = usePush();
  const [loaded] = useState(() => draftsOf(questions));
  const save = useSaveQuiz(quiz.id, clubId, loaded);
  const list = `/clubs/${clubId}/quizzes`;

  return (
    <QuizEditor
      heading={t('edit_title')}
      backHref={list}
      questionsStepLabel={t('edit_step_questions')}
      submitLabel={t('edit_save')}
      savingLabel={t('edit_saving')}
      initialMeta={{ title: quiz.title, description: quiz.description ?? '' }}
      initialQuestions={loaded}
      locked={quiz.status !== 'draft'}
      lockedNotice={t('edit_active_warning')}
      pending={save.isPending}
      error={save.isError ? t('save_error') : null}
      onSubmit={async (values) => {
        try {
          await save.mutateAsync(values);
          push(list);
          return true;
        } catch {
          // surfaced through save.isError
          return false;
        }
      }}
    />
  );
}
