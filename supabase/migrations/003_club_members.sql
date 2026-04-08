CREATE TABLE IF NOT EXISTS club_members (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);

CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_members_club ON club_members(club_id);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see club membership"
  ON club_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_members.club_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Users can join clubs"
  ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs"
  ON club_members FOR DELETE USING (auth.uid() = user_id);
