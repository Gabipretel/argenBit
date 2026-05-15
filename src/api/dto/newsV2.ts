export interface NewsV2ResponseDTO {
  Type: number;
  Message: string;
  Data?: NewsArticleDTO[];
}

export interface NewsArticleDTO {
  id: string;
  guid?: string;
  published_on: number;
  imageurl?: string;
  title: string;
  url: string;
  body?: string;
  source: string;
}
