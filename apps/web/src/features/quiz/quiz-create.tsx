'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { usePush } from '@/lib/use-push';
import { QuizEditor } from './quiz-editor';
import { usePublishQuiz } from './use-quiz';

export function QuizCreate({ clubId }: { clubId: string }) {
  const t = useTranslations('QUIZ');
  const push = usePush();
  const publish = usePublishQuiz(clubId);
  const list = `/clubs/${clubId}/quizzes`;

  return (
    <QuizEditor
      heading={t('create_heading')}
      backHref={list}
      questionsStepLabel={t('create_step_questions')}
      submitLabel={t('create_save_draft')}
      savingLabel={t('create_saving')}
      initialMeta={{ title: '', description: '' }}
      initialQuestions={[]}
      pending={publish.isPending}
      error={publish.isError ? t('save_error') : null}
      onSubmit={async ({ title, description, questions }) => {
        try {
          await publish.mutateAsync({ title, description, questions });
          push(list);
          return true;
        } catch {
          // surfaced through publish.isError
          return false;
        }
      }}
    />
  );
}
