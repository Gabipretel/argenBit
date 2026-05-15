/** Ítem de `GET /news` (CoinStats). */
export interface NewsFeedItemDto {
  id: string;
  feedDate: number;
  source: string;
  title: string;
  description?: string;
  link: string;
  imgUrl: string;
}

export interface NewsListResponseDto {
  result: NewsFeedItemDto[];
}
