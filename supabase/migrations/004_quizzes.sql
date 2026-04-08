CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, user_id)
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can see quizzes"
  ON quizzes FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = quizzes.club_id AND user_id = auth.uid())
  );

CREATE POLICY "Organizers can manage quizzes"
  ON quizzes FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Club members can see questions"
  ON quiz_questions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN club_members cm ON cm.club_id = q.club_id
      WHERE q.id = quiz_questions.quiz_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage questions"
  ON quiz_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_questions.quiz_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Users can see own attempts"
  ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
