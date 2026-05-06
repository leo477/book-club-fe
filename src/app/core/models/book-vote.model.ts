export interface BookOption {
  id: string;
  title: string;
  author: string;
  votes: number;
  hasVoted: boolean;
}

export interface BookVoteRound {
  id: string;
  clubId: string;
  status: 'open' | 'closed';
  options: BookOption[];
  totalVotes: number;
  winnerId: string | null;
}
