import { ClubMeeting } from '../models/club.model';

export const MOCK_MEETINGS: ClubMeeting[] = [
  { id: 'm-1', clubId: 'club-1', title: 'Jane Austen evening', date: '2026-03-10T18:00:00Z', attendees: ['user-1', 'user-2'] },
  { id: 'm-2', clubId: 'club-2', title: 'Dune discussion', date: '2026-03-20T19:00:00Z', attendees: ['user-1'] },
  { id: 'm-3', clubId: 'club-3', title: 'Agatha Christie night', date: '2026-03-25T17:00:00Z', attendees: ['user-2'] },
  { id: 'm-4', clubId: 'club-4', title: 'Shevchenko reading', date: '2026-03-28T18:30:00Z', attendees: ['user-1'] },
];
