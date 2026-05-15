import type { InfiniteData } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import type { MarketsCoinsPage } from "@/features/markets";
import type { AssetDetail } from "@/domain/models/AssetDetail";
import type { PriceMetrics } from "./alertConditions";
import type { Asset } from "@/domain/models/Asset";

function metricsFromTopPages(
  topData: InfiniteData<MarketsCoinsPage>,
  fsymUpper: string
): PriceMetrics | null {
  if (!topData.pages?.length) return null;
  for (const page of topData.pages) {
    const hit = page.items.find((a) => a.fsym.toUpperCase() === fsymUpper);
    if (hit) {
      return {
        priceUsd: hit.priceUsd,
        changePercent24Hr: hit.changePercent24Hr,
      };
    }
  }
  return null;
}

/**
 * Snapshot para evaluar alertas: prioriza detalle, luego cualquier lista top en caché, luego favoritos.
 */
export function getPriceMetricsFromCache(
  queryClient: QueryClient,
  fsymUpper: string
): PriceMetrics | null {
  const detail = queryClient.getQueryData<AssetDetail>(["coin", fsymUpper]);
  if (detail) {
    return {
      priceUsd: detail.priceUsd,
      changePercent24Hr: detail.changePercent24Hr,
    };
  }

  const tops = queryClient.getQueriesData<InfiniteData<MarketsCoinsPage>>({
    queryKey: ["topCoins"],
  });
  for (const [, topData] of tops) {
    if (!topData) continue;
    const hit = metricsFromTopPages(topData, fsymUpper);
    if (hit) return hit;
  }

  const favRows = queryClient.getQueriesData<Asset[]>({
    queryKey: ["favorites", "prices"],
  });
  for (const [, data] of favRows) {
    if (!data?.length) continue;
    const hit = data.find((a) => a.fsym.toUpperCase() === fsymUpper);
    if (hit) {
      return {
        priceUsd: hit.priceUsd,
        changePercent24Hr: hit.changePercent24Hr,
      };
    }
  }

  return null;
}
