import { useInfiniteQuery } from "@tanstack/react-query";

import type { TopMktCapFullResponseDTO } from "@/api/dto/topMktCapFull";
import { cryptocompareClient } from "@/api/cryptocompareClient";
import { mapTopCoinEntryToAsset } from "@/api/mappers/mapTopCoinEntryToAsset";
import type { Asset } from "@/domain/models/Asset";
import type { MarketDataFeedKind } from "@/store/slices/filtersSlice";

export const TOP_COINS_PAGE_SIZE = 10;
const TSYM = "USD";

/** Tope de páginas — lista larga acotada en móvil. */
const MAX_PAGE_INDEX = 8;

const TOP_PATH: Record<MarketDataFeedKind, string> = {
  mcap: "/data/top/mktcapfull",
  volume: "/data/top/totalvolfull",
};

/** Query key usada en hooks y parches WS. */
export function topCoinsQueryKey(kind: MarketDataFeedKind) {
  return ["topCoins", kind, { tsym: TSYM, limit: TOP_COINS_PAGE_SIZE }] as const;
}

async function fetchTopPage(
  kind: MarketDataFeedKind,
  page: number
): Promise<TopMktCapFullResponseDTO> {
  const { data } = await cryptocompareClient.get<TopMktCapFullResponseDTO>(
    TOP_PATH[kind],
    {
      params: {
        tsym: TSYM,
        limit: TOP_COINS_PAGE_SIZE,
        page,
      },
    }
  );
  return data;
}

/**
 * Lista paginada — cap o volumen 24h (CryptoCompare).
 * `enabled: false` evita fetch hasta que lo necesites (ej. sugerencias en modal de alertas).
 */
export function useTopCoinsInfiniteQuery(
  kind: MarketDataFeedKind,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: topCoinsQueryKey(kind),
    enabled: options?.enabled ?? true,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchTopPage(kind, pageParam as number),
    getNextPageParam: (lastPage, _all, lastPageParam) => {
      const batch = lastPage.Data ?? [];
      if (batch.length < TOP_COINS_PAGE_SIZE) return undefined;
      const next = (lastPageParam as number) + 1;
      if (next > MAX_PAGE_INDEX) return undefined;
      return next;
    },
  });
}

export function flattenTopCoinsPages(
  pages: TopMktCapFullResponseDTO[] | undefined
): Asset[] {
  if (!pages?.length) return [];
  return pages.flatMap((page, pageIndex) =>
    (page.Data ?? []).map((entry, i) =>
      mapTopCoinEntryToAsset(
        entry,
        pageIndex * TOP_COINS_PAGE_SIZE + i + 1
      )
    )
  );
}
