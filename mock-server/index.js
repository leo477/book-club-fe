const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;
const BASE = '/api/v1';

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER_ID = 'user-001';

const mockUser = {
  id: MOCK_USER_ID,
  email: 'mock@dev.local',
  role: 'organizer',
  displayName: 'Dev User',
  avatarUrl: null,
  createdAt: '2025-01-01T00:00:00Z',
  socials: null,
  socialsPublic: false,
};

const mockStats = {
  clubsJoined: 2,
  quizzesTaken: 5,
  quizWins: 3,
  likesReceived: 12,
  booksRead: 8,
};

const clubs = [
  {
    id: 'club-001',
    name: 'Книжковий Дракон',
    description: 'Клуб для любителів фентезі та пригодницької літератури.',
    coverUrl: null,
    organizerId: MOCK_USER_ID,
    isPublic: true,
    memberCount: 5,
    memberPreviews: [],
    createdAt: '2025-01-15T10:00:00Z',
    city: 'Київ',
    nextMeetingDate: '2026-05-10T18:00:00Z',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    theme: 'Фентезі',
    currentBook: 'Майстер і Маргарита',
    status: 'active',
    tags: ['фентезі', 'класика'],
    meetingDurationMinutes: 90,
    afterMeetingVenue: { name: 'Кав\'ярня "Книга і Кава"', address: 'вул. Хрещатик, 12', description: 'Затишне місце для обговорень' },
    cancelledAt: null,
  },
  {
    id: 'club-002',
    name: 'Детектив Клуб',
    description: 'Читаємо найкращі детективи та трилери.',
    coverUrl: null,
    organizerId: 'user-002',
    isPublic: true,
    memberCount: 8,
    memberPreviews: [],
    createdAt: '2025-03-01T09:00:00Z',
    city: 'Львів',
    nextMeetingDate: '2026-05-15T19:00:00Z',
    address: 'пл. Ринок, 1',
    lat: 49.8397,
    lng: 24.0297,
    theme: 'Детектив',
    currentBook: 'Дівчина з татуюванням дракона',
    status: 'active',
    tags: ['детектив', 'трилер'],
    meetingDurationMinutes: 120,
    afterMeetingVenue: null,
    cancelledAt: null,
  },
  {
    id: 'club-003',
    name: 'Сучасна Проза',
    description: 'Обговорюємо найактуальнішу сучасну літературу.',
    coverUrl: null,
    organizerId: 'user-003',
    isPublic: false,
    memberCount: 3,
    memberPreviews: [],
    createdAt: '2025-06-10T12:00:00Z',
    city: 'Одеса',
    nextMeetingDate: null,
    address: 'вул. Дерибасівська, 5',
    lat: 46.4825,
    lng: 30.7233,
    theme: 'Сучасна проза',
    currentBook: null,
    status: 'active',
    tags: ['проза', 'сучасність'],
    meetingDurationMinutes: 60,
    afterMeetingVenue: null,
    cancelledAt: null,
  },
];

const membersByClub = {
  'club-001': [
    { userId: MOCK_USER_ID, displayName: 'Dev User', avatarUrl: null, role: 'organizer' },
    { userId: 'user-004', displayName: 'Оксана Петренко', avatarUrl: null, role: 'member' },
    { userId: 'user-005', displayName: 'Іван Коваль', avatarUrl: null, role: 'member' },
  ],
  'club-002': [
    { userId: 'user-002', displayName: 'Марія Шевченко', avatarUrl: null, role: 'organizer' },
    { userId: 'user-006', displayName: 'Андрій Бойко', avatarUrl: null, role: 'member' },
    { userId: 'user-007', displayName: 'Тетяна Мороз', avatarUrl: null, role: 'member' },
  ],
  'club-003': [
    { userId: 'user-003', displayName: 'Лесь Гончар', avatarUrl: null, role: 'organizer' },
    { userId: 'user-008', displayName: 'Ніна Кравченко', avatarUrl: null, role: 'member' },
  ],
};

const bansByClub = {};

const events = [
  {
    id: 'event-001',
    clubId: 'club-001',
    clubName: 'Книжковий Дракон',
    organizerId: MOCK_USER_ID,
    title: 'Обговорення: Майстер і Маргарита',
    description: 'Зустрічаємось щоб обговорити прочитане.',
    date: '2026-05-10T18:00:00Z',
    city: 'Київ',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: 'Фентезі',
    tags: ['класика', 'магічний реалізм'],
    durationMinutes: 90,
    afterMeetingVenue: null,
    attendeeCount: 3,
    isAttending: false,
    bookTitle: 'Майстер і Маргарита',
    coverUrl: 'https://covers.openlibrary.org/b/id/12706862-M.jpg',
  },
  {
    id: 'event-002',
    clubId: 'club-001',
    clubName: 'Книжковий Дракон',
    organizerId: MOCK_USER_ID,
    title: 'Вибір наступної книги',
    description: 'Разом оберемо що читатимемо далі.',
    date: '2026-06-05T18:30:00Z',
    city: 'Київ',
    address: 'вул. Хрещатик, 10',
    lat: 50.4501,
    lng: 30.5234,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: null,
    tags: [],
    durationMinutes: 60,
    afterMeetingVenue: null,
    attendeeCount: 1,
    isAttending: true,
  },
  {
    id: 'event-003',
    clubId: 'club-002',
    clubName: 'Детектив Клуб',
    organizerId: 'user-002',
    title: 'Детектив: фінал сезону',
    description: 'Завершальна зустріч першого сезону.',
    date: '2026-05-15T19:00:00Z',
    city: 'Львів',
    address: 'пл. Ринок, 1',
    lat: 49.8397,
    lng: 24.0297,
    status: 'upcoming',
    cancelledAt: null,
    coverUrl: null,
    theme: 'Детектив',
    tags: ['детектив'],
    durationMinutes: 120,
    afterMeetingVenue: null,
    attendeeCount: 5,
    isAttending: false,
  },
];

const quizzesByClub = {
  'club-001': [
    {
      id: 'quiz-001',
      clubId: 'club-001',
      createdBy: MOCK_USER_ID,
      title: 'Квіз по Майстру і Маргариті',
      description: 'Перевір свої знання!',
      isActive: true,
    },
  ],
};

const questionsByQuiz = {
  'quiz-001': [
    {
      id: 'q-001',
      quizId: 'quiz-001',
      question: 'Хто написав "Майстер і Маргарита"?',
      options: ['Толстой', 'Булгаков', 'Достоєвський', 'Чехов'],
      correctIndex: 1,
    },
    {
      id: 'q-002',
      quizId: 'quiz-001',
      question: 'Як звати чорного кота?',
      options: ['Барон', 'Бегемот', 'Мурзик', 'Васька'],
      correctIndex: 1,
    },
  ],
};

const roomsByClub = {
  'club-001': [{ id: 'room-001', name: 'Загальний чат' }],
  'club-002': [{ id: 'room-002', name: 'Загальний чат' }],
};

const messagesByRoom = {
  'room-001': [
    { id: 'msg-001', senderId: 'user-004', senderName: 'Оксана Петренко', text: 'Всім привіт! 📚', timestamp: new Date(Date.now() - 3600000).toISOString(), isOwn: false },
    { id: 'msg-002', senderId: MOCK_USER_ID, senderName: 'Dev User', text: 'Привіт! Чекаю не діждусь наступної зустрічі.', timestamp: new Date(Date.now() - 1800000).toISOString(), isOwn: true },
  ],
};

const randomizerHistoryByClub = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function findClub(id) {
  return clubs.find((c) => c.id === id);
}

function findEvent(id) {
  return events.find((e) => e.id === id);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Upload
app.post(`${BASE}/upload/cover`, (_req, res) =>
  res.json({ url: 'https://picsum.photos/seed/mockcover/800/400' })
);

// Auth
const AUTH_RESPONSE = () => ({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: mockUser });

app.post(`${BASE}/auth/login`, (_req, res) => res.json(AUTH_RESPONSE()));
app.post(`${BASE}/auth/register`, (_req, res) => res.status(201).json(AUTH_RESPONSE()));
app.get(`${BASE}/auth/me`, (_req, res) => res.json(mockUser));
app.post(`${BASE}/auth/logout`, (_req, res) => res.status(200).json({}));

// User profile
app.get(`${BASE}/users/me/stats`, (_req, res) => res.json(mockStats));
app.patch(`${BASE}/users/me`, (req, res) => { Object.assign(mockUser, req.body); res.json(mockUser); });
app.patch(`${BASE}/users/me/role`, (req, res) => { mockUser.role = req.body.role ?? mockUser.role; res.json(mockUser); });
app.patch(`${BASE}/users/me/socials`, (req, res) => { mockUser.socials = req.body; res.json(mockUser); });
app.patch(`${BASE}/users/me/socials-visibility`, (req, res) => { mockUser.socialsPublic = req.body.socialsPublic; res.json(mockUser); });

// Clubs
app.get(`${BASE}/clubs`, (_req, res) => res.json(clubs));

app.get(`${BASE}/clubs/my`, (_req, res) =>
  res.json(clubs.filter((c) => c.organizerId === MOCK_USER_ID))
);

app.get(`${BASE}/clubs/:id`, (req, res) => {
  const club = findClub(req.params.id);
  return club ? res.json(club) : res.status(404).json({ detail: 'Club not found' });
});

app.post(`${BASE}/clubs`, (req, res) => {
  const club = { id: `club-${uid()}`, organizerId: MOCK_USER_ID, memberCount: 1, memberPreviews: [], createdAt: new Date().toISOString(), status: 'active', tags: [], cancelledAt: null, afterMeetingVenue: null, ...req.body };
  clubs.push(club);
  res.status(201).json(club);
});

app.patch(`${BASE}/clubs/:id`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  Object.assign(club, req.body);
  res.json(club);
});

// Members
app.get(`${BASE}/clubs/:id/members`, (req, res) =>
  res.json(membersByClub[req.params.id] ?? [])
);

app.delete(`${BASE}/clubs/:id/members/:userId`, (req, res) => {
  const list = membersByClub[req.params.id];
  if (list) {
    const idx = list.findIndex((m) => m.userId === req.params.userId);
    if (idx !== -1) list.splice(idx, 1);
  }
  res.status(204).send();
});

app.post(`${BASE}/clubs/:id/members/:userId/ban`, (req, res) => {
  const { clubId, userId } = { clubId: req.params.id, userId: req.params.userId };
  if (!bansByClub[clubId]) bansByClub[clubId] = [];
  const ban = { userId, clubId, bannedAt: new Date().toISOString(), duration: req.body.duration ?? 7, bannedBy: MOCK_USER_ID };
  bansByClub[clubId].push(ban);
  res.json(ban);
});

app.get(`${BASE}/clubs/:id/bans`, (req, res) =>
  res.json(bansByClub[req.params.id] ?? [])
);

// Join / Leave
app.post(`${BASE}/clubs/:id/join`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.memberCount += 1;
  res.json(club);
});

app.delete(`${BASE}/clubs/:id/leave`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.memberCount = Math.max(0, club.memberCount - 1);
  res.json(club);
});

// Club actions
app.patch(`${BASE}/clubs/:id/pause`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.status = 'paused';
  res.json(club);
});

app.patch(`${BASE}/clubs/:id/cancel`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.status = 'cancelled';
  club.cancelledAt = new Date().toISOString();
  res.json(club);
});

app.patch(`${BASE}/clubs/:id/reschedule`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  club.nextMeetingDate = req.body.newDate ?? club.nextMeetingDate;
  res.json(club);
});

// Events — specific routes before parameterised ones
app.get(`${BASE}/events/my`, (_req, res) =>
  res.json(events.filter((e) => e.organizerId === MOCK_USER_ID || e.isAttending))
);

app.get(`${BASE}/events`, (_req, res) => res.json(events));

app.get(`${BASE}/events/:id`, (req, res) => {
  const event = findEvent(req.params.id);
  return event ? res.json(event) : res.status(404).json({ detail: 'Event not found' });
});

app.get(`${BASE}/clubs/:id/events`, (req, res) =>
  res.json(events.filter((e) => e.clubId === req.params.id))
);

app.post(`${BASE}/clubs/:id/events`, (req, res) => {
  const club = findClub(req.params.id);
  if (!club) return res.status(404).json({ detail: 'Club not found' });
  const event = { id: `event-${uid()}`, clubId: req.params.id, clubName: club.name, organizerId: MOCK_USER_ID, status: 'upcoming', cancelledAt: null, coverUrl: null, tags: [], afterMeetingVenue: null, attendeeCount: 0, isAttending: false, createdAt: new Date().toISOString(), ...req.body };
  events.push(event);
  res.status(201).json(event);
});

app.post(`${BASE}/events/:id/attend`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.isAttending = true;
  event.attendeeCount += 1;
  res.json(event);
});

app.delete(`${BASE}/events/:id/attend`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.isAttending = false;
  event.attendeeCount = Math.max(0, event.attendeeCount - 1);
  res.json(event);
});

app.patch(`${BASE}/events/:id/reschedule`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  Object.assign(event, req.body);
  res.json(event);
});

app.patch(`${BASE}/events/:id/cancel`, (req, res) => {
  const event = findEvent(req.params.id);
  if (!event) return res.status(404).json({ detail: 'Event not found' });
  event.status = 'cancelled';
  event.cancelledAt = new Date().toISOString();
  res.json(event);
});

// Quizzes
app.get(`${BASE}/clubs/:id/quizzes`, (req, res) =>
  res.json(quizzesByClub[req.params.id] ?? [])
);

app.post(`${BASE}/clubs/:id/quizzes`, (req, res) => {
  const quiz = { id: `quiz-${uid()}`, clubId: req.params.id, createdBy: MOCK_USER_ID, isActive: false, ...req.body };
  if (!quizzesByClub[req.params.id]) quizzesByClub[req.params.id] = [];
  quizzesByClub[req.params.id].push(quiz);
  res.status(201).json(quiz);
});

app.get(`${BASE}/quizzes/:id/questions`, (req, res) =>
  res.json(questionsByQuiz[req.params.id] ?? [])
);

app.post(`${BASE}/quizzes/:id/questions`, (req, res) => {
  const question = { id: `q-${uid()}`, quizId: req.params.id, ...req.body };
  if (!questionsByQuiz[req.params.id]) questionsByQuiz[req.params.id] = [];
  questionsByQuiz[req.params.id].push(question);
  res.status(201).json(question);
});

app.post(`${BASE}/quizzes/:id/attempts`, (req, res) => {
  const questions = questionsByQuiz[req.params.id] ?? [];
  const answers = req.body.answers ?? [];
  const score = answers.reduce((acc, ans, i) => acc + (questions[i]?.correctIndex === ans ? 1 : 0), 0);
  res.json({ id: `attempt-${uid()}`, quizId: req.params.id, userId: MOCK_USER_ID, score, total: questions.length, answers });
});

app.patch(`${BASE}/quizzes/:id/active`, (req, res) => {
  for (const list of Object.values(quizzesByClub)) {
    const quiz = list.find((q) => q.id === req.params.id);
    if (quiz) { quiz.isActive = req.body.isActive ?? !quiz.isActive; return res.json(quiz); }
  }
  res.status(404).json({ detail: 'Quiz not found' });
});

// Chat
app.get(`${BASE}/clubs/:id/chat/rooms`, (req, res) =>
  res.json(roomsByClub[req.params.id] ?? [])
);

app.get(`${BASE}/chat/rooms/:id/messages`, (req, res) => {
  const msgs = (messagesByRoom[req.params.id] ?? []).slice().reverse();
  res.json(msgs);
});

app.post(`${BASE}/chat/rooms/:id/messages`, (req, res) => {
  const msg = { id: `msg-${uid()}`, senderId: MOCK_USER_ID, senderName: 'Dev User', text: req.body.text, timestamp: new Date().toISOString(), isOwn: true };
  if (!messagesByRoom[req.params.id]) messagesByRoom[req.params.id] = [];
  messagesByRoom[req.params.id].push(msg);
  res.status(201).json(msg);
});

// Randomizer
app.post(`${BASE}/clubs/:id/randomizer/sessions`, (req, res) => {
  const session = { id: `sess-${uid()}`, clubId: req.params.id, createdBy: MOCK_USER_ID, createdAt: new Date().toISOString(), ...req.body };
  if (!randomizerHistoryByClub[req.params.id]) randomizerHistoryByClub[req.params.id] = [];
  randomizerHistoryByClub[req.params.id].unshift(session);
  res.status(201).json(session);
});

app.get(`${BASE}/clubs/:id/randomizer/history`, (req, res) =>
  res.json(randomizerHistoryByClub[req.params.id] ?? [])
);

// Geocoding
app.get(`${BASE}/geocode/autocomplete`, (req, res) => {
  const q = (req.query.q ?? '').toLowerCase();
  const suggestions = [
    { display_name: 'Київ, Україна', lat: '50.4501', lon: '30.5234' },
    { display_name: 'Львів, Україна', lat: '49.8397', lon: '24.0297' },
    { display_name: 'Харків, Україна', lat: '49.9935', lon: '36.2304' },
    { display_name: 'Одеса, Україна', lat: '46.4825', lon: '30.7233' },
    { display_name: 'Дніпро, Україна', lat: '48.4647', lon: '35.0462' },
  ].filter((s) => !q || s.display_name.toLowerCase().includes(q));
  res.json(suggestions);
});

// ─── 404 fallback ────────────────────────────────────────────────────────────

app.use((req, res) => {
  console.warn(`[mock] 404 — ${req.method} ${req.path}`);
  res.status(404).json({ detail: 'Not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🟢 Mock server running at http://localhost:${PORT}${BASE}\n`);
});
