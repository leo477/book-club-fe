export interface BookCandidate {
  title: string;
  author: string;
}

export interface RandomizerSession {
  id: string;
  clubId: string;
  createdBy: string;
  candidates: BookCandidate[];
  result: BookCandidate | null;
  createdAt: string;
}
