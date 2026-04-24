CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','active','held','cancelled','rescheduled')),
  cancelled_at TIMESTAMPTZ,
  theme TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INT,
  after_meeting_venue JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_club_id ON events(club_id);
CREATE INDEX idx_events_date ON events(date);

CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events visible to all"
  ON events FOR SELECT USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.is_public = true)
  );

CREATE POLICY "Members can see private club events"
  ON events FOR SELECT USING (
    EXISTS (SELECT 1 FROM club_members WHERE club_id = events.club_id AND user_id = auth.uid())
  );

CREATE POLICY "Club organizers can create events"
  ON events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );

CREATE POLICY "Club organizers can update events"
  ON events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );

CREATE POLICY "Club organizers can delete events"
  ON events FOR DELETE USING (
    EXISTS (SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.organizer_id = auth.uid())
  );

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendees visible to club members"
  ON event_attendees FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = (SELECT club_id FROM events WHERE id = event_attendees.event_id)
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can RSVP to events"
  ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own RSVP"
  ON event_attendees FOR DELETE USING (auth.uid() = user_id);
