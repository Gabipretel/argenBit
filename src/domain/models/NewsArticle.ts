export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedOn: number;
  imageUrl: string | null;
  body: string;
  url: string;
}
