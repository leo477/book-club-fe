-- Removes Playwright audit test data (pw.audit.*) from the book-club Postgres.
-- Run in a psql / Supabase SQL editor session. Step 1 is read-only; step 2 ends in ROLLBACK
-- until you replace it with COMMIT after checking the counts.
-- Schema per book-club-be/app/models (most FKs have no ON DELETE CASCADE, hence the order).

-- STEP 1: preview -----------------------------------------------------------
SELECT id, email, role, created_at FROM users WHERE email LIKE 'pw.audit.%@gmail.com' ORDER BY created_at;
SELECT id, name, is_public, organizer_id, created_at FROM clubs
 WHERE name LIKE 'PW Audit Club%' OR organizer_id IN (SELECT id FROM users WHERE email LIKE 'pw.audit.%@gmail.com');

-- Anything below that is NOT an audit artifact means STOP and inspect before step 2.
SELECT c.id, c.name, count(DISTINCT m.user_id) FILTER (WHERE u.email NOT LIKE 'pw.audit.%@gmail.com') AS foreign_members
  FROM clubs c
  LEFT JOIN club_members m ON m.club_id = c.id
  LEFT JOIN users u ON u.id = m.user_id
 WHERE c.name LIKE 'PW Audit Club%' OR c.organizer_id IN (SELECT id FROM users WHERE email LIKE 'pw.audit.%@gmail.com')
 GROUP BY c.id, c.name HAVING count(DISTINCT m.user_id) FILTER (WHERE u.email NOT LIKE 'pw.audit.%@gmail.com') > 0;

-- STEP 2: delete (single transaction) ----------------------------------------
BEGIN;

CREATE TEMP TABLE _u ON COMMIT DROP AS SELECT id FROM users WHERE email LIKE 'pw.audit.%@gmail.com';
CREATE TEMP TABLE _c ON COMMIT DROP AS
  SELECT id FROM clubs WHERE name LIKE 'PW Audit Club%' OR organizer_id IN (SELECT id FROM _u);
CREATE TEMP TABLE _e ON COMMIT DROP AS SELECT id FROM events WHERE club_id IN (SELECT id FROM _c);
CREATE TEMP TABLE _q ON COMMIT DROP AS SELECT id FROM quizzes WHERE club_id IN (SELECT id FROM _c) OR created_by IN (SELECT id FROM _u);
CREATE TEMP TABLE _r ON COMMIT DROP AS SELECT id FROM book_vote_rounds WHERE club_id IN (SELECT id FROM _c);
CREATE TEMP TABLE _room ON COMMIT DROP AS SELECT id FROM chat_rooms WHERE club_id IN (SELECT id FROM _c) OR event_id IN (SELECT id FROM _e);
CREATE TEMP TABLE _s ON COMMIT DROP AS SELECT id FROM support_submissions WHERE author_id IN (SELECT id FROM _u);

DELETE FROM message_reads WHERE room_id IN (SELECT id FROM _room) OR user_id IN (SELECT id FROM _u);
DELETE FROM chat_room_bans WHERE room_id IN (SELECT id FROM _room) OR user_id IN (SELECT id FROM _u) OR banned_by IN (SELECT id FROM _u);
DELETE FROM chat_messages WHERE room_id IN (SELECT id FROM _room) OR sender_id IN (SELECT id FROM _u);
DELETE FROM chat_rooms WHERE id IN (SELECT id FROM _room);

DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM _q) OR user_id IN (SELECT id FROM _u);
DELETE FROM quiz_sessions WHERE quiz_id IN (SELECT id FROM _q) OR started_by IN (SELECT id FROM _u);
DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM _q);
DELETE FROM quizzes WHERE id IN (SELECT id FROM _q);

DELETE FROM book_vote_votes WHERE round_id IN (SELECT id FROM _r) OR user_id IN (SELECT id FROM _u);
DELETE FROM book_vote_options WHERE round_id IN (SELECT id FROM _r);
DELETE FROM book_vote_rounds WHERE id IN (SELECT id FROM _r);

DELETE FROM event_attendees WHERE event_id IN (SELECT id FROM _e) OR user_id IN (SELECT id FROM _u);
DELETE FROM events WHERE id IN (SELECT id FROM _e);

DELETE FROM randomizer_sessions WHERE club_id IN (SELECT id FROM _c) OR created_by IN (SELECT id FROM _u);
DELETE FROM club_bans WHERE club_id IN (SELECT id FROM _c) OR user_id IN (SELECT id FROM _u) OR banned_by IN (SELECT id FROM _u);
DELETE FROM club_join_requests WHERE club_id IN (SELECT id FROM _c) OR user_id IN (SELECT id FROM _u);
DELETE FROM club_members WHERE club_id IN (SELECT id FROM _c) OR user_id IN (SELECT id FROM _u);
DELETE FROM clubs WHERE id IN (SELECT id FROM _c);

DELETE FROM support_submission_likes WHERE submission_id IN (SELECT id FROM _s) OR user_id IN (SELECT id FROM _u);
DELETE FROM support_submissions WHERE id IN (SELECT id FROM _s);

DELETE FROM users WHERE id IN (SELECT id FROM _u);

-- Verify: all must be 0
SELECT (SELECT count(*) FROM users WHERE email LIKE 'pw.audit.%@gmail.com') AS users_left,
       (SELECT count(*) FROM clubs WHERE name LIKE 'PW Audit Club%') AS clubs_left;

ROLLBACK;  -- change to COMMIT once counts look right

-- STEP 3: Supabase Auth ------------------------------------------------------
-- users.supabase_user_id points at auth.users. Delete those in Dashboard -> Authentication -> Users
-- (search "pw.audit"), or via the admin API. Do this AFTER step 2 commits.
