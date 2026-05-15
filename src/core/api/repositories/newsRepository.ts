import type { NewsListResponseDto } from "@/core/api/dto/newsFeed";
import { httpClient } from "@/core/api/http.client";

export async function fetchNewsPage(
  page: number,
  limit: number
): Promise<NewsListResponseDto> {
  const { data } = await httpClient.get<NewsListResponseDto>("/news", {
    params: { page, limit },
  });
  return data;
}
