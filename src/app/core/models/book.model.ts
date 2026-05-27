export interface BookSuggestion {
  id: string;
  title: string;
  authors: string[];
  description: string | null;
  thumbnail: string | null;
  publishedDate: string | null;
  publisher: string | null;
}

export type BookDetails = BookSuggestion;
