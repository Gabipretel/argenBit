import { useInfiniteQuery } from "@tanstack/react-query";

import { mapNewsFeedItem } from "@/core/api/mappers/mapNewsFeedItem";
import { fetchNewsPage } from "@/core/api/repositories/newsRepository";
import type { NewsArticle } from "@/domain/models/NewsArticle";

export const NEWS_PAGE_SIZE = 15;

export const newsInfiniteQueryKey = ["news", { limit: NEWS_PAGE_SIZE }] as const;

async function fetchPage(page: number): Promise<NewsArticle[]> {
  const dto = await fetchNewsPage(page, NEWS_PAGE_SIZE);
  const raw = dto.result ?? [];
  return raw.map(mapNewsFeedItem);
}

/**
 * Noticias paginadas (CoinStats).
 */
export function useNewsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: newsInfiniteQueryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam as number),
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      if (lastPage.length < NEWS_PAGE_SIZE) return undefined;
      return (lastPageParam as number) + 1;
    },
  });
}

export function flattenNewsPages(
  pages: NewsArticle[][] | undefined
): NewsArticle[] {
  if (!pages?.length) return [];
  return pages.flat();
}
