import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import type { NewsArticle } from "@/domain/models/NewsArticle";
import { newsInfiniteQueryKey } from "@/hooks/useNewsInfiniteQuery";

export function findNewsArticleById(
  queryClient: QueryClient,
  articleId: string
): NewsArticle | undefined {
  const data = queryClient.getQueryData<
    InfiniteData<NewsArticle[], number | undefined>
  >(newsInfiniteQueryKey);
  if (!data?.pages?.length) return undefined;
  for (const page of data.pages) {
    const hit = page.find((a) => a.id === articleId);
    if (hit) return hit;
  }
  return undefined;
}
