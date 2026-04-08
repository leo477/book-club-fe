export interface Quiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
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
