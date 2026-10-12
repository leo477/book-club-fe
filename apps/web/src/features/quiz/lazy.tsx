'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';
import { OrganizerOfClub } from '@/features/club-manage/organizer-gate';

const QuizCreate = lazy(() => import('./quiz-create').then((m) => ({ default: m.QuizCreate })));
const QuizEdit = lazy(() => import('./quiz-edit').then((m) => ({ default: m.QuizEdit })));
const QuizPreview = lazy(() => import('./quiz-preview').then((m) => ({ default: m.QuizPreview })));
const QuizSession = lazy(() => import('./quiz-session').then((m) => ({ default: m.QuizSession })));

/** Each organizer screen loads on demand, after the per-club gate has admitted the viewer (the editor pulls in react-hook-form and zod). */
export const LazyQuizCreate = ({ clubId }: { clubId: string }) => (
  <OrganizerOfClub clubId={clubId}>
    {() => (
      <LazyPage>
        <QuizCreate clubId={clubId} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);

export const LazyQuizEdit = ({ clubId, quizId }: { clubId: string; quizId: string }) => (
  <OrganizerOfClub clubId={clubId}>
    {() => (
      <LazyPage>
        <QuizEdit clubId={clubId} quizId={quizId} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);

export const LazyQuizPreview = ({ clubId, quizId }: { clubId: string; quizId: string }) => (
  <OrganizerOfClub clubId={clubId}>
    {() => (
      <LazyPage>
        <QuizPreview clubId={clubId} quizId={quizId} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);

export const LazyQuizSession = ({ clubId, quizId }: { clubId: string; quizId: string }) => (
  <OrganizerOfClub clubId={clubId}>
    {() => (
      <LazyPage>
        <QuizSession clubId={clubId} quizId={quizId} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);
