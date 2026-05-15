import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchCoinsPage } from "@/core/api/repositories/coinsRepository";
import { mapCoinToAsset } from "@/core/api/mappers/mapCoinToAsset";
import type { Asset } from "@/domain/models/Asset";
import type { MarketDataFeedKind } from "@/core/store/slices/filtersSlice";

export const TOP_COINS_PAGE_SIZE = 10;

const TSYM = "USD";

export type MarketsCoinsPage = {
  items: Asset[];
  page: number;
  hasNextPage: boolean;
};

/** Query key usada en hooks y parches WS. */
export function topCoinsQueryKey(kind: MarketDataFeedKind) {
  return ["topCoins", kind, { tsym: TSYM, limit: TOP_COINS_PAGE_SIZE }] as const;
}

async function fetchPage(
  kind: MarketDataFeedKind,
  page: number
): Promise<MarketsCoinsPage> {
  const dto = await fetchCoinsPage(kind, page, TOP_COINS_PAGE_SIZE);
  const meta = dto.meta;
  const rows = dto.result ?? [];
  const startRank = (meta.page - 1) * meta.limit;
  const items = rows.map((row, i) => mapCoinToAsset(row, startRank + i + 1));
  return {
    items,
    page: meta.page,
    hasNextPage: Boolean(meta.hasNextPage),
  };
}

/**
 * Lista paginada — cap o volumen 24h (CoinStats).
 */
export function useTopCoinsInfiniteQuery(
  kind: MarketDataFeedKind,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: topCoinsQueryKey(kind),
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(kind, pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}

export function flattenTopCoinsPages(
  pages: MarketsCoinsPage[] | undefined
): Asset[] {
  if (!pages?.length) return [];
  return pages.flatMap((p) => p.items);
}
