export interface MemberCandidate {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface RandomizerSession {
  id: string;
  clubId: string;
  createdBy: string;
  purpose: string;
  candidates: MemberCandidate[];
  result: MemberCandidate | null;
  createdAt: string;
}
