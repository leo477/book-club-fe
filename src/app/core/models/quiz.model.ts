export type QuizStatus = 'draft' | 'active' | 'live' | 'closed';

export interface Quiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
  status: QuizStatus;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  total: number;
  answers: number[];
}

export interface QuizSession {
  id: string;
  quizId: string;
  eventId: string;
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  participantCount: number;
}

export interface QuizLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  totalQuestions: number;
  hasAttempted: boolean;
}
