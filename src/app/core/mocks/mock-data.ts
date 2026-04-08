import { UserProfile } from '../models/user.model';
import { Club } from '../models/club.model';
import { Quiz, QuizQuestion } from '../models/quiz.model';
import { RandomizerSession } from '../models/randomizer.model';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    role: 'organizer',
    displayName: 'Alice Organizer',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    role: 'user',
    displayName: 'Bob Reader',
    avatarUrl: null,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

export const MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'Classic Literature Society',
    description: 'Exploring timeless works from around the world.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 12,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'club-2',
    name: 'Sci-Fi Explorers',
    description: 'For fans of science fiction and speculative fiction.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 8,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'club-3',
    name: 'Mystery & Thriller Club',
    description: 'Whodunits, thrillers, and suspense novels.',
    coverUrl: null,
    organizerId: 'user-2',
    isPublic: false,
    memberCount: 5,
    createdAt: '2024-03-15T00:00:00Z',
  },
];

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

export const MOCK_RANDOMIZER_HISTORY: RandomizerSession[] = [
  {
    id: 'session-1',
    clubId: 'club-1',
    createdBy: 'user-1',
    candidates: [
      { title: 'Middlemarch', author: 'George Eliot' },
      { title: 'Jane Eyre', author: 'Charlotte Brontë' },
      { title: 'Wuthering Heights', author: 'Emily Brontë' },
    ],
    result: { title: 'Jane Eyre', author: 'Charlotte Brontë' },
    createdAt: '2024-03-01T00:00:00Z',
  },
];

/** Club IDs the default mock user (user-1) belongs to */
export const MOCK_MY_CLUB_IDS = new Set(['club-1', 'club-2']);
