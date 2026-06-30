export type SubmissionType = 'complaint' | 'suggestion' | 'comment';

export type SubmissionStatus =
  | 'open'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'done';

export interface Submission {
  id: string;
  type: SubmissionType;
  title: string;
  body: string;
  status: SubmissionStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
