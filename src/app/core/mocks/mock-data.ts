import { UserProfile, UserStats } from '../models/user.model';
import { Club, ClubMeeting, ClubStatus } from '../models/club.model';
import { Quiz, QuizQuestion } from '../models/quiz.model';
import { MemberCandidate, RandomizerSession } from '../models/randomizer.model';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    role: 'organizer',
    displayName: 'Alice Organizer',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    socialsPublic: true,
    socials: {
      telegram: 'bookclub_ua',
      instagram: 'bookclub.ukraine',
      github: 'bookclub-dev',
      goodreads: 'bookclub-ua',
    },
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
    city: 'Kyiv',
    nextMeetingDate: '2026-04-15T18:00:00Z',
    address: 'вул. Хрещатик, 1, Київ',
    lat: 50.4501,
    lng: 30.5234,
    theme: 'Класична література',
    status: 'active',
    currentBook: { title: 'Гордість і упередження', author: 'Джейн Остін', description: 'Романтична сатира на суспільство Англії XIX ст. Елізабет Беннет та містер Дарсі.' },
    memberPreviews: ['Alice Organizer', 'Bob Reader', 'Carol Smith', 'Dan Brown'],
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
    city: 'Kyiv',
    nextMeetingDate: '2026-04-22T19:00:00Z',
    address: 'вул. Саксаганського, 57, Київ',
    lat: 50.4456,
    lng: 30.5052,
    theme: 'Наукова фантастика',
    status: 'active',
    currentBook: { title: 'Дюна', author: 'Френк Герберт', description: 'Епічна сага про пустельну планету Арракіс і долю всесвіту.' },
    memberPreviews: ['Alice Organizer', 'Eve Garcia', 'Frank Lee'],
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
    city: 'Lviv',
    nextMeetingDate: '2026-04-18T17:00:00Z',
    address: 'пл. Ринок, 1, Львів',
    lat: 49.8419,
    lng: 24.0315,
    theme: 'Детектив і трилер',
    status: 'active',
    currentBook: { title: 'Вбивство у Східному експресі', author: 'Агата Крісті', description: 'Пуаро розслідує вбивство в зупиненому снігом поїзді.' },
    memberPreviews: ['Bob Reader', 'Grace Kim'],
  },
  {
    id: 'club-4',
    name: 'Lviv Poetry Circle',
    description: 'A gathering for poetry lovers in the heart of Lviv.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 9,
    createdAt: '2024-04-01T00:00:00Z',
    city: 'Lviv',
    nextMeetingDate: '2026-04-25T18:30:00Z',
    address: 'вул. Театральна, 10, Львів',
    lat: 49.8397,
    lng: 24.0297,
    theme: 'Поезія',
    status: 'active',
    currentBook: { title: 'Кобзар', author: 'Тарас Шевченко', description: 'Збірка поезій, що стала символом національного відродження України.' },
    memberPreviews: ['Alice Organizer', 'Hanna Wolf', 'Ivan Petrenko', 'Julia Roth'],
  },
  {
    id: 'club-5',
    name: 'Odesa Book Exchange',
    description: 'Share and discover books by the Black Sea.',
    coverUrl: null,
    organizerId: 'user-2',
    isPublic: true,
    memberCount: 15,
    createdAt: '2024-05-01T00:00:00Z',
    city: 'Odesa',
    nextMeetingDate: '2026-04-20T16:00:00Z',
    address: 'Дерибасівська, 5, Одеса',
    lat: 46.4825,
    lng: 30.7233,
    theme: 'Сучасна проза',
    status: 'active',
    currentBook: { title: 'Аліса в країні чудес', author: 'Льюїс Керролл', description: 'Фантастична пригода маленької Аліси у дивовижному підземному світі.' },
    memberPreviews: ['Bob Reader', 'Kate Jones', 'Liam Chen', 'Mia Rossi'],
  },
  {
    id: 'club-6',
    name: 'Odesa History Readers',
    description: 'Non-fiction and historical novels discussion group.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 7,
    createdAt: '2024-06-01T00:00:00Z',
    city: 'Odesa',
    nextMeetingDate: '2026-05-03T17:00:00Z',
    address: 'вул. Катерининська, 18, Одеса',
    lat: 46.4845,
    lng: 30.7260,
    theme: 'Нон-фікшн / Історія',
    status: 'active',
    currentBook: { title: 'Sapiens: Коротка історія людства', author: 'Юваль Ной Харарі', description: 'Огляд еволюції людства від кам\'яного віку до сучасності.' },
    memberPreviews: ['Alice Organizer', 'Noah Schulz'],
  },
  {
    id: 'club-7',
    name: 'Kyiv Fantasy Guild',
    description: 'Epic fantasy and world-building enthusiasts.',
    coverUrl: null,
    organizerId: 'user-2',
    isPublic: true,
    memberCount: 11,
    createdAt: '2024-07-01T00:00:00Z',
    city: 'Kyiv',
    nextMeetingDate: '2026-04-30T19:30:00Z',
    address: 'бул. Лесі Українки, 26, Київ',
    lat: 50.4376,
    lng: 30.5477,
    theme: 'Фентезі',
    status: 'paused',
    currentBook: { title: 'Гобіт', author: 'Дж. Р. Р. Толкін', description: 'Пригоди хобіта Більбо Бегінса у пошуках скарбів дракона Смога.' },
    memberPreviews: ['Bob Reader', 'Olivia Brown', 'Peter Park', 'Quinn Adams'],
  },
  {
    id: 'club-8',
    name: 'Lviv Graphic Novel Society',
    description: 'Comics, manga, and illustrated stories.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: false,
    memberCount: 6,
    createdAt: '2024-08-01T00:00:00Z',
    city: 'Lviv',
    nextMeetingDate: null,
    address: 'вул. Городоцька, 34, Львів',
    lat: 49.8365,
    lng: 24.0180,
    theme: 'Графічні романи',
    status: 'cancelled',
    currentBook: null,
    memberPreviews: ['Alice Organizer', 'Rachel Green'],
  },
  {
    id: 'club-9',
    name: 'Скасований клуб (демо)',
    description: 'Цей клуб скасовано ~23 год. тому — покаже таймер видалення.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 3,
    createdAt: '2024-06-01T00:00:00Z',
    city: 'Kyiv',
    nextMeetingDate: null,
    address: null, lat: null, lng: null,
    theme: 'Демо',
    currentBook: null,
    memberPreviews: ['Alice Organizer'],
    status: 'cancelled' as ClubStatus,
    cancelledAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'club-10',
    name: 'Видалений клуб (демо)',
    description: 'Цей клуб скасовано >24 год. тому — буде видалений при першому очищенні.',
    coverUrl: null,
    organizerId: 'user-1',
    isPublic: true,
    memberCount: 1,
    createdAt: '2024-06-01T00:00:00Z',
    city: 'Lviv',
    nextMeetingDate: null,
    address: null, lat: null, lng: null,
    theme: 'Демо',
    currentBook: null,
    memberPreviews: ['Alice Organizer'],
    status: 'cancelled' as ClubStatus,
    cancelledAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
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

export const MOCK_CLUB_MEMBERS: Record<string, MemberCandidate[]> = {
  'club-1': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    { userId: 'user-3', displayName: 'Carol Smith', avatarUrl: null },
    { userId: 'user-4', displayName: 'Dan Brown', avatarUrl: null },
  ],
  'club-2': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-5', displayName: 'Eve Garcia', avatarUrl: null },
    { userId: 'user-6', displayName: 'Frank Lee', avatarUrl: null },
  ],
  'club-3': [
    { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    { userId: 'user-7', displayName: 'Grace Kim', avatarUrl: null },
  ],
  'club-4': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-8', displayName: 'Hanna Wolf', avatarUrl: null },
    { userId: 'user-9', displayName: 'Ivan Petrenko', avatarUrl: null },
    { userId: 'user-10', displayName: 'Julia Roth', avatarUrl: null },
  ],
};

export const MOCK_RANDOMIZER_HISTORY: RandomizerSession[] = [
  {
    id: 'session-1',
    clubId: 'club-1',
    createdBy: 'user-1',
    purpose: 'Хто представляє книгу?',
    candidates: [
      { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
      { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
      { userId: 'user-3', displayName: 'Carol Smith', avatarUrl: null },
    ],
    result: { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    createdAt: '2024-03-01T00:00:00Z',
  },
];

/** Club IDs the default mock user (user-1) belongs to */
export const MOCK_MY_CLUB_IDS = new Set(['club-1', 'club-2', 'club-3', 'club-4']);

export const MOCK_MEETINGS: ClubMeeting[] = [
  { id: 'm-1', clubId: 'club-1', title: 'Jane Austen evening', date: '2026-03-10T18:00:00Z', attendees: ['user-1', 'user-2'] },
  { id: 'm-2', clubId: 'club-2', title: 'Dune discussion', date: '2026-03-20T19:00:00Z', attendees: ['user-1'] },
  { id: 'm-3', clubId: 'club-3', title: 'Agatha Christie night', date: '2026-03-25T17:00:00Z', attendees: ['user-2'] },
  { id: 'm-4', clubId: 'club-4', title: 'Shevchenko reading', date: '2026-03-28T18:30:00Z', attendees: ['user-1'] },
];

/**
 * Clubs where each user had any activity (attended meeting or took a quiz).
 * Used to determine "participated" vs "missed" in the My Clubs section.
 */
export const MOCK_PARTICIPATION: Record<string, Set<string>> = {
  'user-1': new Set(['club-1', 'club-2', 'club-4']),
  'user-2': new Set(['club-3']),
};

/** Per-user statistics keyed by user id */
export const MOCK_STATS: Record<string, UserStats> = {
  'user-1': { clubsJoined: 3, quizzesTaken: 12, quizWins: 5, likesReceived: 24, booksRead: 18 },
  'user-2': { clubsJoined: 2, quizzesTaken: 7, quizWins: 1, likesReceived: 8, booksRead: 9 },
};

/** Seed credentials for in-memory auth. All mock data lives here — not scattered in services. */
export const MOCK_USER_CREDENTIALS: Array<{ userId: string; email: string; password: string }> = [
  { userId: 'user-1', email: 'alice@example.com', password: 'password' },
  { userId: 'user-2', email: 'bob@example.com', password: 'password' },
];
