import { z } from 'zod';

export const bookSuggestion = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
  publishedDate: z.string().nullish(),
  publisher: z.string().nullish(),
});
export type BookSuggestion = z.infer<typeof bookSuggestion>;

export const bookDetails = bookSuggestion;
export type BookDetails = BookSuggestion;

export const storeResult = z.object({
  name: z.string(),
  url: z.string(),
  found: z.boolean().nullable(),
  product_url: z.string().nullish(),
});
export type StoreResult = z.infer<typeof storeResult>;

export const bookOption = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  votes: z.number(),
  hasVoted: z.boolean(),
});
export type BookOption = z.infer<typeof bookOption>;

export const bookVoteRound = z.object({
  id: z.string(),
  clubId: z.string(),
  status: z.enum(['open', 'closed']),
  options: z.array(bookOption),
  totalVotes: z.number(),
  winnerId: z.string().nullable(),
});
export type BookVoteRound = z.infer<typeof bookVoteRound>;

export const addBookOptionRequest = z.object({
  title: z.string().max(300),
  author: z.string().max(300).optional(),
});
export type AddBookOptionRequest = z.input<typeof addBookOptionRequest>;
