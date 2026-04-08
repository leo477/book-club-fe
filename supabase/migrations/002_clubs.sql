CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  current_book_title TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clubs_organizer ON clubs(organizer_id);
CREATE INDEX idx_clubs_search ON clubs USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public clubs visible to all"
  ON clubs FOR SELECT USING (is_public = true);

CREATE POLICY "Members can see private clubs"
  ON clubs FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = clubs.id AND user_id = auth.uid())
  );

CREATE POLICY "Organizers can create clubs"
  ON clubs FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'organizer'
  );

CREATE POLICY "Organizers can update own clubs"
  ON clubs FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own clubs"
  ON clubs FOR DELETE USING (auth.uid() = organizer_id);
