import { useInfiniteQuery } from "@tanstack/react-query";

import type { NewsV2ResponseDTO } from "@/api/dto/newsV2";
import { cryptocompareClient } from "@/api/cryptocompareClient";
import { mapNewsArticleDto } from "@/api/mappers/mapNewsArticle";
import { env } from "@/config/env";
import type { NewsArticle } from "@/domain/models/NewsArticle";

export const NEWS_PAGE_SIZE = 15;

export const newsInfiniteQueryKey = [
  "news",
  { lang: "ES", limit: NEWS_PAGE_SIZE },
] as const;

async function fetchNewsPage(lTs: number | undefined): Promise<NewsArticle[]> {
  const params: Record<string, string | number> = {
    lang: "ES",
    limit: NEWS_PAGE_SIZE,
  };
  if (lTs !== undefined) params.lTs = lTs;

  const { data } = await cryptocompareClient.get<NewsV2ResponseDTO>(
    "/data/v2/news/",
    { params }
  );

  const raw = data.Data ?? [];
  const capped = raw.slice(0, NEWS_PAGE_SIZE);
  return capped.map(mapNewsArticleDto);
}

/**
 * §6.4 — paginación con `lTs` = último `published_on` del batch.
 */
export function useNewsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: newsInfiniteQueryKey,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => {
      if (!env.cryptocompareApiKey.trim()) {
        throw new Error("Se requiere EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY para noticias.");
      }
      return fetchNewsPage(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < NEWS_PAGE_SIZE) return undefined;
      const oldest = lastPage[lastPage.length - 1];
      return oldest.publishedOn;
    },
  });
}

export function flattenNewsPages(
  pages: NewsArticle[][] | undefined
): NewsArticle[] {
  if (!pages?.length) return [];
  return pages.flat();
}
