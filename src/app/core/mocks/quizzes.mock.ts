import { Quiz, QuizQuestion } from '../models/quiz.model';

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    clubId: 'club-1',
    createdBy: 'user-1',
    title: 'Pride and Prejudice Quiz',
    description: 'Test your knowledge of Jane Austen\'s classic.',
    isActive: true,
  },
  {
    id: 'quiz-2',
    clubId: 'club-2',
    createdBy: 'user-1',
    title: 'Dune Quiz',
    description: 'How well do you know Arrakis?',
    isActive: false,
  },
];

export const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    quizId: 'quiz-1',
    question: 'Who is the author of Pride and Prejudice?',
    options: ['Charlotte Brontë', 'Jane Austen', 'George Eliot', 'Mary Shelley'],
    correctIndex: 1,
  },
  {
    id: 'q-2',
    quizId: 'quiz-1',
    question: 'What is the name of the Bennet family estate?',
    options: ['Pemberley', 'Longbourn', 'Netherfield', 'Rosings'],
    correctIndex: 1,
  },
  {
    id: 'q-3',
    quizId: 'quiz-2',
    question: 'What is the desert planet in Dune called?',
    options: ['Caladan', 'Giedi Prime', 'Arrakis', 'Salusa Secundus'],
    correctIndex: 2,
  },
];
