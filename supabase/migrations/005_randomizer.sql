CREATE TABLE IF NOT EXISTS randomizer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  book_candidates JSONB NOT NULL DEFAULT '[]',
  selected_book JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE randomizer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can see randomizer sessions"
  ON randomizer_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = randomizer_sessions.club_id AND user_id = auth.uid())
  );

CREATE POLICY "Organizers can manage randomizer sessions"
  ON randomizer_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM clubs WHERE id = randomizer_sessions.club_id AND organizer_id = auth.uid())
  );
